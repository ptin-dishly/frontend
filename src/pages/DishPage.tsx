import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/storage";
import { recipeService, allergenService, type Recipe, type Allergen } from "../services/api";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import SelectDropdown from "../components/SelectDropdown";

export default function DishPage() {
  const user = getCurrentUser();
  const userRole = (user?.role || "admin") as "admin" | "kitchen" | "waiter" | "sales";
  const navigate = useNavigate();

  if (!["admin", "kitchen"].includes(userRole)) {
    navigate("/dashboard");
    return null;
  }

  const [dishes, setDishes] = useState<Recipe[]>([]);
  const [globalSearch, setGlobalSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<Recipe> | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [excludedAllergenId, setExcludedAllergenId] = useState<string | null>(null);
  const [recipesWithAllergen, setRecipesWithAllergen] = useState<string[]>([]);

  useEffect(() => {
    const fetchDishes = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await recipeService.getAll();
        if (res.success && res.data) {
          setDishes(res.data);
        }
      } catch (err) {
        console.error("Error fetching dishes:", err);
        setError("Failed to load dishes");
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  // Fetch allergens
  useEffect(() => {
    const fetchAllergens = async () => {
      try {
        const res = await allergenService.getAll();
        if (res.success && res.data) {
          console.log("Allergens fetched:", res.data);
          setAllergens(res.data);
        }
      } catch (err) {
        console.error("Error fetching allergens:", err);
      }
    };

    fetchAllergens();
  }, []);

  // Fetch recipes with allergen
  useEffect(() => {
    const fetchRecipesWithAllergen = async () => {
      if (!excludedAllergenId) {
        setRecipesWithAllergen([]);
        return;
      }

      try {
        console.log(`Fetching recipes with allergen: ${excludedAllergenId}`);
        const res = await recipeService.getByAllergen(excludedAllergenId);
        if (res.success && res.data) {
          const recipeIds = res.data.map((recipe) => recipe.id);
          console.log(`Recipes with allergen ${excludedAllergenId}:`, recipeIds);
          setRecipesWithAllergen(recipeIds);
        }
      } catch (err) {
        console.error("Error fetching recipes with allergen:", err);
      }
    };

    fetchRecipesWithAllergen();
  }, [excludedAllergenId]);

  const categories = [
    { label: "All Categories", value: "" },
    ...Array.from(new Set(dishes.map((d) => d.category))).map((cat) => ({
      label: cat,
      value: cat,
    })),
  ];

  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch = dish.name.toLowerCase().includes(globalSearch.toLowerCase());
    const matchesCategory = !categoryFilter || dish.category === categoryFilter;
    const matchesAllergen =
      excludedAllergenId === null || !recipesWithAllergen.includes(dish.id);
    return matchesSearch && matchesCategory && matchesAllergen;
  });

  const handleEdit = (dish: Recipe) => {
    setEditingId(dish.id);
    setEditingData({ ...dish });
  };

  const handleSave = async (dishId: string) => {
    if (!editingData) return;

    setSavingId(dishId);
    try {
      const res = await recipeService.update(dishId, editingData);
      if (res.success && res.data) {
        setDishes((prev) =>
          prev.map((d) => (d.id === dishId ? res.data! : d))
        );
        setEditingId(null);
        setEditingData(null);
      } else {
        setError("Failed to save dish");
      }
    } catch (err) {
      console.error("Error saving dish:", err);
      setError("Error saving dish");
    } finally {
      setSavingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData(null);
  };

  const handleDelete = async (dishId: string) => {
    if (!confirm("Are you sure you want to delete this dish?")) return;

    try {
      const res = await recipeService.delete(dishId);
      if (res.success) {
        setDishes((prev) => prev.filter((d) => d.id !== dishId));
      } else {
        setError("Failed to delete dish");
      }
    } catch (err) {
      console.error("Error deleting dish:", err);
      setError("Error deleting dish");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
      <MenuBar role={userRole} />

      <main style={{ flex: 1, padding: "40px 48px" }}>
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ fontSize: 28, color: "#0F172A", margin: 0, fontWeight: 700 }}>
            Dishes
          </h1>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#FEE2E2",
              color: "#DC2626",
              padding: "12px 16px",
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
            marginBottom: 32,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 300, width: "100%" }}>
            <SearchBar
              value={globalSearch}
              onChange={setGlobalSearch}
              placeholder="Search dishes..."
            />
          </div>

          <SelectDropdown
            options={categories}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />

          <button
            onClick={() => navigate("/dishes/new")}
            style={{
              backgroundColor: "var(--color-green)",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            + New Dish
          </button>
        </div>

        {/* Filters Section */}
        <div
          style={{
            marginBottom: 24,
            padding: "12px 16px",
            backgroundColor: "#FFFFFF",
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#6B7280",
              }}
            >
              Exclude Allergen:
            </label>
            <select
              value={excludedAllergenId || ""}
              onChange={(e) => setExcludedAllergenId(e.target.value || null)}
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #E5E7EB",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              <option value="">None</option>
              {allergens.map((allergen) => (
                <option key={allergen.id} value={allergen.id}>
                  {allergen.nameEs}
                </option>
              ))}
            </select>

            {excludedAllergenId && (
              <button
                onClick={() => setExcludedAllergenId(null)}
                style={{
                  padding: "6px 10px",
                  backgroundColor: "#EF4444",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 20, fontSize: 14, color: "#6B7280" }}>
          Showing {filteredDishes.length} of {dishes.length} dishes
          {excludedAllergenId && allergens.find(a => a.id === excludedAllergenId) && 
            ` (excluding ${allergens.find(a => a.id === excludedAllergenId)?.nameEs})`
          }
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#6B7280" }}>
            <p>Loading dishes...</p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
              border: "1px solid #E5E7EB",
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: "white",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                gap: 16,
                padding: "16px 20px",
                backgroundColor: "#F3F4F6",
                fontWeight: 600,
                fontSize: 12,
                color: "#6B7280",
                borderBottom: "1px solid #E5E7EB",
              }}
            >
              <div>Name</div>
              <div>Category</div>
              <div>Prep Time</div>
              <div>Servings</div>
              <div>Actions</div>
            </div>

            {/* Rows */}
            {filteredDishes.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center", color: "#6B7280" }}>
                No dishes found
              </div>
            ) : (
              filteredDishes.map((dish, index) => (
                <div
                  key={dish.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                    gap: 16,
                    padding: "16px 20px",
                    borderBottom: index < filteredDishes.length - 1 ? "1px solid #E5E7EB" : "none",
                    alignItems: "center",
                    backgroundColor: index % 2 === 0 ? "white" : "#F9FAFB",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F3F4F6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      index % 2 === 0 ? "white" : "#F9FAFB";
                  }}
                >
                  {editingId === dish.id && editingData ? (
                    <>
                      <input
                        type="text"
                        value={editingData.name || ""}
                        onChange={(e) =>
                          setEditingData({ ...editingData, name: e.target.value })
                        }
                        style={{
                          padding: "8px 12px",
                          borderRadius: 6,
                          border: "1px solid #E5E7EB",
                          fontSize: 13,
                        }}
                      />
                      <input
                        type="text"
                        value={editingData.category || ""}
                        onChange={(e) =>
                          setEditingData({ ...editingData, category: e.target.value })
                        }
                        style={{
                          padding: "8px 12px",
                          borderRadius: 6,
                          border: "1px solid #E5E7EB",
                          fontSize: 13,
                        }}
                      />
                      <input
                        type="number"
                        value={editingData.preparation_time || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            preparation_time: Number(e.target.value),
                          })
                        }
                        style={{
                          padding: "8px 12px",
                          borderRadius: 6,
                          border: "1px solid #E5E7EB",
                          fontSize: 13,
                        }}
                      />
                      <input
                        type="number"
                        value={editingData.servings || ""}
                        onChange={(e) =>
                          setEditingData({
                            ...editingData,
                            servings: Number(e.target.value),
                          })
                        }
                        style={{
                          padding: "8px 12px",
                          borderRadius: 6,
                          border: "1px solid #E5E7EB",
                          fontSize: 13,
                        }}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleSave(dish.id)}
                          disabled={savingId === dish.id}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#22C55E",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            cursor: savingId === dish.id ? "not-allowed" : "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {savingId === dish.id ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={handleCancel}
                          style={{
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
                        <p style={{ margin: 0, fontWeight: 600, color: "#0F172A", fontSize: 14 }}>
                          {dish.name}
                        </p>
                        <p
                          style={{
                            margin: "4px 0 0",
                            color: "#6B7280",
                            fontSize: 12,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {dish.description}
                        </p>
                      </div>
                      <div style={{ fontSize: 13, color: "#0F172A" }}>
                        {dish.category}
                      </div>
                      <div style={{ fontSize: 13, color: "#0F172A" }}>
                        {dish.preparation_time} min
                      </div>
                      <div style={{ fontSize: 13, color: "#0F172A" }}>
                        {dish.servings}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          onClick={() => handleEdit(dish)}
                          style={{
                            backgroundColor: "transparent",
                            border: "none",
                            color: "#7C3AED",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                            padding: "4px 8px",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(dish.id)}
                          style={{
                            backgroundColor: "transparent",
                            border: "none",
                            color: "#EF4444",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                            padding: "4px 8px",
                          }}
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => navigate(`/dishes/${dish.id}`)}
                          style={{
                            backgroundColor: "transparent",
                            border: "none",
                            color: "#3B82F6",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 600,
                            padding: "4px 8px",
                          }}
                        >
                          View
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}