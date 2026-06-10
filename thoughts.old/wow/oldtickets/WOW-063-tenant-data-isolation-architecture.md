# WOW-063 Tenant Data Isolation & Physical Database Separation

## Problem Statement

All tenants share a single SQLite file (`data/wayofwork.sqlite`). While row-level `tenant_id` isolation exists on every table and all queries filter by tenant, the physical database file is shared. This means:

1. **No hard isolation boundary** — a bug or SQL injection in a tenant-scoped query could leak data across tenants
2. **No per-tenant backup/restore** — backing up one tenant means backing up ALL tenant data
3. **No per-tenant migration** — schema changes affect all tenants simultaneously with no staging per tenant
4. **No per-tenant performance tuning** — one tenant's heavy query load can degrade performance for all others
5. **No tenant-level resource limits** — storage and compute are shared with no per-tenant caps
6. **GDPR compliance complexity** — deleting one tenant's data requires careful multi-table operations across shared storage

Tracking which company (tenant), users, and projects belong to each other works at the application layer, but there is no infrastructure-level separation.

## Desired Outcome

A tenant data isolation architecture where:

1. Each tenant gets its **own SQLite database file** (`data/tenants/<tenant_id>/database.sqlite`)
2. The system maintains a **shared "meta" database** for cross-tenant data (tenant registry, super admin accounts)
3. Application-layer isolation (`tenant_id` filters) remains as a defense-in-depth layer
4. Per-tenant backup, restore, and migration become possible
5. Different tenants can be on different schema versions during gradual migrations
6. Storage limits can be enforced per tenant at the filesystem level

## Context & Background

### Current State (2026-06-07)

- **Single SQLite**: `data/wayofwork.sqlite` is the MAIN database
- **Per-tenant DB support**: `server/db.ts` now has `getDb(tenantId)` which creates/returns per-tenant `.sqlite` files (`data/wayofwork-<tenantId>.sqlite`) with full schema — **implemented in WOW-095**
- **Tenant isolation**: Row-level via `tenant_id` column on every table, all queries filter by `auth.tenantId`
- **WAL mode**: Enabled on all DB connections (`PRAGMA journal_mode=WAL`) — **implemented**
- **Transaction helper**: `transaction(fn, tenantId)` wraps writes in `BEGIN IMMEDIATE`/`COMMIT` — **implemented**
- **Users**: Each user belongs to one tenant (`users.tenant_id`)
- **Projects**: Each project belongs to one tenant (`projects.tenant_id`)
- **Kanban boards**: Each board belongs to one tenant (`kanban_boards.tenant_id`)
- **Workspace FS**: Path-based per-tenant isolation via `getPrimaryWorkspacePath(tenantId)` — **updated**
- **Authentication**: JWT contains `userId` and `tenantId`, verified on every request
- **VNC sessions**: Per-user/tenant isolation via `server/vnc-display-manager.ts` — **implemented**
- **Tool-log broadcast**: Filtered by `tenantId` — **implemented**
- **Agent manifest cache**: Per-tenant `Map<string, Manifest>` — **implemented**
- **Role system**: `SUPER_ADMIN` (cross-tenant), `ADMIN` (per-tenant), `LEADER`, `WORKER`, `CLIENT`

### Tenant Isolation Audit (2026-06-06)

**Overall Assessment: GOOD** — most routes are properly isolated. However, critical gaps were found:

#### 🔴 CRITICAL — Cross-Tenant Authentication Bypass
- **`auth.ts:19`** — `POST /api/login` queries `WHERE username = ?` with **no `tenant_id` filter**. Since `UNIQUE(tenant_id, username)` allows the same username across tenants, a user from Tenant A could authenticate as Tenant B's user if both have the same username.
- **`auth.ts:48`** — `POST /api/portal/login` has the same issue for PIN-based portal login.

**Fix required**: Logins must accept a tenant identifier (slug/domain) or usernames must be globally unique. Before per-tenant DB separation, add `tenant_id` to login queries using a tenant slug from the request.

#### 🟡 MEDIUM — UPDATE/DELETE Without Tenant Filter (after existence check)
These routes verify `tenant_id` in an existence check (SELECT) but perform the mutation without `tenant_id` in the WHERE clause. While the PRIMARY KEY guarantee makes actual cross-tenant mutation unlikely, the pattern is inconsistent:

| File | Line | Route | Issue |
|---|---|---|---|
| `id06.ts` | 98-101 | `PUT /api/id06/cards/:id` | UPDATE without tenant_id |
| `id06.ts` | 121 | `DELETE /api/id06/cards/:id` | DELETE without tenant_id |
| `kanban-boards.ts` | 96-98 | `PUT /api/kanban-boards/:id` | UPDATE without tenant_id |
| `kanban-boards.ts` | 119 | `DELETE /api/kanban-boards/:id` | DELETE without tenant_id |

**Fix required**: Add `AND tenant_id = ?` to every UPDATE/DELETE statement, even when preceded by an existence check.

#### 🟢 LOW — Generally well-isolated
The remaining 20+ route files across `admin.ts`, `portal.ts`, `projects.ts`, `calendar.ts`, `channels.ts`, `client.ts`, `bug-reports.ts`, `notifications.ts`, and others all correctly filter by `auth.tenantId` in every SQL query. No other cross-tenant data access vectors were found.

### Key Tables and Their Tenant Relationships

| Table | Tenant Column | Current Isolation |
|---|---|---|
| `projects` | `tenant_id` | Row-level filtering |
| `kanban_boards` | `tenant_id` | Row-level filtering |
| `tasks` | `tenant_id` | Row-level filtering |
| `users` | `tenant_id` | Row-level filtering |
| `time_entries` | `tenant_id` | Row-level filtering |
| `project_members` | `tenant_id` (implicit via projects) | Row-level filtering |
| `workspace_files` | `tenant_id` | Row-level filtering |
| `audit_logs` | `tenant_id` | Row-level filtering |

### Why This Matters

As the system grows to support multiple real companies (construction firms, HVAC companies, property managers), physical data isolation becomes critical for:

- **Security**: A query bug in tenant A's scope should NEVER expose tenant B's data
- **Compliance**: GDPR right-to-deletion requires the ability to completely wipe a tenant's data
- **Operations**: Per-tenant backup, restore, migration, and monitoring
- **Performance**: A tenant with 100k tasks shouldn't slow down a tenant with 10 tasks
- **Onboarding**: Each tenant can be migrated independently without system-wide downtime

## Requirements

### Functional Requirements
- [ ] Create a **meta-database** (`data/meta.sqlite`) for cross-tenant data:
  - `tenants` table (id, name, slug, subscription_tier, created_at, status, settings_json)
  - `super_admin_users` table (global super admins, not scoped to a tenant)
- [x] **Per-tenant database factory**: `getDb(tenantId)` in `server/db.ts` creates/returns tenant-specific SQLite files (`data/wayofwork-<tenantId>.sqlite`) with full schema. **Done in WOW-095.**
- [ ] **Per-tenant DB auto-provisioning**: When a new tenant is registered via admin UI, automatically call `getDb(tenantId)` and run initial setup
- [ ] **Route migration**: Switch all route handlers from `db` singleton to `getDb(auth.tenantId)` for tenant-scoped queries (currently default "default" tenant uses shared DB)
- [x] **Connection pool**: `tenantDbs` Map caches DB connections per-tenant. **Done.**
- [x] **WAL mode**: Enabled on all per-tenant DB connections. **Done.**
- [x] **Transaction helper**: `transaction(fn, tenantId)` available. **Done.**
- [ ] **Backward compatibility**: Existing "default" tenant data stays in `wayofwork.sqlite`; new tenants get their own files
- [ ] **Super admin access**: SUPER_ADMIN can query across all tenant databases via `getDb(tenantId)`
- [ ] **Tenant provisioning UI**: Create/disable/delete tenants from admin UI
- [ ] **Login with tenant**: `POST /api/login` must accept `tenantId` (already supported) — forced tenant context prevents cross-tenant auth bypass

### Out of Scope
- Horizontal scaling (multiple server instances sharing tenant DBs)
- Read replicas or sharding
- Cloud-native database services (PostgreSQL, etc.)

### GDPR Compliance Requirements
The system must comply with GDPR (General Data Protection Regulation) since it processes personal data for multiple companies:

- [ ] **Right to erasure ("right to be forgotten")**: Per-tenant DB deletion must remove ALL personal data for that tenant's users. No residual data in shared tables.
- [ ] **Data portability**: Ability to export a tenant's complete data in a standard format (JSON/CSV) on request.
- [ ] **Data minimization**: Only store personal data that is strictly necessary for system function. Audit all tables for unnecessary personal data fields.
- [ ] **Access logs**: All access to personal data must be logged with user ID, timestamp, and purpose (already partially covered by `audit_logs`).
- [ ] **Breach notification**: System must be able to identify which tenants were affected by a data breach (possible with per-tenant DB files).
- [ ] **Data Processing Agreement (DPA)**: Each tenant (company) is a data controller; the system operator is a data processor. The architecture must support per-tenant DPA terms.
- [ ] **Storage limitation**: Personal data must be deleted or anonymized when no longer needed (configurable retention policies per tenant).
- [ ] **Cross-border data transfer**: If the system is hosted in EU vs non-EU regions, tenant DBs must be stored in the correct geographic region.

## Acceptance Criteria

### Automated Verification
- [ ] Build completes: `bun run build`

### Manual Verification
- [ ] Creating a new tenant provisions a new database file
- [ ] Tenant A's data is invisible to Tenant B (even via direct SQLite inspection of the file)
- [ ] SUPER_ADMIN can see all tenants
- [ ] Deleting a tenant removes its database file completely
- [ ] Existing tenants are migrated from shared DB to per-tenant DB
- [ ] Per-tenant backup creates a single file copy

## Technical Notes

### Affected Components
- `server/db.ts` — Major refactor: switch from single `db` export to per-tenant DB resolution
- `server/auth.ts` — Ensure `SUPER_ADMIN` role can access meta-db for cross-tenant operations
- `server/index.ts` — Initialize meta-db, provision per-tenant DBs on first request
- `server/migrations/` — Per-tenant migration system (run per-tenant, track per-tenant version)
- `server/routes/` — All routes get `auth.tenantId` → resolve tenant-specific DB instance
- `server/tools/` — Agent tools need tenant-scoped DB access
- `src/pages/AdminDashboard.tsx` — Tenant management UI (create, disable, delete, settings)
- `src/pages/SuperAdminDashboard.tsx` — Cross-tenant management

### Architecture Sketch

```
data/
├── meta.sqlite                          # Global: tenants, super_admins
└── tenants/
    ├── tenant_abc123/
    │   └── database.sqlite              # Tenant A: all their data
    ├── tenant_def456/
    │   └── database.sqlite              # Tenant B: all their data
    └── tenant_ghi789/
        └── database.sqlite              # Tenant C: all their data
```

### Migration Strategy

1. Create `meta.sqlite` with `tenants` table
2. Copy existing tenants from shared DB into meta.sqlite
3. For each tenant, create `data/tenants/<id>/database.sqlite` and migrate their rows
4. Switch route handlers to resolve DB per-tenant
5. Keep the old shared DB as fallback/read-only until all tenants are migrated

---

## Remaining Gaps After WOW-095 Implementation (2026-06-07)

Även efter dagens implementation av `getDb(tenantId)`, VNC-isolering, workspace-scoping, tool-log-filtering och agent-cache finns det kritiska brister:

### 🔴 P0: Standard-DB används fortfarande av alla routes
`server/db.ts:10` — `const db`-singelton importeras av **14+ filer** och används i alla route-handlers. `getDb(tenantId)` är implementerad men **ingen route anropar den** (förutom OptiCat-verktygen).

**Vad krävs:**
- Varje route måste byta `import { db }` → `import { getDb }` och anropa `getDb(auth.tenantId)` i varje handler
- Alla services (`audit-logger.ts`, `notifications.ts`, `telegram-bot.ts`, `offers-api.ts`, `tickets-api.ts`, etc.) måste få tenantId
- Detta är en massiv refaktor över hela `server/` — uppskattningsvis 40+ ställen

### 🔴 P0: Login kan autentisera över företagsgränser
`server/routes/auth.ts:24` — `POST /api/login` söker efter användarnamn **utan `tenant_id`-filter** när tenantId inte skickas med:
```typescript
user = db.query("SELECT * FROM users WHERE username = ?").get(username);
```
Om "anna" finns i både Företag A och Företag B:
- Utan `tenantId`: returnerar första träffen — kan bli fel företag
- Med `tenantId`: filtrerar korrekt

**Vad krävs:**
- Tvinga `tenantId` i login-flödet (via subdomain, tenant slug i POST body, eller klient-specifik login-URL)
- Ta bort den "fuzzy" matchningen som faller tillbaka på obegränsad sökning

### 🔴 P0: Inget sätt att provisionera nytt företag via UI
Det finns inget admin-UI eller API för att registrera ett nytt företag. Allt körs mot "default"-tenanten. Seedning av nya tenants görs enbart via `server/db.ts:458-497` som bara körs om default-tenanten inte finns.

**Vad krävs:**
- `POST /api/admin/tenants` — skapar tenant, kör `getDb(tenantId)`, initierar per-tenant DB
- Admin-UI för att skapa företag, bjuda in användare, sätta prenumerationsnivå
- Vid skapande: kör `initializeTenantSchema()` på den nya DB-filen

### 🟡 P1: Workspace FS-isolering är path-baserad, inte verklig
`server/workspace-state.ts:80-93` — `getPrimaryWorkspacePath(tenantId)` returnerar `/<base>/<tenantId>/`, men det finns:
- Inget som hindrar en process från att läsa över tenant-gränser via `..` eller absoluta sökvägar
- Inget OS-level isolation (bind mounts, chroot, namespace)
- Workspace-index (`workspace-index.ts`) körs fortfarande på en global root, inte per tenant

**Vad krävs:**
- `WOP_WORKSPACE_ROOT` bör sättas per tenant
- Workspace-index måste kunna indexera per tenant workspace
- Alternativ: använd `chroot` eller `unshare` för verklig filsystemsisolering vid agent tool execution

### 🟡 P1: Inget meta-DB för cross-tenant admin
`tenants`-tabellen bor i samma `wayofwork.sqlite` som all tenant-data. SUPER_ADMIN måste ansluta till samma DB som tenant-data för att administrera företag.

**Vad krävs:**
- Skapa `data/meta.sqlite` med:
  - `tenants` (id, name, slug, subscription_tier, status, created_at, settings_json)
  - `super_admin_users` (globala SUPER_ADMIN-konton, inte kopplade till en tenant)
- `audit_logs` för cross-tenant-händelser
- `metaDb = new Database("data/meta.sqlite")` — separat från tenant-DBer

### 🟡 P2: Objektlagring per tenant
`workspace_files`, dokument och uppladdade filer lagras i en gemensam mapp utan tenant-struktur.

**Vad krävs:**
- All fillagring: `data/tenants/<tenant_id>/files/<uuid>.<ext>`
- Varje tenant får egen `agent/sessions/` directory
- Existerande filer migreras till tenant-mappar

---

## Uppdaterad arkitektur

```
data/
├── meta.sqlite                          # Global: tenants, super_admins, cross-tenant audit
├── wayofwork.sqlite                     # Default tenant (legacy, fasas ut)
├── wayofwork-<tenant_id>.sqlite         # Per-tenant DB (skapas av getDb)
└── tenants/
    └── <tenant_id>/
        ├── files/                       # Tenant-scoped filer
        └── workspace/                   # Tenant-scoped workspace root
```

## Återstående arbete — prioriterat

| Prio | Vad | Fil(er) | Status |
|------|-----|---------|--------|
| 🔴 | Migrera routes till `getDb(tenantId)` | Alla `server/routes/*.ts` (14+ filer) | ❌ |
| 🔴 | Login med tenant-begränsning | `server/routes/auth.ts:24,48` | ❌ |
| 🔴 | Tenant-provisionering (API + UI) | `server/routes/admin.ts`, `src/pages/AdminDashboard.tsx` | ❌ |
| 🟡 | Meta-DB (`data/meta.sqlite`) | `server/db.ts` | ❌ |
| 🟡 | Workspace-index per tenant | `server/workspace-index.ts` | ⚠️ Delvis |
| 🟡 | Fil-lagring per tenant | `server/db.ts` workspace_files, upload endpoints | ❌ |
| 🟢 | Migrera "default" tenant till egen DB | `server/db.ts` seed | ❌ |

---

## Meta

**Created**: 2026-06-06
**Uppdaterad**: 2026-06-07
**Priority**: High
**Estimated Effort**: XL
**Depends on**: WOW-095 (per-tenant DB factory, VNC isolering, workspace-scoping, m.m. är implementerade där)
**Next step**: Migrera alla route-handlers från `db` singelton till `getDb(tenantId)`
