import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCurrentUser } from "../utils/storage";
import { recipeService, recipeStepService, type Recipe, type Allergen, type RecipeStep } from "../services/api";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import SelectDropdown from "../components/SelectDropdown";
import AllergenMultiFilter from "../components/AllergenMultiFilter";

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

export default function DishPage() {
  const user = getCurrentUser();
  const userRole = (user?.role || "admin") as "admin" | "kitchen" | "waiter" | "sales";
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isAdmin = userRole === "admin";

  if (!["admin", "kitchen"].includes(userRole)) {
    navigate("/dashboard");
    return null;
  }

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

  const [dishes, setDishes] = useState<Recipe[]>([]);
  const [globalSearch, setGlobalSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<Recipe> | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [excludedAllergenIds, setExcludedAllergenIds] = useState<string[]>([]);
  const [recipesWithAllergens, setRecipesWithAllergens] = useState<Record<string, string[]>>({});
  const [dishAllergens, setDishAllergens] = useState<Record<string, Allergen[]>>({});
  
  // Estados para steps
  const [expandedStepsId, setExpandedStepsId] = useState<string | null>(null);
  const [stepsLoading, setStepsLoading] = useState<string | null>(null);
  const [stepsData, setStepsData] = useState<Record<string, RecipeStep[]>>({});

  const getCategoryLabel = (category: string): string => {
    return t(`dishCreate.categories.${category}`, { defaultValue: category });
  };

  // Fetch dishes and allergens - single request
  useEffect(() => {
    const fetchDishesAndAllergens = async () => {
      setLoading(true);
      setError(null);
      try {
        const recipesRes = await recipeService.getAllWithAllergens();
        if (recipesRes.success && recipesRes.data) {
          const recipes = recipesRes.data.map((item: any) => ({
            id: item.id,
            establishmentId: item.establishmentId,
            name: item.name,
            description: item.description,
            category: item.category,
            portionSizeKg: item.portionSizeKg,
            servings: item.servings,
            preparationTime: item.preparationTime,
            version: item.version,
            createdBy: item.createdBy,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }));
          setDishes(recipes);

          const allergenMap: Record<string, Allergen[]> = {};
          const allAllergensMap = new Map<string, Allergen>();

          recipesRes.data.forEach((item: any) => {
            allergenMap[item.id] = item.allergens || [];
            item.allergens?.forEach((allergen: Allergen) => {
              allAllergensMap.set(allergen.id, allergen);
            });
          });

          setDishAllergens(allergenMap);
          setAllergens(Array.from(allAllergensMap.values()).sort((a, b) => a.euNumber - b.euNumber));
        }
      } catch (err) {
        console.error("Error fetching dishes:", err);
        setError("Failed to load dishes");
      } finally {
        setLoading(false);
      }
    };
    fetchDishesAndAllergens();
  }, []);

  // Filter recipes that have excluded allergens (usando datos ya cargados)
  useEffect(() => {
    if (excludedAllergenIds.length === 0) {
      setRecipesWithAllergens({});
      return;
    }

    // Buscar en los dishAllergens ya cargados
    const results: Record<string, string[]> = {};
    
    excludedAllergenIds.forEach((allergenId) => {
      results[allergenId] = Object.entries(dishAllergens)
        .filter(([, allergens]) => allergens.some((a) => a.id === allergenId))
        .map(([recipeId]) => recipeId);
    });

    setRecipesWithAllergens(results);
  }, [excludedAllergenIds, dishAllergens]);

  // Fetch steps para un plato
  const handleToggleSteps = async (dishId: string) => {
    if (expandedStepsId === dishId) {
      setExpandedStepsId(null);
      return;
    }

    setExpandedStepsId(dishId);
    
    if (stepsData[dishId]) {
      return; // Ya tenemos los datos en caché
    }

    setStepsLoading(dishId);
    try {
      const res = await recipeStepService.getByRecipe(dishId);
      if (res.success && res.data) {
        setStepsData((prev) => ({
          ...prev,
          [dishId]: res.data.sort((a, b) => a.stepNumber - b.stepNumber),
        }));
      }
    } catch (err) {
      console.error("Error fetching recipe steps:", err);
      setError("Failed to load recipe steps");
    } finally {
      setStepsLoading(null);
    }
  };

  const categories = [
    { label: t("common.all"), value: "" },
    ...Array.from(new Set(dishes.map((d) => d.category))).map((cat) => ({
      label: getCategoryLabel(cat),
      value: cat,
    })),
  ];

  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch = dish.name.toLowerCase().includes(globalSearch.toLowerCase());
    const matchesCategory = !categoryFilter || dish.category === categoryFilter;

    const hasExcludedAllergen = excludedAllergenIds.some((allergenId) =>
      recipesWithAllergens[allergenId]?.includes(dish.id)
    );
    const matchesAllergen = !hasExcludedAllergen;

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
      const res = await recipeService.update(dishId, {
        name: editingData.name,
        description: editingData.description,
        category: editingData.category,
        preparationTime: editingData.preparationTime,
        servings: editingData.servings,
        portionSizeKg: editingData.portionSizeKg,
      });
      if (res.success && res.data) {
        setDishes((prev) => prev.map((d) => (d.id === dishId ? res.data! : d)));
        setEditingId(null);
        setEditingData(null);
      } else {
        setError("Failed to save recipe");
      }
    } catch (err) {
      console.error("Error saving recipe:", err);
      setError("Error saving recipe");
    } finally {
      setSavingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData(null);
  };

  const handleDelete = async (dishId: string) => {
    if (!confirm(t("dishes.deleteConfirm"))) return;
    try {
      const res = await recipeService.delete(dishId);
      if (res.success) {
        setDishes(dishes.filter((d) => d.id !== dishId));
      } else {
        setError("Failed to delete recipe");
      }
    } catch (err) {
      console.error("Error deleting recipe:", err);
      setError("Error deleting recipe");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
      <MenuBar role={userRole} />

      <main style={{ flex: 1, padding: "40px 48px" }}>
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ fontSize: 32, color: "#0F172A", margin: 0, fontWeight: 700 }}>
            {t("dishes.title")}
          </h1>
        </div>

        {error && (
          <div style={{ backgroundColor: "#FEE2E2", color: "#DC2626", padding: "12px 16px", borderRadius: "8px", marginBottom: "24px", fontSize: "14px" }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, gap: 16, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 300, width: "100%" }}>
            <SearchBar value={globalSearch} onChange={setGlobalSearch} placeholder={t("dishes.searchPlaceholder")} />
          </div>

          <SelectDropdown options={categories} value={categoryFilter} onChange={setCategoryFilter} />

          {/* Botón crear - SOLO ADMIN */}
          {isAdmin && (
            <button
              onClick={() => navigate("/dishes/new")}
              style={{ backgroundColor: "var(--color-green)", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" }}
            >
              {t("dishes.newDish")}
            </button>
          )}
        </div>

        {/* Multi-Allergen Filter */}
        <div style={{ marginBottom: 24, padding: "16px", backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #E5E7EB" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 250 }}>
              <AllergenMultiFilter
                allergens={allergens}
                selectedAllergenIds={excludedAllergenIds}
                onChange={setExcludedAllergenIds}
              />
            </div>

            {excludedAllergenIds.length > 0 && (
              <button
                onClick={() => setExcludedAllergenIds([])}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#EF4444",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginTop: 20,
                }}
              >
                {t("common.clearAll")}
              </button>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 20, fontSize: 14, color: "#6B7280" }}>
          {t("dishes.showing", { filtered: filteredDishes.length, total: dishes.length })}
          {excludedAllergenIds.length > 0 &&
            ` (excluding ${excludedAllergenIds.map((id) => allergens.find((a) => a.id === id)?.nameEs).join(", ")})`
          }
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#6B7280" }}>
            <p>{t("dishes.loading")}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden", backgroundColor: "white" }}>
            <div style={{ display: "grid", gridTemplateColumns: "40px minmax(200px, 2fr) 140px 100px 100px 180px", gap: 16, padding: "16px 20px", backgroundColor: "#F3F4F6", fontWeight: 600, fontSize: 12, color: "#6B7280", borderBottom: "1px solid #E5E7EB", width: "100%" }}>
              <div></div>
              <div>{t("dishes.name")}</div>
              <div>{t("dishes.category")}</div>
              <div>{t("dishes.prepTime")}</div>
              <div>{t("dishes.servings")}</div>
              <div>{t("dishes.actions")}</div>
            </div>

            {filteredDishes.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center", color: "#6B7280" }}>
                {t("dishes.notFound")}
              </div>
            ) : (
              filteredDishes.map((dish, index) => (
                <div key={dish.id}>
                  <div
                    style={{ display: "grid", gridTemplateColumns: "40px minmax(200px, 2fr) 140px 100px 100px 180px", gap: 16, padding: "16px 20px", borderBottom: index < filteredDishes.length - 1 ? "1px solid #E5E7EB" : "none", alignItems: "center", backgroundColor: index % 2 === 0 ? "white" : "#F9FAFB", width: "100%" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F3F4F6"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = index % 2 === 0 ? "white" : "#F9FAFB"; }}
                  >
                    {editingId === dish.id && editingData ? (
                      <>
                        <div></div>
                        <input type="text" value={editingData.name || ""} onChange={(e) => setEditingData({ ...editingData, name: e.target.value })} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #E5E7EB", fontSize: 13, fontFamily: "inherit", minWidth: 0 }} />
                        <input type="text" value={editingData.category || ""} onChange={(e) => setEditingData({ ...editingData, category: e.target.value })} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #E5E7EB", fontSize: 13, fontFamily: "inherit" }} />
                        <input type="number" value={editingData.preparationTime || ""} onChange={(e) => setEditingData({ ...editingData, preparationTime: Number(e.target.value) })} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #E5E7EB", fontSize: 13, fontFamily: "inherit" }} />
                        <input type="number" value={editingData.servings || ""} onChange={(e) => setEditingData({ ...editingData, servings: Number(e.target.value) })} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #E5E7EB", fontSize: 13, fontFamily: "inherit" }} />
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => handleSave(dish.id)} disabled={savingId === dish.id} style={{ padding: "6px 12px", backgroundColor: "#22C55E", color: "white", border: "none", borderRadius: 6, cursor: savingId === dish.id ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600 }}>
                            {savingId === dish.id ? t("common.saving") : t("common.save")}
                          </button>
                          <button onClick={handleCancel} style={{ padding: "6px 12px", backgroundColor: "#E5E7EB", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                            {t("common.cancel")}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleToggleSteps(dish.id)}
                          style={{
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 16,
                            padding: 0,
                            width: 24,
                            height: 24,
                          }}
                          title={t("dishes.viewSteps") || "View steps"}
                        >
                          {expandedStepsId === dish.id ? "∨" : ">"}
                        </button>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 600, color: "#0F172A", fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dish.name}</p>
                          {dishAllergens[dish.id] && dishAllergens[dish.id].length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                              {dishAllergens[dish.id].map((allergen) => (
                                <img
                                  key={allergen.id}
                                  src={allergenImageMap[allergen.code]}
                                  alt={allergen.nameEs}
                                  title={allergen.nameEs}
                                  style={{ width: 16, height: 16, objectFit: "contain" }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: 13, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{getCategoryLabel(dish.category)}</div>
                        <div style={{ fontSize: 13, color: "#0F172A", whiteSpace: "nowrap" }}>{dish.preparationTime} min</div>
                        <div style={{ fontSize: 13, color: "#0F172A", whiteSpace: "nowrap" }}>{dish.servings}</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => navigate(`/dishes/${dish.id}`)} style={{ backgroundColor: "transparent", border: "none", color: "#3B82F6", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: "4px 8px", whiteSpace: "nowrap" }}>
                            {t("common.view")}
                          </button>
                          {isAdmin && (
                            <>
                              <button onClick={() => handleEdit(dish)} style={{ backgroundColor: "transparent", border: "none", color: "#7C3AED", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: "4px 8px", whiteSpace: "nowrap" }}>
                                {t("common.edit")}
                              </button>
                              <button onClick={() => handleDelete(dish.id)} style={{ backgroundColor: "transparent", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: "4px 8px", whiteSpace: "nowrap" }}>
                                {t("common.delete")}
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Steps Expandable Row */}
                  {expandedStepsId === dish.id && (
                    <div
                      style={{
                        backgroundColor: "#F9FAFB",
                        padding: "16px 20px",
                        borderBottom: "1px solid #E5E7EB",
                        borderLeft: "4px solid var(--color-purple)",
                      }}
                    >
                      {stepsLoading === dish.id ? (
                        <p style={{ margin: 0, color: "#6B7280", fontSize: 13 }}>{t("common.loading")}</p>
                      ) : stepsData[dish.id] && stepsData[dish.id].length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {stepsData[dish.id].map((step) => (
                            <div key={step.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                              <div
                                style={{
                                  backgroundColor: "var(--color-purple)",
                                  color: "white",
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: 12,
                                  flexShrink: 0,
                                }}
                              >
                                {step.stepNumber}
                              </div>
                              <div>
                                <p style={{ margin: 0, fontSize: 13, color: "#0F172A", fontWeight: 500 }}>
                                  {step.instruction}
                                </p>
                                {step.duration && (
                                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6B7280" }}>
                                    ⏱️ {step.duration} min
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ margin: 0, color: "#6B7280", fontSize: 13 }}>{t("dishDetail.noSteps") || "No steps available"}</p>
                      )}
                    </div>
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