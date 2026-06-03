# PhotoLibrary

A polished, production-quality photo browsing experience built with **Angular 21** (standalone components, signals, modern control flow).

Browse thousands of beautiful photos from [Picsum Photos](https://picsum.photos), instantly favorite them, search & sort, view rich details, and download originals. Fully reactive, accessible, responsive, and beautifully styled.

## Key Features

- **Infinite scroll + Load More** with IntersectionObserver + graceful fallback
- **Client-side Search & Sort** (author, newest/oldest, A–Z) — instantly filters loaded photos
- **Favorite System** — heart toggle on every card (library + favorites page). Persisted via localStorage + fully reactive `signals`
- **Smart Caching** — PhotoService maintains in-memory cache so `/photo/:id` works for any previously seen (or directly linked) photo
- **Details View** — large hero image, metadata (dimensions, aspect), one-click download (full-res), copy shareable link, favorite toggle + toast feedback
- **Favorites Management** — dedicated page, local filter, remove via heart or bulk clear
- **Professional UI** — responsive CSS Grid, skeleton loaders, empty/error states, smooth hovers, Material components + custom design system
- **Modern Angular** — signals everywhere, OnPush, outputs, computed derived state, standalone, typed DI, effects for side-effects
- **Great DX** — 19 passing unit tests, meaningful error handling, loading states

## Quick Start

```bash
npm install
npm start          # http://localhost:4200
```

Other scripts:

- `npm run build` — production build (dist/)
- `npm test` — Vitest unit tests (watch mode) or `npm test -- --run`

## Architecture Highlights

- `PhotoService`: HTTP + normalization + cache (signals) + error handling + single-photo fetch
- `FavoriteService`: signal-backed store with auto localStorage effect + computed count/empty
- Reusable `<app-photo-card>` with built-in favorite button (no parent glue needed)
- Routes: `/` (library with toolbar), `/favorites`, `/photo/:id`
- Global styles + CSS vars for easy theming (prepared for dark mode)

## Screenshots / Demo

Run locally — the experience speaks for itself:

- Search while scrolling new pages
- Heart any photo from grid or details
- Deep link a photo id directly
- Favorites badge updates live in header

## Future Polish Ideas (optional extensions)

- Virtual scrolling for 1000+ photos
- Custom Material theme + dark mode toggle
- Service worker / PWA offline favorites
- Real backend (upload / user accounts)
- MatDialog quick preview instead of route for some flows

Built as a showcase of modern Angular practices (2026).

---

This project was originally generated with Angular CLI v21.
