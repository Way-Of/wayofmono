# WOW-008 [Company Pricing Engine] Company pricing, cost calculation and time estimation

## Problem Statement

There is no integrated pricing system where admins can store their company's unit prices (kr/m², kr/ton, kr/timme) and use them to calculate project offers. The construction project manager agent needs access to real company pricing data to produce accurate cost estimates and time plans.

## Desired Outcome

An admin can manage company price lists in the Admin Console, the AI agents (projektledare) can query prices and calculate project costs, and time estimations can be derived from Swedish construction norms combined with company-specific price data.

## Context & Background

### Current State
- `price_lists` table exists in DB with `items_json` for line items
- CRUD API exists at `/api/price-lists` but no frontend UI
- AdminDashboard has no pricing tab
- Skills `project-pricing` and `time-calculation` created but not wired into agent system
- `useTicketApi.ts` had a bug reading `token` instead of `wop_token` — now fixed

### Why This Matters
Construction companies need to base offers on real unit prices. Without this, all cost estimates are guesswork. The pricing engine is the foundation for: offer calculations, ÄTA pricing, budget follow-up, and profit analysis.

## Requirements

### Functional Requirements
- [x] Admin can create price lists with name + validity dates in Admin Console
- [x] Admin can add/remove/edit line items (name, unit, unit_price, category) per price list
- [x] Active price lists are visible in the stats overview (count)
- [x] Price lists are tenant-isolated per the existing multi-tenant model
- [x] `projektledare` agent can read price lists and use them for cost calculations
- [x] `projektledare` agent references both `project-pricing` and `time-calculation` skills
- [x] Time calculation skill includes standard Swedish time-per-unit tables

### Out of Scope
- Actual project cost calculation engine (API route to compute offer from list + quantities) — future
- Integration with Sektionsdata/Wikells API — future
- Fortnox/Visma export — future

## Acceptance Criteria

### Automated Verification
- [x] Build completes: `bun run build`

### Manual Verification
- [x] Login as admin → Admin Console → "Prislistor" tab visible
- [x] Can create a new price list with name
- [x] Can add items with name, unit, unit_price, category
- [x] Can edit existing items inline
- [x] Can remove individual items
- [x] Can delete (deactivate) entire price list
- [x] Stats card shows Price Lists count
- [x] Price list data persists in SQLite `price_lists` table
## Technical Notes

### What Was Implemented
- `server/routes/admin.ts` — added `priceLists` count to stats endpoint
- `src/pages/AdminDashboard.tsx` — added `Prislistor` tab with full CRUD UI (PriceListsTab component), updated stats mapping + interface
- `.wo/skills/project-pricing/SKILL.md` — Swedish construction pricing frameworks: Sektionsdata, Wikells, Byggtjänst, cost structure (direct/indirect/markup), offer calculation method
- `.wo/skills/time-calculation/SKILL.md` — Standard hours-per-unit tables, crew composition, work phase distribution, critical path dependencies
- `.wo/agents/projektledare.md` — references `kanban-time`, `ata`, `workers`, `safety`, `swedish-building-laws`, `project-pricing`, `time-calculation`
- `src/hooks/useTicketApi.ts` — fixed `token` → `wop_token` bug in `api()` helper

### Database
- Table: `price_lists` (id, tenant_id, name, items_json, active, valid_from, valid_to, created_at)
- Items stored as JSON array in `items_json`: `[{name, unit, unit_price, category}]`

### Architecture
- Price list API: `GET/POST /api/price-lists`, `PUT/DELETE /api/price-lists/:id` (in tickets-api.ts)
- Admin stats: includes `priceLists` count
- Frontend: `PriceListsTab` component in AdminDashboard, fetches directly with auth headers
- Skills: loaded dynamically by agent system from `.wo/skills/<name>/SKILL.md`

### Affected Components
- `server/routes/admin.ts` — stats endpoint extended
- `src/pages/AdminDashboard.tsx` — new Pricing tab
- `.wo/skills/project-pricing/SKILL.md` — new skill
- `.wo/skills/time-calculation/SKILL.md` — new skill
- `.wo/agents/projektledare.md` — references pricing + time skills
- `src/hooks/useTicketApi.ts` — token key bugfix

---

## Meta

**Created**: 2026-05-22
**Priority**: High
**Estimated Effort**: L
**Status**: In Progress — pricing tab UI + skills done, needs agent wiring verification
