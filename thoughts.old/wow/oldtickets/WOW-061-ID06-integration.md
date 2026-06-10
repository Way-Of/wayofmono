# WOW-061 ID06 Swedish Construction ID Integration

## Problem Statement
ID06 is the mandatory electronic ID and access card system for all Swedish construction sites. Every worker on site must have a valid ID06 card — without one, they cannot enter. Way of Work currently has no ID06 integration, making it impossible to track worker credentials, card validity, site access compliance, or connect time entries to ID06 attendance logs. Furthermore, the system **MUST** autonomously handle ID06 compliance—including expiry tracking, regulatory checks, and worker authorization—collaboratively across agents and updated UI surfaces, ensuring full, end-to-end compliance management for the user without requiring manual intervention.

## Desired Outcome
Way of Work can autonomously manage ID06 credentials within worker/company profiles, track card validity periods with **autonomous expiry resolution (e.g., triggering renewal workflows)**, integrate with ID06 attendance logs, and provide mobile NFC scanning for on-site ID checks. **Crucially, all relevant agents (e.g., `projektledare`, `skyddsombud`, `docs`) work together to autonomously enforce site access compliance, notify relevant parties, and suggest corrective actions.** The Admin page must be updated to facilitate this management, providing clear, intuitive, and compliant interfaces.

## Context & Background

### What ID06 Is
- **Personal electronic ID card** for construction workers in Sweden — mandatory since 2016
- Contains: identity, employer info, qualifications (linked via ID06 Skills Database)
- Functions: site access (turnstiles/gates), electronic attendance log (Skatteverket-accessible), identity verification, qualification checks
- Card has NFC chip + QR code; read by card readers at site entrances
- **2026 stricter rules**: passport or national ID card must be scanned (mobile app or in-person) for card issuance; Freja eID supported for identity verification

### ID06 Process Flow
1. Company gets Swedish F-tax approval
2. Company registers in ID06 portal, signs agreement
3. Company orders ID06 cards for workers
4. Worker verifies identity via mobile app (NFC scan of passport) or in-person at scanning office
5. Card is printed and delivered, worker activates it via NFC phone tap
6. Worker uses card daily for site entry/exit — logs attendance automatically

### Validity Periods (from 2026)
- Swedish citizens: 5 years
- EU/EEA citizens (taxed in home country): 6 months
- Non-EU citizens: 3 months (or tied to work permit)
- With coordination number: up to 24 months

### Requirements for Card Issuance
- Employer: Swedish F-tax approval
- Worker: valid A1 certificate (EU posting), coordination number or 183-day exemption, passport/ID verified in person or via app
- Non-EU: valid Swedish work permit

### Current State
- No ID06 fields in worker/employee records.
- No autonomous expiry resolution or collaborative enforcement across agents.
- No integrated attendance log reconciliation.
- UI for ID06 management on the Admin page is either missing or inadequate.

## Requirements

### Functional Requirements
- [ ] **Autonomous ID06 Management:** Agents must autonomously track card validity, initiate renewal workflows for expiring cards, and verify site access compliance across projects, collaborating seamlessly to resolve issues.
- [ ] **Worker & Company Profile Integration:** Add ID06 fields to worker/company profiles, including card status, validity, and F-tax status.
- [ ] **Autonomous Expiry & Compliance Handling:** Agents must collaboratively alert site managers and initiate renewal processes before card expiry.
- [ ] **Admin UI Enhancements:** Update the Admin page to provide a comprehensive, intuitive, and compliant interface for managing ID06 data, tracking card validity, and overseeing site access compliance.
- [ ] **Mobile NFC/Scanning Integration:** Mobile dashboard ID06 page for scanning cards, verifying validity, and checking site access, with manual entry fallback.
- [ ] **Integrated Reporting:** Site access lists per project, attendance log reconciliation, and compliance reporting (including export functionality).
- [ ] **ID06 Status Control integration — link to ID06 Status Control API for real-time card validation
- [ ] Multi-tenant isolation — each tenant (construction company) manages its own workers and ID06 data

### Out of Scope
- Freja eID integration as login method (separate feature)
- Full Skatteverket reporting automation
- ID06 Skills Database integration (Phase 4)
- Non-construction industries where ID06 is expanding

## Acceptance Criteria

### Manual Verification
- [ ] Admin UI on the Admin page allows adding/managing ID06 card data in worker profiles.
- [ ] ID06 dashboard clearly shows card status, validity, and compliance across projects.
- [ ] Agents autonomously notify site managers/responsible parties of card expiry and suggest/initiate renewal workflows.
- [ ] Mobile NFC scanning and manual entry verification are fully operational and compliant.
- [ ] Per-project site access list shows status per worker and is autonomously reconciled with attendance logs.
- [ ] Export CSV with ID06 compliance data per project.
- [ ] Build compiles: `bun run build`.

## Technical Notes

### Key Concepts
- ID06 card number is the primary key for lookups
- Cards are tied to (worker, employer) pair — if worker changes employer, new card needed
- ID06 has a Status Control API for real-time validation (check if card is valid, not revoked)
- NFC on mobile can read card UID/NDEF records — need to research if ID06 cards expose data via NDEF or just UID
- Offline fallback: cards can be looked up by number in local DB if API not available

### Affected Components
- `src/pages/admin/workers/` — **Admin page UI updates** for ID06 card section and worker profile management.
- `server/db/schema.ts` — new tables: `id06_cards`, `worker_id06`, `company_id06`.
- `server/routes/id06.ts` — new route group: CRUD cards, status checks, site access lists.
- `server/routes/projects.ts` — extend with site access endpoint per project.
- `.wo/agents/` — **Agent logic updates** to enable autonomous ID06 compliance tracking, inter-agent collaboration for site access management, and renewal workflow orchestration.
- `src/pages/mobile/MobileID06.tsx` — mobile page for NFC scanning + manual lookup.
- `src/pages/mobile/MobileLayout.tsx` — add ID06 tab to bottom nav.
- `src/hooks/useID06.ts` — hook for card data fetching and expiry logic.
- `src/contexts/NotificationContext.tsx` — expiry alert integration.
- `server/notifications/` — expiry check cron or on-access check.
- `CHANGELOG.md` — will be updated to reflect these enhancements.

---

## Meta

**Created**: 2026-06-06
**Priority**: High
**Estimated Effort**: L