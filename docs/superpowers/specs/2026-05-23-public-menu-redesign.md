# Public Menu Page Redesign Spec

## Goal

Rediseñar la página pública de menú (`/restaurant/:slug`) para que sea una experiencia de cliente real: cálida, legible en móvil y coherente con la estética de carta impresa tradicional — sin ningún elemento de la UI interna de la app.

## Context

La página actual reutiliza estilos del panel de administración (fondo gris, tabla con filas zebra, badge verde/rojo de público/privado). Los clientes acceden via QR sin estar autenticados. El objetivo es que sientan que están leyendo una carta de restaurante, no usando un panel de gestión.

URL: `/restaurant/:restaurantSlug` → mapeado a `establishmentId` vía `ESTABLISHMENTS` en `routes/index.tsx`.

---

## Design Decisions

### Paleta de color
- Fondo: `#FFFBF5` (crema cálido)
- Separadores: `#D6C4A0`
- Acento principal: `#78350F` (marrón oscuro) — precios, botón volver, nombre activo
- Acento secundario: `#92400E` — labels de categoría, eyebrow text
- Texto principal: `#1C1917`
- Texto secundario / descripción: `#78716C`
- Badge alérgeno fondo: `#FEF3C7`, texto: `#92400E`
- Sin morado (`#7C3AED`) — ese color es exclusivo de la UI interna

### Tipografía
- Nombres de platos, títulos de carta, subtítulo: `Georgia, serif`
- Precios, badges, UI chrome (botón volver, filtros): `system-ui, sans-serif`
- La mezcla serif/sans-serif es intencional: evoca carta impresa

### Layout
- Sin `MenuBar`, sin sidebar, sin elementos de navegación interna
- Diseñado mobile-first: ancho máximo 600px, centrado en desktop
- Scroll vertical, sin tabs ni navegación horizontal

---

## Screens

### Pantalla 1 — Selección de carta

**Header:**
```
[eyebrow: "BENVINGUTS A" — 9px, #92400E, letter-spacing 4px]
[h1: nombre del restaurante — Georgia 26px bold, #1C1917]
[subtitle: descripción / ciudad — Georgia 11px italic, #78716C]
[separador: 2px solid #D6C4A0]
```

**Barra de filtro de alérgenos** (debajo del header):
- Pills compactas con código corto: GLU, LAC, HUE, PES…
- Estado activo: fondo `#78350F`, texto blanco
- Estado inactivo: fondo `#F3E8D0`, texto `#78350F`
- Label "Excloure:" a la izquierda
- Al activar un alérgeno, se ocultan las cartas que lo contienen

**Lista de cartas:**
- Una tarjeta por carta (`Menu` del backend)
- Cada tarjeta: nombre (Georgia bold 15px) + descripción/subtítulo opcional (italic 11px) + badges de alérgenos + flecha `›` a la derecha
- Fondo blanco, borde `#F3E8D0`, sombra sutil
- Tap → navega a Pantalla 2

### Pantalla 2 — Detalle de carta

**Header secundario** (sin repetir el nombre del restaurante):
- Botón `← Totes les cartes` (texto `#78350F`, font-weight 600)
- Nombre de la carta en Georgia 20px bold
- Separador `2px solid #D6C4A0`

**Secciones por categoría:**
Cada categoría (entrante, primer_plato, segundo_plato, postre, salsa, bebida) es una sección independiente:
```
[LABEL: "ENTRANTES" — 9px, #92400E, letter-spacing 3px, centrado, border-bottom 1px #F3E8D0]
[lista de platos]
```

Orden fijo de categorías:
1. `entrante`
2. `primer_plato`
3. `segundo_plato`
4. `postre`
5. `salsa`
6. `bebida`

Solo se renderizan las categorías que tienen platos en esa carta.

**Fila de plato:**
```
[Nombre del plato — Georgia 13px bold]   [Precio — 13px #78350F bold]
[Descripción — Georgia 11px italic #78716C]
[badges alérgenos — GLU LAC PES… fondo #FEF3C7 texto #92400E]
[separador: 1px dotted #D6C4A0]
```

El último plato de cada sección no tiene separador inferior.

---

## Data Flow

La página no requiere autenticación. Las llamadas al backend son públicas (sin token).

```
GET /api/v1/menus/establishment/:id      → lista de cartas
GET /api/v1/allergens                    → lista completa de alérgenos
GET /api/v1/allergens/menu/:menuId       → alérgenos por carta (para filtro pantalla 1)
GET /api/v1/menu-card-items              → todos los items, filtrar por menuCardId en cliente
GET /api/v1/allergens/recipe/:recipeId   → alérgenos por plato (pantalla 2)
```

El `establishmentId` se obtiene de `ESTABLISHMENTS[restaurantSlug]` (hardcodeado en `routes/index.tsx`). Si el slug no existe, mostrar error de restaurante no encontrado.

---

## Component Structure

Todo en `PublicMenuPage.tsx`. No se crean componentes separados — la página es standalone y lo suficientemente pequeña.

**Estados internos:**
```ts
view: "list" | "detail"
selectedMenu: Menu | null
menus: Menu[]
menuItems: MenuItemWithAllergens[]   // solo platos de la carta seleccionada
allergens: Allergen[]                // todos, para el filtro
menusWithAllergens: Record<string, Allergen[]>  // para pantalla 1
excludedAllergenIds: string[]        // filtro activo
loading: boolean
detailLoading: boolean
error: string | null
```

**Lógica de filtro (pantalla 1):**
Una carta se oculta si tiene al menos un alérgeno excluido. Se comprueba contra `menusWithAllergens[menu.id]`.

**Agrupación por categoría (pantalla 2):**
```ts
const CATEGORY_ORDER = ["entrante","primer_plato","segundo_plato","postre","salsa","bebida"];
const grouped = menuItems.reduce((acc, item) => {
  if (!acc[item.category]) acc[item.category] = [];
  acc[item.category].push(item);
  return acc;
}, {} as Record<string, MenuItemWithAllergens[]>);
```
Iterar `CATEGORY_ORDER`, renderizar solo las categorías presentes.

**Label de categoría traducido:** usar `t(\`dishCreate.categories.${category}\`)` (las claves ya existen en los 3 locales).

---

## What Does NOT Change

- La lógica de fetch (mismas llamadas al backend)
- El filtro de alérgenos funcional (`excludedAllergenIds`)
- Los estados `loading` / `error`
- La estructura de datos (`Menu`, `MenuItem`, `Allergen`)
- El mapeo `ESTABLISHMENTS` en `routes/index.tsx`

Solo cambia la capa visual: estilos inline, paleta, tipografía, orden de renderizado.

---

## Out of Scope

- Imágenes de platos (no hay URLs en el backend)
- Precios históricos / sugeridos (no relevante para clientes)
- Modo edición / badges "Públic/Privat" (son para admin)
- Barra de búsqueda por texto (el filtro de alérgenos es suficiente para clientes)
- Autenticación
