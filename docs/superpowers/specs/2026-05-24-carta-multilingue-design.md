# Carta Multilingüe (CA / ES / EN) — Spec

**Fecha:** 2026-05-24  
**Scope:** `frontend` — solo `ClientMenuPage.tsx` y los tres JSON de locales  
**Constraint:** Sin cambios en base de datos ni backend

---

## 1. Qué se construye

La carta pública (`/restaurant/:slug/menu/:menuId`) muestra los platos en el idioma seleccionado por el cliente (catalán, español, inglés). El cambio de idioma se hace desde un selector integrado visualmente en la cabecera de la carta.

---

## 2. Traducciones estáticas

Se añade la sección `dishes` a los tres ficheros de locales:

```json
{
  "dishes": {
    "names": {
      "Amanida Cèsar": "Caesar Salad",
      "Lasanya de carn": "Lasagna de carne",
      ...
    },
    "descriptions": {
      "Amanida amb pollastre": "Salad with chicken",
      ...
    }
  }
}
```

- **Clave:** nombre/descripción tal como está en la BD (catalán)
- **CA:** mismo valor que la BD (pass-through)
- **ES / EN:** traducción manual (hecha en este sprint)
- **Fallback:** si la clave no existe en el JSON, se muestra el valor de la BD sin error

Platos a traducir (los del seed activo en demo): ~15 nombres y descripciones.

---

## 3. Categorías

Las traducciones ya existen en los JSON bajo `clientMenu.categories.*`:

```json
"categories": {
  "entrante": "Starter",
  "primer_plato": "First Course",
  "segundo_plato": "Second Course",
  "postre": "Dessert"
}
```

El componente actualmente renderiza `item.category` crudo. Se cambia a:
```tsx
t(`clientMenu.categories.${item.category}`, { defaultValue: item.category.replace(/_/g, " ") })
```

---

## 4. Selector de idioma

**Actual:** tres botones flotantes top-right, estilo minimal (`#0F172A` active, white inactive), desconectados visualmente del tema de la carta.

**Nuevo:** selector integrado en la cabecera de la sección de carta — pill segmentado con el estilo de la carta:

- Fondo: `#F1F5F9` (gris suave, igual que el fondo de artículos)
- Activo: `#0F172A` con texto blanco y `border-radius: 8px`
- Inactivo: transparente con texto `#64748B`
- Tamaño: `font-size: 13px`, `padding: 5px 12px`
- Posición: alineado a la derecha dentro del `<section>` del menú, antes del título

```
┌──────────────────────────────────────┐
│                          [CA][ES][EN] │
│  Carta Principal Temporada            │
│  Pública                              │
│  ─────────────────────────────────── │
│  Amanida Cèsar              9.50€     │
│  ...                                  │
└──────────────────────────────────────┘
```

---

## 5. Lógica de traducción en el componente

```tsx
// Nombre del plato
t(`dishes.names.${item.recipeName}`, { defaultValue: item.recipeName })

// Descripción
t(`dishes.descriptions.${item.recipeDescription}`, { defaultValue: item.recipeDescription })

// Categoría
t(`clientMenu.categories.${item.category}`, { defaultValue: item.category.replace(/_/g, " ") })
```

---

## 6. Ficheros afectados

| Fichero | Cambio |
|---|---|
| `src/locales/ca.json` | Añadir sección `dishes` (15 entradas) |
| `src/locales/es.json` | Añadir sección `dishes` (15 entradas) |
| `src/locales/en.json` | Añadir sección `dishes` (15 entradas) |
| `src/pages/ClientMenuPage.tsx` | Conectar traducciones + rediseño selector idioma |

---

## 7. Éxito

- Cambiar idioma en la carta traduce nombre, descripción y categoría de cada plato
- Si un plato no tiene traducción, muestra el valor de la BD (sin crash)
- El selector de idioma es visualmente coherente con el diseño de la carta
- Sin regresiones en otras páginas
