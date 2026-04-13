# Dishly Frontend

Frontend en React + TypeScript per a la gestió de menús, plats i al·lèrgens.

---

## Setup

### Prerequisits

* Node.js 18+
* npm 9+

### Instal·lació

```bash
# Instal·lar dependències
npm install

# Iniciar servidor de desenvolupament
npm run dev
```

El frontend estarà disponible a `http://localhost:5173`.

---

## Important: No executis `npm audit fix --force`

Després de fer `npm install`, pot aparèixer un avís sobre vulnerabilitats:

```id="t8w2qa"
6 vulnerabilities (2 moderate, 4 high)
To address all issues (including breaking changes), run:
npm audit fix --force
```

No executis aquesta comanda.

Aquestes vulnerabilitats són en dependències internes (esbuild, workbox) i no afecten el codi de l'aplicació.

Executar `npm audit fix --force` pot provocar incompatibilitats entre `vite` i `vite-plugin-pwa` i generar errors al projecte.


## Variables d'entorn

Cal configurar les variables d'entorn mitjançant un fitxer `.env` a l'arrel del projecte.

Si no saps quines variables definir o com configurar-les, contacta amb els responsables de frontend.

---

## Build per a producció

```bash
npm run build
```

---

## Lint

```bash
npm run lint
```

---

### Si s'ha executat per error

```bash
# 1. Restaurar fitxers originals
git checkout package.json package-lock.json

# 2. Eliminar dependències
rm -rf node_modules

# 3. Reinstal·lar correctament
npm install
```

---

## Backend

Aquest frontend es connecta a una API REST i WebSockets.

---

## Stack tecnològic

* React 19
* TypeScript 5
* Vite 5
* Socket.io
* Vite PWA Plugin
* React Router 7

---

## Troubleshooting

### Port 5173 en ús

```bash
npm run dev -- --port 3001
```

### Errors amb dependències

```bash
rm -rf node_modules package-lock.json
npm install
```
