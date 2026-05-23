import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCurrentUser } from "../utils/storage";
import { recipeService, ingredientService, userService, type Ingredient } from "../services/api";
import MenuBar from "../components/MenuBar";
import BackButton from "../components/BackButton";

interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: "kg" | "l";
  isOptional: boolean;
}

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
    imageUrl: "",
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState<string>("");
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(0);
  const [selectedUnit, setSelectedUnit] = useState<"kg" | "l">("kg");
  const [selectedOptional, setSelectedOptional] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [ingredientsLoading, setIngredientsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [establishmentId, setEstablishmentId] = useState<string>("");

  // Fetch establishment ID y ingredients
  useEffect(() => {
    const fetchData = async () => {
      setIngredientsLoading(true);
      try {
        const userRes = await userService.getMe();
        if (userRes.success && userRes.data) {
          setEstablishmentId(userRes.data.establishmentId);
        } else {
          setError("Failed to get user information");
          setIngredientsLoading(false);
          return;
        }

        const res = await ingredientService.getAll();
        if (res.success && res.data) {
          setIngredients(res.data);
          setFilteredIngredients(res.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setIngredientsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar ingredientes según búsqueda
  useEffect(() => {
    if (ingredientSearch.trim()) {
      const filtered = ingredients.filter(
        (ing) =>
          ing.name.toLowerCase().includes(ingredientSearch.toLowerCase()) &&
          !recipeIngredients.some((ri) => ri.ingredientId === ing.id)
      );
      setFilteredIngredients(filtered);
    } else {
      setFilteredIngredients(
        ingredients.filter((ing) => !recipeIngredients.some((ri) => ri.ingredientId === ing.id))
      );
    }
  }, [ingredientSearch, ingredients, recipeIngredients]);

  const handleSelectIngredient = (ingredient: Ingredient) => {
    setSelectedIngredientId(ingredient.id);
    setIngredientSearch(ingredient.name);
    setShowIngredientDropdown(false);
  };

  const handleAddIngredient = () => {
    if (!selectedIngredientId || selectedQuantity <= 0) {
      setError("Please select an ingredient and enter a valid quantity");
      return;
    }

    const ingredient = ingredients.find((i) => i.id === selectedIngredientId);
    if (!ingredient) return;

    setRecipeIngredients([
      ...recipeIngredients,
      {
        ingredientId: selectedIngredientId,
        ingredientName: ingredient.name,
        quantity: selectedQuantity,
        unit: selectedUnit,
        isOptional: selectedOptional,
      },
    ]);

    setSelectedIngredientId("");
    setIngredientSearch("");
    setSelectedQuantity(0);
    setSelectedUnit("kg");
    setSelectedOptional(false);
    setShowIngredientDropdown(false);
    setError(null);
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setRecipeIngredients(recipeIngredients.filter((ri) => ri.ingredientId !== ingredientId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Recipe name is required");
      return;
    }

    if (!establishmentId) {
      setError("Failed to get establishment ID");
      return;
    }

    setLoading(true);
    try {
      const res = await recipeService.create({
        establishmentId,
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        portionSizeKg: formData.portionSizeKg,
        servings: formData.servings,
        preparationTime: formData.preparationTime,
        imageUrl: formData.imageUrl || undefined,
        createdBy: user?.id || "99999999-9999-9999-9999-000000000001",
        ...(recipeIngredients.length > 0 && {
          ingredients: recipeIngredients.map((ri) => ({
            ingredientId: ri.ingredientId,
            quantity: ri.quantity,
            unit: ri.unit,
            isOptional: ri.isOptional,
          })),
        }),
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
        <BackButton label={t("common.back")} />

        <h1 style={{ fontSize: 32, color: "#0F172A", margin: "20px 0", fontWeight: 700 }}>
          {t("dishCreate.title")}
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

        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: "white",
            padding: "32px",
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Basic Info */}
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#0F172A" }}>
              {t("dishCreate.name")}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t("dishCreate.namePlaceholder")}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #E5E7EB",
                fontSize: "14px",
                fontFamily: "inherit",
              }}
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
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #E5E7EB",
                fontSize: "14px",
                fontFamily: "inherit",
                minHeight: "100px",
              }}
            />
          </div>

          {/* Image URL */}
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#0F172A" }}>
              {t("dishCreate.imageUrl")}
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://ejemplo.com/imagen.jpg"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #E5E7EB",
                fontSize: "14px",
                fontFamily: "inherit",
              }}
            />
            {formData.imageUrl && (
              <div
                style={{
                  marginTop: 12,
                  borderRadius: 8,
                  overflow: "hidden",
                  maxWidth: 300,
                  height: 150,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#0F172A" }}>
                {t("dishCreate.category")}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #E5E7EB",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
              >
                <option value="entrante">Entrante</option>
                <option value="primer_plato">Primer plato</option>
                <option value="segundo_plato">Segundo plato</option>
                <option value="postre">Postre</option>
                <option value="salsa">Salsa</option>
                <option value="bebida">Bebida</option>
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
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #E5E7EB",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
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
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #E5E7EB",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, color: "#0F172A" }}>
                {t("dishCreate.prepTime")} (min)
              </label>
              <input
                type="number"
                min="0"
                value={formData.preparationTime}
                onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  border: "1px solid #E5E7EB",
                  fontSize: "14px",
                  fontFamily: "inherit",
                }}
              />
            </div>
          </div>

          {/* Ingredients Section */}
          <div style={{ borderTop: "2px solid #E5E7EB", paddingTop: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#0F172A", marginBottom: 16 }}>
              {t("dishCreate.ingredients")}
            </h2>

            {ingredientsLoading ? (
              <p style={{ color: "#6B7280" }}>Cargando ingredientes...</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 12, marginBottom: 20 }}>
                {/* Ingredient Search */}
                <div style={{ position: "relative" }}>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: 12, fontWeight: 600, color: "#6B7280" }}>
                    {t("dishCreate.ingredient")}
                  </label>
                  <input
                    type="text"
                    value={ingredientSearch}
                    onChange={(e) => {
                      setIngredientSearch(e.target.value);
                      setShowIngredientDropdown(true);
                    }}
                    onFocus={() => setShowIngredientDropdown(true)}
                    onBlur={() => setTimeout(() => setShowIngredientDropdown(false), 200)}
                    placeholder={t("dishCreate.ingredientPlaceholder")}
                    style={{
                      width: "95%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #E5E7EB",
                      fontSize: "13px",
                      fontFamily: "inherit",
                    }}
                  />

                  {/* Dropdown */}
                  {showIngredientDropdown && filteredIngredients.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        marginTop: "4px",
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: "6px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        zIndex: 10,
                        maxHeight: 200,
                        overflowY: "auto",
                      }}
                    >
                      {filteredIngredients.map((ing) => (
                        <div
                          key={ing.id}
                          onClick={() => handleSelectIngredient(ing)}
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            borderBottom: "1px solid #F3F4F6",
                            fontSize: "13px",
                            color: "#0F172A",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#F3F4F6";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "white";
                          }}
                        >
                          {ing.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: 12, fontWeight: 600, color: "#6B7280" }}>
                    {t("dishCreate.quantity")}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={selectedQuantity || ""}
                    onChange={(e) => setSelectedQuantity(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    style={{
                      width: "90%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #E5E7EB",
                      fontSize: "13px",
                      fontFamily: "inherit",
                    }}
                  />
                </div>

                {/* Unit */}
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: 12, fontWeight: 600, color: "#6B7280" }}>
                    {t("dishCreate.unit")}
                  </label>
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value as "kg" | "l")}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #E5E7EB",
                      fontSize: "13px",
                      fontFamily: "inherit",
                    }}
                  >
                    <option value="kg">kg</option>
                    <option value="l">l</option>
                  </select>
                </div>

                {/* Optional Checkbox */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 27, fontSize: 12 }}>
                    <input
                      type="checkbox"
                      checked={selectedOptional}
                      onChange={(e) => setSelectedOptional(e.target.checked)}
                    />
                    <span style={{ fontWeight: 600, color: "#6B7280" }}>Opt.</span>
                  </label>
                </div>

                {/* Add Button */}
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      backgroundColor: "#7C3AED",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {t("dishCreate.addIngredient")}
                  </button>
                </div>
              </div>
            )}

            {/* Ingredients List */}
            {recipeIngredients.length > 0 && (
              <div
                style={{
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#F9FAFB",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                    gap: 12,
                    padding: "12px 16px",
                    backgroundColor: "#F3F4F6",
                    fontWeight: 600,
                    fontSize: "12px",
                    color: "#6B7280",
                    borderBottom: "1px solid #E5E7EB",
                  }}
                >
                  <div>Ingrediente</div>
                  <div>Cantidad</div>
                  <div>Unidad</div>
                  <div>Opcional</div>
                  <div></div>
                </div>

                {recipeIngredients.map((ing, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                      gap: 12,
                      padding: "12px 16px",
                      borderBottom: idx < recipeIngredients.length - 1 ? "1px solid #E5E7EB" : "none",
                      alignItems: "center",
                      backgroundColor: idx % 2 === 0 ? "white" : "#F9FAFB",
                    }}
                  >
                    <div style={{ fontSize: 13, color: "#0F172A" }}>{ing.ingredientName}</div>
                    <div style={{ fontSize: 13, color: "#0F172A", fontWeight: 600 }}>
                      {ing.quantity}
                    </div>
                    <div style={{ fontSize: 13, color: "#0F172A" }}>{ing.unit}</div>
                    <div>
                      <span
                        style={{
                          display: "inline-block",
                          backgroundColor: ing.isOptional ? "#E0E7FF" : "#F3F4F6",
                          color: ing.isOptional ? "#4C1D95" : "#6B7280",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {ing.isOptional ? "Sí" : "No"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(ing.ingredientId)}
                      style={{
                        backgroundColor: "#EF4444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button
              type="button"
              onClick={() => navigate("/dishes")}
              style={{
                flex: 1,
                padding: "10px 20px",
                backgroundColor: "#E5E7EB",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
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
              }}
            >
              {loading ? t("common.creating") : t("dishCreate.createButton")}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}