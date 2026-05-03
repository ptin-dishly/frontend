import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/storage";
import { ingredientService, allergenService, type Ingredient, type Allergen } from "../services/api";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import SelectDropdown from "../components/SelectDropdown";
import BigButton from "../components/BigButton";
import NewIngredientCard from "../components/NewIngredientCard";

// Import allergen images
import glutenImg from "../assets/gluten.png";
import crustaceansImg from "../assets/crustaceans.png";
import eggImg from "../assets/egg.png";
import fishImg from "../assets/fish.png";
import peanutsImg from "../assets/peanuts.png";
import soybeansImg from "../assets/soybeans.png";
import milkImg from "../assets/milk.png";
import treeNutsImg from "../assets/tree-nuts.png";
import celeryImg from "../assets/celery.png";
import mustardImg from "../assets/mustard.png";
import sesameImg from "../assets/sesame.png";
import sulphitesImg from "../assets/sulphites.png";
import lupinsImg from "../assets/lupins.png";
import molluscsImg from "../assets/molluscs.png";

export default function IngredientsPage() {
  const user = getCurrentUser();
  const userRole = (user?.role || "admin") as "admin" | "kitchen" | "waiter" | "sales";
  const navigate = useNavigate();

  if (!["admin", "kitchen"].includes(userRole)) {
    navigate("/dashboard");
    return null;
  }

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [allAllergens, setAllAllergens] = useState<Allergen[]>([]);
  const [globalSearch, setGlobalSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [allergenFilter, setAllergenFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<Ingredient> | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [ingredientAllergens, setIngredientAllergens] = useState<Record<string, Allergen[]>>({});

  // Map allergen codes to imported images
  const allergenImageMap: Record<string, string> = {
    "GLU": glutenImg,
    "CRU": crustaceansImg,
    "HUE": eggImg,
    "PES": fishImg,
    "CAC": peanutsImg,
    "SOJ": soybeansImg,
    "LAC": milkImg,
    "FRU": treeNutsImg,
    "API": celeryImg,
    "MOS": mustardImg,
    "SES": sesameImg,
    "SUL": sulphitesImg,
    "ALT": lupinsImg,
    "MOL": molluscsImg,
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all allergens for filter
        const allergenRes = await allergenService.getAll();
        if (allergenRes.success && allergenRes.data) {
          setAllAllergens(allergenRes.data);
        }

        // Fetch ingredients
        const res = await ingredientService.getAll();
        if (res.success && res.data) {
          setIngredients(res.data);

          // Fetch allergens for each ingredient
          const allergenMap: Record<string, Allergen[]> = {};
          await Promise.all(
            res.data.map(async (ingredient) => {
              try {
                const allergenRes = await allergenService.getByIngredient(ingredient.id);
                if (allergenRes.success && allergenRes.data) {
                  allergenMap[ingredient.id] = allergenRes.data;
                }
              } catch (err) {
                console.error(`Error fetching allergens for ingredient ${ingredient.id}:`, err);
              }
            })
          );
          setIngredientAllergens(allergenMap);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load ingredients");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categories = Array.from(new Set(ingredients.map((i) => i.name))).map((name) => ({
    label: name,
    value: name,
  }));

  const filteredIngredients = ingredients.filter((ingredient) => {
    const matchesSearch = ingredient.name
      .toLowerCase()
      .includes(globalSearch.toLowerCase());
    const matchesCategory = !categoryFilter || ingredient.name === categoryFilter;
    
    // Filter by allergen - show ingredients that contain the selected allergen
    const matchesAllergen = !allergenFilter || 
      (ingredientAllergens[ingredient.id] &&
       ingredientAllergens[ingredient.id].some(a => a.id === allergenFilter));
    
    return matchesSearch && matchesCategory && matchesAllergen;
  });

  const handleEdit = (ingredient: Ingredient) => {
    setEditingId(ingredient.id);
    setEditingData({ ...ingredient });
  };

  const handleSave = async (ingredientId: string) => {
    if (!editingData) return;

    setSavingId(ingredientId);
    try {
      const res = await ingredientService.update(ingredientId, editingData);
      if (res.success && res.data) {
        setIngredients((prev) =>
          prev.map((i) => (i.id === ingredientId ? res.data! : i))
        );
        setEditingId(null);
        setEditingData(null);
      } else {
        setError("Failed to save ingredient");
      }
    } catch (err) {
      console.error("Error saving ingredient:", err);
      setError("Error saving ingredient");
    } finally {
      setSavingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData(null);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
      <MenuBar role={userRole} />

      <main style={{ flex: 1, padding: "48px 56px", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ fontSize: 32, color: "#0F172A", margin: 0 }}>Ingredients</h1>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#FEE2E2",
              color: "#DC2626",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontSize: "14px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 300, width: "100%" }}>
            <SearchBar
              value={globalSearch}
              onChange={setGlobalSearch}
              placeholder="Search ingredients..."
            />
          </div>

          <div style={{ maxWidth: 200 }}>
            <SelectDropdown
              options={[
                { label: "All", value: "" },
                ...categories,
              ]}
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder="Category"
            />
          </div>

          <div style={{ maxWidth: 200 }}>
            <SelectDropdown
              options={[
                { label: "All Allergens", value: "" },
                ...allAllergens.map((allergen) => ({
                  label: allergen.nameEs,
                  value: allergen.id,
                })),
              ]}
              value={allergenFilter || ""}
              onChange={(val) => setAllergenFilter(val || null)}
              placeholder="Allergen"
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#6B7280" }}>
            <p>Loading ingredients...</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
          {/* Add this NewIngredientCard back */}
          <div
            key="new-ingredient"
            style={{
              backgroundColor: "var(--color-green)",
              borderRadius: 12,
              border: "2px dashed var(--color-green)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              padding: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              minHeight: 280,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#16A34A";
              e.currentTarget.style.borderColor = "#16A34A";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-green)";
              e.currentTarget.style.borderColor = "var(--color-green)";
            }}
            onClick={() => navigate("/ingredients/new")}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 8, color: "white", fontWeight: 700 }}>
                +
              </div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "white" }}>
                New Ingredient
              </p>
            </div>
          </div>

          {/* Then your filtered ingredients */}
          {filteredIngredients.length === 0 ? (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#6B7280" }}>
              No ingredients found
            </p>
          ) : (
            filteredIngredients.map((ingredient) => (
              <div key={ingredient.id} style={{ position: "relative" }}>
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    minHeight: 280,
                  }}
                >
                    {editingId === ingredient.id && editingData ? (
                      <>
                        <input
                          type="text"
                          value={editingData.name || ""}
                          onChange={(e) =>
                            setEditingData({ ...editingData, name: e.target.value })
                          }
                          placeholder="Name"
                          style={{
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid #E5E7EB",
                            fontSize: 13,
                            fontFamily: "inherit",
                          }}
                        />
                        <textarea
                          value={editingData.description || ""}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Description"
                          style={{
                            padding: "8px 12px",
                            borderRadius: 6,
                            border: "1px solid #E5E7EB",
                            fontSize: 13,
                            fontFamily: "inherit",
                            minHeight: 60,
                          }}
                        />
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: 13,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={editingData.isActive || false}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData,
                                isActive: e.target.checked,
                              })
                            }
                          />
                          Active
                        </label>
                        <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                          <button
                            onClick={() => handleSave(ingredient.id)}
                            disabled={savingId === ingredient.id}
                            style={{
                              flex: 1,
                              padding: "6px 12px",
                              backgroundColor: "#22C55E",
                              color: "white",
                              border: "none",
                              borderRadius: 6,
                              cursor: savingId === ingredient.id ? "not-allowed" : "pointer",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {savingId === ingredient.id ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={handleCancel}
                            style={{
                              flex: 1,
                              padding: "6px 12px",
                              backgroundColor: "#E5E7EB",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 600, color: "#0F172A" }}>
                            {ingredient.name}
                          </h3>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 12,
                              color: "#6B7280",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {ingredient.description || "No description"}
                          </p>
                        </div>

                        {/* Allergens Display - Compact */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {ingredientAllergens[ingredient.id] &&
                          ingredientAllergens[ingredient.id].length > 0 ? (
                            ingredientAllergens[ingredient.id].map((allergen) => (
                              <div
                                key={allergen.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  padding: "4px 6px",
                                  borderRadius: 6,
                                  backgroundColor: "#F9F5FF",
                                  border: "1px solid #E9D5FF",
                                  cursor: "default",
                                }}
                                title={allergen.nameEs}
                              >
                                {allergenImageMap[allergen.code] ? (
                                  <img
                                    src={allergenImageMap[allergen.code]}
                                    alt={allergen.code}
                                    style={{
                                      width: 20,
                                      height: 20,
                                      objectFit: "contain",
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: 20,
                                      height: 20,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      backgroundColor: "#E9D5FF",
                                      borderRadius: 4,
                                      fontWeight: 700,
                                      color: "#7C3AED",
                                      fontSize: 9,
                                    }}
                                  >
                                    {allergen.code}
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <p style={{ margin: 0, fontSize: 11, color: "#9CA3AF" }}>
                              No allergens
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleEdit(ingredient)}
                          style={{
                            width: "100%",
                            padding: "6px 12px",
                            backgroundColor: "#7C3AED",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                            marginTop: "auto",
                          }}
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}