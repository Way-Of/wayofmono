# WOW-058: Access Control Gaps — RBAC Enforcement Audit

## Problem Statement

Several API endpoints lack proper role-based access control or ownership verification, allowing users to perform actions they shouldn't (approve time entries, delete files, modify other users' data).

## Requirements

- [ ] Time entry approve/reject requires LEADER+ role
- [ ] Ticket approve/reject requires ADMIN/CLIENT role check
- [ ] File DELETE restricted to ADMIN/owner
- [ ] Time PUT/DELETE scoped to own user_id
- [ ] CLIENT project listing scoped to the client's own projects (via project_members or client_id)
- [ ] Notes PUT/DELETE scoped to creator (user_id)
- [ ] Task update/delete blocked for WORKER (only LEADER+)

## Acceptance Criteria

- [ ] Build passes: `bun run build`
- [ ] No 500 errors on login (error logging added)
- [ ] Each endpoint verified against WOW access_control skill rules

## Affected Components

- `server/routes/portal.ts` — time approve/reject role gates, time PUT/DELETE ownership, file DELETE role gate
- `server/tickets-api.ts` — ticket approve/reject role gates
- `server/routes/client.ts` — project listing scope
- `server/routes/projects.ts` — notes ownership

---

**Created**: 2026-06-05
**Priority**: High
**Estimated Effort**: M
