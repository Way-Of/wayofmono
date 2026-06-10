# WOW-052: Unified User Role Schema & Org Hierarchy

## Problem Statement

Way of Work and OptiCat have evolved separate, incompatible role systems. WoW has 5 flat roles (`SUPER_ADMIN`, `ADMIN`, `LEADER`, `WORKER`, `CLIENT`) checked as magic strings scattered across 20+ route handlers. OptiCat has 2 roles (`admin`, `user`) with no multi-tenant or org hierarchy. There is no single source of truth defining:

- What roles exist in the org hierarchy
- What permissions each role has (permissions matrix)
- How OptiCat roles map to WoW roles when OptiCat becomes a plugin
- How users flow through the system from signup to daily work
- How different org sizes (1-person HVAC company vs 200-person construction firm) map to the same schema

This causes role checks to be duplicated, inconsistent, and impossible to audit. Adding the OptiCat plugin (WOW-049) with its own user concepts (gamification level, job title, employment status) makes the problem worse without a unified schema.

## Desired Outcome

A single, formalized user role schema with a clear org hierarchy, documented permissions matrix, and defined user flows for every persona. Both WoW and OptiCat use this schema. Roles are defined as a TypeScript enum + permissions table instead of magic strings. The schema supports companies of all sizes and maps cleanly to OptiCat's existing concepts (gamification, employment status, project permissions).

## Context & Background

### Current State — WoW Roles

WoW has 5 roles used as freeform `TEXT` in the `users` table — no enum, no constants file, no permissions matrix:

| Role | Tenant Scope | Seed Data Users | What They Can Do |
|---|---|---|---|
| **SUPER_ADMIN** | Cross-tenant (system-wide) | Not seeded (manual only) | Create tenants, see all users system-wide, manage all tenants, access all data |
| **ADMIN** | Per-tenant | admin, josef, michael, ebba (WIP: maja_j) | Manage users, price lists, LLM config, channels, approvals, offers/invoices, bug reports |
| **LEADER** | Per-tenant | bjorn, johan | Team oversight, ticket management, see team time entries, no economics access |
| **WORKER** | Per-tenant | martin, karl, erik, anna_j, magnus, lindad (WIP: 7 more) | Own tasks/time/projects, no economics, limited ticket access |
| **CLIENT** | Per-tenant | acme_corp, peab | View-only dashboard, see own projects, no internal operations |

**Key gaps:**
- No `OWNER` — company CEO who owns the tenant is lumped into ADMIN
- No `MANAGER` role between `ADMIN` and `LEADER` — project managers can't see economics without being made ADMIN
- No office specialist roles — finance, procurement, estimation, quality, HR, planning are all collapsed into ADMIN
- No role hierarchy defined anywhere — permissions are scattered inline
- No way to do fine-grained permissions (e.g., "can manage price lists but not users")
- `CLIENT` is overloaded — can be a building owner, a contractor, or a property manager

### Current State — OptiCat Roles

OptiCat has a simpler system designed for a standalone app:

| Role | Scope | What They Can Do |
|---|---|---|
| **admin** | Global (no tenants) | Full access: manage users, projects, permissions, broadcast messages |
| **user** | Global | Project access based on per-project permissions (read/write/none), chat, canvas design |

**Additional OptiCat user attributes** (not access control, but identity):
- `EmploymentStatus`: `available`, `employed`, `selfEmployed`
- `level` (1-10): Gamification level based on points
- `title`: "Nybörjare", "Lärling", "Kunnig", "Erfaren", "Specialist", "Expert", "Mästare"
- `jobTitle`: Freeform string (e.g., "Ventilationstekniker")
- Canvas `CollabRole`: `owner`, `collaborator` (per-session, not system-wide)

### Current Org Hierarchy (Implicit)

```
SUPER_ADMIN (platform owner — runs the WoW instance)
  └── Tenants (companies/organizations)
        └── ADMIN (company admin — runs the company's WoW)
              ├── LEADER (team supervisor)
              │     └── WORKER (field technician)
              └── CLIENT (external — building owner, contractor)
```

This works for a construction company but breaks down for:
- **Small HVAC firm** (1-3 people): Same person is ADMIN + WORKER
- **Large enterprise**: Needs MANAGER between ADMIN and LEADER, multiple teams
- **Property management company**: Needs different CLIENT subtypes

### What a HVAC Company Looks Like in Real Life

A typical HVAC/construction company has multiple office roles that the current 5-role system collapses together:

```
HVAC Company "Svensk Ventilation AB" (25 employees)
  ┌── Top Management ──────────────────────────────────────────┐
  │  Owner/CEO (michael)          → ADMIN today, should be OWNER│
  │  Co-owner (josef)             → ADMIN today, should be OWNER│
  ├── Office & Admin ──────────────────────────────────────────┤
  │  Office Manager (ebba)        → ADMIN today (handles admin) │
  │  HR / Personnel (ny)          → No role today               │
  │  IT / System (ny)             → No role today               │
  ├── Finance & Procurement ───────────────────────────────────┤
  │  Economy/Finance (ny)         → No role today               │
  │  Purchaser/Procurement (ny)   → No role today               │
  │  Cost Estimator (ny)          → No role today               │
  ├── Production Management ───────────────────────────────────┤
  │  Project Manager (bjorn)      → LEADER today, should be     │
  │                                  MANAGER or PROJECT_MGR     │
  │  Production Planner (ny)      → No role today               │
  │  Quality/Compliance (ny)      → No role today (OVK, certs)  │
  ├── Field Operations ────────────────────────────────────────┤
  │  Team Lead / Foreman (johan)  → LEADER today                │
  │  Senior Technician (martin)   → WORKER today                │
  │  Technician (karl, erik)      → WORKER today                │
  │  Apprentice (anna_j)          → WORKER today                │
  └── External ────────────────────────────────────────────────┘
    Building Owner (acme_corp)     → CLIENT today
```

The flat role system collapses all office staff into `ADMIN` even though their responsibilities are completely different — the IT admin should not see financial data, the economy person should not manage users, the estimator should not manage LLM config.

### Real Office Roles in an HVAC Company

| Office Role | Department | Typical Responsibilities | Should Map to |
|---|---|---|---|
| **Owner/CEO** | Management | Strategic decisions, company finances, hiring key staff, delete org | OWNER |
| **Office Manager** | Admin | Daily operations, user accounts, supplies, customer communication | ADMIN |
| **Economy/Finance** | Finance | Invoicing, accounting, payroll, budgeting, financial reports | ECONOMY |
| **Purchaser** | Procurement | Order materials, supplier contracts, logistics, stock management | PURCHASER |
| **Cost Estimator** | Estimation | Price lists, tender calculations, cost analysis, bid preparation | ESTIMATOR |
| **Project Manager** | Production | Run projects, client contact, resource allocation, budget tracking | MANAGER |
| **Production Planner** | Planning | Schedule work, plan resources, coordinate crews, timeline management | PLANNER |
| **Quality/Compliance** | Quality | OVK inspections, certifications, safety documentation, audits | QUALITY |
| **HR/Personnel** | HR | Hiring, employee records, certifications, training, scheduling | HR |
| **IT/System Admin** | IT | System configuration, channels, LLM, integrations | IT_ADMIN |
| **Sales/Marketing** | Sales | Customer acquisition, offers, follow-up, marketing | SALES |
| **Warehouse/Logistics** | Logistics | Inventory management, delivery coordination, stock control | LOGISTICS |
| **Foreman** | Field | Lead crew on site, assign tasks, quality control | LEADER |
| **Technician** | Field | HVAC service, installation, maintenance, measurements | WORKER |
| **Apprentice** | Field | Learning, supervised work, simple tasks | WORKER (restricted) |
| **Building Owner** | External | View progress, receive reports, approve work | CLIENT |

### Why This Matters
- **Security**: Without a formal permissions matrix, a bug in one route handler can expose data. A single source of truth prevents this.
- **OptiCat plugin**: Can't map OptiCat users to WoW roles without a clear schema. A technician vs project manager vs building owner need distinct access.
- **Multi-tenant**: Different org sizes need different role configurations. A 1-person HVAC company doesn't need MANAGER, but a 200-person firm does.
- **Audit**: Every role check today is a magic string — impossible to audit what each role can actually do.
- **UI gating**: Frontend navigation and surface visibility depends on role. Inconsistent role checks mean inconsistent UI.
- **Agent permissions**: AI agents need to know what a user is allowed to do before proposing actions.

## Requirements

### Functional Requirements — Role Schema

#### Org Hierarchy — Complete Role Set

- [ ] **Org/Company (Tenant)** — top-level entity. Has name, slug, subscription tier, settings, company profile.
- [ ] **SUPER_ADMIN** — platform-wide. Creates tenants, manages billing, sees all data. Not a tenant member.
- [ ] **OWNER** — tenant-level. Full control over the company's WoW instance. Can delete tenant, manage billing, appoint ADMINs, see all projects and financials. Maps to: company CEO, business owner, board member.
- [ ] **ADMIN** — tenant-level. Daily office management. Manages users, price lists, LLM config, channels, pending changes, bug reports. Cannot delete tenant, change billing, or see sensitive financials. Maps to: office manager, operations manager.
- [ ] **ECONOMY** — tenant-level. Finance and accounting. Handles invoicing, budgeting, financial reports, price list management, payroll data. Cannot manage users, channels, or LLM config. Maps to: CFO, accountant, finance manager.
- [ ] **PURCHASER** — tenant-level. Procurement and supply chain. Orders materials, manages supplier catalog, handles OptiCat articles and cart, tracks deliveries and stock. Cannot see full company economics. Maps to: procurement manager, supply chain coordinator.
- [ ] **ESTIMATOR** — tenant-level. Cost estimation for tenders. Creates and maintains price lists, calculates project cost estimates, prepares bids. Can see economics needed for estimation. Cannot manage users or projects. Maps to: cost estimator, bid preparer, calculation engineer.
- [ ] **MANAGER** — tenant-level. Project management. Manages multiple projects, client contact, resource allocation, budget tracking, creates offers/invoices, sees project economics. Cannot manage users or system config. Maps to: project manager, regional manager, production manager.
- [ ] **PLANNER** — tenant-level. Production planning and scheduling. Plans daily/weekly work schedules, allocates crews and resources, coordinates with procurement. Can see team availability but not economics. Maps to: production planner, scheduler, dispatcher.
- [ ] **QUALITY** — tenant-level. Quality assurance and compliance. Manages OVK inspections, certifications, safety documentation, audits, service reports. Can see quality-related data across projects. Maps to: quality manager, compliance officer, safety coordinator.
- [ ] **HR** — tenant-level. Human resources and personnel. Manages employee records, employment status, certifications, training, scheduling, sick leave. Cannot see project economics. Maps to: HR manager, personnel administrator.
- [ ] **IT_ADMIN** — tenant-level. System administration. Manages LLM providers, channel integrations (Telegram/WhatsApp), plugin config, system settings. Does not manage users or see project data. Maps to: IT manager, system administrator.
- [ ] **SALES** — tenant-level. Sales and customer acquisition. Creates offers, follows up leads, manages customer relations. Can see offer history but not full project economics. Maps to: sales manager, account manager.
- [ ] **LOGISTICS** — tenant-level. Warehouse and logistics. Manages inventory, stock levels, delivery coordination, tool tracking. Integration with OptiCat inventory module. Maps to: warehouse manager, logistics coordinator.
- [ ] **LEADER** — tenant-level. Leads a crew on site. Assigns daily tasks, sees team time, manages tickets, quality control on site. Cannot see economics. Maps to: foreman, team lead, site supervisor.
- [ ] **WORKER** — tenant-level. Field technician. Own tasks, own time entries, own tickets, access to OptiCat service checklists. Cannot see team data or economics. Maps to: technician, service engineer, installer.
- [ ] **CLIENT** — tenant-level (external). View-only dashboard for own projects. Can see progress, documents, approved information. Cannot see internal operations, costs, or other clients. Maps to: building owner, property manager, general contractor.

#### Permissions Matrix
- [ ] Define a formal permissions matrix with rows = roles, columns = capabilities:

| Capability | SA | OWN | ADM | ECO | PUR | EST | MGR | PLN | QLT | HR | IT | SAL | LOG | LDR | WKR | CLI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Management** | | | | | | | | | | | | | | | | |
| Manage tenants | ✓ | | | | | | | | | | | | | | | |
| Manage billing | ✓ | ✓ | | | | | | | | | | | | | | |

| Delete org | ✓ | ✓ | | | | | | | | | | | | | | |

| Appoint roles | ✓ | ✓ | ✓¹ | | | | | | | | | | | | | |

| **User Admin** | | | | | | | | | | | | | | | | |

| Invite users | ✓ | | ✓ | | | | | | | | | | | | | |

| Change user roles | ✓ | | ✓ | | | | | | | | | | | | | |

| Deactivate users | ✓ | | ✓ | | | | | | | | | | | | | |

| **System Config** | | | | | | | | | | | | | | | | |

| Manage LLM config | ✓ | | ✓ | | | | | | | | ✓ | | | | | |

| Manage channels | ✓ | | ✓ | | | | | | | | ✓ | | | | | |

| Manage plugins | ✓ | | ✓ | | | | | | | | ✓ | | | | | |

| **Finance** | | | | | | | | | | | | | | | | |

| See economics | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | | | | | | | | | |

| Create invoices | ✓ | | | ✓ | | | ✓ | | | | | | | | | |

| Approve invoices | ✓ | ✓ | | ✓ | | | | | | | | | | | | |

| Manage price lists | ✓ | | ✓ | ✓ | | ✓ | | | | | | | | | | |

| **Procurement** | | | | | | | | | | | | | | | | |

| Order materials | ✓ | | | | ✓ | | ✓ | ✓ | | | | | ✓ | | | |

| Manage suppliers | ✓ | | | | ✓ | | | | | | | | ✓ | | | |

| Search articles | ✓ | | | | ✓ | ✓ | ✓ | ✓ | | | | ✓ | ✓ | ✓ | ✓ | |
| Manage cart | ✓ | | | | ✓ | | | | | | | | ✓ | | | |

| **Production** | | | | | | | | | | | | | | | | |

| Create projects | ✓ | | ✓ | | | | ✓ | | | | | | | | | |

| Assign tasks | ✓ | | ✓ | | | | ✓ | ✓ | | | | | | ✓ | | |

| See team time | ✓ | ✓ | ✓ | | | | ✓ | ✓ | | | | | | ✓ | | |

| Approve time | ✓ | | ✓ | | | | ✓ | | | | | | | ✓ | | |

| **Quality** | | | | | | | | | | | | | | | | |

| Manage OVK | ✓ | | | | | | | | ✓ | | | | | | | |

| View service reports | ✓ | ✓ | ✓ | | ✓ | | ✓ | | ✓ | | | | | ✓ | ✓ | |
| Manage certifications | ✓ | | | | | | | | ✓ | ✓ | | | | | | |

| **HR** | | | | | | | | | | | | | | | | |

| Manage employees | ✓ | | ✓ | | | | | | | ✓ | | | | | | |

| View certifications | ✓ | ✓ | ✓ | | | | ✓ | | ✓ | ✓ | | | | ✓ | | |

| Manage schedules | ✓ | | | | | | ✓ | ✓ | | ✓ | | | | ✓ | | |

| **Sales** | | | | | | | | | | | | | | | | |

| Create offers | ✓ | ✓ | | | | | ✓ | | | | | ✓ | | | | |

| View customer history | ✓ | ✓ | ✓ | ✓ | | | ✓ | | | | | ✓ | | | | |

| **Field Ops** | | | | | | | | | | | | | | | | |

| See own tasks | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | |
| Create time entries | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | | | ✓ | ✓ | |
| View own projects | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ |
| View assigned docs | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Communication** | | | | | | | | | | | | | | | | |

| Internal chat | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| Chat with client | ✓ | ✓ | ✓ | ✓ | | | ✓ | | | | | ✓ | | ✓ | | ✗ |
| Notifications | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **OptiCat HVAC** | | | | | | | | | | | | | | | | |

| View HVAC projects | ✓ | ✓ | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ | | | ✓ | ✓ | ✓ | ✓ | |
| Edit HVAC canvas | ✓ | | | | | | ✓ | | | | | | | ✓ | ✓ | |
| Create service reports | ✓ | | | | | | | | ✓ | | | | | ✓ | ✓ | |
| Manage articles | ✓ | | | | ✓ | | | | | | | | ✓ | | | |
| **System** | | | | | | | | | | | | | | | | |

| View system logs | ✓ | | ✓ | | | | | | | | ✓ | | | | | |

| Submit bug reports | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

**Legend**: SA=SUPER_ADMIN, OWN=OWNER, ADM=ADMIN, ECO=ECONOMY, PUR=PURCHASER, EST=ESTIMATOR, MGR=MANAGER, PLN=PLANNER, QLT=QUALITY, HR=HR, IT=IT_ADMIN, SAL=SALES, LOG=LOGISTICS, LDR=LEADER, WKR=WORKER, CLI=CLIENT

¹ ADMIN can appoint MANAGER, PLANNER, QUALITY, HR, SALES, LOGISTICS, LEADER, WORKER, CLIENT — but cannot appoint OWNER, ECONOMY, ESTIMATOR, IT_ADMIN, or other ADMINs (those require OWNER or SUPER_ADMIN)

- [ ] Permissions matrix is defined as a single source of truth (TypeScript record or JSON file), not scattered inline checks
- [ ] Each route handler checks against the matrix, not hardcoded role strings

#### User Flows — All Roles

- [ ] **Org Signup Flow**: SUPER_ADMIN creates tenant → sets up OWNER account → OWNER logs in first time → configures company profile → appoints ADMIN and key roles
- [ ] **User Invite Flow**: OWNER/ADMIN invites user → selects role (any office or field role) → system sends invite → user sets password → user sees role-appropriate dashboard
- [ ] **Client Onboarding Flow**: OWNER/ADMIN creates CLIENT account → sets which projects client can see → client logs in → sees only their project dashboard
- [ ] **Owner Flow (CEO)**: OWNER logs in → company dashboard → review all project financials → manage billing/subscription → appoint/review ADMINs → review company KPIs → adjust org settings
- [ ] **Admin Flow (Office Manager)**: ADMIN logs in → admin dashboard → manage users (invite, role, deactivate) → manage price lists → configure LLM/channels → approve pending changes → review bug reports → manage plugins
- [ ] **Economy Flow (Finance)**: ECONOMY logs in → finance dashboard → create/approve invoices → manage price lists → budgeting → financial reports → payroll → cannot manage users or channels
- [ ] **Purchaser Flow (Procurement)**: PURCHASER logs in → procurement dashboard → search OptiCat articles → manage supplier catalog → create purchase orders → track deliveries → manage stock → link orders to projects
- [ ] **Estimator Flow (Cost Estimation)**: ESTIMATOR logs in → estimation dashboard → create/maintain price lists → calculate project cost estimates → prepare bids/tenders → compare supplier prices → cannot manage projects or users
- [ ] **Manager Flow (Project Manager)**: MANAGER logs in → workboard dashboard → create projects → assign tasks → review project financials → create offers/invoices → approve time entries → client communication → link projects to OptiCat HVAC data
- [ ] **Planner Flow (Production Planner)**: PLANNER logs in → planning dashboard → schedule daily/weekly crew assignments → allocate resources → coordinate with procurement → view team availability → adjust schedules → cannot see economics
- [ ] **Quality Flow (Compliance)**: QUALITY logs in → quality dashboard → manage OVK inspections → review service reports → manage certifications → safety documentation → audit checklists → cannot manage users or economics
- [ ] **HR Flow (Personnel)**: HR logs in → HR dashboard → manage employee records → track certifications → manage sick leave/vacation → training records → employment status changes → hiring workflow
- [ ] **IT Admin Flow (System Admin)**: IT_ADMIN logs in → system dashboard → manage LLM providers → configure Telegram/WhatsApp bots → manage plugin settings → view system logs → integration config → cannot see project data
- [ ] **Sales Flow (Sales)**: SALES logs in → sales dashboard → create offers → follow up leads → customer history → search articles for pricing → track won/lost → cannot manage projects or see full economics
- [ ] **Logistics Flow (Warehouse)**: LOGISTICS logs in → logistics dashboard → inventory management → delivery coordination → stock tracking → tool tracking → manage OptiCat articles → cannot manage projects
- [ ] **Leader Daily Flow (Foreman)**: LEADER logs in → kanban board → see team's tasks → assign tasks to workers → review time entries → approve/reject → create/manage tickets → quality control → escalate to MANAGER
- [ ] **Worker Daily Flow (Technician)**: WORKER logs in → worker portal → see today's tasks → start time tracking → complete tasks with notes → open OptiCat → service checklist → photos → measurements → logs time
- [ ] **Client Progress Flow (Building Owner)**: CLIENT logs in → client dashboard → see project timeline → view completed milestones → download shared docs → view site photos → message project manager → receive weekly summary

#### Role Mapping: OptiCat → WoW

| OptiCat Concept | Maps To | Notes |
|---|---|---|
| `UserRole.admin` | `OWNER` or `ADMIN` | OptiCat admin in a company context is the office manager (ADMIN). In a 1-person company, same person is OWNER+ADMIN+WORKER. |
| `UserRole.user` | `WORKER` | Most OptiCat users are field technicians |
| `EmploymentStatus.employed` | Property on user profile | Not a role — just a profile field |
| `EmploymentStatus.selfEmployed` | Property on user profile | Not a role — just a profile field |
| `level` / `title` | Property on user profile | Gamification — affects profile display only, not access |
| `CollabRole.owner` | Session-level | Not a system role — just who created the canvas session |
| `CollabRole.collaborator` | Session-level | Not a system role |
| Per-project `read` permission | `project_members` + `resource_permissions` | WoW already has this at the project level |
| Per-project `write` permission | `project_members.role` = WORKER/LEADER | Mapping depends on the project context |
| No concept | `CLIENT` | New concept for OptiCat — building owner access |

#### Implementation
- [ ] Create `shared/roles.ts` — TypeScript enum `UserRole` + `PermissionsMatrix` type + constant
- [ ] Define `ROLE_HIERARCHY` array for ordering (e.g., for "at least LEADER" checks)
- [ ] Define `hasPermission(role, capability)` function used everywhere instead of inline role checks
- [ ] Create `permissions.json` or `shared/permissions.ts` with the matrix as a single source of truth
- [ ] Add `OWNER` role to the `users` table (new migration), seed an OWNER user per tenant
- [ ] Refactor all existing role checks in `server/routes/*.ts` to use `hasPermission()`
- [ ] Refactor frontend role checks in `src/components/Navigation.tsx`, `src/hooks/useUserRole.ts` to use shared enum
- [ ] Add `MANAGER` role to the `users` table
- [ ] Update OptiCat auth service to accept WoW JWT tokens and map WoW roles to OptiCat permissions
- [ ] Update OptiCat permission service to use WoW's resource_permissions table instead of its own permissions.json

### Out of Scope
- Custom roles (user-defined role with custom permission set) — future work
- Per-feature toggles within a role (e.g., "ADMIN but no LLM config")
- Role-based UI component library (showing/hiding per-role)
- Cross-tenant roles (a user being ADMIN in two tenants)
- SCIM/SSO integration with external identity providers
- Role change audit trail (what changed and who approved it)

## Acceptance Criteria

### Automated Verification
- [ ] Build completes: `bun run build`
- [ ] `shared/roles.ts` exists with `UserRole` enum and `hasPermission()` function
- [ ] All existing role checks in server/ use `hasPermission()` instead of inline role strings
- [ ] No regressions in existing role-gated functionality
- [ ] Database migration adds `OWNER` and `MANAGER` roles without breaking existing rows

### Manual Verification — Core Roles
- [ ] SUPER_ADMIN can create a tenant and see it in the super admin dashboard
- [ ] OWNER can manage billing, delete tenant, appoint ADMINs, see all project financials
- [ ] ADMIN can manage users, price lists, LLM config, channels, approvals but CANNOT delete tenant or see billing
- [ ] ECONOMY can create/approve invoices, manage price lists, see economics but CANNOT manage users or channels
- [ ] PURCHASER can order materials, manage suppliers, search articles, manage cart but CANNOT see full economics
- [ ] ESTIMATOR can manage price lists, see economics for estimation, prepare cost estimates but CANNOT manage users
- [ ] MANAGER can create projects, assign tasks, see economics, create offers/invoices but CANNOT manage users
- [ ] PLANNER can assign tasks, see team time, manage schedules, coordinate procurement but CANNOT see economics
- [ ] QUALITY can manage OVK, view service reports, manage certifications but CANNOT manage users or economics
- [ ] HR can manage employees, certifications, schedules but CANNOT see project economics
- [ ] IT_ADMIN can manage LLM, channels, plugins, view system logs but CANNOT see project data
- [ ] SALES can create offers, view customer history, search articles but CANNOT manage projects or see full economics
- [ ] LOGISTICS can manage inventory, stock, deliveries, search articles but CANNOT manage projects
- [ ] LEADER can see team time entries, assign tasks, approve time but CANNOT see economics
- [ ] WORKER can see own time/tasks but CANNOT see team data or economics
- [ ] CLIENT can see own project dashboard but CANNOT see other clients or internal ops
- [ ] OptiCat technician (WORKER role) can access HVAC projects linked to their assignments
- [ ] Navigation sidebar shows correct surfaces per role
- [ ] A user with multiple hats (e.g., owner who also does field work) can have both OWNER and WORKER access
- [ ] Small company (3 people): same person can hold OWNER+ADMIN+WORKER simultaneously

## Technical Notes

### Role Hierarchy Definition
```typescript
// shared/roles.ts

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",  // Platform-wide, cross-tenant
  OWNER = "OWNER",              // Company CEO / business owner
  ADMIN = "ADMIN",              // Office manager, daily ops
  ECONOMY = "ECONOMY",          // Finance, accounting, invoicing
  PURCHASER = "PURCHASER",      // Procurement, supplier management
  ESTIMATOR = "ESTIMATOR",      // Cost estimation, tender preparation
  MANAGER = "MANAGER",          // Project manager
  PLANNER = "PLANNER",          // Production planning & scheduling
  QUALITY = "QUALITY",          // Quality assurance, compliance, OVK
  HR = "HR",                    // Human resources, personnel
  IT_ADMIN = "IT_ADMIN",        // System admin, channels, LLM
  SALES = "SALES",              // Sales, offers, customer acquisition
  LOGISTICS = "LOGISTICS",      // Warehouse, inventory, deliveries
  LEADER = "LEADER",            // Foreman, team lead on site
  WORKER = "WORKER",            // Field technician
  CLIENT = "CLIENT",            // External building owner
}

// Ordered from highest to lowest privilege
// Groups: Platform > Management > Office Specialists > Production > Field > External
export const ROLE_HIERARCHY: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.OWNER,
  UserRole.ADMIN,
  UserRole.ECONOMY,
  UserRole.PURCHASER,
  UserRole.ESTIMATOR,
  UserRole.MANAGER,
  UserRole.PLANNER,
  UserRole.QUALITY,
  UserRole.HR,
  UserRole.IT_ADMIN,
  UserRole.SALES,
  UserRole.LOGISTICS,
  UserRole.LEADER,
  UserRole.WORKER,
  UserRole.CLIENT,
];

// Helper: check if role has at least the given level
export function roleAtLeast(role: UserRole, minimum: UserRole): boolean {
  return ROLE_HIERARCHY.indexOf(role) <= ROLE_HIERARCHY.indexOf(minimum);
}
```

### Permissions Matrix Definition
```typescript
// shared/permissions.ts

export type Capability =
  // Management
  | "manage-tenants"
  | "manage-billing"
  | "delete-org"
  | "appoint-roles"
  // User Admin
  | "invite-users"
  | "change-user-roles"
  | "deactivate-users"
  // System Config
  | "manage-llm-config"
  | "manage-channels"
  | "manage-plugins"
  // Finance
  | "see-economics"
  | "create-invoices"
  | "approve-invoices"
  | "manage-price-lists"
  // Procurement
  | "order-materials"
  | "manage-suppliers"
  | "search-articles"
  | "manage-cart"
  // Production
  | "create-projects"
  | "assign-tasks"
  | "see-team-time"
  | "approve-time"
  // Quality
  | "manage-ovk"
  | "view-service-reports"
  | "manage-certifications"
  // HR
  | "manage-employees"
  | "manage-schedules"
  // Sales
  | "create-offers"
  | "view-customer-history"
  // Field
  | "see-own-tasks"
  | "create-time-entries"
  | "view-projects"
  | "view-docs"
  // Communication
  | "internal-chat"
  | "client-chat"
  | "receive-notifications"
  // OptiCat HVAC
  | "opticat-view-projects"
  | "opticat-edit-canvas"
  | "opticat-create-reports"
  | "opticat-manage-articles"
  // System
  | "view-system-logs"
  | "submit-bug-reports";

// Permissions matrix as a record of role → allowed capabilities
export const PERMISSIONS_MATRIX: Record<UserRole, Capability[]> = {
  [UserRole.SUPER_ADMIN]: [
    "manage-tenants", "manage-billing", "delete-org", "appoint-roles",
    "invite-users", "change-user-roles", "deactivate-users",
    "manage-llm-config", "manage-channels", "manage-plugins",
    "see-economics", "create-invoices", "approve-invoices", "manage-price-lists",
    "order-materials", "manage-suppliers", "search-articles", "manage-cart",
    "create-projects", "assign-tasks", "see-team-time", "approve-time",
    "manage-ovk", "view-service-reports", "manage-certifications",
    "manage-employees", "manage-schedules",
    "create-offers", "view-customer-history",
    "see-own-tasks", "create-time-entries", "view-projects", "view-docs",
    "internal-chat", "client-chat", "receive-notifications",
    "opticat-view-projects", "opticat-edit-canvas", "opticat-create-reports", "opticat-manage-articles",
    "view-system-logs", "submit-bug-reports",
  ],

  [UserRole.OWNER]: [
    "manage-billing", "delete-org", "appoint-roles",
    "see-economics", "approve-invoices",
    "view-service-reports",
    "create-offers", "view-customer-history",
    "see-own-tasks", "create-time-entries", "view-projects", "view-docs",
    "internal-chat", "client-chat", "receive-notifications",
    "opticat-view-projects",
    "submit-bug-reports",
  ],

  [UserRole.ADMIN]: [
    "appoint-roles",
    "invite-users", "change-user-roles", "deactivate-users",
    "manage-llm-config", "manage-channels", "manage-plugins",
    "manage-price-lists",
    "see-economics",
    "approve-time",
    "view-service-reports",
    "manage-employees",
    "see-own-tasks", "create-time-entries", "view-projects", "view-docs",
    "internal-chat", "client-chat", "receive-notifications",
    "opticat-view-projects",
    "view-system-logs", "submit-bug-reports",
  ],

  [UserRole.ECONOMY]: [
    "see-economics", "create-invoices", "approve-invoices", "manage-price-lists",
    "view-service-reports",
    "see-own-tasks", "create-time-entries", "view-projects", "view-docs",
    "internal-chat", "receive-notifications",
    "submit-bug-reports",
  ],

  [UserRole.PURCHASER]: [
    "order-materials", "manage-suppliers", "search-articles", "manage-cart",
    "view-service-reports",
    "see-own-tasks", "create-time-entries", "view-projects", "view-docs",
    "internal-chat", "receive-notifications",
    "opticat-view-projects", "opticat-manage-articles",
    "submit-bug-reports",
  ],

  [UserRole.ESTIMATOR]: [
    "manage-price-lists",
    "see-economics",
    "search-articles",
    "view-service-reports",
    "see-own-tasks", "create-time-entries", "view-projects", "view-docs",
    "internal-chat", "receive-notifications",
    "submit-bug-reports",
  ],

  [UserRole.MANAGER]: [
    "create-projects", "assign-tasks", "see-team-time", "approve-time",
    "see-economics", "create-invoices",
    "order-materials", "search-articles",
    "view-service-reports",
    "create-offers", "view-customer-history",
    "manage-schedules",
    "see-own-tasks", "create-time-entries", "view-projects", "view-docs",
    "internal-chat", "client-chat", "receive-notifications",
    "opticat-view-projects", "opticat-edit-canvas",
    "submit-bug-reports",
  ],

  [UserRole.PLANNER]: [
    "assign-tasks", "see-team-time",
    "order-materials", "search-articles",
    "manage-schedules",
    "see-own-tasks", "create-time-entries", "view-projects", "view-docs",
    "internal-chat", "receive-notifications",
    "opticat-view-projects",
    "submit-bug-reports",
  ],

  [UserRole.QUALITY]: [
    "manage-ovk", "view-service-reports", "manage-certifications",
    "see-own-tasks", "create-time-entries", "view-projects", "view-docs",
    "internal-chat", "receive-notifications",
    "opticat-view-projects", "opticat-create-reports",
    "submit-bug-reports",
  ],

  [UserRole.HR]: [
    "manage-employees", "manage-certifications", "manage-schedules",
    "view-service-reports",
    "see-own-tasks", "create-time-entries", "view-projects", "view-docs",
    "internal-chat", "receive-notifications",
    "submit-bug-reports",
  ],

  [UserRole.IT_ADMIN]: [
    "manage-llm-config", "manage-channels", "manage-plugins",
    "view-system-logs",
    "see-own-tasks", "create-time-entries", "view-projects", "view-docs",
    "internal-chat", "receive-notifications",
    "submit-bug-reports",
  ],

  [UserRole.SALES]: [
    "create-offers", "view-customer-history",
    "search-articles",
    "see-own-tasks", "create-time-entries", "view-projects", "view-docs",
    "internal-chat", "client-chat", "receive-notifications",
    "opticat-view-projects",
    "submit-bug-reports",
  ],

  [UserRole.LOGISTICS]: [
    "order-materials", "manage-suppliers", "search-articles", "manage-cart",
    "see-own-tasks", "create-time-entries", "view-projects", "view-docs",
    "internal-chat", "receive-notifications",
    "opticat-view-projects", "opticat-manage-articles",
    "submit-bug-reports",
  ],

  [UserRole.LEADER]: [
    "assign-tasks", "see-team-time", "approve-time",
    "search-articles",
    "view-service-reports",
    "see-own-tasks", "create-time-entries", "view-projects", "view-docs",
    "internal-chat", "client-chat", "receive-notifications",
    "opticat-view-projects", "opticat-edit-canvas", "opticat-create-reports",
    "submit-bug-reports",
  ],

  [UserRole.WORKER]: [
    "search-articles",
    "view-service-reports",
    "see-own-tasks", "create-time-entries", "view-projects", "view-docs",
    "internal-chat", "receive-notifications",
    "opticat-view-projects", "opticat-edit-canvas", "opticat-create-reports",
    "submit-bug-reports",
  ],

  [UserRole.CLIENT]: [
    "view-projects", "view-docs",
    "receive-notifications",
    "submit-bug-reports",
  ],
};

export function hasPermission(role: UserRole, capability: Capability): boolean {
  return PERMISSIONS_MATRIX[role]?.includes(capability) ?? false;
}
```

### Affected Components

#### WoW Core
- `shared/roles.ts` — new: `UserRole` enum, `ROLE_HIERARCHY`, `roleAtLeast()`
- `shared/permissions.ts` — new: `Capability` type, `PERMISSIONS_MATRIX`, `hasPermission()`
- `server/db.ts` — migration: add `OWNER` and `MANAGER` to users table, update seed data
- `server/auth.ts` — role parsing, update JWT payload
- `server/auth-rbac.ts` — refactor to use `hasPermission()` instead of inline role checks
- `server/routes/admin.ts` — replace `adminGuard()` with capability-based checks
- `server/routes/projects.ts` — replace inline role checks with `hasPermission()`
- `server/routes/portal.ts` — replace inline role checks with `hasPermission()`
- `server/routes/system.ts` — replace inline role checks with `hasPermission()`
- `server/routes/client.ts` — verify CLIENT permissions align with matrix
- `server/routes/bug-reports.ts` — replace inline role checks with `hasPermission()`
- `server/offers-api.ts` — replace Economics Shield inline checks with `hasPermission(role, "see-economics")`
- `server/tickets-api.ts` — replace inline role checks with `hasPermission()`
- `server/time-bot.ts` — replace inline role checks with `hasPermission()`
- `server/tools/pending-changes.ts` — update approval guard to use matrix
- `server/routes/access.ts` — update resource permission checks
- `src/App.tsx` — update route gating to use shared enum
- `src/components/Navigation.tsx` — update role checks to use shared enum
- `src/hooks/useUserRole.ts` — update to use `UserRole` enum
- `src/pages/AdminDashboard.tsx` — update role guard to include `OWNER` + `MANAGER`
- `src/pages/SuperAdminDashboard.tsx` — update role guard
- `src/pages/WorkerPortal.tsx` — update role guard to use enum
- `src/pages/ClientDashboard.tsx` — update role guard to use enum

#### OptiCat Plugin
- `plugin/opticat/chat_server/lib/auth_service.dart` — accept WoW JWT, map WoW `UserRole` to OptiCat permissions
- `plugin/opticat/chat_server/lib/permission_service.dart` — delegate to WoW's `resource_permissions` table instead of own `permissions.json`
- `plugin/opticat/lib/services/chat_service.dart` — update role handling to use WoW roles
- `plugin/opticat/lib/Screens/chat/admin_screen.dart` — gate admin features by WoW role

#### Agent System
- `server/orchestrator-tools-exec.ts` — agent tools check `hasPermission()` before executing
- `.wo/skills/` — agent skill definitions reference capability names for what they can do
- `plugin/opticat/skills/opticat-hvac/SKILL.md` — reference which roles can access OptiCat data

### User Flow Diagrams

```
SUPER_ADMIN Flow (platform owner)
  Create tenant → Assign OWNER → Monitor billing → Cross-tenant support

OWNER Flow (company CEO)
  ┌──────────────────────────────────────────────────────┐
  │  Login → Company Dashboard                          │
  │    ├── Review all projects (financials)              │
  │    ├── Manage billing/subscription                   │
  │    ├── Appoint ADMINs                                │
  │    ├── View team performance                         │
  │    └── Delete org (emergency only)                   │
  └──────────────────────────────────────────────────────┘

ADMIN Flow (office manager)
  ┌──────────────────────────────────────────────────────┐
  │  Login → Admin Dashboard                            │
  │    ├── Manage users (invite, role, deactivate)       │
  │    ├── Manage price lists                            │
  │    ├── Configure LLM providers                       │
  │    ├── Manage Telegram/WhatsApp channels             │
  │    ├── Approve/reject pending changes                │
  │    ├── Review bug reports                            │
  │    └── Manage OptiCat plugin settings                │
  └──────────────────────────────────────────────────────┘

MANAGER Flow (project manager)
  ┌──────────────────────────────────────────────────────┐
  │  Login → Workboard Dashboard                        │
  │    ├── Create projects                              │
  │    ├── Assign tasks to LEADERs/WORKERs              │
  │    ├── Review project financials                     │
  │    ├── Create offers/invoices                       │
  │    ├── Approve time entries                         │
  │    ├── View team performance reports                │
  │    └── Link projects to OptiCat HVAC data           │
  └──────────────────────────────────────────────────────┘

LEADER Flow (foreman)
  ┌──────────────────────────────────────────────────────┐
  │  Login → Kanban Board                               │
  │    ├── See team's tasks for today                   │
  │    ├── Assign tasks to WORKERs                      │
  │    ├── Review team time entries                     │
  │    ├── Create/manage tickets                        │
  │    ├── Start/stop own time tracking                 │
  │    ├── Communicate via team chat                    │
  │    └── Escalate issues to MANAGER                   │
  └──────────────────────────────────────────────────────┘

WORKER Flow (technician)
  ┌──────────────────────────────────────────────────────┐
  │  Login → Worker Portal                              │
  │    ├── See today's assigned tasks                   │
  │    ├── Start/stop time tracking per task            │
  │    ├── Complete tasks with notes                    │
  │    ├── Open OptiCat → service checklist → photos    │
  │    ├── View own schedule/calendar                   │
  │    ├── Chat with team                               │
  │    └── Submit bug reports                           │
  └──────────────────────────────────────────────────────┘

CLIENT Flow (building owner)
  ┌──────────────────────────────────────────────────────┐
  │  Login → Client Dashboard                           │
  │    ├── See own project(s) timeline                  │
  │    ├── View completed task milestones               │
  │    ├── Download shared documents (reports, drawings)│
  │    ├── View photos from site                        │
  │    ├── Send message to project manager              │
  │    └── Receive weekly progress summary              │
  └──────────────────────────────────────────────────────┘
```

### Database Schema Changes

```sql
-- Add CHECK constraint to enforce allowed roles
ALTER TABLE users ADD CONSTRAINT chk_role CHECK (
  role IN (
    'SUPER_ADMIN', 'OWNER', 'ADMIN',
    'ECONOMY', 'PURCHASER', 'ESTIMATOR',
    'MANAGER', 'PLANNER', 'QUALITY', 'HR',
    'IT_ADMIN', 'SALES', 'LOGISTICS',
    'LEADER', 'WORKER', 'CLIENT'
  )
);

-- Add optional department/team column for org structuring
ALTER TABLE users ADD COLUMN department TEXT;
-- e.g., 'Management', 'Finance', 'Production', 'Field', 'External'

-- Add roles_config table for per-tenant role customization
CREATE TABLE IF NOT EXISTS roles_config (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  role TEXT NOT NULL,
  display_name TEXT NOT NULL,        -- e.g., "Project Manager" instead of "MANAGER"
  description TEXT,
  allowed_capabilities TEXT,         -- JSON array override of capabilities
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(tenant_id, role)
);

-- Migration: Update existing users
-- SUPER_ADMIN → SUPER_ADMIN (unchanged)
-- ADMIN → needs manual split into OWNER/ADMIN/ECONOMY/etc.
--   Default all existing ADMINs → ADMIN role
--   Manually promote company owners to OWNER
-- LEADER → LEADER (unchanged, but can be promoted to MANAGER/PLANNER)
-- WORKER → WORKER (unchanged)
-- CLIENT → CLIENT (unchanged)
```

### Migration Strategy (Existing Users)

| Existing Role | New Role(s) | Migration Action |
|---|---|---|---|
| `SUPER_ADMIN` | `SUPER_ADMIN` | Unchanged |
| `ADMIN` | Split across 10 roles | Default all existing ADMINs → `ADMIN`. Manually review each: company owner → `OWNER`, finance person → `ECONOMY`, purchaser → `PURCHASER`, project manager → `MANAGER`, system person → `IT_ADMIN`, etc. |
| `LEADER` | `LEADER`, `MANAGER`, or `PLANNER` | Default → `LEADER`. Manually promote project managers to `MANAGER`, production planners to `PLANNER`. |
| `WORKER` | `WORKER` | Unchanged. Can be promoted to `LEADER` by ADMIN. |
| `CLIENT` | `CLIENT` | Unchanged |

### Seed Data Update (Real Company Example)

```
Svensk Ventilation AB (tenant: svensk-ventilation)
├── michael  → OWNER  (CEO, co-owner)
├── josef    → OWNER  (CEO, co-owner)
├── ebba     → ADMIN  (office manager)
├── ny       → ECONOMY  (finance/accounting)
├── ny       → PURCHASER  (procurement)
├── ny       → ESTIMATOR  (cost estimation)
├── bjorn    → MANAGER  (project manager)
├── ny       → PLANNER  (production planner)
├── ny       → QUALITY  (compliance/OVK)
├── ny       → HR  (personnel)
├── ny       → IT_ADMIN  (system admin)
├── ny       → SALES  (sales)
├── ny       → LOGISTICS  (warehouse)
├── johan    → LEADER  (foreman)
├── martin   → WORKER  (senior technician)
├── karl     → WORKER  (technician)
├── erik     → WORKER  (technician)
├── anna_j   → WORKER  (apprentice)
└── acme_corp → CLIENT  (building owner)
```

### Related Tickets
- WOW-016 — Access Control & Daily Flow (foundational, this ticket extends it)
- WOW-049 — OptiCat WoW Plugin (depends on this role schema for user mapping)
- WOW-010 — Human-in-the-Loop (pending changes approval relies on role)
- WOW-037 — Plugin Management System (plugins need role-based visibility)
- WOW-024 — Private/Shared Access (per-resource permissions feed into matrix)

---

## Meta

**Created**: 2026-06-05
**Priority**: High
**Estimated Effort**: XL
