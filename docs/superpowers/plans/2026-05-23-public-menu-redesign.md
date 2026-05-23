# Public Menu Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `PublicMenuPage.tsx` with a warm carta-impresa aesthetic — cream palette, Georgia serif, no admin UI elements — keeping all existing fetch logic intact.

**Architecture:** Single file rewrite (`PublicMenuPage.tsx`). Extend `ESTABLISHMENTS` in `routes/index.tsx` to include restaurant names. All data fetching stays identical; only the render layer changes. Two views: menu selection list (Pantalla 1) and menu detail by category (Pantalla 2).

**Tech Stack:** React 19, TypeScript, react-i18next (existing keys reused), inline styles (project convention)

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `src/routes/index.tsx` | Modify | `ESTABLISHMENTS` extended with `name` per entry |
| `src/pages/PublicMenuPage.tsx` | Rewrite render layer | Full visual overhaul; fetch logic untouched |

---

### Task 1: Extend ESTABLISHMENTS with restaurant name

**Files:**
- Modify: `src/routes/index.tsx:19-22`

- [ ] **Step 1: Update the ESTABLISHMENTS map**

Open `src/routes/index.tsx`. Replace the current map (lines 19–22):

```ts
export const ESTABLISHMENTS: Record<string, { id: string; name: string }> = {
  "ca-la-maria": { id: "22222222-0002-0002-0002-000000000001", name: "Ca la Maria" },
  "el-raco":     { id: "22222222-0002-0002-0002-000000000002", name: "El Racó" },
};
```

- [ ] **Step 2: Fix the two consumers of ESTABLISHMENTS**

`PublicMenuPage.tsx` currently does:
```ts
const establishmentId = (ESTABLISHMENTS as Record<string, string>)[restaurantSlug || ""];
```
Change it to:
```ts
const establishment = ESTABLISHMENTS[restaurantSlug || ""];
const establishmentId = establishment?.id;
const restaurantName  = establishment?.name ?? restaurantSlug ?? "";
```

`routes/index.tsx` itself does not consume the map — no other change needed there.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit` from `frontend/`  
Expected: 0 errors (or only pre-existing errors unrelated to this change)

- [ ] **Step 4: Commit**

```bash
git add src/routes/index.tsx src/pages/PublicMenuPage.tsx
git commit -m "feat: extend ESTABLISHMENTS with restaurant name for public menu header"
```

---

### Task 2: Rewrite Pantalla 1 — header, allergen filter, menu card list

**Files:**
- Modify: `src/pages/PublicMenuPage.tsx` — the `view === "list"` return block (currently lines 184–336)

- [ ] **Step 1: Replace the list-view return block**

Find the block starting at `if (view === "list") { return (` and replace the entire JSX with:

```tsx
if (view === "list") {
  const filteredMenus = menus.filter((menu) => {
    const menuAllergenIds = (menusWithAllergens[menu.id] || []).map((a) => a.id);
    return !excludedAllergenIds.some((id) => menuAllergenIds.includes(id));
  });

  // Unique allergens that appear in at least one menu
  const allergenPool = Array.from(
    new Map(
      Object.values(menusWithAllergens).flat().map((a) => [a.id, a])
    ).values()
  );

  return (
    <div style={{ background: "#FFFBF5", minHeight: "100vh" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{
          borderBottom: "2px solid #D6C4A0",
          padding: "28px 20px 20px",
          textAlign: "center",
        }}>
          <p style={{
            fontSize: 9, color: "#92400E", letterSpacing: 4,
            marginBottom: 6, fontFamily: "Georgia, serif",
            textTransform: "uppercase", margin: "0 0 6px",
          }}>
            Benvinguts a
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
            Cuina catalana de mercat
          </p>
        </div>

        {/* ── Allergen filter bar ── */}
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

        {/* ── Error ── */}
        {error && (
          <p style={{ color: "#92400E", padding: "16px 20px", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
            {error}
          </p>
        )}

        {/* ── Loading ── */}
        {loading && (
          <p style={{ color: "#78716C", padding: "32px 20px", textAlign: "center", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
            {t("common.loading")}
          </p>
        )}

        {/* ── Menu card list ── */}
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
                  onClick={() => openMenuDetail(menu)}
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
```

- [ ] **Step 2: Remove unused state variables**

Remove these state declarations that are no longer needed (they were for the admin edit functionality):
```ts
// DELETE these lines:
const [editedMenuName, setEditedMenuName] = useState("");
const [editingMenuPublic, setEditingMenuPublic] = useState(false);
const [savingMenu, setSavingMenu] = useState(false);
// Also remove menuSearch state — search is replaced by allergen filter only
const [menuSearch, setMenuSearch] = useState("");
```

Also remove the `openMenuDetail` function's lines that set these deleted states:
```ts
// In openMenuDetail, KEEP:
setSelectedMenu(menu);
fetchMenuItems(menu.id);
setView("detail");
// DELETE:
setEditedMenuName(menu.name);
setEditingMenuPublic(menu.isPublic);
```

- [ ] **Step 3: Verify TypeScript**

```bash
pnpm tsc --noEmit
```
Expected: 0 new errors

- [ ] **Step 4: Commit**

```bash
git add src/pages/PublicMenuPage.tsx
git commit -m "feat: public menu list view — warm carta style, allergen filter pills"
```

---

### Task 3: Rewrite Pantalla 2 — detail view with category sections

**Files:**
- Modify: `src/pages/PublicMenuPage.tsx` — the detail-view return block (currently lines 338–478)

- [ ] **Step 1: Add CATEGORY_ORDER constant and grouped items logic**

At the top of the component function body (before the `useEffect`), add:

```ts
const CATEGORY_ORDER = ["entrante", "primer_plato", "segundo_plato", "postre", "salsa", "bebida"];
```

- [ ] **Step 2: Replace the detail-view return block**

Find the `// Detail view` comment and replace the entire return with:

```tsx
// Detail view
const grouped = menuItems.reduce<Record<string, MenuItemWithAllergens[]>>((acc, item) => {
  if (!acc[item.category]) acc[item.category] = [];
  acc[item.category].push(item);
  return acc;
}, {});

return (
  <div style={{ background: "#FFFBF5", minHeight: "100vh" }}>
    <div style={{ maxWidth: 600, margin: "0 auto" }}>

      {/* ── Detail header ── */}
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
          {selectedMenu?.name}
        </h1>
      </div>

      {/* ── Loading ── */}
      {detailLoading && (
        <p style={{ color: "#78716C", padding: "32px 20px", textAlign: "center", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
          {t("menus.loadingItems")}
        </p>
      )}

      {/* ── Category sections ── */}
      {!detailLoading && (
        <div style={{ paddingBottom: 32 }}>
          {CATEGORY_ORDER.filter((cat) => grouped[cat]?.length > 0).map((cat) => (
            <div key={cat} style={{ padding: "16px 16px 0" }}>

              {/* Category label */}
              <p style={{
                fontSize: 9, fontWeight: 700, color: "#92400E",
                letterSpacing: 3, textAlign: "center",
                borderBottom: "1px solid #F3E8D0",
                paddingBottom: 8, marginBottom: 8,
                fontFamily: "Georgia, serif",
                textTransform: "uppercase", margin: "0 0 8px",
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
                        {item.recipeName}
                      </span>
                      <span style={{ fontSize: 13, color: "#78350F", fontWeight: 700, whiteSpace: "nowrap", marginLeft: 12 }}>
                        {item.price.toFixed(2)}€
                      </span>
                    </div>
                    {item.recipeDescription && (
                      <p style={{ fontSize: 11, color: "#78716C", fontStyle: "italic", fontFamily: "Georgia, serif", margin: "3px 0 0" }}>
                        {item.recipeDescription}
                      </p>
                    )}
                    {item.allergens && item.allergens.length > 0 && (
                      <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
                        {item.allergens.map((a) => (
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
                );
              })}
            </div>
          ))}

          {menuItems.length === 0 && (
            <p style={{ color: "#78716C", padding: "24px 16px", textAlign: "center", fontFamily: "Georgia, serif", fontStyle: "italic" }}>
              {t("menus.noItems")}
            </p>
          )}
        </div>
      )}
    </div>
  </div>
);
```

- [ ] **Step 3: Remove unused imports**

Remove these imports that are no longer used after the rewrite:
```ts
// DELETE:
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import AllergenMultiFilter from "../components/AllergenMultiFilter";
// DELETE the 14 allergen image imports (glutenImg, crustaceansImg, etc.)
// DELETE the allergenImageMap constant inside the component
```

Also remove `const navigate = useNavigate();` from the component body.

- [ ] **Step 4: TypeScript check**

```bash
pnpm tsc --noEmit
```
Expected: 0 new errors

- [ ] **Step 5: Commit**

```bash
git add src/pages/PublicMenuPage.tsx
git commit -m "feat: public menu detail view — category sections, dish rows with description + allergen badges"
```

---

### Task 4: Visual verification

**Files:** none — browser only

- [ ] **Step 1: Start the dev server if not running**

```bash
cd /Users/carlosmac/Desktop/UPC/PROJECT_PTIN/frontend
pnpm dev
```

Make sure the backend is also running:
```bash
cd /Users/carlosmac/Desktop/UPC/PROJECT_PTIN/backend
pnpm dev
```

- [ ] **Step 2: Open Pantalla 1**

Navigate to: `http://localhost:5173/restaurant/ca-la-maria`

Check:
- [ ] Fondo crema `#FFFBF5`, sin sidebar ni MenuBar
- [ ] Header: eyebrow "Benvinguts a", h1 "Ca la Maria" en Georgia, subtítulo en cursiva
- [ ] Barra de alérgenos con pills (GLU, LAC, HUE…)
- [ ] Tarjetas de carta: nombre en Georgia, fecha en cursiva, badges de alérgenos en amarillo crema
- [ ] Click en una tarjeta → navega a Pantalla 2

- [ ] **Step 3: Verificar filtro de alérgenos**

Activar un pill (e.g., PES). Las cartas que contengan ese alérgeno deben desaparecer.

- [ ] **Step 4: Open Pantalla 2**

Click en "Carta Principal". Comprobar:
- [ ] Botón `← Totes les cartes` visible, click vuelve a Pantalla 1
- [ ] Nombre de la carta en Georgia 20px bold
- [ ] Secciones por categoría con label en mayúsculas + letra spacing
- [ ] Cada plato: nombre bold + precio `#78350F` + descripción italic + badges alérgenos
- [ ] Último plato de cada sección sin línea punteada inferior

- [ ] **Step 5: Comprobar mobile**

En DevTools (F12) → Toggle device toolbar → iPhone SE (375px).
- [ ] Sin scroll horizontal
- [ ] Tarjetas ocupan todo el ancho
- [ ] Header legible

- [ ] **Step 6: Commit final si todo OK**

```bash
git add -A
git commit -m "feat: public menu page — complete carta-impresa redesign"
```
