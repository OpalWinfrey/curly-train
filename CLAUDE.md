# VaultMark — CLAUDE.md

Read this first. It covers the full architecture so you don't waste time re-discovering things or making incorrect assumptions.

## What this app is

VaultMark (`curly-train`) is a **Magic: The Gathering sealed-product investment tracker**. Users browse sealed MTG products (booster boxes, Secret Lairs, Commander decks), track a personal collection with cost-basis and P&L, and maintain a watchlist. It is a separate app from `mtg-commander-tracker` (the Runemark Commander game tracker).

## Tech stack

- **React Native 0.74 + Expo ~51 + Expo Router ~3.5** — targets iOS, Android, and web
- **TypeScript** — types in `data/types.ts`
- **react-native-svg** — custom SVG charts (PriceChart, ValueBreakdown donut)
- **expo-linear-gradient** — gradient UI elements
- **Vite/web build** — `npm run build` runs `npx expo export --platform web`, output goes to `dist/`

## Vercel deployment

- **Project name:** `vaultmark` on Vercel (NOT `runemark` — that is the separate commander tracker)
- **URL:** `vaultmark-sealed.vercel.app`
- **Connected repo:** `OpalWinfrey/curly-train`, `main` branch
- **Build:** Vercel CI/CD runs `npx expo export --platform web` and deploys `dist/` automatically on every push to `main` (see `.github/workflows/deploy.yml`)
- **Environment variables set in Vercel dashboard:**
  - `MANAPOOL_TOKEN` — Manapool API access token (sensitive)
  - `MANAPOOL_EMAIL` — Manapool account email (sensitive)
  - These are server-side only (no `EXPO_PUBLIC_` prefix) — only accessible in the `api/` serverless function

## Data architecture

### Pricing API (live data)
- `api/manapool-prices.ts` — Vercel serverless function that proxies `https://manapool.com/api/v1/prices/sealed` using the credentials from env vars. Caches for 5 minutes (`s-maxage=300`). Called as `/api/manapool-prices` from the client.
- `api/set-ev.ts` — Vercel serverless function that fetches all cards in a set from Scryfall and computes live EV broken down by rarity/treatment (mythics, rares, foils, showcase, special guests, bulk). Accepts `?setCode=&productType=`. Called as `/api/set-ev` from the client.
- `data/manapool.ts` — client-side fetch helper that calls `/api/manapool-prices` and returns `ManapoolSealedListing[]`
- `data/useSetEV.ts` — React hook that calls `/api/set-ev` and returns `{ loading, evData }`. Caches results in memory per set+productType so repeated renders don't re-fetch. Used by PlayBoosterDetail and CollectorBoosterDetail to show live EV data, falling back to static data in `products.ts` if the API fails.

### Product catalog (Scryfall + Manapool)
- `data/scryfall.ts` — fetches set list from Scryfall API, generates `Product` objects for each set (one play booster box, one collector booster box, one commander deck, one bundle per set where applicable). Also provides `useProductArt()` which fetches the priciest card in a set as the product thumbnail.
- `data/productCatalog.ts` — `buildProductCatalog()` combines Scryfall-derived products with Manapool live prices. Merges by set code + product type. Returns ~200+ products with real market prices.
- `data/products.ts` — 7 hand-curated static products with rich data (EV breakdown, pull rates, investment scores, recommendation rationale). These are the only products with full detail data.
- `data/userState.tsx` — React Context for in-memory collection/watchlist/recently-viewed state. Also calls `buildProductCatalog()` on mount to populate the full product list. **State is not persisted** — resets on reload.

### Product data quality tiers
1. **Curated products** (7 in `data/products.ts`): full EV, pull rates, investment score, recommendation, price history
2. **Catalog products** (200+ from Scryfall + Manapool): real market prices, but no EV/hits/score data. Product detail screens gracefully hide missing sections.

## Key known issues / open GitHub issues

Open issues are tracked at `https://github.com/OpalWinfrey/curly-train/issues`. Key ones:

- **#1** — No user auth (no sign-up/login, data resets on reload)
- **#2** — No data persistence (plain useState, everything lost on refresh)
- **#6** — Live pricing API exists (Manapool proxy), but catalog products lack EV/hits/score data; Secret Lair and Commander deck enumeration is incomplete
- **#7** — PriceChart still uses hardcoded data arrays, ignores `product.priceHistory`
- **#8** — Currency setting in Settings doesn't convert prices
- **#9** — Selling fee / tax settings not wired into P&L math
- **#10** — No error boundaries
- **#11** — No form validation, no date picker
- **#12** — Already fixed: CommanderDeckDetail.tsx and BundleDetail.tsx now exist
- **#14** — Push notifications not implemented
- **#15** — CSV export/import not implemented
- **#16** — No test suite (Playwright e2e tests exist in `e2e/` but no unit tests)
- **#17** — No ESLint/Prettier
- **#24** — Vercel CI/CD is set up (`.github/workflows/deploy.yml`) — this issue may already be resolved
- **#3** — Already fixed: RecommendationCard props mismatch (was crashing on render)
- **#13** — Already fixed: share button now calls Share.share() in all detail screens
- **#18** — Already fixed: deleted unused BottomNav, MarketOverviewCard, EVMetricsRow, MetricCard
- **#22** — Already fixed: unpriced catalog products show "N/A" instead of "$0.00"

## File structure

```
api/
  manapool-prices.ts     Vercel serverless proxy for Manapool API

app/
  _layout.tsx            Root layout — Expo Router Tabs + UserStateProvider
  index.tsx              Home screen
  discover.tsx           Product browse + search + filter
  collection.tsx         Portfolio / owned products
  watchlist.tsx          Price-target watchlist
  settings.tsx           User preferences (currency, fees, theme)
  add-product.tsx        4-step wizard to add to collection or watchlist
  product/[id].tsx       Product detail router — dispatches to detail components

components/
  detail/
    PlayBoosterDetail.tsx
    CollectorBoosterDetail.tsx
    SecretLairDetail.tsx
    CommanderDeckDetail.tsx
    BundleDetail.tsx
  PriceChart.tsx          SVG line chart (WARNING: still uses hardcoded data, see #7)
  RecommendationCard.tsx  Signal badge + rationale bullets + confidence bars
  InvestmentScore.tsx     Animated arc gauge
  ValueBreakdown.tsx      SVG donut + EV legend
  TopHitCard.tsx          Pull-rate table
  tokens.ts               Design system (Colors, Spacing, Radius, Typography)
  SearchBar.tsx, ProductCard.tsx, FilterChip.tsx, SectionHeader.tsx, etc.

data/
  types.ts               All TypeScript types (Product, CollectionItem, LiveEVData, etc.)
  products.ts            7 hand-curated static products (rich data)
  scryfall.ts            Scryfall API integration — generates Product objects per set
  manapool.ts            Manapool fetch helper (calls /api/manapool-prices)
  productCatalog.ts      Combines Scryfall + Manapool into the full product catalog
  userState.tsx          React Context — in-memory state + calls buildProductCatalog()
  useSetEV.ts            Hook for live EV data from /api/set-ev

e2e/
  discover-game-filter.spec.ts
  product-detail-price-chart.spec.ts

dist/                    Pre-built web output (committed to repo, served by Vercel)
```

## Dev commands

```bash
npm install
npx expo start          # dev server (iOS/Android/web)
npx expo start --web    # web only
npm run build           # builds web to dist/
```

## Git convention

Always commit and push directly to `main`. Do not create feature branches. The `main` branch triggers auto-deploy to Vercel.
