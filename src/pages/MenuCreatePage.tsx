import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCurrentUser } from "../utils/storage";
import { menuService, recipeService, type Recipe } from "../services/api";
import MenuBar from "../components/MenuBar";
import BackButton from "../components/BackButton";

interface MenuItemForm {
  recipeId: string;
  recipeName: string;
  price: number;
  displayOrder: number;
  isAvailable: boolean;
}

export default function MenuCreatePage() {
  const user = getCurrentUser();
  const userRole = (user?.role || "admin") as "admin" | "kitchen" | "waiter" | "sales";
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!["admin", "waiter"].includes(userRole)) {
    navigate("/dashboard");
    return null;
  }

  const [formData, setFormData] = useState({
    name: "",
    isPublic: false,
  });

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemForm[]>([]);
  const [recipeSearch, setRecipeSearch] = useState<string>("");
  const [showRecipeDropdown, setShowRecipeDropdown] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [selectedPrice, setSelectedPrice] = useState<string>("");
  const [suggestedPrice, setSuggestedPrice] = useState<{ price: number; count: number } | null>(null);
  const [selectedAvailable, setSelectedAvailable] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [establishmentId, setEstablishmentId] = useState<string>("");

  // Fetch establishment ID y recipes
useEffect(() => {
  const fetchData = async () => {
    setRecipesLoading(true);
    try {
      const currentUser = getCurrentUser();
      const estId = currentUser?.establishmentId;
      if (estId) {
        setEstablishmentId(estId);

        const recipesRes = await recipeService.getByEstablishment(estId);
        if (recipesRes.success && recipesRes.data) {
          setRecipes(recipesRes.data);
          setFilteredRecipes(recipesRes.data);
        } else {
          setError("Failed to load recipes");
        }
      } else {
        setError("Failed to get user information");
        setRecipesLoading(false);
        return;
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data");
    } finally {
      setRecipesLoading(false);
    }
  };

  fetchData();
}, []);

  // Filtrar recipes según búsqueda
  useEffect(() => {
    if (recipeSearch.trim()) {
      const filtered = recipes.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(recipeSearch.toLowerCase()) &&
          !menuItems.some((mi) => mi.recipeId === recipe.id)
      );
      setFilteredRecipes(filtered);
    } else {
      setFilteredRecipes(
        recipes.filter((recipe) => !menuItems.some((mi) => mi.recipeId === recipe.id))
      );
    }
  }, [recipeSearch, recipes, menuItems]);

  const handleSelectRecipe = async (recipe: Recipe) => {
    setSelectedRecipeId(recipe.id);
    setRecipeSearch(recipe.name);
    setShowRecipeDropdown(false);
    setSelectedPrice(""); // Limpiar precio
    setSuggestedPrice(null);
    // Buscar precio sugerido desde menu_card_items existentes
    try {
        const itemsRes = await menuService.getItems();
        if (itemsRes.success && itemsRes.data) {
        // Encontrar items con este recipeId
        const itemsForRecipe = itemsRes.data.filter((item) => item.recipeId === recipe.id);
        
        if (itemsForRecipe.length > 0) {
            // Usar el primer precio encontrado (o podrías promediar)
            const suggestedPriceValue = itemsForRecipe[0].price;
            const count = itemsForRecipe.length;
            
            setSuggestedPrice({
            price: suggestedPriceValue,
            count: count,
            });
            
            // Opcionalmente, auto-llenar el precio
            setSelectedPrice(suggestedPriceValue.toString());
        }
        }
    } catch (err) {
        console.error("Error fetching suggested price:", err);
        // No es crítico si falla
    }
  };

  const handleAddItem = () => {
    if (!selectedRecipeId || !selectedPrice) {
      setError("Please select a recipe and enter a price");
      return;
    }

    const price = parseFloat(selectedPrice);
    if (price <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    const recipe = recipes.find((r) => r.id === selectedRecipeId);
    if (!recipe) return;

    const newOrder = menuItems.length + 1;

    setMenuItems([
      ...menuItems,
      {
        recipeId: selectedRecipeId,
        recipeName: recipe.name,
        price,
        displayOrder: newOrder,
        isAvailable: selectedAvailable,
      },
    ]);

    // Limpiar formulario
    setSelectedRecipeId("");
    setRecipeSearch("");
    setSelectedPrice("");
    setSelectedAvailable(true);
    setSuggestedPrice(null);
    setShowRecipeDropdown(false);
    setError(null);
  };

  const handleRemoveItem = (recipeId: string) => {
    const updated = menuItems
      .filter((mi) => mi.recipeId !== recipeId)
      .map((mi, idx) => ({ ...mi, displayOrder: idx + 1 }));
    setMenuItems(updated);
  };

  const handleUpdateItemOrder = (fromIndex: number, toIndex: number) => {
    const updated = [...menuItems];
    const [item] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, item);
    updated.forEach((mi, idx) => (mi.displayOrder = idx + 1));
    setMenuItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Menu name is required");
      return;
    }

    if (menuItems.length === 0) {
      setError("Add at least one dish to the menu");
      return;
    }

    if (!establishmentId) {
      setError("Failed to get establishment ID");
      return;
    }

    setLoading(true);
    try {
      const res = await menuService.create({
        establishmentId,
        name: formData.name,
        isPublic: formData.isPublic,
        qrCodeUrl: null,
        items: menuItems.map((mi) => ({
          recipeId: mi.recipeId,
          price: mi.price,
          displayOrder: mi.displayOrder,
          isAvailable: mi.isAvailable,
        })),
      });

      if (res.success) {
        navigate("/menus");
      } else {
        setError("Failed to create menu");
      }
    } catch (err) {
      console.error("Error creating menu:", err);
      setError("Error creating menu");
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
          {t("menuCreate.title")}
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
              {t("menuCreate.name")}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t("menuCreate.namePlaceholder")}
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

          {/* Public Toggle */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              />
              <span style={{ fontWeight: 600, color: "#0F172A" }}>
                {t("menuCreate.isPublic")}
              </span>
            </label>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6B7280" }}>
              {t("menuCreate.isPublicDescription")}
            </p>
          </div>

          {/* Items Section */}
          <div style={{ borderTop: "2px solid #E5E7EB", paddingTop: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#0F172A", marginBottom: 16 }}>
              {t("menuCreate.items")}
            </h2>

            {recipesLoading ? (
              <p style={{ color: "#6B7280" }}>Cargando platos...</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 12, marginBottom: 20 }}>
                {/* Recipe Search */}
                <div style={{ position: "relative" }}>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: 12, fontWeight: 600, color: "#6B7280" }}>
                    {t("menuCreate.recipe")}
                  </label>
                  <input
                    type="text"
                    value={recipeSearch}
                    onChange={(e) => {
                      setRecipeSearch(e.target.value);
                      setShowRecipeDropdown(true);
                    }}
                    onFocus={() => setShowRecipeDropdown(true)}
                    onBlur={() => setTimeout(() => setShowRecipeDropdown(false), 200)}
                    placeholder={t("menuCreate.recipePlaceholder")}
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
                  {showRecipeDropdown && filteredRecipes.length > 0 && (
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
                      {filteredRecipes.map((recipe) => (
                        <div
                          key={recipe.id}
                          onClick={() => handleSelectRecipe(recipe)}
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
                          {recipe.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: 12, fontWeight: 600, color: "#6B7280" }}>
                    {t("menuCreate.price")}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={selectedPrice || ""}
                    onChange={(e) => setSelectedPrice(e.target.value)}
                    placeholder={t("menuCreate.pricePlaceholder")}
                    style={{
                      width: "90%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #E5E7EB",
                      fontSize: "13px",
                      fontFamily: "inherit",
                    }}
                  />
                  {suggestedPrice && (
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#22C55E", fontWeight: 600 }}>
                      {t("menuCreate.suggestedPrice")} €{suggestedPrice.price.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Available */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 27, fontSize: 12 }}>
                    <input
                      type="checkbox"
                      checked={selectedAvailable}
                      onChange={(e) => setSelectedAvailable(e.target.checked)}
                    />
                    <span style={{ fontWeight: 600, color: "#6B7280" }}>Disp.</span>
                  </label>
                </div>

                {/* Add Button */}
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button
                    type="button"
                    onClick={handleAddItem}
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
                    {t("menuCreate.addItem")}
                  </button>
                </div>
              </div>
            )}

            {/* Items List */}
            {menuItems.length > 0 && (
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
                    gridTemplateColumns: "auto 2fr 1fr 1fr auto",
                    gap: 12,
                    padding: "12px 16px",
                    backgroundColor: "#F3F4F6",
                    fontWeight: 600,
                    fontSize: "12px",
                    color: "#6B7280",
                    borderBottom: "1px solid #E5E7EB",
                  }}
                >
                  <div>Orden</div>
                  <div>Plato</div>
                  <div>Precio</div>
                  <div>Disponible</div>
                  <div></div>
                </div>

                {menuItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 2fr 1fr 1fr auto",
                      gap: 12,
                      padding: "12px 16px",
                      borderBottom:
                        idx < menuItems.length - 1
                          ? "1px solid #E5E7EB"
                          : "none",
                      alignItems: "center",
                      backgroundColor: idx % 2 === 0 ? "white" : "#F9FAFB",
                    }}
                  >
                    <div style={{ display: "flex", gap: 4 }}>
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleUpdateItemOrder(idx, idx - 1)}
                          style={{
                            backgroundColor: "#E5E7EB",
                            border: "none",
                            borderRadius: 4,
                            padding: "2px 6px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          ↑
                        </button>
                      )}
                      {idx < menuItems.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleUpdateItemOrder(idx, idx + 1)}
                          style={{
                            backgroundColor: "#E5E7EB",
                            border: "none",
                            borderRadius: 4,
                            padding: "2px 6px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          ↓
                        </button>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: "#0F172A" }}>{item.recipeName}</div>
                    <div style={{ fontSize: 13, color: "#0F172A", fontWeight: 600 }}>
                      €{item.price.toFixed(2)}
                    </div>
                    <div>
                      <span
                        style={{
                          display: "inline-block",
                          backgroundColor: item.isAvailable ? "#D1FAE5" : "#FEE2E2",
                          color: item.isAvailable ? "#065F46" : "#991B1B",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {item.isAvailable ? "Sí" : "No"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.recipeId)}
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

            {menuItems.length === 0 && (
              <div style={{ textAlign: "center", padding: "24px", color: "#6B7280", backgroundColor: "#F9FAFB", borderRadius: 8 }}>
                {t("menuCreate.noItemsAdded")}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button
              type="button"
              onClick={() => navigate("/menus")}
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
              {loading ? t("common.creating") : t("menuCreate.createButton")}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}