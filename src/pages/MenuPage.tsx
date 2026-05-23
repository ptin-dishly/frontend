import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCurrentUser } from "../utils/storage";
import { menuService, allergenService, userService, recipeService, type Menu, type MenuItem, type Allergen} from "../services/api";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
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

export default function MenusPage() {
  const user = getCurrentUser();
  const userRole = (user?.role || "admin") as "admin" | "kitchen" | "waiter" | "sales";
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!["admin", "waiter"].includes(userRole)) {
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

  // View states
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  // List view states
  const [menus, setMenus] = useState<Menu[]>([]);
  const [menuSearch, setMenuSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [excludedAllergenIds, setExcludedAllergenIds] = useState<string[]>([]);
  const [menusWithAllergens, setMenusWithAllergens] = useState<Record<string, Allergen[]>>({});

  // Detail view states
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const [editedMenuName, setEditedMenuName] = useState("");
  const [editingMenuPublic, setEditingMenuPublic] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);

  // Fetch menus and allergens
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userRes = await userService.getMe();
        if (!userRes.success || !userRes.data) {
          setError("Failed to get user information");
          setLoading(false);
          return;
        }

        const currentUser = userRes.data;
        const establishmentId = currentUser.establishmentId;

        if (!establishmentId) {
          setError("User has no establishment assigned");
          setLoading(false);
          return;
        }

        // Obtener menus y allergens en paralelo
        const [menusRes, allergensRes] = await Promise.all([
          menuService.getByEstablishment(establishmentId),
          allergenService.getAll(),
        ]);

        if (menusRes.success && menusRes.data) {
          setMenus(menusRes.data);

          // Enriquecer menus con alérgenos
          if (menusRes.data.length > 0) {
            const results: Record<string, Allergen[]> = {};

            await Promise.all(
              menusRes.data.map(async (menu) => {
                try {
                  const res = await allergenService.getByMenu(menu.id);
                  if (res.success && res.data) {
                    results[menu.id] = res.data;
                  }
                } catch (err) {
                  console.error(`Error fetching allergens for menu ${menu.id}:`, err);
                }
              })
            );

            setMenusWithAllergens(results);
          }
        } else {
          setError("Failed to load menus");
        }

        if (allergensRes.success && allergensRes.data) {
          setAllergens(allergensRes.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load menus");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch menu items
  const fetchMenuItems = async (menuId: string) => {
    setDetailLoading(true);
    try {
      const res = await menuService.getItems();
      if (res.success && res.data) {
        const filtered = res.data.filter((item) => item.menuCardId === menuId);
        
        // Enriquecer items con imágenes de recipes
        const enrichedItems = await Promise.all(
          filtered.map(async (item) => {
            try {
              const recipeRes = await recipeService.getById(item.recipeId);
              if (recipeRes.success && recipeRes.data) {
                return {
                  ...item,
                  imageUrl: recipeRes.data.imageUrl,
                };
              }
            } catch (err) {
              console.error(`Error fetching recipe ${item.recipeId}:`, err);
            }
            return item;
          })
        );
        
        setMenuItems(enrichedItems);
      }
    } catch (err) {
      console.error("Error fetching menu items:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm(t("menus.deleteConfirm"))) return;

    try {
      const res = await menuService.delete(id);
      if (res.success) {
        setMenus(menus.filter((m) => m.id !== id));
      } else {
        setError("Failed to delete menu");
      }
    } catch (err) {
      console.error("Error deleting menu:", err);
      setError("Error deleting menu");
    }
  };

  const handleSaveMenu = async () => {
    if (!selectedMenu) return;

    setSavingMenu(true);
    try {
      const res = await menuService.update(selectedMenu.id, {
        name: editedMenuName,
        isPublic: editingMenuPublic,
      });

      if (res.success && res.data) {
        setSelectedMenu(res.data);
        setMenus(menus.map((m) => (m.id === selectedMenu.id ? res.data! : m)));
        setIsEditingMenu(false);
      } else {
        setError("Failed to save menu");
      }
    } catch (err) {
      console.error("Error saving menu:", err);
      setError("Error saving menu");
    } finally {
      setSavingMenu(false);
    }
  };

  const openMenuDetail = (menu: Menu) => {
    setSelectedMenu(menu);
    setEditedMenuName(menu.name);
    setEditingMenuPublic(menu.isPublic);
    fetchMenuItems(menu.id);
    setView("detail");
  };

  // Filter menus
  const filteredMenus = menus.filter((menu) => {
    const matchesSearch = menu.name.toLowerCase().includes(menuSearch.toLowerCase());
    const menuAllergenIds = (menusWithAllergens[menu.id] || []).map((a) => a.id);
    const hasExcludedAllergen = excludedAllergenIds.some((allergenId) =>
      menuAllergenIds.includes(allergenId)
    );
    const matchesAllergen = !hasExcludedAllergen;

    return matchesSearch && matchesAllergen;
  });

  if (view === "list") {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
        <MenuBar role={userRole} />

        <main style={{ flex: 1, padding: "40px 48px" }}>
          <div style={{ marginBottom: 30 }}>
            <h1 style={{ fontSize: 28, color: "#0F172A", margin: 0, fontWeight: 700 }}>
              {t("menus.title")}
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

          {/* Filters Row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 32,
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: 300, width: "100%" }}>
              <SearchBar
                value={menuSearch}
                onChange={setMenuSearch}
                placeholder={t("menus.searchPlaceholder")}
              />
            </div>

            <div style={{ maxWidth: 400, width: "100%" }}>
              <AllergenMultiFilter
                allergens={allergens}
                selectedAllergenIds={excludedAllergenIds}
                onChange={setExcludedAllergenIds}
              />
            </div>

            <button
              onClick={() => navigate("/menus/new")}
              style={{
                backgroundColor: "var(--color-green)",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {t("menus.newMenu")}
            </button>
          </div>

          <div style={{ marginBottom: 20, fontSize: 14, color: "#6B7280" }}>
            {t("menus.showing", { filtered: filteredMenus.length, total: menus.length })}
            {excludedAllergenIds.length > 0 &&
              ` (${t("menus.excluding")} ${excludedAllergenIds.map((id) => allergens.find((a) => a.id === id)?.nameEs).join(", ")})`
            }
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#6B7280" }}>
              <p>{t("menus.loading")}</p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 24,
              }}
            >
              {filteredMenus.length === 0 ? (
                <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#6B7280" }}>
                  {t("menus.notFound")}
                </p>
              ) : (
                filteredMenus.map((menu) => (
                  <div
                    key={menu.id}
                    onClick={() => openMenuDetail(menu)}
                    style={{
                      backgroundColor: "white",
                      borderRadius: 12,
                      border: "2px solid #7C3AED",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#0F172A" }}>
                        {menu.name}
                      </h3>
                      <span
                        style={{
                          backgroundColor: menu.isPublic ? "#D1FAE5" : "#FEE2E2",
                          color: menu.isPublic ? "#065F46" : "#991B1B",
                          padding: "4px 12px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {menu.isPublic ? t("menus.public") : t("menus.private")}
                      </span>
                    </div>

                    <p style={{ margin: 0, color: "#6B7280", fontSize: 14 }}>
                      {t("menus.created")} {new Date(menu.createdAt).toLocaleDateString()}
                    </p>

                    {menusWithAllergens[menu.id] && menusWithAllergens[menu.id].length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                        {menusWithAllergens[menu.id].map((allergen) => (
                          <img
                            key={allergen.id}
                            src={allergenImageMap[allergen.code]}
                            alt={allergen.nameEs}
                            title={allergen.nameEs}
                            style={{ width: 24, height: 24, objectFit: "contain" }}
                          />
                        ))}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMenu(menu.id);
                        }}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          backgroundColor: "#EF4444",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {t("common.delete")}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Detail view
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
      <MenuBar role={userRole} />

      <main style={{ flex: 1, padding: "40px 48px" }}>
        <button
          onClick={() => setView("list")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            color: "#0F172A",
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 20 }}>←</span>
          {t("menus.backToMenus")}
        </button>

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
            {isEditingMenu ? (
              <>
                <input
                  type="text"
                  value={editedMenuName}
                  onChange={(e) => setEditedMenuName(e.target.value)}
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
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    marginBottom: 12,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={editingMenuPublic}
                    onChange={(e) => setEditingMenuPublic(e.target.checked)}
                  />
                  {t("menus.public")}
                </label>
              </>
            ) : (
              <>
                <h1 style={{ fontSize: 28, color: "#0F172A", margin: "0 0 8px", fontWeight: 700 }}>
                  {selectedMenu?.name}
                </h1>
                <p style={{ margin: "0 0 16px", color: "#6B7280", fontSize: 14 }}>
                  {selectedMenu?.isPublic ? "🌍 " + t("menus.public") : "🔒 " + t("menus.private")}
                </p>
              </>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setView("list")}
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
                {t("common.back")}
              </button>
              {!isEditingMenu ? (
                <button
                  onClick={() => setIsEditingMenu(true)}
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
                  {t("menus.editMenu")}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveMenu}
                    disabled={savingMenu}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#22C55E",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: savingMenu ? "not-allowed" : "pointer",
                      fontSize: 14,
                    }}
                  >
                    {savingMenu ? t("common.saving") : t("common.save")}
                  </button>
                  <button
                    onClick={() => setIsEditingMenu(false)}
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
          </div>

          {/* Menu Items Section */}
          <div>
            <h2 style={{ fontSize: 20, color: "#0F172A", margin: "0 0 16px", fontWeight: 600 }}>
              {t("menus.menuItems")}
            </h2>

            {detailLoading ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#6B7280" }}>
                <p>{t("menus.loadingItems")}</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 24 }}>
                {menuItems.length === 0 ? (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "24px 16px", color: "#6B7280" }}>
                    {t("menus.noItemsFound")}
                  </div>
                ) : (
                  menuItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: "white",
                        borderRadius: 12,
                        border: "1px solid #E5E7EB",
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        display: "flex",
                        flexDirection: "column",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {/* Image */}
                      {item.imageUrl ? (
                        <div
                          style={{
                            width: "100%",
                            height: 200,
                            backgroundColor: "#F3F4F6",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.recipeName}
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
                            height: 200,
                            backgroundColor: "#F3F4F6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#9CA3AF",
                            fontSize: 14,
                          }}
                        >
                          {t("common.noImage")}
                        </div>
                      )}

                      {/* Content */}
                      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                        {/* Name */}
                        <div>
                          <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: "#0F172A" }}>
                            {item.recipeName}
                          </h3>
                          <p style={{ margin: 0, color: "#6B7280", fontSize: 13 }}>
                            {item.recipeDescription}
                          </p>
                        </div>

                        {/* Category & Details */}
                        <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#6B7280" }}>
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>{item.preparationTime} min</span>
                          <span>•</span>
                          <span>{item.portionSizeKg} kg</span>
                        </div>

                        {/* Price & Availability */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingTop: 12,
                            borderTop: "1px solid #E5E7EB",
                            marginTop: "auto",
                          }}
                        >
                          <span style={{ fontSize: 20, fontWeight: 700, color: "#7C3AED" }}>
                            €{item.price.toFixed(2)}
                          </span>
                          <span
                            style={{
                              display: "inline-block",
                              backgroundColor: item.isAvailable ? "#D1FAE5" : "#FEE2E2",
                              color: item.isAvailable ? "#065F46" : "#991B1B",
                              padding: "4px 12px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 500,
                            }}
                          >
                            {item.isAvailable ? t("menus.available") : t("menus.unavailable")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}