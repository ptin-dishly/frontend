import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCurrentUser } from "../utils/storage";
import { recipeService, recipeStepService, type Recipe, type RecipeIngredientDetail, type RecipeStep } from "../services/api";
import MenuBar from "../components/MenuBar";
import BackButton from "../components/BackButton";

export default function DishDetailPage() {
  const user = getCurrentUser();
  const userRole = (user?.role || "admin") as "admin" | "kitchen" | "waiter" | "sales";
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  if (!["admin", "kitchen"].includes(userRole)) {
    navigate("/dashboard");
    return null;
  }

  const [dish, setDish] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<RecipeIngredientDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDish, setEditedDish] = useState<Partial<Recipe> | null>(null);
  const [saving, setSaving] = useState(false);
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [steps, setSteps] = useState<RecipeStep[]>([]);
  const [stepsLoading, setStepsLoading] = useState(false);

  const fetchDishIngredients = async (recipeId: string) => {
    try {
      const res = await recipeService.getIngredients(recipeId);
      if (res.success && res.data) {
        const groupedIngredients = res.data.reduce(
          (acc, ingredient) => {
            const existing = acc.find((item) => item.name === ingredient.name);
            if (existing) {
              existing.quantity += ingredient.quantity;
            } else {
              acc.push({ ...ingredient });
            }
            return acc;
          },
          [] as RecipeIngredientDetail[]
        );
        setIngredients(groupedIngredients);
      }
    } catch (err) {
      console.error("Error fetching recipe ingredients:", err);
    }
  };

  useEffect(() => {
    const fetchDishDetails = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const recipeRes = await recipeService.getById(id);
        if (!recipeRes.success || !recipeRes.data) {
          setError("Dish not found");
          setLoading(false);
          return;
        }

        setDish(recipeRes.data);
        setEditedDish(recipeRes.data);

        await fetchDishIngredients(id);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dish details:", err);
        setError("Failed to load dish details");
        setLoading(false);
      }
    };

    fetchDishDetails();
  }, [id]);

  const handleSave = async () => {
    if (!dish || !editedDish || !id) return;

    setSaving(true);
    try {
      const res = await recipeService.update(id, {
        name: editedDish.name,
        description: editedDish.description,
        category: editedDish.category,
        preparationTime: editedDish.preparationTime,
        servings: editedDish.servings,
        portionSizeKg: editedDish.portionSizeKg,
      });

      if (res.success && res.data) {
        setDish(res.data);
        setIsEditing(false);
      } else {
        setError("Failed to save dish");
      }
    } catch (err) {
      console.error("Error saving dish:", err);
      setError("Error saving dish");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedDish(dish);
    setIsEditing(false);
  };

  const handleShowSteps = async () => {
    if (!id) return;
    setShowStepsModal(true);
    setStepsLoading(true);
    try {
      const res = await recipeStepService.getByRecipe(id);
      if (res.success && res.data) {
        setSteps(res.data.sort((a, b) => a.stepNumber - b.stepNumber));
      }
    } catch (err) {
      console.error("Error fetching recipe steps:", err);
      setError("Failed to load recipe steps");
    } finally {
      setStepsLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <MenuBar role={userRole} />
        <main style={{ flex: 1, padding: "40px 20px", textAlign: "center" }}>
          <p style={{ fontSize: "16px", color: "#6B7280" }}>{t("dishDetail.loading")}</p>
        </main>
      </div>
    );
  }

  if (error || !dish) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <MenuBar role={userRole} />
        <main style={{ flex: 1, padding: "40px 20px", textAlign: "center" }}>
          <p style={{ fontSize: "16px", color: "#DC2626" }}>
            {error || t("dishDetail.notFound")}
          </p>
          <button
            onClick={() => navigate("/dishes")}
            style={{
              marginTop: 20,
              padding: "10px 20px",
              backgroundColor: "#7C3AED",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t("common.back")}
          </button>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
      <MenuBar role={userRole} />

      <main style={{ flex: 1, padding: "40px 48px" }}>
        <BackButton label={t("common.back")} />

        <div style={{ marginTop: 24, maxWidth: 900 }}>
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

          {/* Image */}
          {!isEditing && (
            <>
              {dish?.imageUrl ? (
                <div
                  style={{
                    width: "100%",
                    maxWidth: 600,
                    height: 300,
                    borderRadius: 12,
                    overflow: "hidden",
                    marginBottom: 24,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: "100%",
                    maxWidth: 600,
                    height: 300,
                    borderRadius: 12,
                    backgroundColor: "#F3F4F6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 24,
                    color: "#9CA3AF",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {t("common.noImage")}
                </div>
              )}
            </>
          )}

          <div style={{ marginBottom: 32 }}>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={editedDish?.name || ""}
                  onChange={(e) =>
                    setEditedDish({ ...editedDish, name: e.target.value })
                  }
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#0F172A",
                    margin: "0 0 16px",
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    width: "100%",
                    fontFamily: "inherit",
                  }}
                />
                <textarea
                  value={editedDish?.description || ""}
                  onChange={(e) =>
                    setEditedDish({ ...editedDish, description: e.target.value })
                  }
                  style={{
                    fontSize: 14,
                    color: "#6B7280",
                    margin: "0 0 16px",
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #E5E7EB",
                    width: "100%",
                    fontFamily: "inherit",
                    minHeight: 80,
                  }}
                />
              </>
            ) : (
              <>
                <h1 style={{ fontSize: 28, color: "#0F172A", margin: "0 0 8px", fontWeight: 700 }}>
                  {dish.name}
                </h1>
                <p style={{ margin: "0 0 16px", color: "#6B7280", fontSize: 14 }}>
                  {dish.description}
                </p>
              </>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16,
                marginTop: 16,
              }}
            >
              <div style={{ backgroundColor: "white", padding: 16, borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: 12, color: "#6B7280", fontWeight: 600 }}>
                  {t("dishDetail.category")}
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedDish?.category || ""}
                    onChange={(e) =>
                      setEditedDish({ ...editedDish, category: e.target.value })
                    }
                    style={{
                      margin: "8px 0 0",
                      padding: "6px 8px",
                      borderRadius: 6,
                      border: "1px solid #E5E7EB",
                      fontSize: 13,
                      width: "100%",
                      fontFamily: "inherit",
                    }}
                  />
                ) : (
                  <p style={{ margin: "8px 0 0", fontSize: 16, color: "#0F172A", fontWeight: 600 }}>
                    {dish.category?.replace(/_/g, " ")}
                  </p>
                )}
              </div>

              <div style={{ backgroundColor: "white", padding: 16, borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: 12, color: "#6B7280", fontWeight: 600 }}>
                  {t("dishDetail.prepTime")}
                </p>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedDish?.preparationTime || ""}
                    onChange={(e) =>
                      setEditedDish({
                        ...editedDish,
                        preparationTime: Number(e.target.value),
                      })
                    }
                    style={{
                      margin: "8px 0 0",
                      padding: "6px 8px",
                      borderRadius: 6,
                      border: "1px solid #E5E7EB",
                      fontSize: 13,
                      width: "100%",
                      fontFamily: "inherit",
                    }}
                  />
                ) : (
                  <p style={{ margin: "8px 0 0", fontSize: 16, color: "#0F172A", fontWeight: 600 }}>
                    {dish.preparationTime} min
                  </p>
                )}
              </div>

              <div style={{ backgroundColor: "white", padding: 16, borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: 12, color: "#6B7280", fontWeight: 600 }}>
                  {t("dishDetail.servings")}
                </p>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedDish?.servings || ""}
                    onChange={(e) =>
                      setEditedDish({
                        ...editedDish,
                        servings: Number(e.target.value),
                      })
                    }
                    style={{
                      margin: "8px 0 0",
                      padding: "6px 8px",
                      borderRadius: 6,
                      border: "1px solid #E5E7EB",
                      fontSize: 13,
                      width: "100%",
                      fontFamily: "inherit",
                    }}
                  />
                ) : (
                  <p style={{ margin: "8px 0 0", fontSize: 16, color: "#0F172A", fontWeight: 600 }}>
                    {dish.servings}
                  </p>
                )}
              </div>

              <div style={{ backgroundColor: "white", padding: 16, borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: 12, color: "#6B7280", fontWeight: 600 }}>
                  {t("dishDetail.portionSize")}
                </p>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.1"
                    value={editedDish?.portionSizeKg || ""}
                    onChange={(e) =>
                      setEditedDish({
                        ...editedDish,
                        portionSizeKg: Number(e.target.value),
                      })
                    }
                    style={{
                      margin: "8px 0 0",
                      padding: "6px 8px",
                      borderRadius: 6,
                      border: "1px solid #E5E7EB",
                      fontSize: 13,
                      width: "100%",
                      fontFamily: "inherit",
                    }}
                  />
                ) : (
                  <p style={{ margin: "8px 0 0", fontSize: 16, color: "#0F172A", fontWeight: 600 }}>
                    {Number(dish.portionSizeKg).toFixed(2)} kg
                  </p>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, color: "#0F172A", margin: "0 0 16px", fontWeight: 600 }}>
              {t("dishDetail.ingredients")}
            </h2>

            <div
              style={{
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                overflow: "hidden",
                backgroundColor: "white",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr",
                  gap: 16,
                  padding: "12px 16px",
                  backgroundColor: "#F3F4F6",
                  fontWeight: 600,
                  fontSize: 12,
                  color: "#6B7280",
                  borderBottom: "1px solid #E5E7EB",
                }}
              >
                <div>{t("common.name")}</div>
                <div>{t("dishDetail.quantity")}</div>
                <div>{t("dishDetail.optional")}</div>
              </div>

              {ingredients.length === 0 ? (
                <div style={{ padding: "24px 16px", textAlign: "center", color: "#6B7280" }}>
                  {t("dishDetail.noIngredients")}
                </div>
              ) : (
                ingredients.map((ingredient, index) => (
                  <div
                    key={ingredient.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr",
                      gap: 16,
                      padding: "12px 16px",
                      borderBottom:
                        index < ingredients.length - 1 ? "1px solid #E5E7EB" : "none",
                      alignItems: "center",
                      backgroundColor: index % 2 === 0 ? "white" : "#F9FAFB",
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 500, color: "#0F172A", fontSize: 14 }}>
                        {ingredient.name}
                      </p>
                    </div>
                    <div style={{ fontSize: 13, color: "#0F172A" }}>
                      {Number(ingredient.quantity).toFixed(2)} {ingredient.unit}
                    </div>
                    <div>
                      <span
                        style={{
                          display: "inline-block",
                          backgroundColor: ingredient.isOptional ? "#E0E7FF" : "#F3F4F6",
                          color: ingredient.isOptional ? "#4C1D95" : "#6B7280",
                          padding: "4px 12px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {ingredient.isOptional ? t("dishDetail.optional") : t("dishDetail.required")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
                onClick={handleShowSteps}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "var(--color-purple)",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                📋 {t("Steps")}
              </button>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "var(--color-green)",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                {t("dishDetail.editDish")}
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#22C55E",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: saving ? "not-allowed" : "pointer",
                    fontSize: 14,
                  }}
                >
                  {saving ? t("common.saving") : t("common.save")}
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#EF4444",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  {t("common.cancel")}
                </button>
              </>
            )}
          </div>

          {/* Recipe Steps Modal */}
          {showStepsModal && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2400,
              }}
              onClick={() => setShowStepsModal(false)}
            >
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: 12,
                  padding: 32,
                  maxWidth: 600,
                  width: "90%",
                  maxHeight: "80vh",
                  overflowY: "auto",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 style={{ fontSize: 20, color: "#0F172A", margin: "0 0 24px", fontWeight: 700 }}>
                  {dish?.name} 
                </h2>

                {stepsLoading ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "#6B7280" }}>
                    <p>{t("common.loading") || "Loading steps..."}</p>
                  </div>
                ) : steps.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "#6B7280" }}>
                    <p>{t("dishDetail.noSteps") || "No recipe steps available"}</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {steps.map((step) => (
                      <div
                        key={step.id}
                        style={{
                          backgroundColor: "#F9FAFB",
                          padding: 16,
                          borderRadius: 8,
                          borderLeft: "4px solid var(--color-purple)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <div
                            style={{
                              backgroundColor: "var(--color-purple)",
                              color: "white",
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {step.stepNumber}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: 14, color: "#0F172A", fontWeight: 500, marginBottom: 8 }}>
                              {step.instruction}
                            </p>
                            {step.duration && (
                              <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>
                                ⏱️ {step.duration} {t("minutes") }
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowStepsModal(false)}
                  style={{
                    marginTop: 24,
                    padding: "10px 20px",
                    backgroundColor: "#E5E7EB",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 14,
                    width: "100%",
                  }}
                >
                  {t("common.close") || "Close"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}