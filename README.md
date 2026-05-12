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
---
## Internacionalització (Idiomes amb els paquets i18n)

El projecte utilitza `i18next` per gestionar múltiples idiomes. Cal instal·lar les dependències específicament ja que no sempre s'inclouen al `package.json` base:
```bash
npm install i18next react-i18next i18next-browser-languagedetector
```
---
## Notes de manteniment

### Eliminació d'imports de React innecessaris

A partir de React 17+, no cal importar React explícitament a cada fitxer. Si el build falla per errors del tipus `'React' is declared but its value is never read`, executa les següents comandes des de l'arrel del projecte per eliminar-los automàticament:

```bash
sed -i "s/import React, { /import { /g" src/**/*.tsx src/**/*.ts
sed -i "/^import React from \"react\";$/d" src/**/*.tsx src/**/*.ts
```

### Instal·lació de socket.io-client

Si el build falla per `Cannot find module 'socket.io-client'`, instal·la el paquet:

```bash
npm install socket.io-client
```

### Provar la PWA en local

El service worker i la funcionalitat PWA (instal·lació des del navegador) **no funcionen en mode dev**. Per provar-la cal fer el build i servir-lo localment:

```bash
npm run build
npm run preview
```

El `preview` estarà disponible a `http://localhost:4173`. Si no veus els últims canvis, fes un hard refresh (`Ctrl + Shift + R`) o des de les DevTools (F12) → Application → Service Workers → Unregister, i torna a carregar la pàgina.
