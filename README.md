# Mehrak Dashboard

Vue 3 dashboard for managing HoYoLAB-linked game accounts (Genshin Impact, Honkai: Star Rail, Zenless Zone Zero, Honkai Impact 3rd). Powered by [MehrakBot](https://github.com/GamerYuan/MehrakBot). Deployed to Cloudflare Pages.

## Stack

- Vue 3 (Composition API, `<script setup>`, plain JS)
- Vite 7, Tailwind CSS v4
- PrimeVue v4 with Aura preset
- vue-router, Vitest, oxlint, oxfmt

## Commands

```sh
npm run dev        # Vite dev server
npm run build      # production build to dist/
npm run deploy     # build + wrangler deploy (Cloudflare Pages)
npm run test       # vitest (watch mode)
npm run test:ci    # vitest (single run)
npm run lint       # oxlint
npm run lint:fix   # oxlint --fix
npm run format     # oxfmt on src/
```

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the values
3. `npm run dev`

See `.env.example` for required environment variables.

## License

GPL-3.0 — see [LICENSE.txt](LICENSE.txt)
