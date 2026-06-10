# WOW-059: Kanban UI Fixes & Access Control Gaps

## Problem Statement

Several issues in the Kanban system and backend access control:

1. **White `/app/tasks` page** — navigating to `/app/tasks` renders a blank white page because no Route is defined for this path.
2. **500 error on card open** — GET `/api/portal/tasks/:id` returns 500 for task IDs because `checkResourceAccess` queries a `resource_permissions` table that lacks entries for task resources.
3. **No edit button on kanban cards** — clicking a card opens CardView in view-only mode; the Edit button inside the modal is present, but the card itself lacks a direct edit affordance.
4. **Time entry approve/reject** — no role check, any user can approve/reject time entries (`portal.ts:438`)
5. **Time entry PUT/DELETE** — no ownership check, users can modify/delete other users' time entries (`portal.ts:399-436`)
6. **Ticket approve/reject** — no role gate, any tenant user can approve/reject tickets in `pending_approval` status (`tickets-api.ts:180-198`)
7. **File DELETE** — no role restriction, any user can delete files (`portal.ts:325-335`)
8. **CLIENT project listing** — scoped to tenant, not filtered to client's own projects (`client.ts:7-14`)
9. **Notes PUT/DELETE** — no ownership check, any user can edit/delete any note (`projects.ts:444-475`)
10. **Task update/delete** — WORKER role can modify/delete tasks they shouldn't (`portal.ts:581-637`)
11. **Card dates not syncing with system** — start/due dates set on kanban cards are not persisted or reflected correctly against the system; dates may appear in the UI but don't propagate to the backend or downstream views
12. **Kanban chat has no input interface** — the KanbanChatPanel is rendered but has no working chat input; users cannot type messages to the kanban agent
13. **BoardMembers crashes on null fields** — `full_name`, `username`, or `email` can be null, causing `Cannot read properties of null (reading 'toLowerCase')` in `BoardMembers.tsx:441`

## Requirements

- [x] Register `/app/tasks` route in `src/App.tsx` pointing to a working view (redirect to `/portal`)
- [x] Fix `server/accessControl.ts` `checkResourceAccess` to not crash when `resource_permissions` table has no entry — return `true` for non-sensitive resources
- [x] Add edit button directly on kanban cards (hover reveal) that opens CardView in edit mode
- [x] Time approve/reject requires LEADER+ role
- [x] Time PUT/DELETE scoped to own `user_id` (ADMIN bypass)
- [x] Ticket approve/reject requires ADMIN or CLIENT role
- [x] File DELETE restricted to ADMIN or file owner
- [x] CLIENT project listing filtered by `project_members`
- [x] Notes PUT/DELETE scoped to creator (`user_id`)
- [x] Task update/delete blocked for WORKER (only LEADER+)
- [x] Kanban chat input working — users can type and send messages to the kanban agent

## Acceptance Criteria

- [x] Build passes: `tsc -b --noEmit`
- [x] `/app/tasks` renders content, not a blank page (redirects to `/portal`)
- [x] Opening a kanban card does not produce a 500 error
- [x] Users can edit existing cards from the kanban board (hover-reveal pencil)
- [x] Each endpoint verified against WOW access_control skill rules
- [x] Kanban chat panel has working textarea input with send/stop buttons, auto-sets kanban agent on WS connect

## Affected Components

- `src/App.tsx` — router routes (missing `/app/tasks`)
- `src/pages/Kanban.tsx` — card rendering (needs edit affordance on cards)
- `src/components/kanban/CardView.tsx` — edit mode flow
- `server/accessControl.ts` — `checkResourceAccess` crash on missing resource_permissions
- `server/routes/portal.ts` — time approve/reject role gates, time PUT/DELETE ownership, file DELETE role gate, task update/delete WORKER block
- `server/tickets-api.ts` — ticket approve/reject role gates
- `server/routes/client.ts` — project listing scope
- `server/routes/projects.ts` — notes ownership

---

**Created**: 2026-06-06
**Priority**: High
**Estimated Effort**: M
