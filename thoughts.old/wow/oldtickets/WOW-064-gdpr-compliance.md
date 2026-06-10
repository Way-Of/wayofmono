# WOW-064 GDPR Compliance — Data Protection, Erasure & Portability

## Problem Statement

Way of Work processes personal data for multiple companies and their users but has **no systematic GDPR compliance**. Key gaps identified:

1. ~~No user deletion endpoint~~ ✅ DONE — `DELETE /api/admin/users/:id` + `DELETE /api/portal/me` via `server/services/user-deletion.ts`
2. ~~No data export endpoint~~ ✅ DONE — `GET /api/portal/me/data` via `server/services/data-export.ts`
3. ~~No data retention policy~~ ✅ DONE — `server/services/retention-cleanup.ts`, runs on startup + daily, configurable via `WOP_RETENTION_DAYS` (default 365)
4. ~~Plaintext PIN storage~~ ✅ DONE — PINs hashed with `Bun.password.hash()` (argon2), migration on every server start, backward compat for legacy plaintext
5. ~~No cascade deletes~~ ✅ DONE — `user-deletion.ts` handles 21+ tables + session files + Telegram media
6. Audit logs contain IPs — no mechanism to anonymize audit logs when a user is deleted
7. Chat transcripts persisted indefinitely — JSONL files with full message content never cleaned up
8. **NEW: Cross-tenant authentication bypass** — Login endpoint queries by username only, without `tenant_id` filter. If Tenant A and Tenant B both have user "admin", a user could authenticate into the wrong tenant. This is a GDPR data breach risk (Art. 32 security failure).

## Desired Outcome

A GDPR-compliant system where:
- Users can request deletion of all their personal data (complete erasure)
- Users can export all their personal data in machine-readable format
- Personal data has retention limits (auto-purge after configurable period)
- PINs are hashed, not stored in plaintext
- Deleting a user properly cascades across all tables, files, and session data
- Audit logs are anonymized when a data subject is deleted
- Chat transcripts and media files have cleanup mechanisms
- Data Processing Agreement (DPA) terms are supported

## Context & Background

### Current State — What Personal Data Is Stored

| Table | Personal Data Columns | Sensitivity |
|---|---|---|
| `users` | `username`, `full_name`, `email`, `phone`, `pin` (plaintext!), `last_active`, `job_title`, `id06_card_number` | **HIGH** |
| `audit_logs` | `user_id`, `ip_address`, `user_agent`, `summary` (free text), `details_json` (free form) | **HIGH** |
| `channel_message_logs` | `channel_user_id` (phone/TG ID), `message_text` (full content) | **HIGH** |
| `user_channel_links` | `channel_user_id` (phone/TG ID), `channel_username` | **HIGH** |
| `time_sessions` | `user_id`, `notes`, `location_json` (location = Art. 9 special category!) | **HIGH** |
| `bot_whatsapp_accounts` | `phone_number` (business phone) | MEDIUM |
| `tickets` | `created_by`, `assigned_to`, `reviewed_by`, `approved_by`, `rejected_reason`, `photos_json` | MEDIUM |
| `bug_reports` | `user_id`, `username`, `description`, `screenshots` | MEDIUM |
| `offers` / `invoices` | `client_id`, `created_by`, `notes`, `client_name`, `client_org_no` | MEDIUM |
| `id06_cards` | `card_number` (Swedish personal ID), `notes`, `user_id` | HIGH |
| `workspace_files` | `created_by`, `filename` | LOW |
| `notes` | `created_by`, `content` (free text) | MEDIUM |
| Chat JSONL files | Full user messages + AI responses, stored as plaintext on disk under `workspace/agent/sessions/` | **HIGH** |
| Telegram media files | Photos and documents under `workspace/.telegram/` | **HIGH** |

### Current State — What Does Exist (Implemented)

| GDPR Requirement | Status |
|---|---|
| **User deletion endpoint** | ✅ `DELETE /api/admin/users/:id` + `DELETE /api/portal/me` |
| **Data export endpoint** | ✅ `GET /api/portal/me/data` — full JSON export |
| **Audit log retention/purge** | ✅ `retention-cleanup.ts` — daily job, configurable `WOP_RETENTION_DAYS` |
| **Chat transcript cleanup** | ✅ Retention job deletes stale JSONL files |
| **Cascade deletes** | ✅ `user-deletion.ts` handles 21+ tables + files |
| **PIN hashing** | ✅ `Bun.password.hash()` + server-start migration + backward compat |
| **Consent tracking** | ❌ No consent records |

### Current State — What Still Needs Work

| Issue | Severity | Details |
|---|---|---|
| **Cross-tenant login bypass** | 🔴 CRITICAL | `auth.ts:19` and `auth.ts:48` query users by username alone — no `tenant_id` filter. Same username across tenants → wrong tenant access. GDPR Art. 32 violation. |
| **Audit log anonymization** | 🟡 MEDIUM | When user is deleted, audit log `user_id` and `ip_address` should be set to NULL. Currently they remain. |
| **Chat transcript cleanup on delete** | 🟡 MEDIUM | JSONL files are cleaned by retention job but NOT when a user is deleted. |
| **Consent tracking** | 🟢 LOW | No `user_consents` table or consent dialog. Required for Art. 7 compliance on data processing. |

### Why This Matters

GDPR applies because:
- Users are identifiable individuals (employees of client companies)
- IP addresses, locations, phone numbers are collected
- Chat messages and communications are stored
- The system operates in EU jurisdiction (Swedish construction industry focus)
- Fines up to €20M or 4% of global turnover per breach

## Requirements

### Functional Requirements

#### Phase 1: User Deletion (Right to Erasure, Art. 17)
- [ ] `DELETE /api/admin/users/:id` — admin-initiated user deletion
- [ ] `DELETE /api/portal/me` — self-service user deletion
- [ ] On deletion, the system must:
  - Delete the `users` row
  - Delete or anonymize all user references across ALL tables listed above
  - Delete chat transcript JSONL files from `workspace/agent/sessions/`
  - Delete Telegram media files from `workspace/.telegram/`
  - Anonymize audit log entries (set `user_id` → NULL, clear `ip_address`)
  - Delete channel links (`user_channel_links`)
  - Handle time entries, tasks, tickets by either reassigning or anonymizing
- [ ] Confirmation dialog: "This will permanently delete all data for this user. This action cannot be undone."
- [ ] Audit log the deletion action

#### Phase 2: Data Portability (Right to Data Portability, Art. 20)
- [ ] `GET /api/portal/me/data` — export all personal data as JSON
- [ ] Export must include:
  - User profile (all `users` columns)
  - Time entries
  - Tasks (assigned/created)
  - Chat transcripts
  - Tickets
  - Notes
  - Calendar events
  - Project memberships
  - Channel links
- [ ] Return as downloadable JSON file with Content-Disposition header

#### Phase 3: Data Retention & Storage Limitation (Art. 5)
- [ ] Configurable retention period for `audit_logs` (default: 90 days)
- [ ] Configurable retention period for `channel_message_logs` (default: 365 days)
- [ ] Configurable retention period for chat JSONL files (default: 365 days)
- [ ] Scheduled cleanup job (cron or on-server-start) that purges expired data
- [ ] Admin UI for configuring retention periods per tenant

#### Phase 4: Security Improvements (Art. 32)
- [ ] Hash PINs using `Bun.password.hash()` instead of plaintext storage
- [ ] Add migration to re-hash existing plaintext PINs on next login
- [ ] Verify existing PIN authentication works with hashed values
- [ ] Review `details_json` in audit logs — ensure no personal data leakage

#### Phase 5: Consent Tracking (Art. 7)
- [ ] Create `user_consents` table:
  - `id`, `user_id`, `tenant_id`, `consent_type` (e.g., `data_processing`, `marketing`, `llm_sharing`), `granted` (boolean), `granted_at`, `ip_address`
- [ ] Consent dialog on first login or when processing rules change
- [ ] Record of consent stored permanently

### Out of Scope
- Full privacy dashboard UI
- Automated data mapping / DSR (Data Subject Request) workflow
- Cross-border data transfer mechanisms (Standard Contractual Clauses)
- DPA generation (legal document, not code)

## Acceptance Criteria

### Automated Verification
- [ ] Build completes: `bun run build`

### Manual Verification
- [ ] Admin can delete a user and all their data is gone (no orphaned records)
- [ ] User can export all their data as JSON
- [ ] Audit logs older than retention period are purged
- [ ] Chat transcripts older than retention period are purged
- [ ] PIN login still works after migration to hashed PINs
- [ ] Deleted user's audit entries are anonymized (user_id = NULL, ip = NULL)

## Technical Notes

### Affected Components

#### Phase 1 — User Deletion
- `server/routes/admin.ts` — add `DELETE /api/admin/users/:id`
- `server/routes/portal.ts` — add `DELETE /api/portal/me`
- `server/services/user-deletion.ts` — new file with cascading deletion logic
- `server/paths.ts` — function to resolve user's session files and media files
- `src/pages/AdminDashboard.tsx` — UI for admin user deletion
- `src/pages/ProfilePage.tsx` — UI for self-service account deletion

#### Phase 2 — Data Export
- `server/routes/portal.ts` — add `GET /api/portal/me/data`
- `server/services/data-export.ts` — new file with export logic

#### Phase 3 — Retention
- `server/retention-cleanup.ts` — cleanup job
- `server/db.ts` — add `retention_configs` table
- `src/pages/AdminDashboard.tsx` — retention config UI

#### Phase 4 — PIN Hashing
- `server/db.ts` — migration for PIN hashing
- `server/auth.ts` — update PIN verification to use `Bun.password.verify()`
- `server/routes/auth.ts` — update login to handle both old (plaintext) and new (hashed) PINs

#### Phase 5 — Consent
- `server/db.ts` — add `user_consents` table
- `src/components/ConsentDialog.tsx` — consent dialog component
- `src/App.tsx` — check consent on mount

### Cascade Deletion Reference

When a user is deleted, the following must be handled:

| Table | Column | Action |
|---|---|---|
| `project_members` | `user_id` | DELETE row |
| `time_entries` | `user_id` | DELETE or reassign |
| `time_blocks` | `user_id` | DELETE |
| `time_sessions` | `user_id` | DELETE |
| `tasks` | `assigned_to`, `created_by` | SET NULL |
| `tickets` | `created_by`, `assigned_to`, `reviewed_by`, `approved_by` | SET NULL |
| `notifications` | `user_id` | DELETE |
| `bug_reports` | `user_id` | Anonymize (clear username, set user_id NULL) |
| `user_licenses` | `user_id` | DELETE |
| `user_channel_links` | `user_id` | DELETE |
| `channel_message_logs` | `user_id` | Anonymize (set user_id NULL, clear channel_user_id) |
| `workspace_files` | `created_by` | SET NULL |
| `notes` | `created_by` | Anonymize or DELETE |
| `calendar_events` | `user_id` | DELETE |
| `offers` | `created_by`, `client_id` | SET NULL |
| `invoices` | `created_by`, `client_id` | SET NULL |
| `audit_logs` | `user_id`, `ip_address` | Anonymize (SET NULL) |
| `id06_cards` | `user_id` | DELETE |
| Chat JSONL files | — | Delete file from disk |
| Telegram media | — | Delete directory from disk |

---

## Meta

**Created**: 2026-06-06
**Priority**: High
**Estimated Effort**: XL
