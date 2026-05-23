import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { menuService, allergenService, type Menu, type MenuItem, type Allergen } from "../services/api";
import { ESTABLISHMENTS } from "../routes/index";
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

interface MenuItemWithAllergens extends MenuItem {
  allergens?: Allergen[];
}

export default function PublicMenuPage() {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
  const [menuItems, setMenuItems] = useState<MenuItemWithAllergens[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editedMenuName, setEditedMenuName] = useState("");
  const [editingMenuPublic, setEditingMenuPublic] = useState(false);

  // Fetch menus and allergens
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Obtener establishment ID del slug
      const establishmentId = (ESTABLISHMENTS as Record<string, string>)[restaurantSlug || ""];
      
      if (!establishmentId) {
        setError(`Restaurant "${restaurantSlug}" not found`);
        setLoading(false);
        return;
      }

      try {
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
          setError("No menus found for this restaurant");
        }

        if (allergensRes.success && allergensRes.data) {
          setAllergens(allergensRes.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load restaurant menu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantSlug]);

  // Fetch menu items
  const fetchMenuItems = async (menuId: string) => {
    setDetailLoading(true);
    try {
      const res = await menuService.getItems();
      if (res.success && res.data) {
        const filtered = res.data.filter((item) => item.menuCardId === menuId);
        
        // Enriquecer con alérgenos
        const enrichedItems = await Promise.all(
          filtered.map(async (item) => {
            try {
              const allergensRes = await allergenService.getByRecipe(item.recipeId);
              if (allergensRes.success && allergensRes.data) {
                return { ...item, allergens: allergensRes.data };
              }
            } catch (err) {
              console.error(`Error fetching allergens for recipe ${item.recipeId}:`, err);
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

          {/* Filters Row - Search and Allergen Filter */}
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

                    {/* Show allergens with icons */}
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
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, color: "#0F172A", margin: "0 0 8px", fontWeight: 700 }}>
              {selectedMenu?.name}
            </h1>
            <p style={{ margin: "0 0 16px", color: "#6B7280", fontSize: 14 }}>
              {selectedMenu?.isPublic ? "🌍 " + t("menus.public") : "🔒 " + t("menus.private")}
            </p>
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
                    gridTemplateColumns: "2fr 1fr 1fr 1fr",
                    gap: 16,
                    padding: "12px 16px",
                    backgroundColor: "#F3F4F6",
                    fontWeight: 600,
                    fontSize: 12,
                    color: "#6B7280",
                    borderBottom: "1px solid #E5E7EB",
                  }}
                >
                  <div>{t("menus.dish")}</div>
                  <div>{t("menus.category")}</div>
                  <div>{t("menus.price")}</div>
                  <div>{t("menus.available")}</div>
                </div>

                {menuItems.length === 0 ? (
                  <div style={{ padding: "24px 16px", textAlign: "center", color: "#6B7280" }}>
                    {t("menus.noItemsFound")}
                  </div>
                ) : (
                  menuItems.map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr 1fr",
                        gap: 16,
                        padding: "12px 16px",
                        borderBottom:
                          index < menuItems.length - 1
                            ? "1px solid #E5E7EB"
                            : "none",
                        alignItems: "center",
                        backgroundColor: index % 2 === 0 ? "white" : "#F9FAFB",
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, fontWeight: 500, color: "#0F172A", fontSize: 14 }}>
                          {item.recipeName}
                        </p>
                        {/* Show allergen icons */}
                        {item.allergens && item.allergens.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                            {item.allergens.map((allergen) => (
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
                      <div style={{ fontSize: 13, color: "#0F172A" }}>
                        {item.category}
                      </div>
                      <div style={{ fontSize: 13, color: "#0F172A" }}>
                        €{item.price.toFixed(2)}
                      </div>
                      <div>
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