# [WOW-053] OptiCat HVAC Dashboard - UI Improvements

## Problem Statement

The current OptiCat HVAC dashboard (accessed via `/opticat` route) provides basic project and AHU information, but lacks detailed metrics and contextual information that would be valuable for administrators or project managers. The current "Projects" and "AHU (Aggregat)" sections primarily show counts, and the project list is minimal. This limits the dashboard's utility for quick insights and decision-making.

## Desired Outcome

Enhance the OptiCat HVAC dashboard UI to display more comprehensive and relevant data points, providing a richer overview of HVAC projects, AHUs, service reports, and synchronization status. This will allow users to gain deeper insights without needing to navigate to other sections or tools.

## Context & Background

### Current State
The existing OptiCat dashboard in `src/App.tsx` and `plugin/opticat/src/OptiCatDashboard.tsx` displays:
- Counts for Projects, AHU, Pending Reports, Warnings.
- A table of projects with columns: Name, Status, Buildings, AHU, Last Sync.
- Backend data is available via `/api/opticat/summary`, and individual endpoints for projects, aggregat, service reports, and sync logs.

### Why This Matters
Providing more detailed and insightful information directly on the dashboard will improve user efficiency, reduce the need for manual data correlation, and highlight potential issues or areas needing attention proactively.

## Requirements

### Functional Requirements
- [ ] Display total number of AHUs and their overall status (e.g., active, in maintenance).
- [ ] Show a breakdown of service report statuses (e.g., "completed", "pending review", "overdue").
- [ ] Include key metrics for each project, such as:
    - Last service date.
    - Number of open issues/warnings.
    - Next scheduled maintenance.
    - Link to view detailed service reports for a project.
- [ ] Incorporate a visual indicator for projects that have not synced recently.
- [ ] Potentially add a "View Details" button for each project to navigate to a project-specific OptiCat view (if such a view is implemented).

### Out of Scope
- Implementing new backend API endpoints for data that is not already exposed. This ticket focuses on UI presentation of existing or easily derivable data.
- Complex analytics or predictive modeling.

## Acceptance Criteria

### Automated Verification
- [ ] Build completes: `bun run build`

### Manual Verification
- [ ] Navigate to the `/opticat` dashboard.
- [ ] Verify that new metrics and detailed information are displayed for projects and AHUs.
- [ ] Confirm that service report statuses are accurately reflected.
- [ ] Check that links/buttons (if implemented) correctly navigate to relevant sections.

## Technical Notes

### Affected Components
- `plugin/opticat/src/OptiCatDashboard.tsx` - Main UI component for the dashboard.
- `src/pages/AdminDashboard.tsx` - If any summary stats need to be surfaced there.
- `server/routes/opticat.ts` (or `plugin/opticat/server/api.ts`) - May require minor adjustments to existing API responses to expose more details if not already available.

---

## Meta

**Created**: 2026-06-05
**Priority**: Medium
**Estimated Effort**: M