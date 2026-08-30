# WOW-006 Refactor server/index.ts into smaller modules

## Problem Statement
`server/index.ts` has grown large. It handles everything from WebSocket connections to a massive `if/else` chain for every single API route. This makes it hard to maintain, test, and collaborate on. We should no longer add routes directly to `server/index.ts`.

## Desired Outcome
A modular server architecture where routes and WebSocket handlers are broken out into separate files organized by domain. `server/index.ts` should only contain the server initialization and a clean router delegator.

## Plan & Approach

### Phase 1: Router Abstraction ✅ (Done)
Created `server/router.ts` — a lightweight routing utility supporting HTTP method and path matching.

### Phase 2: Domain Extraction (API Routes) ✅ (Done)
Extracted routes into `server/routes/`:
- `portal.ts` — `/api/portal/*`
- `projects.ts` — `/api/projects`
- `calendar.ts` — `/api/calendar/events`
- `admin.ts` — `/api/admin/*`
- `client.ts` — `/api/client/*`
- `claw.ts` — `/api/claw/automation`
- `system.ts` — system routes
- `dev.ts` — dev tunnel routes
- `auth.ts` — auth routes
- `channels.ts` — channel management
- `native-dialog.ts` — native file dialog
- `ta-planner.ts` — TA planner

### Phase 3: WebSocket & Helper Extraction ✅ (Done)
- WebSocket handlers moved to `server/ws-handler.ts`
- Helper functions (`json()`, `logLine()`) in `server/utils.ts`

### Phase 4: Route Registration ✅ (Done)
All new route files registered on the Router in `server/index.ts`.

### Phase 5: Final Cleanup ✅ (Done)
Many routes still inlined in `handleApi()` in `server/index.ts`. These need to be moved into the appropriate route modules (or new modules):
- Admin tenant/user/stats inline routes → `routes/admin.ts`
- Client project/drawing/feedback inline routes → `routes/client.ts`
- Portal download → `routes/portal.ts`
- Dev ngrok/tunnel/share-url → `routes/dev.ts`
- Native dialog pick → `routes/native-dialog.ts`
- Claw webhook/telegram/whatsapp status → `routes/claw.ts`
- GitHub/Git routes → new `routes/github.ts`
- File system routes (`/api/file`, `/api/fs/*`) → new `routes/file-system.ts`
- Workspace routes → new `routes/workspace.ts`
- Config/manifest → new `routes/config.ts`
- LLM/agents/scripts → new `routes/llm.ts`
- Server/terminal/diagnostics → new `routes/server.ts`
- Plans → `routes/claw.ts` or new
- Workspace-index → new `routes/workspace.ts`

Current line count: **1846 lines**. Target: **< 500 lines**.

## Acceptance Criteria
- [x] `server/index.ts` is **< 500 lines**
- [x] All API routes use the new routing pattern and are separated by domain
- [x] `bun run build` passes with no regressions
---

**Priority**: Medium
**Estimated Effort**: M to L
