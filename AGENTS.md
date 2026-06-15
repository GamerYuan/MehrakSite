# AGENTS.md — MehrakSite

## Stack
- Vue 3 (Composition API, `<script setup>`, **plain JS** — no TypeScript)
- Vite 7, Tailwind CSS v4 (via `@tailwindcss/vite` plugin, not PostCSS)
- PrimeVue v4 with `@primeuix/themes` Aura preset
- vue-router with hash-smooth scroll behavior
- Deployed to Cloudflare Pages via Wrangler

## Commands
- `npm run dev` — Vite dev server
- `npm run build` — production build to `dist/`
- `npm run deploy` — build + `wrangler deploy` (Cloudflare Pages)
- There are **no test, lint, or typecheck scripts**

## Environment
- `VITE_APP_BACKEND_URL` — backend API base URL (set in `.env` / `.env.local`)
- `.env.local` overrides `.env` for local dev

## Auth & API
- Auth is cookie-based via Discord OAuth (no localStorage user data)
- `src/composables/useAuth.js` — `useAuth()` composable manages auth state
  - `normalizeUser()` handles both camelCase and PascalCase API responses
  - `setAuthState()` syncs state between the router guard and useAuth
  - `fetchUser()` fetches `/users/me` with inflight deduplication
  - `login()` redirects to Discord OAuth; `logout()` hits `/auth/logout` then redirects home
- `src/composables/useApi.js` — all API calls go through `apiFetch` / `apiFetchJson`
  - Uses `credentials: "include"` (cookie-based sessions)
  - Auto-redirects to `/` on 401 (pass `skipAuthRedirect: true` to suppress)
  - Also exports standalone functions (`standaloneApiFetch`, `standaloneApiFetchJson`) for use outside Vue components

## Routing (`src/router/index.js`)
- Public routes: `/`, `/docs`, `/privacy`, `/terms`
- Dashboard (auth-guarded): `/dashboard` with children
- Games: `/dashboard/:game` where `:game` must match a `routeKey` from `gameMeta`
- Router guard: fetches `/users/me`, normalizes response, syncs with useAuth state. Redirects to Discord OAuth on 401. Checks `meta.requireAuth`, `meta.requireSuperAdmin`, `meta.requireGamePermission`, `meta.requireAnyPermission`

## Game System
- **Game definitions:** `src/configs/gameMeta.js` — labels, colors, permissions, routeKeys
- **Game configs:** `src/configs/gameConfigs.js` — endpoints, servers, tabs, character inputs
- Games with routes: `genshin`, `hsr`, `zzz`, `hi3` (Tears of Themis has no route)
- Per-game composables live in `src/composables/game/`
- Per-game UI components live in `src/components/game/`

## Theme
- Light/dark via `useTheme()` composable; toggles `.dark` class on `<html>`
- CSS custom properties in `src/style.css` define semantic tokens for both themes
- PrimeVue dark mode tied to `.dark` selector

## Styling
- Tailwind CSS v4 via Vite plugin (no `tailwind.config.js` needed)
- Custom dark variant: `@custom-variant dark (&:is(.dark *));` in `src/style.css`
- CSS custom properties (`--bg-page`, `--text-primary`, etc.) for themed values
- Body uses Inter font at 14px
