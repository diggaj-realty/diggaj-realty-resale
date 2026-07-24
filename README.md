# Diggaj Realty — Resale Frontend

Public-facing Next.js 16 (App Router, Turbopack) storefront for the Diggaj Realty
resale platform. It renders listings, buyer/seller auth + dashboards, and
India-focused property detail pages (EMI calculator, live locality/connectivity
via Google Maps, project & builder info).

The backend is a separate deployed service (`diggaj-realty-resale-admin`); this app
only consumes its public API.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in the values
pnpm dev                     # http://localhost:3000
```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server (Turbopack) on :3000 |
| `pnpm build` | Production build (static + ISR) |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |

## Environment variables (`.env.local`)

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | yes | Base URL of the resale-admin API, e.g. `https://…/api/v1`. Public (browser-visible). |
| `GOOGLE_PLACES_API_KEY` | optional | **Server-only** (no `NEXT_PUBLIC_` prefix). Powers locality/connectivity, drive-time, and the property map. If absent, the map falls back to OpenStreetMap and locality falls back to curated data. |

### Google Cloud APIs to enable for the key

The single `GOOGLE_PLACES_API_KEY` is used for three APIs — all must be enabled on
the project, and the key should be **API-restricted** to just these plus
**HTTP-referrer restricted** to your domain (it appears in client HTML for the map):

- **Places API (New)** — nearby metro / hospitals / schools / IT parks / airport
- **Distance Matrix API** — real driving distance + time from the listing
- **Maps JavaScript API** — the interactive property map with the custom home marker

## Data & caching

- Listing data is fetched from `NEXT_PUBLIC_API_BASE_URL` with **ISR** (`revalidate: 120`),
  so pages are prerendered/static and served from cache. The home page's three
  catalog-consuming sections share one deduped fetch (`lib/api/home.ts`).
- Google lookups are cached 7 days per coordinate (`unstable_cache`) and only run at
  build / ISR revalidation, keeping API cost low.
- Elite-plan prices are gated: hidden (never sent to the DOM) until a buyer logs in.

## Key directories

```
app/                     routes (home, listings, listing detail, contact, login, dashboards)
components/              UI (listings/, dashboard/, auth/, shared)
components/listings/     cards, gallery, EMI calc, locality, project info, map
lib/api/                 API client, properties, auth, buyer, places (Google), home
lib/                     auth context, badges, cities, slug, locality/builder fallbacks
types/                   API, auth, buyer, dashboard types
```

## Auth

Buyer/Seller accounts authenticate against the resale-admin API (`/auth/login`,
`/auth/register`, `/auth/me`) with a bearer token kept in `localStorage`
(`lib/auth/AuthContext.tsx`). Separate `/login/buyer` and `/login/seller` entry points.
