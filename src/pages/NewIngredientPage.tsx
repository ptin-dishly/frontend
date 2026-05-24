import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCurrentUser } from "../utils/storage";
import { ingredientService } from "../services/api";
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
  const [isActive, setIsActive] = useState(true); // ← AGREGAR
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim()) {
      setError(t("newIngredient.nameRequired"));
      return;
    }

    setLoading(true);
    try {
      console.log("📝 Creating ingredient:", { name, description, isActive });
      
      const res = await ingredientService.create({
        name: name.trim(),
        description: description.trim() || null,
        isActive, // ← AGREGAR
      });

      if (res.success && res.data) {
        console.log("✅ Ingredient created:", res.data);
        setSuccess(true);
        
        // Limpiar formulario
        setName("");
        setDescription("");
        setIsActive(true);

        // Redirigir después de 1.5 segundos
        setTimeout(() => {
          navigate("/ingredients");
        }, 1500);
      } else {
        setError(res.error?.message || t("newIngredient.creationFailed"));
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t("newIngredient.creationError");
      setError(errorMsg);
      console.error("❌ Error creating ingredient:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
      <MenuBar role={userRole} />

      <main style={{ flex: 1, padding: "40px 48px" }}>
        <BackButton label={t("common.back")} />

        <h1 style={{ fontSize: 32, color: "#0F172A", margin: "20px 0", fontWeight: 700 }}>
          {t("newIngredient.title")}
        </h1>

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

        {success && (
          <div
            style={{
              backgroundColor: "#D1FAE5",
              color: "#065F46",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontSize: "14px",
            }}
          >
            ✅ {t("newIngredient.createdSuccess")}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: "white",
            padding: "32px",
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            maxWidth: 600,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Name */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
                color: "#0F172A",
              }}
            >
              {t("newIngredient.name")} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("newIngredient.namePlaceholder")}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #E5E7EB",
                fontSize: "14px",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: 600,
                color: "#0F172A",
              }}
            >
              {t("newIngredient.description")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("newIngredient.descriptionPlaceholder")}
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #E5E7EB",
                fontSize: "14px",
                fontFamily: "inherit",
                boxSizing: "border-box",
                minHeight: "100px",
                resize: "vertical",
              }}
            />
          </div>

          {/* Active Status - NUEVO */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: 600,
                color: "#0F172A",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={loading}
                style={{
                  width: 18,
                  height: 18,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              />
              {t("newIngredient.isActive")}
            </label>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button
              type="button"
              onClick={() => navigate("/ingredients")}
              disabled={loading}
              style={{
                flex: 1,
                padding: "10px 20px",
                backgroundColor: "#E5E7EB",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "10px 20px",
                backgroundColor: "#22C55E",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? t("common.creating") : t("common.create")}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}