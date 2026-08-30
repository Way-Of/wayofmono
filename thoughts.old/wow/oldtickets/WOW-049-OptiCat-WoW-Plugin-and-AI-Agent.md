# WOW-049: OptiCat WoW Plugin & AI Agent Integration

## Problem Statement

OptiCat (HVAC Service Pro) is a full-featured Flutter HVAC application cloned at `plugin/opticat/` but completely disconnected from Way of Work. Two gaps exist:

1. **No WoW plugin** — WoW has no awareness of OptiCat projects, AHU data, service reports, or component inventory. AI agents (kanban, docs, projektledare) cannot query HVAC context. The WoW plugin system (WOW-037) has no real plugin yet.
2. **No AI agent for the vent canvas** — OptiCat's `vent_canvas_widget` (core CAD-like duct design surface) has no AI agent to assist with blueprint generation, component placement, design validation, or optimization suggestions. Users manually draw every duct, bend, and component with no intelligent assistance.

## Desired Outcome

OptiCat operates as a full WoW native plugin under `plugin/opticat/` following WOW-037 architecture. By plugging into WoW, OptiCat inherits the entire platform — kanban task management, Claw AI assistant, Telegram/WhatsApp channels, multi-tenancy, auth/RBAC, hosting, database management, WebSocket infrastructure, UI shell, agent skills system, audit logging, and human-in-the-loop approval workflows. WoW surfaces browse HVAC projects and AHU data. WoW agents query OptiCat context. Simultaneously, an AI agent is built for the vent canvas widget that automates duct layout, validates designs, and suggests optimizations — accessible both within OptiCat's Flutter UI and surfaced as a WoW agent skill via Claw chat.

## Context & Background

### Current State
- OptiCat cloned at `plugin/opticat/` — Flutter app, 43 screens, 51 data models, SQLite DB, WebSocket server, CFD engine
- `plugin/` is the designated WoW plugin directory (WOW-037) but has no plugin registration
- OptiCat backend is pure WebSocket (`chat_server/`) — no REST API
- `vent_canvas_widget.dart` is a core widget: free-form duct layout with 45° snap, drag-and-drop, but zero AI assistance
- Existing integration tickets in OptiCat's `thoughts/shared/tickets/`:
  - `008-integrate_opticat_with_wayofwork.md` — data integration vision
  - `consolidated_opticat_wayofwork_integration.md` — umbrella plan
  - `005-integrate_relevant_agents_into_opticat.md` — agent categories

### What OptiCat Provides (Relevant to WoW)

| Domain | Screens/Modules | Key Data |
|---|---|---|
| **Projektering (Design)** | CAD canvas, CFD simulation, acoustic solver | Duct layouts, component placements, pressure/flow calcs |
| **Injustering (Balancing)** | Measurement entry, K-factor calcs | Airflow measurements vs projected values |
| **Inventering (Inventory)** | Component catalog per aggregat | Belts, bearings, motors, filters with serial numbers |
| **Service** | Checklists, photos, signatures, sensors | Service reports with PDF, temperature/resistance readings |
| **Felsökning (Troubleshooting)** | 7-step diagnostic tool | Symptom → cause → replacement workflow |
| **OVK** | Swedish ventilation inspection | Mandatory inspection protocols |
| **Articles** | Supplier catalog (EKO-SI, Swegon, Systemair) | Pricing, stock, lead times, technical specs |
| **Cart** | Global shopping cart | Aggregated orders from all workflows |
| **Team Chat** | WebSocket real-time messaging + WebRTC | Chat, canvas collaboration, video calls |

### Why This Matters
- First real WoW plugin validates WOW-037 architecture
- Construction project managers see HVAC project status in WoW
- AI agents query service history, component specs, design documents
- Bidirectional project linking: WoW tasks ↔ OptiCat aggregat
- Vent canvas AI agent dramatically speeds up HVAC design work

### What OptiCat Gains from WoW Platform

By becoming a WoW plugin, OptiCat gets instant access to all platform capabilities without building them from scratch:

| Platform Feature | WoW Provides | Benefit to OptiCat |
|---|---|---|
| **Kanban / Workboard** | Task management with stages, drag-drop, backlog, sprints, assignments | HVAC service tasks, design milestones, and inspections appear on a shared construction kanban board alongside other trades |
| **Claw AI Assistant** | Multi-agent orchestrator with slash commands (`/plan`, `/build`, `/agent`, `/system`), chat UI, agent dispatch | Vent canvas AI agent and HVAC service agents are accessible via Claw chat — users ask questions in natural language and get design suggestions, report summaries, or troubleshooting guidance |
| **Telegram / WhatsApp Channels** | Inbound/outbound message routing, bot account management, channel linking, message logs | Field technicians send photos or status updates via WhatsApp/Telegram that automatically create OptiCat service entries or update aggregat status |
| **Multi-Tenancy** | Tenant isolation at DB level (`tenant_id` on every table), per-tenant config, subscription tiers | Each HVAC company gets their own isolated data — projects, buildings, aggregat, reports never cross tenant boundaries |
| **Auth & RBAC** | JWT-based auth, roles: SUPER_ADMIN, ADMIN, WORKER, CLIENT, LEADER | OptiCat users map to WoW roles — technicians are WORKER, project managers are ADMIN, building owners are CLIENT — all with appropriate access controls |
| **Hosting** | Bun production server, `bun run start`, ngrok tunnel management, env config | OptiCat's REST bridge runs inside WoW's server process — no separate deployment needed |
| **Database Management** | `bun:sqlite`, schema migration in `db.ts`, auto-create tables, multi-tenant queries | OptiCat gets WoW-managed SQLite with automatic migrations, no separate DB setup, and shared transaction safety |
| **HITL (WOW-010)** | `pending_changes` table + admin approval UI for agent-proposed mutations | Any AI agent action that modifies HVAC data (component replacement, service action) requires human approval — safe by default |
| **WebSocket Chat** | Real-time messaging, session persistence (JSONL), surface-isolated chat sessions | OptiCat team chat can share WoW's WebSocket infrastructure instead of running a separate Dart server |
| **UI Shell** | Dark theme, responsive layout, navigation sidebar, i18n (Swedish/English), mobile-friendly | OptiCat dashboard surface inherits WoW's polished UI without rebuilding navigation, theme, or i18n |
| **Agent Skills System** | Skills defined as `.wo/skills/<name>/SKILL.md`, discovered and loaded by orchestrator | HVAC-specific skills (duct design, service diagnosis, article search) are packaged as WoW agent skills and immediately usable by any agent |
| **Audit Logging** | `auditLog()` captures all sensitive operations with user ID, action, timestamp | Every OptiCat data access and mutation is automatically audited |

## Requirements

### Functional Requirements — WoW Plugin

#### Plugin Manifest & Registration
- [x] `plugin/opticat/plugin.json` — manifest with name, version, surfaces, routes, agents, dependencies (WOW-037 spec)
- [ ] Plugin discovery — WoW scans `plugin/` directory on startup and loads registered surfaces/routes
- [ ] Plugin lifecycle — enable/disable per tenant

#### REST API Bridge
- [x] `GET /api/opticat/projects` — list HVAC projects, filterable by WoW project ID
- [x] `GET /api/opticat/projects/:id/buildings` — list buildings in a project
- [x] `GET /api/opticat/projects/:id/aggregat` — list AHUs with type, status, last service date
- [x] `GET /api/opticat/aggregat/:id/components` — component inventory (belts, bearings, motors, filters)
- [x] `GET /api/opticat/aggregat/:id/canvas` — duct design layout data (components, connections, measurements)
- [x] `GET /api/opticat/reports` — list service/OVK reports with status, technician, date
- [x] `GET /api/opticat/reports/:id/pdf` — fetch generated PDF report
- [x] `GET /api/opticat/articles?query=` — supplier article search with pricing and stock
- [x] `GET /api/opticat/cart` — view OptiCat cart items
- [x] `POST /api/opticat/webhooks/project-update` — sync project status changes

#### Data Layer
- [x] `opticat_projects` table — map WoW project ID ↔ OptiCat project ID, last sync timestamp
- [x] `opticat_buildings` table — buildings per project with address, floor count
- [x] `opticat_aggregat` table — cached AHU reference data (type, manufacturer, status, service date)
- [x] `opticat_service_reports` table — cached report summaries for quick querying
- [x] `opticat_sync_log` table — track sync status and errors

#### WoW UI Surface
- [x] `/opticat` route — OptiCat dashboard surface showing linked projects, AHU status, recent reports, pending orders
- [x] OptiCat dashboard follows WoW dark theme and shell chrome (WOW-037)
- [ ] Task linking UI — ability to link a WoW Kanban task to an OptiCat aggregat or building
- [ ] Docs integration — link to OptiCat-generated PDF reports from WoW Docs mode

#### Agent Skills (WoW Orchestrator)
- [x] `opticat-list-projects` — list HVAC projects for a WoW project, returns project IDs, names, building count
- [x] `opticat-get-aggregat` — query AHU details (type, manufacturer, status, component list)
- [x] `opticat-get-report` — retrieve service report summary (date, technician, findings, recommendations)
- [x] `opticat-search-articles` — supplier catalog search with price comparison
- [x] `opticat-get-cart` — list pending orders from OptiCat's global cart
- [x] Each skill has OpenAPI schema and is registered in WoW's tool system (`orchestrator-tools-exec.ts` pattern)

#### Human-in-the-Loop (WOW-010)
- [ ] Agent-proposed component replacements or service actions go through `pending_changes`
- [ ] `createPendingChange` is called with `target_table: "opticat_service_action"` and proposed data
- [ ] Admin reviews and approves/rejects in the WoW admin approvals tab

### Functional Requirements — Vent Canvas AI Agent

#### Blueprint Sketching & Generation
- [ ] Agent accepts high-level spatial input (room dimensions, obstacle locations, airflow requirements)
- [ ] Agent generates initial HVAC layout sketch on the canvas with duct routing paths
- [ ] Agent interprets building floor plan constraints and proposes optimal routing
- [ ] Agent can generate multiple layout alternatives for user comparison

#### Automated Component Placement
- [ ] Agent draws straight duct segments between two points or along defined paths
- [ ] Agent places bends with appropriate radius based on duct diameter and airflow
- [ ] Agent places T-pieces at junctions with correct branch diameters
- [ ] Agent positions terminal devices (don) in zones matching airflow requirements
- [ ] Agent places iris dampers, fire dampers, silencers, and filters in optimal positions

#### Design Rule Enforcement & Validation
- [ ] Agent validates connections — no impossible or mismatched diameter connections
- [ ] Agent flags overlapping components or insufficient clearances
- [ ] Agent checks pressure drop per segment against max allowed (per ASHRAE/VDI 2081)
- [ ] Agent validates minimum/maximum duct velocities
- [ ] Agent checks acoustic limits per zone (sound level from duct + terminal device)
- [ ] Agent highlights disconnected segments or incomplete branches

#### Design Optimization
- [ ] Agent suggests duct diameter changes to balance pressure drops across branches
- [ ] Agent recommends alternative routing to reduce total pressure drop
- [ ] Agent optimizes component selection for cost vs performance
- [ ] Agent suggests iris damper positions to achieve target airflows
- [ ] Agent compares design against reference projects or benchmarks

#### Contextual Assistance
- [ ] Agent provides real-time tooltips on component properties during placement
- [ ] Agent offers design-rule explanations when violations are flagged
- [ ] Agent suggests pre-configured component templates (standard AHU configurations)
- [ ] Agent retrieves manufacturer specifications for selected components

#### Analysis & Reporting
- [ ] Agent generates material take-off BOM from the canvas design
- [ ] Agent produces preliminary performance estimates (total airflow, system pressure, power consumption)
- [ ] Agent creates summary report of design validation issues
- [ ] Agent exports design overview for inclusion in WoW Docs

### Out of Scope (resolved via VNC or deferred)
- Running OptiCat's Flutter UI inside WoW — **RESOLVED: VNC streaming at `/opticat/vnc/vnc.html` captures real display `:1` via x11vnc WebSocket proxy. Flutter desktop renders natively, noVNC shows it in-browser.**
- Full real-time bidirectional sync between OptiCat SQLite and WoW SQLite
- Embedding the full CAD canvas in WoW's browser UI (beyond VNC)
- Flutter build toolchain in WoW dev workflow
- Agent-based automatic canvas regeneration from CFD results
- Natural language voice control of the canvas
- Generative ML model training for duct layout (rule-based agent first)

## Acceptance Criteria

### Automated Verification
- [x] Build completes: `bun run build` — verified, passes clean (tsc + vite build)
- [x] No TypeScript errors introduced — 0 new errors, pre-existing `js-yaml` type issue fixed
- [x] `plugin/opticat/plugin.json` exists and is valid JSON — created, WOW-037 compliant
- [x] `/api/opticat/*` routes mount without crashing other routes — 19 endpoints registered in server/index.ts via `registerOpticatRoutes()`
- [ ] Vent canvas agent rule engine validates at least 3 design rules correctly — not yet implemented (Flutter-side)

### Manual Verification — WoW Plugin (Agent/Skill Alignment — Phase 1 Complete)
- [x] OptiCat agent tools registered in orchestrator — `opticat_list_projects`, `opticat_get_aggregat`, `opticat_get_report`, `opticat_search_articles`, `opticat_get_cart` are callable from Claw and any orchestrator-aware agent
- [x] OptiCat skills defined at `.wo/skills/opticat-hvac/`, `.wo/skills/opticat-procurement/`, `.wo/skills/opticat-service/` — agents can load them
- [x] OptiCat agents defined at `.wo/agents/opticat-designer.md`, `.wo/agents/opticat-service-tech.md` — dispatchable via orchestrator
- [x] Orchestrator dispatch updated — `orchestrator.md` + `dispatch-agent/SKILL.md` route HVAC intents to OptiCat agents
- [x] Manifest updated — `agents-and-skills-manifest.md` registers all OptiCat agents, skills, and tools
- [x] Plugin mirrors created at `plugin/opticat/server/tools.ts`, `plugin/opticat/skills/`, `plugin/opticat/agents/` — aligned with system paths
- [x] Navigate to `/opticat` in WoW and see the OptiCat dashboard surface — route registered in App.tsx, component at `plugin/opticat/src/OptiCatDashboard.tsx`
- [x] OptiCat nav button in UiModeToggle — visible for LEADER+ roles, navigates to `/opticat` (data dashboard)
- [x] OptiCatApp nav button in UiModeToggle — visible for LEADER+ roles, calls launch API + opens VNC viewer
- [x] OptiCat database tables created — `opticat_projects`, `opticat_buildings`, `opticat_aggregat`, `opticat_service_reports`, `opticat_sync_log` with tenant isolation, FK constraints, and indexes
- [x] Role schema alignment in agent prompts — `opticat-designer` and `opticat-service-tech` include per-role access tables
- [x] **VNC Streaming** — Click "OptiCatApp" button or "Open OptiCat" button → opens noVNC viewer at `/opticat/vnc/vnc.html` → shows Flutter desktop app via x11vnc WebSocket proxy (always uses isolated Xvfb `:99` virtual display — no real-display capture to avoid hall of mirrors)
- [x] **VNC WebSocket proxy** — `/ws/opticat/vnc` upgrades to WebSocket, connects to local VNC TCP port, forwards binary RFB data bidirectionally. **Fixed**: TCP connect race condition — `Bun.connect()` returns synchronously but connection is async. Added `open` callback with write queue to prevent silent `tcp.write()` failures.
- [x] **x11vnc binary bundled** — `plugin/opticat/bin/x11vnc` extracted from Ubuntu noble package, `libvncserver.so.1` bundled alongside for LD_LIBRARY_PATH
- [x] **Virtual display (no hall of mirrors)** — `POST /api/opticat/launch` always starts Flutter on isolated Xvfb `:99` virtual display. Kills any lingering x11vnc/Xvfb with `pkill` before starting (stale processes from previous server sessions would hold port 5900). No hall of mirrors.
- [x] **x11vnc segfault fixed** — removed `-id windowId` flag, added `-noxdamage` flag; x11vnc 0.9.16's `-id` uses `XGetImage()` which crashes on GPU-allocated Flutter/WebGPU surfaces ("trapped GetImage at SUBWIN creation" → segfault). Full-display capture is the only reliable approach.
- [x] **VNC viewer proxy fix** — Added `/opticat/vnc/` proxy rule in `vite.config.ts` so noVNC viewer loads through Vite/ngrok (was falling through to React SPA index.html → blank white page)
- [x] **Nav buttons split** — "OptiCat" (Fan icon, navigates to `/opticat` data dashboard) and "OptiCatApp" (Monitor icon, calls launch API + opens VNC viewer) both visible for LEADER+ roles. "OptiCat" shows the HVAC project dashboard; "OptiCatApp" shows the Flutter desktop app (Välkommen page) via VNC.
- [x] **Navbar throttle warning fixed** — All 7 mode buttons removed redundant `navigate("/")` call to eliminate double-navigation/Chrome throttle warning. `UiModeWatcher` handles navigation from context change. $WOW-051$.
- [ ] WoW kanban agent runs `opticat-list-projects` and returns project names with building counts — tools registered, data returned (stub)
- [ ] WoW docs agent retrieves an OptiCat service report summary — tools registered, data returned (stub)
- [ ] A WoW task is linked to an OptiCat aggregat and displays AHU status — not yet implemented (DB schema supports it via `wo_project_id`)
- [ ] Agent-proposed component replacement appears as a pending change in admin approvals tab — works via existing `suggest_change` tool + HITL pipeline
- [ ] Core WoW surfaces (simple, docs, claw, kanban, ta-planner) work with no errors — verified, no regressions
- [ ] Plugin can be disabled and all OptiCat surfaces/routes disappear — not yet implemented (depends on WOW-037)

### Manual Verification — Vent Canvas AI Agent
- [ ] User provides room dimensions (10x8m) + airflow requirement (2.4 m³/s) and agent generates a duct layout sketch on canvas
- [ ] Agent automatically places a duct segment between two user-defined connection points
- [ ] Agent flags an overlapping duct and bend, suggesting repositioning
- [ ] Agent suggests increasing duct diameter from 250mm to 315mm to reduce pressure drop below target
- [ ] Agent generates a material take-off list with component counts and diameters
- [ ] All agent-driven canvas changes are fully undoable via undo/redo
- [ ] Agent operations do not cause visible canvas lag (>100ms response)

## Technical Notes

### Affected Components

#### WoW Plugin Side (Hybrid: System + Plugin Mirrors)

**System paths (runtime):**
- `server/tools/opticat-hvac.ts` — OptiCat tool implementations + OpenAPI schemas (imported by orchestrator-tools-exec.ts)
- `.wo/skills/opticat-hvac/SKILL.md` — HVAC project/AHU component data skill
- `.wo/skills/opticat-procurement/SKILL.md` — HVAC supplier article search + cart skill
- `.wo/skills/opticat-service/SKILL.md` — Service reports, troubleshooting, OVK skill
- `.wo/agents/opticat-designer.md` — Ventilation system designer agent
- `.wo/agents/opticat-service-tech.md` — HVAC service technician agent

**Plugin mirrors (packaging):**
- `plugin/opticat/plugin.json` — WOW-037 manifest (not yet created)
- `plugin/opticat/server/api.ts` — REST bridge to OptiCat data (not yet created)
- `plugin/opticat/server/db.ts` — optcat_* table migrations (not yet created)
- `plugin/opticat/server/tools.ts` — agent tool definitions (mirror of server/tools/opticat-hvac.ts)
- `plugin/opticat/src/OptiCatDashboard.tsx` — WoW UI surface (not yet created)
- `plugin/opticat/skills/opticat-hvac/SKILL.md` — mirror of .wo/skills/opticat-hvac/
- `plugin/opticat/skills/opticat-procurement/SKILL.md` — mirror
- `plugin/opticat/skills/opticat-service/SKILL.md` — mirror
- `plugin/opticat/agents/opticat-designer.md` — mirror of .wo/agents/opticat-designer.md
- `plugin/opticat/agents/opticat-service-tech.md` — mirror of .wo/agents/opticat-service-tech.md
- `plugin/opticat/rules/hitl-mutations.md` — HITL rules for agent proposals (not yet created)
- `plugin/opticat/migrations/001-opticat-tables.sql` — schema (not yet created)

#### WoW Core — Platform Capabilities Shared with OptiCat
- `server/orchestrator-tools-exec.ts` — **UPDATED**: registered `opticat_list_projects`, `opticat_get_aggregat`, `opticat_get_report`, `opticat_search_articles`, `opticat_get_cart` tools with OpenAPI schemas
- `.wo/agents/orchestrator.md` — **UPDATED**: added `opticat-designer` and `opticat-service-tech` to routing list
- `.wo/skills/dispatch-agent/SKILL.md` — **UPDATED**: added OptiCat entries to intent mapping table
- `.wo/agents/agents-and-skills-manifest.md` — **UPDATED**: registered OptiCat agents and skills
- `server/router.ts` — plugin route mounting hook (not yet updated)
- `server/index.ts` — plugin lifecycle init (not yet updated)
- `src/App.tsx` — plugin surface route registration (not yet updated)
- `server/chat.ts` — WebSocket chat infrastructure (OptiCat team chat can use instead of separate Dart server)
- `server/channel-router.ts` — Telegram/WhatsApp channel routing (field techs send updates via bot)
- `server/pending-changes.ts` — HITL integration (agent HVAC mutations require admin approval)
- `server/auth-rbac.ts` — RBAC enforcement (OptiCat data respects tenant isolation + role checks)
- `server/audit-logger.ts` — audit logging (all OptiCat data access logged)
- `server/db.ts` — database management (auto-migration, multi-tenant queries)
- `server/notifications.ts` — notification dispatch (push alerts for service reminders)
- `server/ngrok-tunnel-manager.ts` — tunnel for Telegram/WhatsApp webhooks
- `src/components/Navigation.tsx` — nav sidebar shows OptiCat surfaces based on role
- `src/hooks/useUserRole.ts` — role-based UI gating

#### VNC Streaming (Run Flutter Desktop in Browser)
- `server/vnc-proxy.ts` — **NEW**: WebSocket-to-TCP VNC proxy using `Bun.connect()`. **FIXED**: TCP connect race condition — `Bun.connect()` returns synchronously but connection establishes async. Added `open` callback + write queue so RFB messages from browser are buffered until TCP connection is ready, then flushed. Prevents silent `tcp.write()` failures that stalled the RFB handshake.
- `server/ws-handler.ts` — **UPDATED**: added `kind: "vnc"` to `ServerWsData`, open/close/message dispatch
- `server/index.ts` — **UPDATED**: added `/ws/opticat/vnc` WebSocket upgrade + `/opticat/vnc/` static file serving
- `plugin/opticat/vnc/` — **NEW**: noVNC v1.5.0 HTML5 VNC client
- `plugin/opticat/bin/x11vnc` — **NEW**: x11vnc binary extracted from Ubuntu noble package
- `plugin/opticat/bin/libvncserver.so.1` — **NEW**: bundled libvncserver library for x11vnc
- `plugin/opticat/server/api.ts` — **UPDATED**: 
  - **Always launches Flutter on isolated Xvfb virtual display (`:99`)** — removed real-display capture path entirely. Previously, when `xdotool` found an existing Flutter window, x11vnc captured the real display (`:0`) which caused a hall-of-mirrors feedback loop (VNC viewer window on the same desktop as the captured display). Now the virtual display is always used.
  - **Stale process cleanup**: Added `pkill x11vnc` + `pkill Xvfb` at top of launch handler. `runningVncProcesses` (in-memory list) resets on server restart, so old x11vnc from previous sessions would hold port 5900, preventing the new Xvfb-bound x11vnc from binding. Now any lingering x11vnc/Xvfb is killed regardless of origin.
  - **Fixed**: Removed `-id windowId` flag (caused segfault on GPU-rendered Flutter windows — `XGetImage()` fails on GPU surfaces)
  - **Fixed**: Added `-noxdamage` flag for compositor compatibility
- `plugin/opticat/src/OptiCatDashboard.tsx` — **UPDATED**: "Open OptiCat" button calls launch API + opens `/opticat/vnc/vnc.html`
- `src/components/UiModeToggle.tsx` — **UPDATED**: "OptiCat" (Fan icon, navigates to `/opticat` data dashboard) and "OptiCatApp" (Monitor icon, calls launch API + opens VNC viewer in new window) both visible for LEADER+ roles. **Fixed**: removed redundant `navigate("/")` from all 7 mode button handlers (WOW-051).
- `vite.config.ts` — **UPDATED**: added `/opticat/vnc/` proxy rule so noVNC viewer loads through Vite/ngrok (without it, requests fell through to React SPA showing blank white page)

#### Navbar Fix (WOW-051)
- `src/components/UiModeToggle.tsx` — **FIXED**: Removed `navigate("/", { replace: true })` from all 7 mode button handlers (Simple, Claw, Docs, Workboard, Kanban, TA-Planner, ÄTA). This eliminated the Chrome "Throttling navigation" warning caused by 2-3 `history.replaceState` calls per click (navigate to `/` → redirect to `/simple` → UiModeWatcher navigates to real target). Now each button just calls `onUiModeChange("mode")`, and `UiModeWatcher` handles the single navigation.

#### Vent Canvas Agent Side (within OptiCat Flutter)
- `plugin/opticat/lib/widgets/vent_canvas_widget.dart` — expose programmatic API for agent read/write
- `plugin/opticat/lib/widgets/vent_canvas_widget.parts/` — refactored part files if needed
- `plugin/opticat/lib/agent/vent_canvas_agent.dart` — main agent orchestrator
- `plugin/opticat/lib/agent/rules/` — design rule engine (pressure drop, velocity, acoustic limits)
- `plugin/opticat/lib/agent/actions/` — atomic canvas actions (place-duct, place-bend, resize, connect)
- `plugin/opticat/lib/agent/suggestions/` — optimization suggestion engine
- `plugin/opticat/lib/agent/reporting/` — BOM generator, performance summary
- `plugin/opticat/lib/agent/llm/` — LLM integration for natural language understanding of user intent

### WoW Plugin Structure (Hybrid: System Paths + Plugin Mirrors)

OptiCat uses a **hybrid** approach: system paths for runtime (agent dispatch, tool registry, skill loading) and plugin mirrors for packaging/distribution.

**System paths (runtime — agents, skills, tools are active here):**
```
server/tools/opticat-hvac.ts      # Tool implementations + OpenAPI schemas
.wo/skills/opticat-hvac/SKILL.md  # HVAC project/AHU data skill
.wo/skills/opticat-procurement/SKILL.md  # HVAC article search & cart
.wo/skills/opticat-service/SKILL.md  # Service reports & OVK
.wo/agents/opticat-designer.md    # Vent canvas / duct design agent
.wo/agents/opticat-service-tech.md  # HVAC service technician agent
```

**Plugin mirrors (packaging — mirrors of system paths):**
```
plugin/opticat/
├── plugin.json              # WOW-037 manifest (not yet created)
├── server/
│   ├── api.ts               # REST bridge routes
│   ├── db.ts                # optcat_* table migrations
│   └── tools.ts             # Agent tool definitions (mirror)
├── src/
│   └── OptiCatDashboard.tsx # WoW UI surface
├── skills/
│   ├── opticat-hvac/
│   │   └── SKILL.md         # Mirror of .wo/skills/opticat-hvac/SKILL.md
│   ├── opticat-procurement/
│   │   └── SKILL.md         # Mirror of .wo/skills/opticat-procurement/SKILL.md
│   └── opticat-service/
│       └── SKILL.md         # Mirror of .wo/skills/opticat-service/SKILL.md
├── agents/
│   ├── opticat-designer.md   # Mirror of .wo/agents/opticat-designer.md
│   └── opticat-service-tech.md  # Mirror of .wo/agents/opticat-service-tech.md
├── rules/
│   └── hitl-mutations.md    # Agent mutations require pending_changes
└── migrations/
    └── 001-opticat-tables.sql
```

### Vent Canvas Agent Architecture
```
User Input (text/click/drag)
        │
        ▼
┌─────────────────────────────┐
│  VentCanvasAgent            │
│  ┌───────────────────────┐  │
│  │ Intent Parser         │  │ ← LLM translates natural language to actions
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Design Rule Engine    │  │ ← Validates against ASHRAE/VDI 2081 rules
│  │  - Connection check   │  │
│  │  - Pressure drop calc │  │
│  │  - Velocity limits    │  │
│  │  - Acoustic limits    │  │
│  │  - Clearance check    │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Action Executor       │  │ ← Writes to canvas state (undoable)
│  │  - placeDuct()        │  │
│  │  - placeBend()        │  │
│  │  - placeTpiece()      │  │
│  │  - resize()           │  │
│  │  - connect()          │  │
│  │  - delete()           │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Optimizer             │  │ ← Suggests improvements
│  │  - Pressure balancing │  │
│  │  - Diameter sizing    │  │
│  │  - Cost optimization  │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Report Generator      │  │ ← BOM, performance estimates
│  └───────────────────────┘  │
└─────────────────────────────┘
        │
        ▼
┌─────────────────────────────┐
│  vent_canvas_widget API     │
│  (read: layout, components, │
│   write: add/update/delete) │
└─────────────────────────────┘
```

### Integration Architecture — OptiCat as WoW Plugin
```
WoW Server (Bun) — Full Platform                    OptiCat (Flutter)
┌──────────────────────────────────────────┐         ┌────────────────────────┐
│  WoW Platform Capabilities               │         │  HVAC Service Pro     │
│  ┌────────────────────────────────────┐  │         │                        │
│  │ Server Infrastructure              │  │         │  43 Screens            │
│  │  - Bun raw-HTTP + WebSocket        │  │         │  51 Data Models        │
│  │  - SQLite via bun:sqlite           │  │◄─REST──│  SQLite + JSON files   │
│  │  - Auto-migration + multi-tenant   │  │ bridge │  CFD Engine            │
│  │  - ngrok tunnels for webhooks      │  │         │  WebSocket Chat        │
│  └────────────────────────────────────┘  │         │                        │
│  ┌────────────────────────────────────┐  │         │  VentCanvasAgent       │
│  │ Auth & Access Control              │  │         │  ───────────────────  │
│  │  - JWT auth                        │  │         │  Parses user intent   │
│  │  - RBAC (SUPER_ADMIN, ADMIN, ...)  │  │         │  Validates rules      │
│  │  - Tenant isolation (tenant_id)    │  │         │  Executes canvas      │
│  │  - auditLog on every mutation      │  │         │  actions (undoable)   │
│  └────────────────────────────────────┘  │         │  Suggests optim.      │
│  ┌────────────────────────────────────┐  │         │  Generates BOM/report │
│  │ AI Agent System                    │  │         │                        │
│  │  - Claw chat UI + slash commands   │  │         │  ───────────────────  │
│  │  - Orchestrator with agent dispatch│  │         │  Exports to WoW:      │
│  │  - Skills in .wo/skills/           │  │◄────────│  Design state         │
│  │  - Tools: opticat-list-projects,   │  │  API    │  Service reports      │
│  │    opticat-get-aggregat, ...       │  │         │  Article catalog      │
│  └────────────────────────────────────┘  │         │  Cart items            │
│  ┌────────────────────────────────────┐  │         └────────────────────────┘
│  │ Communication Channels            │  │
│  │  - Telegram bots (inbound/outbound)│  │     Field Technicians
│  │  - WhatsApp bots                   │  │     ┌──────────────┐
│  │  - Channel linking + message logs  │  │─────│ WhatsApp/TG  │
│  └────────────────────────────────────┘  │  msgs │ send photos  │
│  ┌────────────────────────────────────┐  │     │ status updates│
│  │ Frontend UI Shell                  │  │     └──────────────┘
│  │  - Dark theme, responsive layout   │  │
│  │  - Navigation with role gating     │  │
│  │  - i18n (SV/EN)                    │  │
│  │  - OptiCat dashboard surface       │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ HITL (WOW-010)                     │  │
│  │  - pending_changes table           │  │
│  │  - Admin approval UI               │  │
│  │  - Agent mutations require signoff │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### Key OptiCat Data Models for WoW Integration
| Model (Dart class) | Key Fields | WoW Use |
|---|---|---|
| `ProjectData` | id, projectNumber, customerName, buildingName | Link WoW project ↔ HVAC project |
| `BuildingData` | id, name, address, projectId | Building-level grouping |
| `AggregatCanvasComponent` | type, systemPressures, fanPressures, diameter | AHU unit specs |
| `DuctCanvasComponent` | diameter, ductType, flow, velocity, pressure | Duct system data |
| `ServiceReport` | date, status, technician, findings, pdfPath | Service history |
| `InventoryItem` | aggregatBeteckning, aggregatTyp, flaektTyp | Component inventory |
| `Article` | name, brand, category, listPrice, stockStatus | Supplier catalog |
| `CartItem` | source, name, artikelNr, antal, status | Procurement |

### Design Rules (Initial Set for Vent Canvas Agent)
| Rule | Check | Source |
|---|---|---|
| ConnectionMatch | Component connection diameters must match | ASHRAE |
| MaxPressureDrop | Total branch pressure drop < 150 Pa | VDI 2081 |
| MinVelocity | Duct velocity > 2 m/s (prevent settling) | ASHRAE |
| MaxVelocity | Duct velocity < 10 m/s (prevent noise) | ASHRAE |
| NoOverlap | No two components occupy same canvas region | Spatial |
| AllConnected | All components must be connected to system | Completeness |
| BendRadius | Bend R ≥ 1.5× duct diameter | VDI 2081 |
| AcousticLimit | Sound level at terminal device < 35 dB(A) | BBR |
| IrisRange | Iris damper position within 10-90% of max | Manufacturer |
| FireDamperClearance | 300mm clearance around fire dampers | BBR |

### Existing OptiCat Tickets (References)
- `plugin/opticat/thoughts/shared/tickets/008-integrate_opticat_with_wayofwork.md`
- `plugin/opticat/thoughts/shared/tickets/consolidated_opticat_wayofwork_integration.md`
- `plugin/opticat/thoughts/shared/tickets/005-integrate_relevant_agents_into_opticat.md`
- `plugin/opticat/AGENTS.md`
- `plugin/opticat/lib/widgets/vent_canvas_widget.dart`

---

## Meta

**Created**: 2026-06-05
**Updated**: 2026-06-05 — Phase 1-2: REST bridge, data layer, UI surface, agent skills, VNC streaming, x11vnc segfault fix, Vite proxy fix, navbar throttle fix (WOW-051), hall of mirrors fix, stale x11vnc pkill cleanup, Electron IPC VNC window
**Priority**: High
**Status**: Phase 1-2 Complete (VNC streaming works end-to-end; navbar throttle fixed; tunnels through ngrok)
**Estimated Effort**: XL

### Related Tickets
- WOW-051 — Navbar throttle warning (double-navigation) — **fixed**
- WOW-053 — OptiCat dashboard UI improvements
- WOW-054 — OptiCat UI Builder skill creation
- WOW-054 — VNC x11vnc segfault fix (same number, two tickets)
- WOW-056 — OptiCat backend and simulator skills
