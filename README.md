# VaultMark

A Magic: The Gathering sealed-product investment tracker. Browse sealed MTG products (booster boxes, Secret Lairs, Commander decks), track your personal collection with cost-basis and P&L, and maintain a watchlist with price targets.

## Features

- **Live prices** — sealed product prices sourced from Manapool, updated every 5 minutes
- **200+ products** — auto-imported from Scryfall + Manapool covering every recent MTG set
- **Portfolio tracking** — P&L with configurable selling fee and tax rate
- **Watchlist** — set a target price and get notified when a product hits it
- **Auth + persistence** — sign up with email, data synced via Supabase
- **Public profiles** — share your portfolio summary via a public profile link
- **Multi-currency** — USD, EUR, GBP (approximate conversion rates)

## Tech stack

- React Native 0.74 + Expo 51 + Expo Router 3.5
- TypeScript
- Supabase (auth + Postgres)
- Vercel (hosting + serverless API routes)
- react-native-svg (charts)

## Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`

## Setup

```bash
npm install
```

Create a `.env` file at the repo root:

```env
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

## Running locally

```bash
# Interactive dev menu (iOS / Android / Web)
npx expo start

# Web only
npx expo start --web
```

## Building for web

```bash
npm run build
```

Output goes to `dist/`. Vercel deploys `dist/` automatically on every push to `main`.

## Vercel deployment

The project deploys to `vaultmark-sealed.vercel.app`. Pushes to `main` trigger an automatic build via `.github/workflows/deploy.yml`.

The following environment variables must be set in the Vercel dashboard (server-side only):

- `MANAPOOL_TOKEN` — Manapool API access token
- `MANAPOOL_EMAIL` — Manapool account email

## Linting & formatting

```bash
npm run lint      # ESLint
npm run format    # Prettier
```

## Supabase schema

Migration SQL lives in `supabase/migrations/001_initial.sql`. Tables: `profiles`, `collection_items`, `watchlist_items`, `user_preferences`. All tables have RLS enabled — users can only read/write their own rows.
