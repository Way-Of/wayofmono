# Ticket: [WOW-028] Mobile Dashboard — Field Work (All Roles)

## Objective
Create a mobile-friendly web interface for field work — admins reviewing projects from their car, leaders assigning tasks on site, workers logging time, clients checking status. Every role needs the system accessible from a phone.

**Constraint:** The existing desktop UI MUST NOT be modified. The mobile dashboard is a focused surface, not a responsive adaptation of the desktop.

## Problem Statement
The ngrok URL (`https://unvocable-oligopoly-lorraine.ngrok-free.dev/`) exposes the app to any device, but the entire UI is desktop-only. Anyone in the field with a phone cannot:
- Log in without pinching/zooming
- Enter time on a job site
- Review or update task details
- Check notifications
- Navigate between pages without tiny hit targets

The desktop mode-rail, fixed-width panels, and drag-and-drop kanban are all desktop paradigms that don't translate to a phone.

## Desired Outcome
Any role opening the app on their phone sees a focused, touch-friendly interface with role-appropriate functionality:
1. Login (pin or simplified auth)
2. Role-aware dashboard — admins see project status, workers see their tasks, clients see project overview
3. Quick time entry ("log hours now")
4. View and update tasks/kanban cards
5. Navigation via bottom tab bar (Dashboard, Tasks, Time, Notifications, Profile)

## Requirements

### Login & Auth
- [ ] Mobile-friendly login page (large inputs, touch numeric keypad for pin)
- [ ] Auto-detect mobile → route to mobile dashboard instead of desktop App
- [ ] Session persist so workers don't re-login constantly

### Dashboard (home screen)
- [ ] Today's tasks/assignments (from kanban/tasks)
- [ ] Recent time entries with "Continue" button
- [ ] Pending notifications count + quick peek
- [ ] Quick-action buttons: "Log Time", "My Tasks", "Notifications"

### Time Entry (core field use-case)
- [ ] Start/stop timer or manual hours entry
- [ ] Project/task selector (simplified, searchable)
- [ ] Recent entries for quick repeat
- [ ] Offline resilience — queue entries if connection drops

### Tasks / Kanban (field view)
- [ ] List view of my assigned cards across all boards
- [ ] Filter by board, column, due date
- [ ] Tap card → details (description, dates, assigned)
- [ ] Simple state change: move card to next column (e.g., "Mark Complete")

### Notifications
- [ ] Bell icon in bottom nav → full-page notification list
- [ ] Tap notification → navigate to relevant item

### Navigation
- [ ] Fixed bottom tab bar: Dashboard | Tasks | Time | Notifications | Profile
- [ ] No mode-rail, no kanban column drag-drop

### OptiCat Dashboard (`/opticat`)
- [ ] Mobile layout for the OptiCat dashboard — summary cards stack vertically, tables collapse to card lists, badges and statuses stay readable
- [ ] Touch-friendly filter and search controls
- [ ] Keep all data accessible, no horizontal scroll

## Out of Scope
- Full desktop UI responsive adaptation
- ClawPage, DocsPage, TA-Planner on mobile
- PWA / offline-first (beyond time-entry queue)
- Native iOS/Android apps

## Technical Approach
- **Detection**: Check `window.innerWidth` on app entry → route to `/mobile/*` or a mobile layout wrapper
- **Separate routes**: `/mobile/dashboard`, `/mobile/time`, `/mobile/tasks` — new components, not responsive hacks on desktop pages
- **Shared API**: Reuse existing `/api/portal/*` endpoints — no new backend
- **State**: Shared contexts (NotificationContext, etc.) — no separate mobile state tree
- **CSS**: Mobile-first components with Tailwind, no desktop styles leaking in

## OptiCat Native Apps
OptiCat already has Flutter mobile apps for HVAC field work. The Way of Work mobile dashboard should complement those — not duplicate — by focusing on:
- Time tracking (not in OptiCat)
- Task/kanban view (not in OptiCat)
- Platform notifications (not in OptiCat)

## Testing
- Chrome DevTools mobile emulation (iPhone SE, Pixel 7)
- Physical phone via ngrok URL
- Desktop must not be affected at all

## Acceptance Criteria
- [ ] Worker can log in from phone at ngrok URL
- [ ] Worker can log time from phone in under 3 taps
- [ ] Worker can view assigned kanban cards
- [ ] Worker sees notifications
- [ ] Desktop UI is completely unchanged
- [ ] `tsc -b --noEmit` passes

## Meta
**Created**: 2026-05-23
**Updated**: 2026-06-06 — refocused from generic responsive redesign to worker field dashboard
**Priority**: High
**Estimated Effort**: M
**Depends on**: WOW-034 (back button guard for mobile navigation)
