# Rust Service Structure Reference

Last updated: 2026-01-03

This doc summarizes the Rust service layout and patterns to use as the baseline structure
for new Rust services in this repo.

## 1) Shared Structure Pattern

Typical layout (both projects):
```
<service>/
  Cargo.toml
  Dockerfile
  src/
    main.rs
    routes/
      mod.rs
      ...
    state.rs
    config/ or config.rs
    models/
    utils.rs or utils/
```

Key patterns:
- `main.rs` wires config, state, middleware, and routes.
- `routes/mod.rs` exposes an `init` function that registers scoped endpoints.
- `state.rs` defines `AppState` with shared resources, wrapped in `Arc` or `Data`.
- `config` module reads env vars, validates required values, and builds config struct(s).

## 2) Example A (Actix + Postgres)

### Core modules
- `src/main.rs`: Actix server setup, Sentry, logging, CORS, rate limiting, JSON error handling.
- `src/config.rs`: Config from env (`APP_PORT`, `DB_*`) and DB URL assembly.
- `src/state.rs`: `AppState` with config + DB ops + cached lookups/rules.
- `src/routes/mod.rs`: `/api/1.0` scope + sub-routes.
- `src/db/`: database operations, sqlx.
- `src/models/`, `src/dtos/`: domain models + request/response shapes.

### Middleware / infra
- CORS: `actix-cors` permissive.
- Rate limiting: `actix-governor`.
- Logging: `env_logger` + `sentry` integration.

### Notes to mirror
- Load config early, fail fast on missing env vars.
- Initialize DB pool and shared caches inside `main.rs`.
- Wrap `AppState` in `Arc` and `web::Data`.

## 3) Example B (Actix + Redis)

### Core modules
- `src/main.rs`: Actix server, CORS, Logger, routes.
- `src/config/mod.rs`: OAuth config and app settings from env.
- `src/state.rs`: `AppState` holding OAuth configs, remote config, Redis connection.
- `src/routes/mod.rs`: health + auth endpoints under scopes.

### Middleware / infra
- CORS: allow any origin, supports credentials.
- Logging: `env_logger`.

### Notes to mirror
- Redis URL defaults to `redis://redis:6379`.
- State uses `Arc<TokioMutex<MultiplexedConnection>>` for Redis.

## 4) Guidance for New Rust Service (Jellyfin API)

Recommended to follow the same shape:
```
media-savant-api/
  Cargo.toml
  Dockerfile
  src/
    main.rs
    routes/
      mod.rs
      auth.rs
      jellyfin.rs
      health.rs
    state.rs
    config/
      mod.rs
    models/
    utils.rs
```

Design notes (aligned to your patterns):
- Use Actix Web always.
- Centralize env config in `config` with strict validation.
- `main.rs` should:
  - load env
  - init logger
  - init Redis connection
  - build `AppState`
  - configure middleware (CORS, rate limiting)
  - configure routes
- `routes/mod.rs` should expose `init(cfg: &mut ServiceConfig)` with scoped routes.
- `state.rs` should carry Redis, config, and any in-memory caches.
