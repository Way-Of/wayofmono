# WOW-010 [Human-in-the-Loop] Approval queue for AI suggestions — human must verify before data becomes active

## Problem Statement

AI agents can suggest price updates, plan changes, schedules and messages, but they can make mistakes. The system currently has no guard — if an agent calls `PUT /api/price-lists` the change goes live immediately. The customer must have control and responsibility over their own system.

All data changes from AI must go through an **approval queue** where an admin (human) clicks "Approve" or "Reject" before the change becomes active.

## Desired Outcome

A generic `pending_changes` system where AI only creates **suggestions/drafts**. An admin in the Admin Console sees the queue, reviews the diff, and approves or rejects. Only upon approval is the data written to live tables. The same mechanism is reused for price lists, planning, schedules, messages — everything.

## Context & Background

### Current State
- `PUT /api/price-lists/:id` writes directly to DB — AI can immediately change live prices
- No `pending_changes` concept exists
- Agents (`forskare`, `projektledare`) are instructed to "ask the user first" but have no technical guard
- The ÄTA system has a similar workflow (draft → review → approve) but it's per-case, not generic

### Why This Matters
- AI can hallucinate prices or misunderstand context
- The customer must legally stand behind their price lists and offers
- Audit trail: who changed what and when was it approved?
- The same mechanism is needed for planning, time, messages, schedules

## Requirements

### Functional Requirements
- [x] `pending_changes` DB table: tenant_id, change_type, status (pending/approved/rejected), proposed_data (JSON), current_data (JSON), summary, suggested_by, approved_by, approved_at
- [x] `POST /api/pending-changes` — AI creates a suggestion (status: pending)
- [x] `GET /api/admin/pending-changes` — Admin sees all pending suggestions
- [x] `POST /api/admin/pending-changes/:id/approve` — Admin approves → data written to live table
- [x] `POST /api/admin/pending-changes/:id/reject` — Admin rejects with reason
- [x] Admin Console tab "Approval Queue" with diff view (before/after)
- [x] Price list API changed: AI can only create pending_changes, not update directly
- [x] Planning, schedules, batch messages use the same mechanism

### Out of Scope
- Automatic approval based on rules — future
- Role-based approval rules (who can approve what) — future
- Escalation on delayed approval — future

## Acceptance Criteria

### Automated Verification
- [x] Build completes: `bun run build`

### Manual Verification
- [x] AI suggests price change → visible in admin queue as "pending"
- [x] Admin sees diff: "Excavator: 700 → 750 SEK/h"
- [x] Admin clicks Approve → price list updated
- [x] Admin clicks Reject → no change, status becomes "rejected"
- [x] All agents (`forskare`, `projektledare`, `fakturering`) instructed to only create suggestions
- [x] Existing `PUT /api/price-lists/:id` requires admin role (not agent)
## Technical Notes

### Architecture

```
AI Agent → POST /api/pending-changes → pending_changes (status=pending)
                                               ↓
                                     Admin Console ← GET /api/admin/pending-changes
                                               ↓
                                     Admin clicks "Approve"
                                               ↓
                                     POST /api/admin/pending-changes/:id/approve
                                               ↓
                                     proposed_data written to live table
                                               ↓
                                     pending_changes.status = 'approved'
```

### Database

```sql
CREATE TABLE IF NOT EXISTS pending_changes (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    change_type TEXT NOT NULL,        -- 'price_update', 'plan_change', 'schedule', 'message'
    status TEXT DEFAULT 'pending',    -- 'pending', 'approved', 'rejected'
    target_table TEXT NOT NULL,       -- 'price_lists', 'offers', 'tasks', etc.
    target_id TEXT,                   -- ID of the record to update (null for creates)
    proposed_data TEXT NOT NULL,      -- JSON: the new data
    current_data TEXT,                -- JSON: snapshot of current data (for diff)
    summary TEXT NOT NULL,            -- Human-readable: "Update excavator price 700→750 kr/h"
    suggested_by TEXT,                -- Agent name: "forskare"
    suggested_by_user TEXT,           -- User ID of the human who asked (if any)
    approved_by TEXT,                 -- Admin user ID
    approved_at TEXT,
    rejected_reason TEXT,
    created_at TEXT DEFAULT (datetime('now'))
)
```

### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/pending-changes` | Any (agent) | Create a pending change suggestion |
| GET | `/api/admin/pending-changes` | ADMIN | List all pending changes |
| GET | `/api/admin/pending-changes/:id` | ADMIN | Get single change with diff |
| POST | `/api/admin/pending-changes/:id/approve` | ADMIN | Approve → write to live table |
| POST | `/api/admin/pending-changes/:id/reject` | ADMIN | Reject with reason |

### Approval Hook

When approve is called, the server:
1. Reads `proposed_data` and `target_table`/`target_id`
2. Executes the actual UPDATE/INSERT on the target table
3. Marks `pending_changes.status = 'approved'`
4. Logs the audit trail

### Agent Instructions

All agents updated to never call `PUT /api/price-lists` directly. Instead:
- `POST /api/pending-changes` med `change_type: "price_update"`
- Berätta för användaren: "Förslag skickat till admin för godkännande"

### UI Component: ApprovalQueue

New tab in AdminDashboard: "Approval Queue" showing:
- Table of pending changes: summary, type, suggested_by, created_at
- Expandable row showing diff (proposed vs current)
- Approve / Reject buttons
- Badge count on tab

### Affected Components
- `server/db.ts` — new `pending_changes` table
- `server/routes/admin.ts` — GET/POST approve/reject endpoints
- `server/index.ts` or new `server/pending-changes-api.ts` — POST create
- `src/pages/AdminDashboard.tsx` — new ApprovalQueue tab
- `.wo/agents/forskare.md` — agent instructions (only suggest, never write)
- `.wo/agents/projektledare.md` — agent instructions
- `.wo/agents/fakturering.md` — agent instructions
- All existing API routes that agents call — add role check (ADMIN-only for direct writes)

---

## Meta

**Created**: 2026-05-22
**Priority**: Critical
**Estimated Effort**: XL
**Status**: Planned
