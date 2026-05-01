// src/pages/DishDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MenuBar from "../components/MenuBar";
import BackButton from "../components/BackButton";
import { recipeService, type Recipe, type RecipeIngredientDetail } from "../services/api";

export default function DishDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dish, setDish] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<RecipeIngredientDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDishDetails = async () => {
      if (!id) {
        setError("No recipe ID provided");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch dish details
        const dishRes = await recipeService.getById(id);
        if (dishRes.success && dishRes.data) {
          setDish(dishRes.data);

          // Fetch ingredients
          const ingredientsRes = await recipeService.getIngredients(id);
          if (ingredientsRes.success && ingredientsRes.data) {
            setIngredients(ingredientsRes.data);
          }
        } else {
          setError("Failed to load dish details");
        }
      } catch (err) {
        setError("Error loading dish: " + String(err));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDishDetails();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#FAFAFA" }}>
        <MenuBar role="admin" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "40px 20px", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontSize: "16px", color: "#6B7280" }}>Carregant detalls del plat...</p>
        </div>
      </div>
    );
  }

  if (error || !dish) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#FAFAFA" }}>
        <MenuBar role="admin" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "40px 20px" }}>
          <BackButton label="Tornar als plats" onClick={() => navigate("/dishes")} />
          <div style={{ padding: "16px", backgroundColor: "#fff1f0", border: "1px solid #fca5a5", borderRadius: "8px", color: "#b91c1c", fontSize: "14px", marginTop: "20px" }}>
            ⚠️ {error || "Plat no trobat"}
          </div>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      entrante: "#7C3AED",
      segundo_plato: "#2563EB",
      postre: "#EC4899",
      salsa: "#F59E0B",
    };
    return colors[category] || "#6B7280";
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#FAFAFA" }}>
      <MenuBar role="admin" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "40px 20px", alignItems: "center" }}>
        {/* Back Button */}
        <div style={{ width: "100%", maxWidth: "1200px", marginBottom: "20px" }}>
          <BackButton label="Tornar als plats" onClick={() => navigate("/dishes")} />
        </div>

        {/* Header */}
        <div style={{ width: "100%", maxWidth: "1200px", marginBottom: "40px", display: "flex", alignItems: "center", gap: "16px" }}>
          <h1 style={{ fontFamily: "Fustat, sans-serif", color: "#0F172A", fontSize: "28px", fontWeight: 700, margin: 0 }}>
            {dish.name}
          </h1>
          <span style={{
            display: "inline-block",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "#FFFFFF",
            backgroundColor: getCategoryColor(dish.category),
            padding: "6px 12px",
            borderRadius: "4px",
          }}>
            {dish.category}
          </span>
        </div>

        {/* Content Grid */}
        <div style={{ width: "100%", maxWidth: "1200px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "40px" }}>
          {/* Info Section */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Description Card */}
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", padding: "24px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", border: "1px solid #E5E7EB" }}>
              <h2 style={{ fontFamily: "Fustat, sans-serif", fontSize: "18px", fontWeight: 700, color: "#0F172A", margin: "0 0 16px 0" }}>
                Descripció
              </h2>
              <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: "1.6", margin: 0 }}>
                {dish.description || "No hi ha descripció disponible"}
              </p>
            </div>

            {/* Details Card */}
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", padding: "24px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", border: "1px solid #E5E7EB" }}>
              <h2 style={{ fontFamily: "Fustat, sans-serif", fontSize: "18px", fontWeight: 700, color: "#0F172A", margin: "0 0 16px 0" }}>
                Detalls del Plat
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* Preparation Time */}
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "4px" }}>
                    Temps de preparació
                  </span>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A" }}>
                    {dish.preparation_time} minuts
                  </span>
                </div>

                {/* Servings */}
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "4px" }}>
                    Porcions
                  </span>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A" }}>
                    {dish.servings}
                  </span>
                </div>

                {/* Portion Size */}
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "4px" }}>
                    Pes de la porció
                  </span>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A" }}>
                    {dish.portion_size_kg} kg
                  </span>
                </div>

                {/* Version */}
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "4px" }}>
                    Versió
                  </span>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "#0F172A" }}>
                    {dish.version}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ingredients Section */}
          <div>
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", padding: "24px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", border: "1px solid #E5E7EB" }}>
              <h2 style={{ fontFamily: "Fustat, sans-serif", fontSize: "18px", fontWeight: 700, color: "#0F172A", margin: "0 0 16px 0" }}>
                Ingredients
              </h2>
              {ingredients.length === 0 ? (
                <p style={{ fontSize: "14px", color: "#6B7280", fontStyle: "italic", margin: 0 }}>
                  No hi ha ingredients registrats
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {ingredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px",
                        backgroundColor: "#F9FAFB",
                        borderRadius: "8px",
                        border: "1px solid #E5E7EB",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#0F172A" }}>
                          {ingredient.name}
                        </span>
                        {ingredient.isOptional && (
                          <span style={{ fontSize: "10px", fontWeight: 700, color: "#F59E0B", backgroundColor: "#FEF3C7", padding: "2px 6px", borderRadius: "3px" }}>
                            Opcional
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#7C3AED" }}>
                        {ingredient.quantity} {ingredient.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ width: "100%", maxWidth: "1200px", display: "flex", gap: "16px" }}>
          <button
            style={{
              padding: "12px 24px",
              backgroundColor: "#2563EB",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1D4ED8")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563EB")}
          >
            Editar Plat
          </button>
          <button
            style={{
              padding: "12px 24px",
              backgroundColor: "#EF4444",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#DC2626")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#EF4444")}
          >
            Eliminar Plat
          </button>
        </div>
      </div>
    </div>
  );
}