# WOW-037: Plugin Management System

## Problem Statement

Currently all UI surfaces are bundled together in the same codebase with no clear separation between core platform features and domain-specific verticals. Simple, Claw, Docs, Workboard, Kanban, and Profile are core platform surfaces. TA Planner, ATA, and other construction-specific tools are domain plugins living in the same package with no plugin registration, isolation, or lifecycle management.

As more verticals are added (accounting, HR, property management, etc.), the monolith will grow unboundedly. There is no mechanism to:
- Register a plugin as a separate package
- Load/unload plugins dynamically
- Define plugin dependencies and API contracts
- Version plugins independently

## Desired Outcome

A plugin management system where:
- **Core platform** (simple, claw, docs, workboard, kanban, profile) lives in the main package
- **Domain verticals** are separate plugins with a well-defined registration API:
  - **Construction** — TA Planner, ATA, project pricing, safety documentation
  - **Healthcare** — patient scheduling, journaling, resource planning
  - **Property & Facility Management** — building maintenance, tenant communication, inspection workflows
  - **Finance & Accounting** — invoicing, budget tracking, auditing
  - **HR & Workforce** — shift planning, time reporting, onboarding
- More verticals can be added without touching core platform code
- Plugins can be installed, enabled, disabled, and uninstalled at runtime or build time
- Plugins declare their surfaces, routes, WebSocket handlers, database migrations, and agent definitions
- The core provides hooks/extension points that plugins implement

## Context & Background

### Current State
- All surfaces are registered in `src/App.tsx` as static `<Route>` elements
- TA Planner and ATA are just additional pages in the same routing table
- Shared imports cross-cut between all surfaces
- No clear boundary between "core" and "plugin"
- Adding a new vertical means modifying core files (`App.tsx`, server routing, database schema)

### Why This Matters
- Enables third-party plugin development for construction, healthcare, property management, finance, HR, etc.
- Reduces core bundle size — plugins loaded on demand
- Clear API contracts prevent core breakage from plugin changes
- Versioned plugins can be developed independently
- Customers install only what they need

## Requirements

### Functional Requirements
- [ ] Plugin manifest format (e.g. `plugin.json` with name, version, surfaces, routes, dependencies)
- [ ] Core plugin registry — plugins register their surfaces, routes, WebSocket handlers, DB migrations
- [ ] Plugin discovery — scan a directory (e.g. `plugins/` or `.wow/plugins/`) for installed plugins
- [ ] Surface isolation — each plugin's UI surfaces render within a plugin sandbox, not mixed into core routing
- [ ] Plugin-scoped database tables with namespace prefix or separate schema
- [ ] Plugin can define its own agents in `.wo/agents/` via the manifest
- [ ] Plugin enable/disable toggle per tenant (multi-tenant ready)
- [ ] Client-facing mechanism to choose and manage plugins for their subscription
- [ ] Plugin API versioning — core exposes a semver API that plugins declare compatibility with
- [ ] Dev mode: hot-reload plugins during development

### Out of Scope
- Plugin marketplace or remote install (local filesystem only)
- Plugin sandboxing at the JS runtime level (iframe/web worker isolation)
- Paid plugin licensing system

## Acceptance Criteria

### Automated Verification
- [ ] Build completes: `bun run build`
- [ ] Existing tests pass (once test framework exists)
- [ ] Plugin manifest schema validates correctly
- [ ] Surface routing still works for core pages

### Manual Verification
- [ ] Install a TA Planner plugin via `plugins/` directory and see it appear in navigation
- [ ] Disable a plugin and its surfaces disappear
- [ ] Plugin surfaces use the same dark theme and shell chrome
- [ ] Core surfaces (simple, docs, claw) work with no plugins installed

## Technical Notes

### Affected Components
- `src/App.tsx` — Route registration should be plugin-aware, not hardcoded
- `src/pages/` — Plugin pages should not be mixed with core pages
- `server/` — Plugin WebSocket handlers, API routes, DB migrations need registration
- `server/index.ts` — Plugin lifecycle management
- `server/routes/` — Pluggable route mounting
- `.wo/agents/` — Plugin-declared agents
- `src/components/` — Plugin surfaces should mount in a host shell

### Architecture Sketch
```
core/
  plugin-api.ts        — Plugin interface & registry
  plugin-loader.ts     — Discovers & loads plugins
  plugin-host.tsx      — Renders plugin surfaces in shell
plugins/
  ta-planner/                      — Construction: time & resource planning
    plugin.json
    src/
    server/
    migrations/
  ata/                             — Construction: ATP compliance
    plugin.json
    src/
    server/
    migrations/
  healthcare-scheduling/           — Healthcare: patient & resource scheduling
    plugin.json
    src/
    server/
    migrations/
  facility-management/             — Property: building maintenance & inspections
    plugin.json
    src/
    server/
    migrations/
  asset-tracking/                  — Facility: asset tracking & inventory
    plugin.json
    src/
    server/
    migrations/
  work-order-management/           — Facility: work order creation & dispatch
    plugin.json
    src/
    server/
    migrations/
  preventative-maintenance/        — Facility: scheduled maintenance tasks
    plugin.json
    src/
    server/
    migrations/

```

### Plugin Manifest Example
```json
{
  "name": "ta-planner",
  "version": "1.0.0",
  "apiVersion": "^1.0",
  "surfaces": ["ta-planner"],
  "routes": { "/ta-planner": "TAPlannerPage" },
  "agents": ["ta-planner"],
  "dependencies": {}
}
```

---

## Meta

**Created**: 2026-06-02
**Priority**: High
**Estimated Effort**: XL
