# TanStack Frontend Structure Reference

Last updated: 2026-01-03

This doc captures the TanStack (router + query) project structure patterns, based on the existing tgpatcher frontend layout.

## 1) Project Layout

Typical structure:
```
<app>/
  package.json
  vite.config.ts
  src/
    main.tsx
    App.tsx
    routeTree.gen.ts
    routes/
      __root.tsx
      index.tsx
      <route>.tsx
      <nested>/<route>.tsx
    components/
    hooks/
    lib/
    stores/
    types/
    utils/
    index.css
```

## 2) Tooling + Build
- Vite-based setup with React + TanStack Router Vite plugin.
- Alias `@` -> `src` in `vite.config.ts`.
- Local dev server typically proxies `/api` to backend.

Example essentials from `vite.config.ts`:
- `react()` plugin
- `TanStackRouterVite()` plugin
- `resolve.alias` for `@`
- `server.proxy` for API
- `build.outDir = dist` + sourcemaps

## 3) App Entry

`src/main.tsx` typically:
- Creates a `QueryClient` (TanStack Query) with defaults.
- Wraps app in `QueryClientProvider`.
- Renders `<App />` with `ReactDOM.createRoot`.
- Imports global CSS.
- Optional: React Query devtools, toast provider, theme toggles.

`src/App.tsx` typically:
- Creates TanStack Router with `routeTree`.
- Registers router types for TS.
- Renders `<RouterProvider />`.

## 4) Routing Pattern

- File-based routing under `src/routes/`.
- Root layout in `__root.tsx`.
- Route tree generated to `routeTree.gen.ts`.
- Nested routes map to nested folders, e.g. `routes/case/$applicationId.tsx`.

Typical `routes/__root.tsx` responsibilities:
- App shell layout (header, nav, tab bar).
- Auth gate / redirect.
- Global modals and dev tools.
- Main outlet via `<Outlet />`.

## 5) State + Data
- `@tanstack/react-query` for data fetching.
- Zustand for UI/global state (`src/stores/`).
- `src/lib/` for shared utilities (api clients, auth/session helpers, versioning).

## 6) Styling
- Tailwind with `index.css` as global entry.
- Component-level classnames with utility-first styling.

## 7) Recommended to Mirror in This Repo
- Keep the same `src/` structure and routing conventions.
- Use TanStack Router file-based routes and generated `routeTree.gen.ts`.
- Place reusable UI in `components/`, shared logic in `lib/`, hooks in `hooks/`.
- Put API calls behind a single `lib/api.ts` (or equivalent).

