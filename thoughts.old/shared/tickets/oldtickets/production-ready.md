# Plan: Transition System to Production Readiness

## Goal
Replace all mock data and services with real, database-backed implementations. Harden multi-tenancy and remove demo bypasses to prepare for client onboarding.

## Phase 1: Service Implementation (Frontend)
- [ ] Implement `src/services/kanbanService.ts` to use `/api/kanban/*` (or map to `/api/portal/tasks`).
- [ ] Implement `src/services/tasksService.ts` to use `/api/tasks/*`.
- [ ] Implement `src/services/projectsService.ts` to use `/api/projects/*`.
- [ ] Implement `src/services/driveService.ts` to use `/api/portal/files`.
- [ ] Implement `src/services/calendarService.ts` (or decide if it's out of scope for tomorrow).

## Phase 2: Backend API Expansion (server/index.ts)
- [ ] **Unify Role Casing**: Change all `admin`, `worker`, `leader` checks to `ADMIN`, `WORKER`, `LEADER`.
- [ ] **Implement CRUD Endpoints**:
    - [ ] `GET /api/kanban/boards`
    - [ ] `POST /api/kanban/boards`
    - [ ] `GET /api/projects`
    - [ ] `POST /api/projects`
- [ ] **Harden Auth**: Remove "Demo" user bypasses from `server/index.ts`.

## Phase 3: Page Cleanup
- [ ] **WorkerPortal.tsx**: Remove `loadDemoData()` and "Demo/1234" login.
- [ ] **AdminDashboard.tsx**: Replace `DEMO_STATS` and `DEMO_WORKERS` with real API calls.
- [ ] **UserProfile.tsx**: Implement `PUT /api/portal/me` and `POST /api/portal/change-pin`.

## Phase 4: Verification
- [ ] Build and start the system.
- [ ] Create a real tenant and user via `sqlite3`.
- [ ] Log in as the real user and verify data persistence.
