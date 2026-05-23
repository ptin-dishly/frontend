import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { menuService, allergenService, type Menu, type MenuItem, type Allergen } from "../services/api";
import { ESTABLISHMENTS } from "../routes/index";

interface MenuItemWithAllergens extends MenuItem {
  allergens?: Allergen[];
}

export default function PublicMenuPage() {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const { t } = useTranslation();

  const establishment = ESTABLISHMENTS[restaurantSlug || ""];
  const restaurantName = establishment?.name ?? restaurantSlug ?? "";

  // View states
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  // List view states
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [excludedAllergenIds, setExcludedAllergenIds] = useState<string[]>([]);
  const [menusWithAllergens, setMenusWithAllergens] = useState<Record<string, Allergen[]>>({});

  // Detail view states
  const [menuItems, setMenuItems] = useState<MenuItemWithAllergens[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch menus and allergens
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Obtener establishment ID del slug
      const establishmentId = establishment?.id;

      if (!establishmentId) {
        setError(`Restaurant "${restaurantSlug}" not found`);
        setLoading(false);
        return;
      }

      try {
        // Obtener menus
        const menusRes = await menuService.getByEstablishment(establishmentId);

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
    fetchMenuItems(menu.id);
    setView("detail");
  };

  const filteredMenus = useMemo(() => {
    if (view !== "list") return [];
    return menus.filter((menu) => {
      const menuAllergenIds = (menusWithAllergens[menu.id] || []).map((a) => a.id);
      return !excludedAllergenIds.some((id) => menuAllergenIds.includes(id));
    });
  }, [menus, menusWithAllergens, excludedAllergenIds, view]);

  const allergenPool = useMemo(() => {
    return Array.from(
      new Map(
        Object.values(menusWithAllergens).flat().map((a) => [a.id, a])
      ).values()
    );
  }, [menusWithAllergens]);

  if (view === "list") {
    return (
      <div style={{ background: "#FFFBF5", minHeight: "100vh" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>

          {/* Header */}
          <div style={{
            borderBottom: "2px solid #D6C4A0",
            padding: "28px 20px 20px",
            textAlign: "center",
          }}>
            <p style={{
              fontSize: 9, color: "#92400E", letterSpacing: 4,
              fontFamily: "Georgia, serif",
              textTransform: "uppercase", margin: "0 0 6px",
            }}>
              {t("menus.welcomeTo")}
            </p>
            <h1 style={{
              fontSize: 26, fontWeight: 800, color: "#1C1917",
              fontFamily: "Georgia, serif", margin: "0 0 5px",
            }}>
              {restaurantName}
            </h1>
            <p style={{
              fontSize: 11, color: "#78716C", fontStyle: "italic",
              fontFamily: "Georgia, serif", margin: 0,
            }}>
              {t("menus.tagline")}
            </p>
          </div>

          {/* Allergen filter bar */}
          {allergenPool.length > 0 && (
            <div style={{
              padding: "10px 16px",
              borderBottom: "1px solid #F3E8D0",
              display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
            }}>
              <span style={{ fontSize: 11, color: "#92400E", fontWeight: 600, whiteSpace: "nowrap" }}>
                Excloure:
              </span>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {allergenPool.map((a) => {
                  const active = excludedAllergenIds.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() =>
                        setExcludedAllergenIds((prev) =>
                          active ? prev.filter((id) => id !== a.id) : [...prev, a.id]
                        )
                      }
                      style={{
                        background: active ? "#78350F" : "#F3E8D0",
                        color: active ? "white" : "#78350F",
                        border: "none", borderRadius: 20,
                        padding: "3px 10px", fontSize: 10,
                        fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      {a.code}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p style={{ color: "#92400E", padding: "16px 20px", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
              {error}
            </p>
          )}

          {/* Loading */}
          {loading && (
            <p style={{ color: "#78716C", padding: "32px 20px", textAlign: "center", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
              {t("common.loading")}
            </p>
          )}

          {/* Menu card list */}
          {!loading && (
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredMenus.length === 0 && (
                <p style={{ textAlign: "center", color: "#78716C", fontFamily: "Georgia, serif", fontStyle: "italic", padding: "24px 0" }}>
                  {t("menus.notFound")}
                </p>
              )}
              {filteredMenus.map((menu) => {
                const menuAllergens = menusWithAllergens[menu.id] || [];
                return (
                  <div
                    key={menu.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openMenuDetail(menu)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openMenuDetail(menu); }}
                    style={{
                      background: "white", borderRadius: 10,
                      border: "1px solid #F3E8D0",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      padding: "14px 16px",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#FFFBF5"; e.currentTarget.style.borderColor = "#D6C4A0"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#F3E8D0"; }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: "#1C1917", fontFamily: "Georgia, serif" }}>
                        {menu.name}
                      </p>
                      <p style={{ margin: "0 0 8px", fontSize: 11, color: "#78716C", fontStyle: "italic", fontFamily: "Georgia, serif" }}>
                        {new Date(menu.createdAt).toLocaleDateString()}
                      </p>
                      {menuAllergens.length > 0 && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {menuAllergens.map((a) => (
                            <span key={a.id} style={{
                              background: "#FEF3C7", color: "#92400E",
                              borderRadius: 4, padding: "2px 6px",
                              fontSize: 9, fontWeight: 700,
                            }}>
                              {a.code}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: 20, color: "#D6C4A0", marginLeft: 12 }}>›</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
                        {/* Show allergen badges */}
                        {item.allergens && item.allergens.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                            {item.allergens.map((allergen) => (
                              <span
                                key={allergen.id}
                                title={allergen.nameEs}
                                style={{
                                  background: "#FEF3C7", color: "#92400E",
                                  borderRadius: 4, padding: "1px 5px",
                                  fontSize: 9, fontWeight: 700,
                                }}
                              >
                                {allergen.code}
                              </span>
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