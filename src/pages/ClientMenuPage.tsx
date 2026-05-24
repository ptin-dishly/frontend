import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { menuService, type Menu, type MenuItem } from "../services/api";
import { getCurrentUser } from "../utils/storage";

const LANGUAGES = [
  { code: "es", label: "ES" },
  { code: "ca", label: "CA" },
  { code: "en", label: "EN" },
];

export default function ClientMenuPage() {
  const { menuId } = useParams();
  const { t, i18n } = useTranslation();

  const [menu, setMenu] = useState<Menu | null>(null);
  const [publicMenus, setPublicMenus] = useState<Menu[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeLanguage = i18n.language?.slice(0, 2);

  useEffect(() => {
    const fetchClientMenu = async () => {
      if (!menuId) {
        const currentUser = getCurrentUser();

        // Public visitors can still use this page through QR links.
        // Without a logged-in user we do not have an establishment context
        // to list all menus, so we show only the scan prompt.
        if (!currentUser?.establishmentId) {
          setPublicMenus([]);
          setLoading(false);
          setError(null);
          return;
        }

        setLoading(true);
        setError(null);
        try {
          const res = await menuService.getByEstablishment(currentUser.establishmentId);
          if (!res.success || !res.data) {
            setError(t("clientMenu.loadError"));
            return;
          }
          setPublicMenus(res.data.filter((m) => m.isPublic));
        } catch (err) {
          console.error("Error loading public menus:", err);
          setError(t("clientMenu.loadError"));
        } finally {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [menuRes, itemsRes] = await Promise.all([
          menuService.getById(menuId),
          menuService.getItems(),
        ]);

        if (!menuRes.success || !menuRes.data) {
          setError(t("clientMenu.notFound"));
          return;
        }

        if (!itemsRes.success || !itemsRes.data) {
          setError(t("clientMenu.loadError"));
          return;
        }

        setMenu(menuRes.data);
        setItems(
          itemsRes.data.filter((item) => {
            const row = item as MenuItem & { menuId?: string };
            return row.menuCardId === menuId || row.menuId === menuId;
          }),
        );
      } catch (err) {
        console.error("Error loading client menu:", err);
        setError(t("clientMenu.loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchClientMenu();
  }, [menuId, t]);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.displayOrder - b.displayOrder),
    [items],
  );

  if (!menuId) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, backgroundColor: "#F8FAFC" }}>
        <div style={{ backgroundColor: "white", borderRadius: 16, padding: 24, border: "1px solid #E5E7EB", maxWidth: 760, width: "100%" }}>
          <h1 style={{ margin: "0 0 8px", color: "#0F172A" }}>{t("clientMenu.title")}</h1>
          <p style={{ margin: "0 0 16px", color: "#64748B" }}>{t("clientMenu.scanPrompt")}</p>

          {loading && <p style={{ margin: 0, color: "#64748B" }}>{t("clientMenu.loading")}</p>}
          {error && <p style={{ margin: 0, color: "#B91C1C" }}>{error}</p>}

          {!loading && !error && publicMenus.length === 0 && (
            <p style={{ margin: 0, color: "#64748B" }}>{t("clientMenu.noPublicMenus")}</p>
          )}

          {!loading && !error && publicMenus.length > 0 && (
            <div style={{ display: "grid", gap: 10 }}>
              {publicMenus.map((m) => (
                <Link
                  key={m.id}
                  to={`/client/menu/${m.id}`}
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    border: "1px solid #E2E8F0",
                    borderRadius: 10,
                    padding: "12px 14px",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: 18, color: "#0F172A" }}>{m.name}</h2>
                  <p style={{ margin: "6px 0 0", color: "#64748B", fontSize: 13 }}>
                    {new Date(m.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", padding: "24px 16px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <div style={{ display: "inline-flex", backgroundColor: "#F1F5F9", borderRadius: 10, padding: 3, gap: 2 }}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => i18n.changeLanguage(lang.code)}
                style={{
                  border: "none",
                  backgroundColor: activeLanguage === lang.code ? "#0F172A" : "transparent",
                  color: activeLanguage === lang.code ? "white" : "#64748B",
                  borderRadius: 8,
                  padding: "5px 14px",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                  fontFamily: "inherit",
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <section style={{ backgroundColor: "white", border: "1px solid #E5E7EB", borderRadius: 16, padding: 24, boxShadow: "0 6px 18px rgba(15,23,42,0.06)" }}>
          {loading && <p style={{ margin: 0, color: "#64748B" }}>{t("clientMenu.loading")}</p>}
          {error && <p style={{ margin: 0, color: "#B91C1C" }}>{error}</p>}

          {!loading && !error && menu && (
            <>
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ margin: 0, color: "#0F172A", fontSize: 30 }}>{menu.name}</h1>
                <p style={{ margin: "8px 0 0", color: menu.isPublic ? "#166534" : "#B91C1C", fontWeight: 600 }}>
                  {menu.isPublic ? t("clientMenu.public") : t("clientMenu.private")}
                </p>
              </div>

              {!menu.isPublic ? (
                <p style={{ margin: 0, color: "#B91C1C" }}>{t("clientMenu.notPublic")}</p>
              ) : sortedItems.length === 0 ? (
                <p style={{ margin: 0, color: "#64748B" }}>{t("clientMenu.noItems")}</p>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {sortedItems.map((item) => (
                    <article
                      key={item.id}
                      style={{
                        border: "1px solid #E2E8F0",
                        borderRadius: 12,
                        padding: 14,
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                        <div>
                          <h2 style={{ margin: 0, fontSize: 18, color: "#0F172A" }}>
                            {t(`dishes.names.${item.recipeName}`, { defaultValue: item.recipeName })}
                          </h2>
                          <p style={{ margin: "6px 0 0", color: "#64748B", fontSize: 14 }}>
                            {t(`clientMenu.categories.${item.category}`, { defaultValue: item.category.replace(/_/g, " ") })}
                          </p>
                        </div>
                        <p style={{ margin: 0, color: "#0F172A", fontWeight: 700, fontSize: 18 }}>€{item.price.toFixed(2)}</p>
                      </div>
                      {item.recipeDescription && (
                        <p style={{ margin: "10px 0 0", color: "#334155", fontSize: 14 }}>
                          {t(`dishes.descriptions.${item.recipeDescription}`, { defaultValue: item.recipeDescription })}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}