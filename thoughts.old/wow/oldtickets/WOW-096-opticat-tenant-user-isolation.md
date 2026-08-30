# WOW-096 — OptiCat Tenant & User Isolation

## Problem
OptiCat plugin (`plugin/opticat/server/api.ts`) still uses the global `db` singleton from `server/db.ts` — it does NOT use `getDb(tenantId)`. This means OptiCat data is NOT tenant-isolated despite the tables (`opticat_projects`, `opticat_aggregat`, `opticat_buildings`, `opticat_service_reports`, `opticat_sync_log`) being created per-tenant in `getDb()`.

Additionally, OptiCat's Flutter frontend (`chat_server/`) has its own independent auth system — completely bypassing WoW's JWT and tenant context. Users authenticate once in WoW but must re-authenticate in OptiCat (or use a separate auth flow).

This creates several critical gaps:
- Tenant A's HVAC projects, aggregat, and service reports can leak to Tenant B
- No unified user identity — `technician_name` fields are free-text, not linked to WoW user IDs
- Audit logs from OptiCat operations are not reliably linked to the correct WoW user

## Desired Outcome
OptiCat data access is fully tenant-isolated through `getDb(tenantId)`. OptiCat API routes use the same JWT/token as WoW (passed via `auth` context). OptiCat Flutter backend (`chat_server/`) accepts WoW JWTs and enforces tenant + user scoping.

## Scope

### WoW Backend (`plugin/opticat/server/api.ts`)
- [ ] Change `import { db }` → `import { getDb }` and replace all `db.query(...)` → `getDb(auth.tenantId).query(...)`
- [ ] Verify every route filters by `tenant_id = ?` (already done in SQL, but need to ensure this comes from auth context, not user-supplied JSON body)
- [ ] Ensure `auditLog()` calls pass the correct `auth.userId` and `auth.tenantId`
- [ ] VNC launch (`POST /api/opticat/launch`) — ensure per-tenant display isolation (currently single global display at `:99`; when Tenant A and Tenant B both launch OptiCat they share the same desktop)

### OptiCat Flutter Backend (`plugin/opticat/chat_server/`)
- [ ] **Auth bridge**: Accept WoW JWT as Bearer token in all API calls
- [ ] **Tenant context**: Pass `tenantId` from JWT to all DB queries in the Dart chat server
- [ ] **User identity**: Replace free-text `technician_name` with `userId` from JWT, resolve display name from WoW
- [ ] **Permission checks**: Gate OptiCat operations behind `hasPermission(role, capability)` from `server/accessControl.ts`
- [ ] **Session isolation**: Ensure WebSocket sessions in the Dart server are scoped to tenant+user

### Flutter Frontend (`plugin/opticat/lib/`, `plugin/opticat/chat_server/lib/`)
- [ ] All API calls to WoW `/api/opticat/*` must include the WoW JWT
- [ ] Remove any separate login/pin flows in OptiCat Flutter that bypass WoW auth
- [ ] UI must reflect the same role-based gating from `accessControl.ts` (e.g., `opticat:design_hvac`, `opticat:service_checklist`)

### WoW Frontend — OptiCat UI Isolation (`src/`)
- [ ] **Navbar/Navigation hiding**: OptiCat users (role `opticat_user` / `opticat_admin`) must NOT see the main WoW navbar with links to Projects, Tasks, Time, Tickets, Docs, Kanban, Chat, Settings, etc.
- [ ] **Route gating**: Direct navigation to WoW routes (e.g., `/projects`, `/tasks`, `/time`, `/kanban`, `/docs`, `/chat`) must return 403 or redirect for OptiCat-only roles
- [ ] **Surface isolation**: When embedded in WoW, OptiCat should only render within its designated surface (e.g., a dedicated `/opticat` route or iframe) with a minimal "app shell" — no sidebar, no top bar, no global actions
- [ ] **Role-based UI**: `useAuth()` / `usePermissions()` hooks must expose OptiCat capabilities; components like `<Navbar>`, `<Sidebar>`, `<GlobalActions>` must conditionally render based on `hasPermission('opticat:*')` vs full WoW permissions
- [ ] **Tenant switcher hiding**: OptiCat users must NOT see the tenant switcher (they are bound to a single tenant via JWT)

## Acceptance Criteria
- [ ] `bun run build` passes
- [ ] Login via WoW grants access to OptiCat without re-authentication
- [ ] Tenant A sees ONLY their own projects/aggregat/reports in OptiCat
- [ ] Tenant B sees ONLY their own data — cross-tenant access returns 403 or empty results
- [ ] User identity flows through to OptiCat reports (technician name resolved from WoW user)
- [ ] Two simultaneous OptiCat desktop sessions for different tenants/users use separate VNC displays
- [ ] OptiCat users CANNOT see WoW navbar, sidebar, or global navigation
- [ ] OptiCat users accessing `/projects`, `/tasks`, `/time`, `/kanban`, `/docs`, `/chat`, `/settings` receive 403
- [ ] OptiCat users only see the OptiCat surface (e.g., `/opticat` or embedded view) with minimal app shell
- [ ] OptiCat users CANNOT see or use the tenant switcher

## Files to Change
- `plugin/opticat/server/api.ts` — migrate `db` → `getDb(tenantId)` (P0)
- `plugin/opticat/chat_server/lib/auth_service.dart` — accept WoW JWT (P0)
- `plugin/opticat/chat_server/lib/permission_service.dart` — delegate to WoW accessControl (P1)
- `plugin/opticat/server/db.ts` — reference mirror (add getDb usage example)
- `server/db.ts` — VNC display manager already provides per-session displays (`server/vnc-display-manager.ts`), but launch endpoint in api.ts still uses global display (P1)
- `server/accessControl.ts` — OptiCat capabilities already defined, verify coverage

## Related Tickets
- **WOW-056** (opticat-backend-and-simulator-skills) — OptiCat simulator/integrator skills that must also respect tenant isolation
- **WOW-063** (tenant-data-isolation-architecture) — Root ticket for per-tenant DB separation; this ticket extends that work to OptiCat
- **WOW-082** (opticat-unified-auth) — Superseded: auth scope merged into this ticket
- **WOW-095** (multi-user-concurrency) — Blocking dependency for VNC per-session isolation model
- **WOW-097** (docs-file-tree-and-preview) — Frontend file tree and preview infrastructure that must surface tenant-scoped files correctly

## Dependencies
- Blocked on WOW-095 for the VNC per-session isolation model
- Depends on main `db` → `getDb` migration for other route files (ongoing in WOW-063)
- WOW-082 (unified auth) — this ticket supersedes the auth-specific pieces and adds tenant isolation scope
- WOW-097 — file tree must correctly surface tenant-scoped documents

## Notes
- OptiCat DB tables (`opticat_projects`, `opticat_aggregat`, etc.) are ALREADY created per-tenant in `getDb()` (`server/db.ts:65-78`) — the schema is ready, only the API routes need migration.
- The Flutter chat server (`chat_server/`) is deployed independently on Fly.io — its auth and tenant isolation may need a separate deployment pipeline.

## Current WoW Frontend Architecture (Investigation Results)

### Auth & Role System
- **AuthContext** (`src/context/AuthContext.tsx:28-33`) — Provides `useAuth()` hook returning `{ user: { id, name, role }, token }` from JWT in localStorage
- **LoginPage** (`src/pages/LoginPage.tsx:33-42`) — Role-based redirect after login: `CLIENT→/client`, `WORKER/LEADER→/workboard`, `ADMIN/SUPER_ADMIN→/simple`
- **JWT Payload** — Contains `role`, `tenantId`, `userId` (verified in `UiModeToggle.tsx:18-28`)

### Navigation / UI Mode Toggle
- **UiModeToggle** (`src/components/UiModeToggle.tsx`) — Main navigation component in MenuBar, conditionally renders buttons based on role:
  - `isLeaderRole` (LEADER, ADMIN, SUPER_ADMIN): Shows Claw, Projects, OptiCat, OptiCatApp launch
  - `isAdminRole` (ADMIN, SUPER_ADMIN): Shows Admin button
  - `isSuperAdminRole`: Shows Super Admin button
  - `isClientRole`: Shows Client button
  - **All roles see**: Simple, Docs, Workboard, Kanban, TA-Planner, ÄTA, Profile, Logout
- **MenuBar** (`src/components/MenuBar.tsx`) — Always rendered in `App.tsx:229`, contains UiModeToggle
- **App.tsx routes** (`src/App.tsx:233-255`) — No route-level protection; any authenticated user can navigate directly to `/projects`, `/kanban`, `/docs`, `/workboard`, `/admin`, etc.

### OptiCat Dashboard
- **OptiCatDashboard** (`plugins/opticat/src/OptiCatDashboard.tsx`) — Mounted at `/opticat` route
- Fetches data via `/api/opticat/*` endpoints with JWT in Authorization header
- Currently accessible to any role that can reach the route (no permission gate)

### Server-Side Permissions (Backend Only)
- **accessControl.ts** (`server/accessControl.ts`) — Defines `hasCapability(role, capability)` and `getOpticatUiGates(role)`
- OptiCat capabilities: `opticat:view_projects`, `opticat:design_hvac`, `opticat:service_checklist`, etc.
- Role hierarchy: SUPER_ADMIN(100) > ADMIN(80) > LEADER(60) > WORKER(40) > CLIENT(20) > DEMO(10)
- **Frontend does NOT currently consume these capabilities** — no `usePermissions` hook exists

### Gap for OptiCat Isolation
1. **No OptiCat-specific role** — Current roles: SUPER_ADMIN, ADMIN, LEADER, WORKER, CLIENT, DEMO. Need `OPTICAT_USER`, `OPTICAT_ADMIN` (or similar)
2. **Navbar/MenuBar always visible** — OptiCat users see full WoW navigation (Simple, Docs, Workboard, Kanban, Projects, Admin, etc.)
3. **No route guards** — Direct URL access to `/projects`, `/kanban`, `/docs`, `/admin` works for any authenticated user
4. **No frontend permission hook** — Components can't check `hasCapability('opticat:design_hvac')` client-side
5. **UiModeToggle shows OptiCat only to leaders** — But OptiCat users should ONLY see OptiCat, nothing else

---

**Created**: 2026-06-07
**Priority**: High
**Estimated Effort**: L
**Depends on**: WOW-095, WOW-063
**Supersedes**: WOW-082 (unified auth scope merged here)
**Related**: WOW-056, WOW-097


# WOW-098 — OptiCat Per-User Data Isolation (Row-Level Security)

## Problem
WOW-096 establishes **tenant-level** isolation for OptiCat (via `getDb(tenantId)`). However, within a tenant, multiple users (technicians, project managers, admins) share the same OptiCat data with no per-user access control:

- All technicians in Tenant A see ALL projects, aggregat, and service reports
- No assignment model: `technician_name` is free-text, not linked to WoW `userId`
- Service reports created by Technician X are visible/editable by Technician Y
- No audit trail of which USER (not just tenant) performed an action
- OptiCat Flutter backend has no concept of "current user" — only tenant context

## Desired Outcome
OptiCat enforces **per-user row-level security** within each tenant:
- Technicians only see projects/aggregat/reports **assigned to them**
- Project managers see projects they manage
- Admins see all tenant data
- All mutations carry `userId` from WoW JWT for audit logs
- Flutter backend validates user-level permissions on every API call

## Scope

### 1. Database Schema Extensions (Per-User Ownership)
- [ ] Add `owner_user_id` column to `opticat_projects` (FK → `users.id`)
- [ ] Add `owner_user_id` column to `opticat_aggregat` (FK → `users.id`)
- [ ] Add `assigned_user_id` column to `opticat_service_reports` (FK → `users.id`)
- [ ] Add `created_by_user_id` / `updated_by_user_id` to all OptiCat tables
- [ ] Create `opticat_project_assignments` join table (project_id, user_id, role: 'owner'|'technician'|'viewer')
- [ ] Create `opticat_aggregat_assignments` join table (aggregat_id, user_id, role)
- [ ] Migration script in `plugin/opticat/server/migrations/`

### 2. WoW Backend API (`plugin/opticat/server/api.ts`)
- [ ] All `SELECT` queries filter by user assignment:
  ```sql
  -- Projects: user is owner OR has assignment
  SELECT p.* FROM opticat_projects p
  LEFT JOIN opticat_project_assignments a ON p.id = a.project_id
  WHERE p.tenant_id = ? AND (p.owner_user_id = ? OR a.user_id = ?)
  ```
- [ ] All `INSERT`/`UPDATE` set `created_by_user_id` = `auth.userId`
- [ ] `POST /api/opticat/projects` → requires `opticat:manage_catalog` + sets `owner_user_id = auth.userId`
- [ ] `POST /api/opticat/assignments` → grant/revoke user access to project/aggregat (admin/manager only)
- [ ] `GET /api/opticat/my-projects` → convenience endpoint for current user's assigned projects
- [ ] AuditLog calls include `auth.userId` (not just tenantId)

### 3. OptiCat Flutter Backend (`plugin/opticat/chat_server/`)
- [ ] **Auth middleware**: Parse WoW JWT → extract `userId`, `tenantId`, `role`
- [ ] **User context**: Attach `currentUser` to all request handlers
- [ ] **Permission guards** per endpoint:
  - `GET /projects` → filter by `currentUser.id` assignments
  - `POST /reports` → set `assigned_user_id = currentUser.id`
  - `PATCH /reports/:id` → verify `assigned_user_id = currentUser.id` OR `hasCapability(role, 'opticat:edit_report')`
- [ ] **Assignment APIs**: `POST /projects/:id/assign`, `DELETE /projects/:id/assign/:userId`
- [ ] **WebSocket auth**: Validate JWT on WS upgrade, scope session to `tenantId` + `userId`

### 4. Flutter Frontend (`plugin/opticat/lib/`)
- [ ] **User-aware API client**: Auto-attach WoW JWT, handle 403 for unauthorized access
- [ ] **My Projects view**: Default dashboard shows only assigned projects
- [ ] **Assignment UI** (for managers): Drag-drop assign technicians to projects/aggregat
- [ ] **Report ownership**: Service reports pre-fill `technician_name` from WoW user profile
- [ ] **Permission-based UI**: Hide "Create Project" button unless `opticat:manage_catalog`

### 5. WoW Frontend Integration
- [ ] `useOpticatPermissions()` hook consuming `getOpticatUiGates(role)` from backend
- [ ] OptiCatDashboard shows "My Projects" tab by default for technicians
- [ ] Project detail shows assigned technicians (from `opticat_project_assignments`)

## Acceptance Criteria
- [ ] `bun run build` passes
- [ ] Technician A logs in → sees ONLY projects assigned to them
- [ ] Technician B logs in → sees THEIR projects, NOT Technician A's
- [ ] Project Manager sees all projects they manage (assignment role='manager')
- [ ] Admin sees all tenant projects (bypass via `hasCapability('admin:view_all_data')`)
- [ ] Service report created by Technician A → `assigned_user_id = Technician A`
- [ ] Technician B cannot PATCH Technician A's report (403)
- [ ] Audit log shows `userId` for every OptiCat mutation
- [ ] Flutter backend rejects requests without valid WoW JWT containing `userId`
- [ ] Assignment API allows manager to grant/revoke access per user per project

## Files to Change
- `plugin/opticat/server/api.ts` — user-scoped queries, assignment endpoints
- `plugin/opticat/server/migrations/002_per_user_isolation.sql` — new schema
- `plugin/opticat/chat_server/lib/auth_service.dart` — JWT → userId extraction
- `plugin/opticat/chat_server/lib/permission_service.dart` — user-level guards
- `plugin/opticat/chat_server/lib/project_service.dart` — assignment logic
- `plugin/opticat/lib/services/api_service.dart` — user-aware client
- `plugin/opticat/lib/screens/MyProjectsScreen.dart` — default view
- `plugins/opticat/src/OptiCatDashboard.tsx` — "My Projects" tab, assignment UI
- `server/accessControl.ts` — verify OptiCat capability coverage for user-level ops

## Role Matrix (OptiCat-Specific)

| Capability | OPTICAT_TECH | OPTICAT_PM | OPTICAT_ADMIN | ADMIN | SUPER_ADMIN |
|------------|--------------|------------|---------------|-------|-------------|
| `opticat:view_projects` (own) | ✓ | ✓ | ✓ | ✓ | ✓ |
| `opticat:view_projects` (all tenant) | ✗ | ✓* | ✓ | ✓ | ✓ |
| `opticat:create_project` | ✗ | ✓ | ✓ | ✓ | ✓ |
| `opticat:assign_project` | ✗ | ✓ | ✓ | ✓ | ✓ |
| `opticat:create_report` (own) | ✓ | ✓ | ✓ | ✓ | ✓ |
| `opticat:edit_report` (own) | ✓ | ✓ | ✓ | ✓ | ✓ |
| `opticat:edit_report` (any) | ✗ | ✓ | ✓ | ✓ | ✓ |
| `opticat:view_economics` | ✗ | ✓ | ✓ | ✓ | ✓ |

*PM sees projects where they have assignment role='manager' or 'owner'

## Dependencies
- **WOW-096** (tenant isolation) — must be complete first
- **WOW-095** (multi-user concurrency) — for concurrent user sessions
- **WOW-063** (tenant-data-isolation-architecture) — base `getDb` pattern

## Notes
- This ticket **extends** WOW-096 (tenant isolation) with user-level granularity
- Requires new OptiCat-specific roles: `OPTICAT_TECHNICIAN`, `OPTICAT_PROJECT_MANAGER`, `OPTICAT_ADMIN`
- Roles map to WoW roles: `WORKER`→`OPTICAT_TECHNICIAN`, `LEADER`→`OPTICAT_PROJECT_MANAGER`, `ADMIN`→`OPTICAT_ADMIN`
- Assignment tables enable many-to-many (technician can work on multiple projects, project can have multiple technicians)

---

**Created**: 2026-06-08
**Priority**: High
**Estimated Effort**: L
**Depends on**: WOW-096, WOW-095
**Related**: WOW-056, WOW-063, WOW-097

# WOW-096 — OptiCat Tenant & User Isolation

## Problem
OptiCat plugin (`plugin/opticat/server/api.ts`) still uses the global `db` singleton from `server/db.ts` — it does NOT use `getDb(tenantId)`. This means OptiCat data is NOT tenant-isolated despite the tables (`opticat_projects`, `opticat_aggregat`, `opticat_buildings`, `opticat_service_reports`, `opticat_sync_log`) being created per-tenant in `getDb()`.

Additionally, OptiCat's Flutter frontend (`chat_server/`) has its own independent auth system — completely bypassing WoW's JWT and tenant context. Users authenticate once in WoW but must re-authenticate in OptiCat (or use a separate auth flow).

This creates several critical gaps:
- Tenant A's HVAC projects, aggregat, and service reports can leak to Tenant B
- No unified user identity — `technician_name` fields are free-text, not linked to WoW user IDs
- Audit logs from OptiCat operations are not reliably linked to the correct WoW user

## Desired Outcome
OptiCat data access is fully tenant-isolated through `getDb(tenantId)`. OptiCat API routes use the same JWT/token as WoW (passed via `auth` context). OptiCat Flutter backend (`chat_server/`) accepts WoW JWTs and enforces tenant + user scoping.

## Scope

### WoW Backend (`plugin/opticat/server/api.ts`)
- [ ] Change `import { db }` → `import { getDb }` and replace all `db.query(...)` → `getDb(auth.tenantId).query(...)`
- [ ] Verify every route filters by `tenant_id = ?` (already done in SQL, but need to ensure this comes from auth context, not user-supplied JSON body)
- [ ] Ensure `auditLog()` calls pass the correct `auth.userId` and `auth.tenantId`
- [ ] VNC launch (`POST /api/opticat/launch`) — ensure per-tenant display isolation (currently single global display at `:99`; when Tenant A and Tenant B both launch OptiCat they share the same desktop)

### OptiCat Flutter Backend (`plugin/opticat/chat_server/`)
- [ ] **Auth bridge**: Accept WoW JWT as Bearer token in all API calls
- [ ] **Tenant context**: Pass `tenantId` from JWT to all DB queries in the Dart chat server
- [ ] **User identity**: Replace free-text `technician_name` with `userId` from JWT, resolve display name from WoW
- [ ] **Permission checks**: Gate OptiCat operations behind `hasPermission(role, capability)` from `server/accessControl.ts`
- [ ] **Session isolation**: Ensure WebSocket sessions in the Dart server are scoped to tenant+user

### Flutter Frontend (`plugin/opticat/lib/`, `plugin/opticat/chat_server/lib/`)
- [ ] All API calls to WoW `/api/opticat/*` must include the WoW JWT
- [ ] Remove any separate login/pin flows in OptiCat Flutter that bypass WoW auth
- [ ] UI must reflect the same role-based gating from `accessControl.ts` (e.g., `opticat:design_hvac`, `opticat:service_checklist`)

### WoW Frontend — OptiCat UI Isolation (`src/`)
- [ ] **Navbar/Navigation hiding**: OptiCat users (role `opticat_user` / `opticat_admin`) must NOT see the main WoW navbar with links to Projects, Tasks, Time, Tickets, Docs, Kanban, Chat, Settings, etc.
- [ ] **Route gating**: Direct navigation to WoW routes (e.g., `/projects`, `/tasks`, `/time`, `/kanban`, `/docs`, `/chat`) must return 403 or redirect for OptiCat-only roles
- [ ] **Surface isolation**: When embedded in WoW, OptiCat should only render within its designated surface (e.g., a dedicated `/opticat` route or iframe) with a minimal "app shell" — no sidebar, no top bar, no global actions
- [ ] **Role-based UI**: `useAuth()` / `usePermissions()` hooks must expose OptiCat capabilities; components like `<Navbar>`, `<Sidebar>`, `<GlobalActions>` must conditionally render based on `hasPermission('opticat:*')` vs full WoW permissions
- [ ] **Tenant switcher hiding**: OptiCat users must NOT see the tenant switcher (they are bound to a single tenant via JWT)

## Acceptance Criteria
- [ ] `bun run build` passes
- [ ] Login via WoW grants access to OptiCat without re-authentication
- [ ] Tenant A sees ONLY their own projects/aggregat/reports in OptiCat
- [ ] Tenant B sees ONLY their own data — cross-tenant access returns 403 or empty results
- [ ] User identity flows through to OptiCat reports (technician name resolved from WoW user)
- [ ] Two simultaneous OptiCat desktop sessions for different tenants/users use separate VNC displays
- [ ] OptiCat users CANNOT see WoW navbar, sidebar, or global navigation
- [ ] OptiCat users accessing `/projects`, `/tasks`, `/time`, `/kanban`, `/docs`, `/chat`, `/settings` receive 403
- [ ] OptiCat users only see the OptiCat surface (e.g., `/opticat` or embedded view) with minimal app shell
- [ ] OptiCat users CANNOT see or use the tenant switcher

## Files to Change
- `plugin/opticat/server/api.ts` — migrate `db` → `getDb(tenantId)` (P0)
- `plugin/opticat/chat_server/lib/auth_service.dart` — accept WoW JWT (P0)
- `plugin/opticat/chat_server/lib/permission_service.dart` — delegate to WoW accessControl (P1)
- `plugin/opticat/server/db.ts` — reference mirror (add getDb usage example)
- `server/db.ts` — VNC display manager already provides per-session displays (`server/vnc-display-manager.ts`), but launch endpoint in api.ts still uses global display (P1)
- `server/accessControl.ts` — OptiCat capabilities already defined, verify coverage

## Related Tickets
- **WOW-056** (opticat-backend-and-simulator-skills) — OptiCat simulator/integrator skills that must also respect tenant isolation
- **WOW-063** (tenant-data-isolation-architecture) — Root ticket for per-tenant DB separation; this ticket extends that work to OptiCat
- **WOW-082** (opticat-unified-auth) — Superseded: auth scope merged into this ticket
- **WOW-095** (multi-user-concurrency) — Blocking dependency for VNC per-session isolation model
- **WOW-097** (docs-file-tree-and-preview) — Frontend file tree and preview infrastructure that must surface tenant-scoped files correctly

## Dependencies
- Blocked on WOW-095 for the VNC per-session isolation model
- Depends on main `db` → `getDb` migration for other route files (ongoing in WOW-063)
- WOW-082 (unified auth) — this ticket supersedes the auth-specific pieces and adds tenant isolation scope
- WOW-097 — file tree must correctly surface tenant-scoped documents

## Notes
- OptiCat DB tables (`opticat_projects`, `opticat_aggregat`, etc.) are ALREADY created per-tenant in `getDb()` (`server/db.ts:65-78`) — the schema is ready, only the API routes need migration.
- The Flutter chat server (`chat_server/`) is deployed independently on Fly.io — its auth and tenant isolation may need a separate deployment pipeline.

## Current WoW Frontend Architecture (Investigation Results)

### Auth & Role System
- **AuthContext** (`src/context/AuthContext.tsx:28-33`) — Provides `useAuth()` hook returning `{ user: { id, name, role }, token }` from JWT in localStorage
- **LoginPage** (`src/pages/LoginPage.tsx:33-42`) — Role-based redirect after login: `CLIENT→/client`, `WORKER/LEADER→/workboard`, `ADMIN/SUPER_ADMIN→/simple`
- **JWT Payload** — Contains `role`, `tenantId`, `userId` (verified in `UiModeToggle.tsx:18-28`)

### Navigation / UI Mode Toggle
- **UiModeToggle** (`src/components/UiModeToggle.tsx`) — Main navigation component in MenuBar, conditionally renders buttons based on role:
  - `isLeaderRole` (LEADER, ADMIN, SUPER_ADMIN): Shows Claw, Projects, OptiCat, OptiCatApp launch
  - `isAdminRole` (ADMIN, SUPER_ADMIN): Shows Admin button
  - `isSuperAdminRole`: Shows Super Admin button
  - `isClientRole`: Shows Client button
  - **All roles see**: Simple, Docs, Workboard, Kanban, TA-Planner, ÄTA, Profile, Logout
- **MenuBar** (`src/components/MenuBar.tsx`) — Always rendered in `App.tsx:229`, contains UiModeToggle
- **App.tsx routes** (`src/App.tsx:233-255`) — No route-level protection; any authenticated user can navigate directly to `/projects`, `/kanban`, `/docs`, `/workboard`, `/admin`, etc.

### OptiCat Dashboard
- **OptiCatDashboard** (`plugins/opticat/src/OptiCatDashboard.tsx`) — Mounted at `/opticat` route
- Fetches data via `/api/opticat/*` endpoints with JWT in Authorization header
- Currently accessible to any role that can reach the route (no permission gate)

### Server-Side Permissions (Backend Only)
- **accessControl.ts** (`server/accessControl.ts`) — Defines `hasCapability(role, capability)` and `getOpticatUiGates(role)`
- OptiCat capabilities: `opticat:view_projects`, `opticat:design_hvac`, `opticat:service_checklist`, etc.
- Role hierarchy: SUPER_ADMIN(100) > ADMIN(80) > LEADER(60) > WORKER(40) > CLIENT(20) > DEMO(10)
- **Frontend does NOT currently consume these capabilities** — no `usePermissions` hook exists

### Gap for OptiCat Isolation
1. **No OptiCat-specific role** — Current roles: SUPER_ADMIN, ADMIN, LEADER, WORKER, CLIENT, DEMO. Need `OPTICAT_USER`, `OPTICAT_ADMIN` (or similar)
2. **Navbar/MenuBar always visible** — OptiCat users see full WoW navigation (Simple, Docs, Workboard, Kanban, Projects, Admin, etc.)
3. **No route guards** — Direct URL access to `/projects`, `/kanban`, `/docs`, `/admin` works for any authenticated user
4. **No frontend permission hook** — Components can't check `hasCapability('opticat:design_hvac')` client-side
5. **UiModeToggle shows OptiCat only to leaders** — But OptiCat users should ONLY see OptiCat, nothing else

---

**Created**: 2026-06-07
**Priority**: High
**Estimated Effort**: L
**Depends on**: WOW-095, WOW-063
**Supersedes**: WOW-082 (unified auth scope merged here)
**Related**: WOW-056, WOW-097
