---
name: wow-access-control
description: Critical security, access control, and privacy rules defined in WOW-016. Must be followed when modifying data access layers to ensure multi-tenant and role-based isolation.
---

# wow_access_control

## 1. Role-Based Access Control (RBAC)
- **Roles:** `SUPER_ADMIN`, `ADMIN`, `LEADER`, `WORKER`, `CLIENT`, `DEMO`.
- **Worker Isolation:** Users with the `WORKER` role must ONLY see data related to projects they are explicitly members of (via the `project_members` table). Always enforce this via SQL `JOIN` or application logic.

## 2. The Economics Shield
- **Rule:** `WORKER`, `CLIENT`, and `LEADER` roles MUST NEVER see financial data.
- **Implementation:** When returning data from tables like `projects`, `tasks`, `tickets`, or `time_blocks`, you must manually strip financial fields before sending the JSON response.
- **Restricted Fields:** `budget`, `budget_allocated`, `budget_spent`, `cost_estimate`, `cost_actual`, `hourly_rate`, `overtime_rate`.
- **Complete Block:** Non-admins must be blocked (403 Forbidden) from accessing `price_lists`, `offers`, `invoices`, and financial reports.

## 3. Information Access Audit (`audit_logs`)
- Every sensitive action must be logged using `auditLog(opts)` from `server/audit-logger.ts`.
- **What to log:**
  - `VIEW_ECONOMICS`: When an Admin views financial data.
  - `ACCESS_DENIED`: When a user attempts an unauthorized action (e.g., Worker trying to view another project).
  - `SEARCH` / `READ`: When users query the workspace via tools.
  - `SAVE_VERSION`: When users trigger GitHub backups.
