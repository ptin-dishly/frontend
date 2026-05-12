import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCurrentUser } from "../utils/storage";
import MenuBar from "../components/MenuBar";
import BackButton from "../components/BackButton";

export default function NewIngredientPage() {
  const user = getCurrentUser();
  const userRole = (user?.role || "admin") as "admin" | "kitchen" | "waiter" | "sales";
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!["admin", "kitchen"].includes(userRole)) {
    navigate("/dashboard");
    return null;
  }

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name) {
      setError("Please fill in ingredient name");
      return;
    }

    setLoading(true);
    try {
      console.log("Creating ingredient (using fake data):", { name, description });
      setTimeout(() => {
        navigate("/ingredients");
      }, 1000);
    } catch (err) {
      setError("Failed to create ingredient");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <MenuBar role={userRole} />

      <main style={{ flex: 1, padding: "40px 48px" }}>
        <BackButton label="Back to Ingredients" />

        <h1 style={{ fontSize: 32, color: "#0F172A", margin: "20px 0" }}>
          {t("newIngredient.title")}
        </h1>

        <div style={{ backgroundColor: "#FEF3C7", color: "#92400E", padding: "12px 16px", borderRadius: "8px", marginBottom: "24px", fontSize: "13px" }}>
          ℹ️ {t("newIngredient.backendNotice")}
        </div>

        {error && (
          <div style={{ backgroundColor: "#FEE2E2", color: "#DC2626", padding: "16px", borderRadius: "8px", marginBottom: "24px", fontSize: "14px" }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ maxWidth: 500, display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#0F172A" }}>
              {t("newIngredient.name")}
            </label>
            <input
              type="text"
              placeholder={t("newIngredient.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "#0F172A" }}>
              {t("newIngredient.description")}
            </label>
            <textarea
              placeholder={t("newIngredient.descriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", minHeight: 100 }}
            />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button
              type="button"
              onClick={() => navigate("/ingredients")}
              style={{ flex: 1, padding: "12px 24px", backgroundColor: "#E5E7EB", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 }}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, padding: "12px 24px", backgroundColor: loading ? "#9CA3AF" : "#22C55E", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontSize: 14 }}
            >
              {loading ? t("newIngredient.creating") : t("newIngredient.createButton")}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
