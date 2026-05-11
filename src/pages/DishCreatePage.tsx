import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCurrentUser } from "../utils/storage";
import { recipeService } from "../services/api";
import MenuBar from "../components/MenuBar";
import BackButton from "../components/BackButton";

export default function RecipeCreatePage() {
  const user = getCurrentUser();
  const userRole = (user?.role || "admin") as "admin" | "kitchen" | "waiter" | "sales";
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!["admin", "kitchen"].includes(userRole)) {
    navigate("/dashboard");
    return null;
  }

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "primer_plato",
    portionSizeKg: 0.4,
    servings: 2,
    preparationTime: 30,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Recipe name is required");
      return;
    }

    setLoading(true);
    try {
      const res = await recipeService.create({
        establishment_id: "22222222-0002-0002-0002-000000000001",
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        portion_size_kg: formData.portionSizeKg,
        servings: formData.servings,
        preparation_time: formData.preparationTime,
      });

      if (res.success) {
        navigate("/dishes");
      } else {
        setError("Failed to create recipe");
      }
    } catch (err) {
      console.error("Error creating recipe:", err);
      setError("Error creating recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
      <MenuBar role={userRole} />

      <main style={{ flex: 1, padding: "40px 48px" }}>
        <BackButton label="Back to Dishes" />

        <h1 style={{ fontSize: 32, color: "#0F172A", margin: "20px 0", fontWeight: 700 }}>
          {t("dishCreate.title")}
        </h1>

        {error && (
          <div style={{ backgroundColor: "#FEE2E2", color: "#DC2626", padding: "12px 16px", borderRadius: "8px", marginBottom: "24px", fontSize: "14px" }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ backgroundColor: "white", padding: "32px", borderRadius: "12px", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#0F172A" }}>
              {t("dishCreate.recipeName")}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t("dishCreate.recipeNamePlaceholder")}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #E5E7EB", fontSize: "14px", fontFamily: "inherit" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#0F172A" }}>
              {t("dishCreate.description")}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t("dishCreate.descriptionPlaceholder")}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #E5E7EB", fontSize: "14px", fontFamily: "inherit", minHeight: "100px" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#0F172A" }}>
              {t("dishCreate.category")}
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #E5E7EB", fontSize: "14px", fontFamily: "inherit" }}
            >
              <option value="entrante">{t("dishCreate.categories.starter")}</option>
              <option value="primer_plato">{t("dishCreate.categories.firstCourse")}</option>
              <option value="segundo_plato">{t("dishCreate.categories.secondCourse")}</option>
              <option value="postre">{t("dishCreate.categories.dessert")}</option>
              <option value="salsa">{t("dishCreate.categories.sauce")}</option>
              <option value="bebida">{t("dishCreate.categories.drink")}</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#0F172A" }}>
              {t("dishCreate.portionSize")}
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={formData.portionSizeKg}
              onChange={(e) => setFormData({ ...formData, portionSizeKg: parseFloat(e.target.value) })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #E5E7EB", fontSize: "14px", fontFamily: "inherit" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#0F172A" }}>
              {t("dishCreate.servings")}
            </label>
            <input
              type="number"
              min="1"
              value={formData.servings}
              onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #E5E7EB", fontSize: "14px", fontFamily: "inherit" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#0F172A" }}>
              {t("dishCreate.prepTime")}
            </label>
            <input
              type="number"
              min="0"
              value={formData.preparationTime}
              onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #E5E7EB", fontSize: "14px", fontFamily: "inherit" }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button
              type="button"
              onClick={() => navigate("/dishes")}
              style={{ flex: 1, padding: "10px 20px", backgroundColor: "#E5E7EB", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, padding: "10px 20px", backgroundColor: "#22C55E", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? t("dishCreate.creating") : t("dishCreate.createButton")}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
