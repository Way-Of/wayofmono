# WOW-004 Production Readiness: Real Data & API Completion

## Problem Statement

To onboard clients tomorrow, the system must transition fully from mock data to real, database-backed operations. While the foundations are in place (schema, basic GET routes, agent integration), several CRUD operations and UI-to-service links are incomplete or currently cause build errors due to interface mismatches.

## Desired Outcome

A fully functional, zero-mock-data system that builds without errors and supports real-world multi-tenant workflows (project creation, task assignment, time logging, note taking).

## Context & Background

### Why I "Got Stuck"
The transition from `mock*Service` to real services involved changing method signatures and returning types (e.g., from sync to async). This triggered **188 build errors** across the UI because components were expecting the full mock interface (with members, WhatsApp toggles, etc.) while the new real services only implemented basic GET operations.

### Current Progress
- `WOW-001`: Build Green (briefly), Wo Agent installed, stale DB deleted.
- `WOW-003`: Multi-tenancy roles defined, schema updated with `notes` and `calendar`.
- `kanbanService`: Interface restored to match UI expectations (fixes ~150 errors).

## Requirements

### Backend (server/index.ts)
- [x] **Complete CRUD for Projects**: `POST /api/projects`, `PUT /api/projects/:id`.
- [x] **Complete CRUD for Tasks**: `POST /api/portal/tasks`, `PUT /api/portal/tasks/:id`.
- [x] **Complete CRUD for Notes**: `POST /api/notes`, `PUT /api/notes/:id`.
- [x] **Complete CRUD for Calendar**: `POST /api/calendar/events`, `PUT /api/calendar/events/:id`.
- [x] **Implement User Management**: `GET /api/admin/users`, `POST /api/admin/users`.

### Frontend Services
- [x] **Tasks Service**: Restore full interface (delete, update, filter).
- [x] **Drive Service**: Implement `getFile`, `uploadFile`, `deleteFile`.
- [x] **Notes/Calendar**: Align fully with UI needs (CRUD).

### Multi-Tenancy Hardening
- [x] Ensure all `POST/PUT` operations automatically inject `auth.tenantId`.
- [x] Verify filesystem operations in `server/index.ts` are scoped to tenant subdirectories.

## Acceptance Criteria

### Automated Verification
- [x] `bun run build` passes with 0 errors.
- [x] `GET /api/health` returns all capabilities active.

### Manual Verification
- [x] Create a new project as an `ADMIN`.
- [x] Create a task and assign it to a `WORKER`.
- [x] Log in as that `WORKER`, see the task, and log time.
- [x] Verify that another tenant cannot see this data.
## Technical Notes

### Affected Components
- `server/index.ts` - All CRUD endpoints.
- `src/services/*` - Full interface restoration.
- `src/pages/WorkerPortal.tsx` - Final cleanup of demo logic.

---

## Meta

**Created**: 2026-05-19
**Priority**: CRITICAL (Launch Blocker)
**Estimated Effort**: L
