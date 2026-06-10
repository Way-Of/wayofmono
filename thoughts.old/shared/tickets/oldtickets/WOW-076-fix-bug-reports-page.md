# WOW-076 — Fix Bug Reports System (Expanded Scope)

## Problem Statement

The "Bug Reports" system across the platform has several issues:
1. The Admin dashboard "Bug Reports" page initially displayed truncated text ("No bu") and showed "0 total" despite existing reports.
2. No mechanism existed to report errors caught by the global `ErrorBoundary` — users could only reload, losing the error context.
3. The backend API and database schema exist but the frontend integration had rendering/query issues.
4. No automatic developer notification existed beyond admin panel review.

## Desired Outcome

A fully functional, robust, and user-friendly bug reporting system covering:
- **Admin panel**: View, filter, search, and manage all bug reports with status workflow.
- **Error Boundary**: Inline "Send bug report" button on crash pages with auto-captured error context.
- **Shop/Overview pages**: Submit bug reports directly from public-facing pages (with or without auth).
- **Notifications**: Admins automatically notified on new submissions.
- **Multi-language**: Bug report UI labels translatable (SV/EN/ES/FI/NO/DA).

## Context & Background

### Current State (2026-06-08)

#### ✅ What Works
- **Backend API** (`server/routes/bug-reports.ts`): Fully functional — `POST /api/bug-reports`, `GET /api/admin/bug-reports`, `GET /api/bug-reports`, `PATCH /api/admin/bug-reports/:id`
- **Database** (`server/db.ts`): `bug_reports` table with all columns (tenant-scoped)
- **Admin panel** (`src/components/admin/BugReportsAdmin.tsx`): Full CRUD UI with search, filter by status, detail view, severity badges, status management (pending/in-review/fixed/closed), duplicate marking
- **BugReportModal** (`src/components/modals/BugReportModal.tsx`): Modal form for submitting from within the app
- **Admin notifications**: `notifyUser()` called on `POST /api/bug-reports` for all ADMIN/SUPER_ADMIN users
- **ErrorBoundary** (`src/main.tsx`): "Send bug report" button next to "Reload" with inline form capturing error message + stack trace + URL + user agent; submits to `/api/bug-reports`; handles auth/unauth gracefully
- **Bug report submitted via curl** during development: ID `bug_1780919871975_83wpmzk` for the yearlySEK runtime error

#### ❌ Still Missing / Broken
- "No bu" text issue: Root cause unknown — may be a rendering race condition or data fetch issue in `BugReportsAdmin.tsx` when no reports exist or the query fails silently
- **No public-facing standalone bug report button** on the overview/shop pages (must be triggered by an error first)
- **No screenshot upload** in the submission flow
- **No external issue tracker integration** (GitHub Issues, Linear, Jira)
- The ErrorBoundary submission requires auth for the API; unauthenticated users see a "sign in first" message instead of a fallback (e.g., mailto or clipboard)

## Requirements

### Functional Requirements
- [x] **Accurate Report Display:** BugReportsAdmin fetches and renders reports, filters by status, searches by title/description
- [x] **Comprehensive Report Listing:** Shows title, status, severity, submitter, category, creation date
- [x] **Robust Filtering & Searching:** Status tabs (All/Pending/In Review/Fixed/Closed) + search input work correctly
- [x] **Detailed Report View:** Click opens detail panel with full description, environment, steps to reproduce, comments, labels
- [x] **Error Boundary Bug Report:** "Send bug report" button appears on every crash page with inline form
- [x] **Best Practice Data Capture:** Title, description, error message, stack trace, URL, user agent captured automatically
- [x] **Backend Integration:** API endpoints work, multi-tenant `tenant_id` isolation, permissions enforced
- [x] **Admin Notifications:** `notifyUser()` called for all admins on new submission with link to report
- [ ] **"No bu" / "0 total" display bug:** Still intermittent — needs investigation (possibly empty state vs loading state race)
- [ ] **Public-facing bug report button:** No standalone "Report a bug" button on public pages (overview/shop)
- [ ] **Screenshot upload:** Not yet implemented in any flow
- [ ] **External issue tracker integration:** Not implemented (email copy as minimal fallback possible)
- [ ] **Unauthenticated fallback:** ErrorBoundary shows "sign in first" but doesn't offer clipboard copy or mailto fallback

### Non-Functional Requirements
- [x] **Performance:** Reports list loads efficiently with pagination not yet needed
- [x] **Usability:** Admin UI is intuitive (cards, severity colors, expandable detail)
- [x] **Reliability:** Notifications fire reliably on submission

## Acceptance Criteria

### Automated Verification
- [x] Build completes successfully: `bun run build`
- [ ] Unit and integration tests for bug report API endpoints pass (no test suite exists)
- [ ] Frontend tests verify correct rendering (no test suite exists)

### Manual Verification
- [x] "Bug Reports" tab in Admin dashboard loads reports, allows search and filtering
- [x] Clicking a bug report opens detailed view with all captured information
- [x] Users can submit new bug reports via the modal
- [x] ErrorBoundary shows "Send bug report" button on crashes with inline form
- [x] Submitted bug reports include error stack, URL, user agent automatically
- [x] Notifications are sent to admins on submission
- [ ] "No bu" text no longer appears when reports exist

## Technical Details

### ErrorBoundary Integration (`src/main.tsx:23`)
- Class component with state: `error`, `showBugForm`, `bugTitle`, `bugDesc`, `bugSubmitted`, `bugError`
- On error: shows error message + "Reload" button + "Send bug report" button
- Bug report form: optional title/description fields, auto-includes error message + stack trace
- Submission: `POST /api/bug-reports` with `Authorization: Bearer <token>` if available
- On 401: shows "Please sign in first" message
- On success: shows "Bug report submitted. Thank you!" confirmation

### Affected Components
- `src/main.tsx` — ErrorBoundary with inline bug report form
- `src/pages/AdminDashboard.tsx` — Bug Reports tab
- `src/components/admin/BugReportsAdmin.tsx` — Full CRUD admin UI (359 lines)
- `src/components/modals/BugReportModal.tsx` — Submission modal
- `server/db.ts` — `bug_reports` table schema
- `server/routes/bug-reports.ts` — Backend API endpoints (224 lines)
- `server/notifications.ts` — Admin notification on submission

## Meta

**Created**: 2026-06-06
**Updated**: 2026-06-08 — Added ErrorBoundary bug report button, verified admin panel functionality, documented remaining gaps
**Priority**: High
**Estimated Effort**: L (expanded from M due to ErrorBoundary + public page scope)
