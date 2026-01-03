# Jellyfin Web UI Client - Spec Draft (Filled)

Last updated: 2026-01-03

This document captures the desired UI client for a Jellyfin server, plus resolved decisions and any remaining clarifications.

## 1) Vision
- Build a web UI client for a Jellyfin server, deployed alongside the existing docker-compose setup.
- Primary flow: first-run setup (server host/port, username, password), then access media library and playback.
- UI reference: Figma design (Jellyfin-Client).
- App name: **mdia savant** (no logo yet).

## 2) Users + Goals
- Self-hosted on a laptop media server, accessible remotely via Tailscale.
- Used by self + family (multiple Jellyfin users).
- Accessibility: basic/acceptable efforts (keyboard nav, ARIA, contrast).

## 3) Deployment + Domains
- Hosted in same docker-compose as Jellyfin and related apps.
- Reverse proxy (Traefik) should be included in compose now; TLS later.
- Domains (future):
  - Jellyfin: `jellyfin.iamngonimedia.app`
  - App: `savant.iamngonimedia.app`
  - Others: `radarr.iamngonimedia.app`, etc.

## 4) Auth + Persistence
- Use Jellyfin access tokens (MediaBrowser auth header). No session cookies from Jellyfin.
- Store auth server-side (Redis) with HTTP-only session cookie in browser.
- Session persistence: **never expire until logout** (note: Jellyfin token revocation may invalidate).
- Support multiple user accounts on same server; provide in-app user switch.
- Provide logout / "forget server".
- Do not store passwords.
- Rate limiting / brute-force protections on login: **yes**.

## 5) Networking + Proxy
- Use backend proxy (server-side) to talk to Jellyfin.
- Hiding base URL from browser: **doesn’t matter**.
- Access pattern: local LAN + remote (Tailscale).

## 6) First-Run Setup UX
- Multi-step wizard.
- Fields: protocol, host, port, optional base path, username, password.
- Connection validation: both `/System/Info` and `/Users/AuthenticateByName`.
- Version compatibility check: **yes** (warn on older, still allow).
- Login errors: **detailed**.
- No anonymous/guest browsing.

## 7) Media Types + Library UX
- Video libraries only for now; music later; no photos.
- Current folders: movies, anime, animations, series.
- Include: recently added + continue watching.
- Support resume playback + progress tracking.
- Search: both global + per-library.
- Play queues / playlists: **yes**.
- Subtitles: selection + default English.
- Audio tracks: selection + default English.
- Theming: stick to Figma design (no theming).

## 8) Player
- Prefer a powerful, highly customizable player library.
- If no suitable library, consider building a custom in-app player.
- Transcoding settings: **yes**.
- Casting: **yes** (Chromecast/AirPlay).
- PiP: **yes**.
- Background audio: **yes**.

## 9) Tech Stack
- Framework: **TanStack Start** (SSR).
- TypeScript: **yes**.
- Styling: **Tailwind + shadcn**.
- State management: **Zustand**.
- Jellyfin integration: **raw REST API**.

## 10) Observability
- Analytics: **self-hosted**.
- Error reporting: **Sentry**.
- Health check endpoint: nice-to-have, not required.

## 11) Docker Compose + Ops
- Add Traefik to compose now.
- Add Redis to compose (OK).
- Config persistence: **volumes** (env vars only for non-secrets).
- Container names/ports: defaults acceptable.

## 12) Testing + Support
- Testing: not strict; do what is necessary.
- Browser support: Chrome, Safari, Firefox, Edge (desktop).

## 13) Branding + Copy
- App name: **mdia savant**.
- No logo yet.
- Minimal copy; no Jellyfin branding.

---

## Open Items / Clarifications
1) **Acceptance criteria**: will be proposed by agent (TBD).
2) **Player library shortlist**: need to evaluate options for customizability + Jellyfin compatibility.
3) **Data model for playlists / play queues**: confirm expected behavior (server playlists vs local queues).
4) **Analytics stack**: choose specific self-hosted solution (e.g., Plausible, Umami, PostHog).
5) **Rate limiting**: preferred approach (Traefik middleware vs app-level).
6) **SSR auth details**: confirm cookie/session strategy and refresh logic.

## Proposed Acceptance Criteria (Draft)
- First-run wizard connects to Jellyfin and authenticates successfully.
- Users can switch profiles without re-entering server details.
- Browse libraries, see recently added and continue watching.
- Search global and within a library.
- Play video with selectable subtitle/audio tracks; defaults to English.
- Resume playback from last position.
- Play queue/playlist basic flow works.
- Player supports PiP and background audio (where browser allows).
- Casting option is present (actual support may vary by device).
- Logout/forget server clears session.
- Works on Chrome, Safari, Firefox, Edge (desktop).

