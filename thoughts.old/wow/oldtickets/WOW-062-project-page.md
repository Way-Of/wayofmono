# WOW-062: Comprehensive Project Page Implementation

## ⚠️ CRITICAL MANDATE
INVESTIGATE WHAT THE SYSTEM HAS. DO NOT TAKE AWAY FEATURES: ONLY ENHANCE FEATURES. WE NEED ALL FEATURES IMPLEMENTED. PRODUCTION READY.

## Research Findings & Compliance Requirements
- **Industristandard (Bygg)**: Projektvyn måste fungera som den centrala "digitala projektpärmen" (Single Source of Truth).
- **Krav**: Inkludera realtidsbudget, dokumenthantering, tidrapportering, ÄTA-logg och visuell resursplanering.
- **Produktionstillförlitlighet**: All data måste vara live-synkad, RBAC-skyddad och tenant-isolerad.

## Problemställning
Projektvyn är för närvarande begränsad och saknar den djupgående funktionalitet som krävs för att effektivt styra komplexa byggprojekt.

## Önskat resultat
En omfattande, produktionstillförlitlig projektvy som agerar som centralhub för allt projektarbete.

## Krav (Omfattande utbyggnad)
### Functional Requirements
- [x] Project overview page at `/projects` route
- [x] Navbar button "Projects" beside existing context nav items
- [x] Project list view with create/delete controls
- [x] Per-project detail view (The Hub) with:
  - [x] **Projektöversikt & Ekonomi (WOW-092)**: Realtidsstatus, budget-dashboard (realtidsavstämning timmar/material), KPI:er.
  - [x] **Dokumenthantering (WOW-088)**: Direktvisning och koppling till projektmappar, CAD-stöd (WOW-069), versionskontroll.
  - [x] **Tidrapportering (WOW-089)**: Mobilinläsning, koppling till moment, maskiner, och avstämning mot budget.
  - [x] **Material & Inköp (WOW-090)**: EDI-fakturor, koppling till projektets kostnadsställen, automatiserade påslag.
  - [x] **Fakturering & Offerter (WOW-087)**: Offerthantering, BankID, ROT-export, Fortnox/Visma-koppling.
  - [x] **KMA-Handbok (WOW-091)**: Digitala checklistor, riskanalyser, fotodokumentation.
  - [x] **ÄTA-hantering**: Snabbvy för aktiva ÄTA-arbeten och kundgodkännande.
  - [x] **Kommunikation (WOW-080)**: Dokumentchatt och projektspecifik chatt.
  - [x] **Resursplanering**: Visuellt schema, drag-and-drop, mobil åtkomst (Gantt/Kalender).
  - [x] **Member management**: Add/remove users with RBAC.
  - [x] **Multi-kanban board management**: Create/link boards per project.
- [x] Embedded chat panel (separate `project` WebSocket surface).
- [x] Project agent (`project`) available for queries.

## Out of Scope
- Full project timeline/Gantt view
- Integration with external project management tools
- Drag-and-drop file upload

## Acceptance Criteria
- [ ] Build completes: `bun run build`
- [ ] `/projects` route loads project list
- [ ] Creating a project shows it in the list
- [ ] Clicking a project opens detail view with members, files, kanbans
- [ ] Chat panel opens in project page with its own session
- [ ] Navbar "Projects" button visible for workers/leaders/admins
- [ ] Multiple kanbans can be linked to one project
- [ ] Kanban chat works without cards/columns disappearing

## Technical Implementation
### Data Model Change
**New table: `kanban_boards`**
```sql
CREATE TABLE IF NOT EXISTS kanban_boards (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    project_id TEXT REFERENCES projects(id),
    name TEXT NOT NULL,
    columns_json TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resource_permission_id TEXT,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
)
```

### Migration/Affected Components
- `server/db.ts` — add `kanban_boards` table + migration
- `server/routes/kanban-boards.ts` — new CRUD routes for boards
- `server/index.ts` — register new routes
- `server/routes/projects.ts` — update board-creation logic

---
## Meta
**Created**: 2026-06-06
**Priority**: Critical
**Estimated Effort**: L
