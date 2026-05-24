import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { menuService, allergenService, type Menu, type MenuItem, type Allergen } from "../services/api";
import { ESTABLISHMENTS } from "../routes/index";

const LANGUAGES = [
  { code: "ca", label: "CA" },
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
];

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

const ALLERGEN_ICONS: Record<string, string> = {
  GLU: glutenImg, CRU: crustaceansImg, HUE: eggImg, PES: fishImg,
  CAC: peanutsImg, SOJ: soybeansImg, LAC: milkImg, FRU: treeNutsImg,
  API: celeryImg, MOS: mustardImg, SES: sesameImg, SUL: sulphitesImg,
  ALT: lupinsImg, MOL: molluscsImg,
};

interface MenuItemWithAllergens extends MenuItem {
  allergens?: Allergen[];
}

export default function PublicMenuPage() {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const { t, i18n } = useTranslation();
  const activeLanguage = i18n.language?.slice(0, 2);

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
        setError(t("menus.restaurantNotFound"));
        setLoading(false);
        return;
      }

      try {
        // Obtener menus
        const menusRes = await menuService.getByEstablishment(establishmentId);

        if (menusRes.success && menusRes.data) {
          setMenus(menusRes.data.filter((m) => m.isPublic));

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
          setError(t("menus.noMenusFound"));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(t("menus.loadError"));
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

  const CATEGORY_ORDER = ["entrante", "primer_plato", "segundo_plato", "postre", "salsa", "bebida"];

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
            <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
              <div style={{ display: "inline-flex", backgroundColor: "#F3E8D0", borderRadius: 10, padding: 3, gap: 2 }}>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => i18n.changeLanguage(lang.code)}
                    style={{
                      border: "none",
                      backgroundColor: activeLanguage === lang.code ? "#78350F" : "transparent",
                      color: activeLanguage === lang.code ? "#FEF3C7" : "#92400E",
                      borderRadius: 8,
                      padding: "5px 14px",
                      fontWeight: 700,
                      fontSize: 11,
                      cursor: "pointer",
                      fontFamily: "Georgia, serif",
                      letterSpacing: 1,
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Allergen filter bar */}
          {allergenPool.length > 0 && (
            <div style={{
              padding: "10px 16px",
              borderBottom: "1px solid #F3E8D0",
              display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
            }}>
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
                      title={a.nameEs}
                      style={{
                        background: active ? "#78350F" : "#F3E8D0",
                        border: active ? "2px solid #78350F" : "2px solid transparent",
                        borderRadius: 8, padding: "4px 6px",
                        cursor: "pointer", display: "flex",
                        alignItems: "center", gap: 4,
                        opacity: active ? 1 : 0.75,
                      }}
                    >
                      {ALLERGEN_ICONS[a.code]
                        ? <img src={ALLERGEN_ICONS[a.code]} alt={a.nameEs} style={{ width: 20, height: 20, objectFit: "contain", filter: active ? "brightness(0) invert(1)" : "none" }} />
                        : <span style={{ fontSize: 10, fontWeight: 700, color: active ? "white" : "#78350F" }}>{a.code}</span>
                      }
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
                        {t(`dishes.menuNames.${menu.name}`, { defaultValue: menu.name })}
                      </p>
                      <p style={{ margin: "0 0 8px", fontSize: 11, color: "#78716C", fontStyle: "italic", fontFamily: "Georgia, serif" }}>
                        {new Date(menu.createdAt).toLocaleDateString()}
                      </p>
                      {menuAllergens.length > 0 && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {menuAllergens.map((a) => (
                            ALLERGEN_ICONS[a.code]
                              ? <img key={a.id} src={ALLERGEN_ICONS[a.code]} alt={a.nameEs} title={a.nameEs} style={{ width: 20, height: 20, objectFit: "contain" }} />
                              : <span key={a.id} style={{ background: "#FEF3C7", color: "#92400E", borderRadius: 4, padding: "2px 6px", fontSize: 9, fontWeight: 700 }}>{a.code}</span>
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
  const grouped = menuItems.reduce<Record<string, MenuItemWithAllergens[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div style={{ background: "#FFFBF5", minHeight: "100vh" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        {/* Detail header */}
        <div style={{ borderBottom: "2px solid #D6C4A0", padding: "14px 16px 0" }}>
          <button
            onClick={() => setView("list")}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 12, color: "#78350F", fontWeight: 600,
              background: "transparent", border: "none", cursor: "pointer",
              marginBottom: 10, padding: 0,
            }}
          >
            ← {t("menus.backToMenus")}
          </button>
          <h1 style={{
            fontSize: 20, fontWeight: 800, color: "#1C1917",
            fontFamily: "Georgia, serif", margin: "0 0 12px",
          }}>
            {selectedMenu ? t(`dishes.menuNames.${selectedMenu.name}`, { defaultValue: selectedMenu.name }) : ""}
          </h1>
        </div>

        {/* Loading */}
        {detailLoading && (
          <p style={{ color: "#78716C", padding: "32px 20px", textAlign: "center", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
            {t("menus.loadingItems")}
          </p>
        )}

        {/* Category sections */}
        {!detailLoading && (
          <div style={{ paddingBottom: 32 }}>
            {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length > 0).map((cat) => (
              <div key={cat} style={{ padding: "16px 16px 0" }}>

                {/* Category label */}
                <p style={{
                  fontSize: 9, fontWeight: 700, color: "#92400E",
                  letterSpacing: 3, textAlign: "center",
                  borderBottom: "1px solid #F3E8D0",
                  paddingBottom: 8, margin: "0 0 8px",
                  fontFamily: "Georgia, serif",
                  textTransform: "uppercase",
                }}>
                  {t(`dishCreate.categories.${cat}`, { defaultValue: cat })}
                </p>

                {/* Dish rows */}
                {grouped[cat].map((item, idx) => {
                  const isLast = idx === grouped[cat].length - 1;
                  return (
                    <div
                      key={item.id}
                      style={{
                        borderBottom: isLast ? "none" : "1px dotted #D6C4A0",
                        paddingBottom: isLast ? 0 : 10,
                        marginBottom: isLast ? 0 : 10,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#1C1917", fontFamily: "Georgia, serif", flex: 1 }}>
                          {t(`dishes.names.${item.recipeName}`, { defaultValue: item.recipeName })}
                        </span>
                        <span style={{ fontSize: 13, color: "#78350F", fontWeight: 700, whiteSpace: "nowrap", marginLeft: 12 }}>
                          {item.price.toFixed(2)}€
                        </span>
                      </div>
                      {item.recipeDescription && (
                        <p style={{ fontSize: 11, color: "#78716C", fontStyle: "italic", fontFamily: "Georgia, serif", margin: "3px 0 0" }}>
                          {t(`dishes.descriptions.${item.recipeDescription}`, { defaultValue: item.recipeDescription })}
                        </p>
                      )}
                      {item.allergens && item.allergens.length > 0 && (
                        <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
                          {item.allergens.map((a) => (
                            ALLERGEN_ICONS[a.code]
                              ? <img key={a.id} src={ALLERGEN_ICONS[a.code]} alt={a.nameEs} title={a.nameEs} style={{ width: 18, height: 18, objectFit: "contain" }} />
                              : <span key={a.id} style={{ background: "#FEF3C7", color: "#92400E", borderRadius: 4, padding: "2px 6px", fontSize: 9, fontWeight: 700 }}>{a.code}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {!detailLoading && CATEGORY_ORDER.every((cat) => !grouped[cat]?.length) && (
              <p style={{ color: "#78716C", padding: "24px 16px", textAlign: "center", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                {t("menus.noItems")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}