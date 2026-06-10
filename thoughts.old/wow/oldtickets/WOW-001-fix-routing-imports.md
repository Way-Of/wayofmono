# WOW-001 Fix system after extraction from Way of Work monorepo

## Problem Statement

This repo was extracted from the Way of Work monorepo. Several dependencies were stripped out to get `bun install` working, file paths were never reconciled, and build is blocked (41 tsc errors). Runtime paths may still reference the old monorepo layout.

## Desired Outcome

Clean `bun run build` (zero tsc errors), all routes wired, orphaned files removed or integrated, runtime paths pointing only at this repo, and a fresh database.

## Context & Background

### Current routing map

**Client-side routes** (`src/App.tsx` + `src/main.tsx`):
| Path | Component | File |
|---|---|---|
| `/welcome` | WelcomePage | `src/pages/WelcomePage.tsx` |
| `/login` | LoginPage | `src/pages/LoginPage.tsx` |
| `/` | redirect → `/docs` or `/welcome` | — |
| `/simple` | SimplePage | `src/pages/SimplePage.tsx` |
| `/kanban` | KanbanPage | `src/pages/Kanban.tsx` |
| `/workboard` | WorkPage | `src/pages/WorkPage.tsx` |
| `/ata` | ClawPage | `src/pages/ClawPage.tsx` |
| `/docs` | DocsPage | `src/pages/DocsPage.tsx` |
| `/portal` | WorkerPortal | `src/pages/WorkerPortal.tsx` |
| `/admin` | AdminDashboard | `src/pages/AdminDashboard.tsx` |
| `/super-admin` | SuperAdminDashboard | `src/pages/SuperAdminDashboard.tsx` |
| `/client` | ClientDashboard | `src/pages/ClientDashboard.tsx` |
| `/profile` | UserProfile | `src/pages/UserProfile.tsx` |

UI modes (`"simple"`, `"work"`, `"claw"`, `"docs"`, `"kanban"`) sync to routes via `uiModeRouteMap`/`routeUiModeMap`. Mode `"technical"` has **no route** — setting it navigates to `/simple`.

### Known mismatches (ported-system debris)

1. **Broken tsc build** (41 errors)
   - `src/pages/workerportal.tsx` wrong import depth (`./src/components` → `../components`)
   - `WorkerPortal.tsx` vs `workerportal.tsx` case conflict (both exist)
   - 5 UI components import missing dep `class-variance-authority`
   - `server/sdk-runtime.ts` imports missing dep `@wayofmono/wo-agent`
   - `mockKanbanService.ts` missing required fields (`createdAt`, `labels`)
   - `SimplePage.tsx` undefined ref `setSimpleProviderNonce`
   - `CardView.tsx` `user.role` not on `User` type

2. **Orphaned/unreachable files**
   - `src/pages/Dashboard.tsx` — exists but not exported or routed
   - `src/pages/workerportal.tsx` — case-duplicate of `WorkerPortal.tsx`, not exported

3. **Frontend calls server endpoints that don't exist**
   - `UserProfile.tsx` calls `PUT /api/portal/me` and `POST /api/portal/change-pin` — neither exists on server (both are `// TODO`)
   - `WorkerPortal.tsx` data layer is mostly demo — real `GET /api/portal/me`, tasks, files calls are commented out

4. **Server routes with no frontend consumer**
   - `/api/time-sessions/*` (check-in, check-out, active, report)
   - `/api/tickets/*` + `/api/price-lists/*` + `/api/reports/*` + `/api/invoices/*`
   - `/api/workspace-index/*` (sync, clear, docs, options)
   - `/api/dev/ngrok-tunnel`, `/api/dev/tunnel-gate`, `/api/dev/share-url-hints`
   - `/api/diagnostics`, `/api/upstream`, `/api/package-scripts`, `/api/run-script`, `/api/plans`
   - `/api/github/*`, `/api/ui/views`, `/api/ui/views/seed`

5. **Route gating mismatch**
   - `/admin` page calls `GET /api/admin/stats` which requires `SUPER_ADMIN` — regular admins get 403

6. **Electron routing**
   - Dev: loads Vite URL (`http://127.0.0.1:5173`), Vite proxies `/api` and `/ws` to Bun on `:3333`
   - Prod: loads Bun URL (`http://127.0.0.1:3333/`), Bun serves `dist/` + API
   - Bun autostart checks `GET /api/health` for capabilities freshness

7. **Wo Agent (`@wayofmono/wo-agent`) is not installed**
   - Listed as `"TODO"` in `package.json` — removed to get `bun install` working
   - `server/sdk-runtime.ts` and `server/agent-runtime.ts` both import it — chat won't work without it
   - The agent is a **general-purpose user agent** (no coding tools: no read/bash/edit/write). It only has `web_search` and `web_fetch`. This is correct — Way of Work is a planning/org tool, not a code editor.

8. **Runtime paths from old monorepo** — mostly cleaned up, checked during extraction

9. **Dead code excluded from tsconfig** (imports from removed `@earendil-works/pi-tui/menu`)
    - `src/components/menus/FileMenu.tsx`, `TerminalMenu.tsx`, `EditMenu.tsx`, `GoMenu.tsx`, `HelpMenu.tsx`, `RunMenu.tsx`, `ViewMenu.tsx`, `MenuBar.tsx`
    - Already excluded in `tsconfig.app.json` — either delete them or keep the exclusion

### Why This Matters
The app cannot build or start. Unclear which server routes are dead code vs. future features, and which frontend pages are placeholders vs. real.

## Requirements

### Functional
- [ ] `bun run build` passes with zero tsc errors
- [ ] All client-side routes render the correct component
- [ ] `./start.sh` launches Electron without build errors
- [ ] Login flow lands on correct page per role (worker→/portal, client→/client, admin→/ata)

### Integration
- [ ] For each page that makes API calls, the server endpoint exists and accepts the right role
- [ ] Dead server routes with no frontend consumer are either wired up or removed
- [ ] Orphaned page files (`Dashboard.tsx`, `workerportal.tsx`) are either removed or properly added to routing

### Out of Scope
- Adding new features
- Rewriting the server routing architecture

## Priority & Dependencies

1. **Wo Agent** — system won't chat without it (install from official repo when available)
2. **Pre-existing TS errors** — build is blocked without these
3. **Runtime paths** — unexpected crashes if old monorepo paths remain
4. **Database** — fresh start or migrate
5. **Dead code / routing** — cleanup, lowest risk, can be parallel

---

## Tasks

### P1 — Install Wo Agent
- [x] Add `@wayofmono/wo-agent` and `@wayofmono/wo-agent-core` to `package.json` dependencies (currently `"TODO"`)
- [x] Update with correct registry URL and run `bun install`
- [x] Verify `server/sdk-runtime.ts` and `server/agent-runtime.ts` compile

### P2 — Fix build (41 tsc errors)
- [x] Deduplicate `WorkerPortal.tsx` / `workerportal.tsx` — keep one, fix case in index.ts
- [x] Fix `workerportal.tsx` import paths (`./src/components` → `../components`)
- [x] Install `class-variance-authority` or rewrite affected components (Badge, Input, Label, Textarea, PlanReview)
- [x] Fix `mockKanbanService.ts` — add missing `createdAt` and `labels` fields
- [x] Fix `SimplePage.tsx` — rename `setSimpleProviderNonce` or correct the ref
- [x] Fix `CardView.tsx` — add `role` to `User` type or fix the access
- [x] Resolve `server/sdk-runtime.ts` model input type mismatch.

### P3 — Audit runtime paths
- [x] Updated diagnostics.ts SDK probes from `@earendil-works/pi-coding-agent` → `@wayofmono/wo-agent`
- [x] Cleaned up agent-runtime.ts comments
- [x] Cleaned up server/paths.ts
- [x] Cleaned up electron paths

### P4 — Database
- [x] Deleted stale wayofpi.sqlite and db_data/
- [x] Server recreates fresh DB on next start via server/db.ts

### P5 — Dead code & routing cleanup
- [x] Decide fate of menu files excluded from tsconfig (`FileMenu.tsx`, `EditMenu.tsx`, etc.) — delete or keep excluded
- [x] Add missing server endpoints: `PUT /api/portal/me`, `POST /api/portal/change-pin`
- [x] Wire `WorkerPortal.tsx` real API calls (uncomment `GET /api/portal/me`, tasks, files)
- [x] Fix `/admin` → `GET /api/admin/stats` gating (allow ADMIN role too)
- [x] Decide fate of `"technical"` uiMode — remove it or give it a route
- [x] Clean up `Dashboard.tsx` — remove or add to routing
- [x] Audit server routes with no frontend consumer: keep, wire, or remove (deferred — not blocking)
## Technical Notes

### Wo Agent context
- This is a **general-purpose user agent** (`wouser`) with no coding tools
- Tools: `web_search`, `web_fetch` (no read/bash/edit/write)
- The agent powers chat across all UI modes (Simple, Claw, Docs)
- It receives: user role, current project/workspace, relevant tasks, chat history
- It does NOT receive: file system access, shell access, coding toolchain

### Affected Components
- `src/pages/workerportal.tsx` — fix imports, resolve case conflict with WorkerPortal.tsx
- `src/pages/WorkerPortal.tsx` — activate real API calls (currently commented out)
- `src/pages/index.ts` — fix exports
- `src/pages/Dashboard.tsx` — remove or wire in
- `src/components/ui/Badge.tsx`, `Input.tsx`, `Label.tsx`, `Textarea.tsx`, `PlanReview.tsx` — install `class-variance-authority` or rewrite
- `src/components/kanban/CardView.tsx` — fix `user.role` type access
- `src/pages/SimplePage.tsx` — fix `setSimpleProviderNonce` ref
- `src/services/mockKanbanService.ts` — add missing fields (`createdAt`, `labels`)
- `src/types/kanban.ts` — add `role` to User if needed
- `server/sdk-runtime.ts` — resolve `@wayofmono/wo-agent` dep
- `server/agent-runtime.ts` — imports `@wayofmono/wo-agent`, clean (Pi references removed)
- `server/index.ts` — add `PUT /api/portal/me` + `POST /api/portal/change-pin`, relax `/admin/stats` role gate

---

## Meta

**Created**: 2026-05-19
**Priority**: High
**Estimated Effort**: L
