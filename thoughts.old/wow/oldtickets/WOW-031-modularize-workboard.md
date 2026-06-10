# Ticket: [WOW-029] Modularize WorkBoard.tsx

## Objective
Refactor the monolithic `src/components/work/kanban/WorkBoard.tsx` component into smaller, isolated sub-components.

## Problem Statement
`WorkBoard.tsx` is an extremely large component (over 3000 lines) handling too many responsibilities: board rendering, card management, timeline/calendar/docs/drive view switches, drag-and-drop logic, and complex state management. This makes it difficult to maintain, test, and develop.

## Requirements
### Refactoring Plan
- [ ] Analyze `WorkBoard.tsx` to identify logical sub-components:
    - `BoardHeader`: Board title, view switcher, project linking.
    - `KanbanBoard`: Core drag-and-drop kanban view.
    - `TimelineView`: Timeline visualization logic.
    - `CalendarView`: Calendar integration.
    - `BoardSidebar`: Board settings, member management, filters.
    - `CardModal`: Card creation/editing logic (already separated, verify integration).
- [ ] Create a dedicated directory `src/components/work/kanban/` for sub-components if needed (or use `src/components/work/kanban/parts/`).
- [ ] Extract logic and state into smaller components, keeping `WorkBoard.tsx` as a lean shell.
- [ ] Ensure all functionality is preserved.

## Acceptance Criteria
- `WorkBoard.tsx` is significantly refactored and reduced in size.
- Board views (Kanban, List, Calendar, Timeline, Docs, Drive) are isolated into distinct sub-components.
- Functionality is 1:1 with current implementation.

## Meta
**Created**: 2026-05-24
**Priority**: Medium
**Estimated Effort**: L
