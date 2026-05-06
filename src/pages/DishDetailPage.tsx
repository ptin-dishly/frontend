import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/storage";
import { recipeService, type Recipe, type RecipeIngredientDetail } from "../services/api";
import MenuBar from "../components/MenuBar";
import BackButton from "../components/BackButton";

export default function DishDetailPage() {
  const user = getCurrentUser();
  const userRole = (user?.role || "admin") as "admin" | "kitchen" | "waiter" | "sales";
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

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

        const ingredientsRes = await recipeService.getIngredients(id);
        if (ingredientsRes.success && ingredientsRes.data) {
          setIngredients(ingredientsRes.data);
        }

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
        preparation_time: editedDish.preparation_time,
        servings: editedDish.servings,
        portion_size_kg: editedDish.portion_size_kg,
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

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <MenuBar role={userRole} />
        <main style={{ flex: 1, padding: "40px 20px", textAlign: "center" }}>
          <p style={{ fontSize: "16px", color: "#6B7280" }}>Loading...</p>
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
            {error || "Dish not found"}
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
            Back to Dishes
          </button>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
      <MenuBar role={userRole} />

      <main style={{ flex: 1, padding: "40px 48px" }}>
        <BackButton label="Back to Dishes" />

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
                    margin: "0 0 8px",
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
                  Category
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
                    {dish.category}
                  </p>
                )}
              </div>

              <div style={{ backgroundColor: "white", padding: 16, borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: 12, color: "#6B7280", fontWeight: 600 }}>
                  Prep Time
                </p>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedDish?.preparation_time || ""}
                    onChange={(e) =>
                      setEditedDish({
                        ...editedDish,
                        preparation_time: Number(e.target.value),
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
                    {dish.preparation_time} min
                  </p>
                )}
              </div>

              <div style={{ backgroundColor: "white", padding: 16, borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: 12, color: "#6B7280", fontWeight: 600 }}>
                  Servings
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
                  Portion Size
                </p>
                <p style={{ margin: "8px 0 0", fontSize: 16, color: "#0F172A", fontWeight: 600 }}>
                  {dish.portion_size_kg} kg
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, color: "#0F172A", margin: "0 0 16px", fontWeight: 600 }}>
              Ingredients
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
                <div>Name</div>
                <div>Quantity</div>
                <div>Optional</div>
              </div>

              {ingredients.length === 0 ? (
                <div style={{ padding: "24px 16px", textAlign: "center", color: "#6B7280" }}>
                  No ingredients added
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
                      backgroundColor: index % 2 === 0 ? "white" : "#F9FAFB",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 500, color: "#0F172A", fontSize: 14 }}>
                        {ingredient.name}
                      </p>
                    </div>
                    <div style={{ fontSize: 13, color: "#0F172A" }}>
                      {ingredient.quantity} {ingredient.unit}
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
                        {ingredient.isOptional ? "Optional" : "Required"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => navigate("/dishes")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#E5E7EB",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Back
            </button>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#7C3AED",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Edit Dish
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
                  {saving ? "Saving..." : "Save"}
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
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}