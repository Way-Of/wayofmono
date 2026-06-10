# Way of Work — Master TODO

**PRODUCTION READY NO MOCK DATA — EXHAUSTIVE LIST**

## ⚠️ CRITICAL MANDATE
INVESTIGATE WHAT THE SYSTEM HAS. DO NOT TAKE AWAY FEATURES: ONLY ENHANCE FEATURES. WE NEED ALL FEATURES IMPLEMENTED. PRODUCTION READY.
**MANDATORY RESEARCH**: Perform deep Google/industry research for every feature implemented to ensure adherence to legal requirements, industry standards, and best practices. No mock data, only enterprise-level code and production-ready systems.

## 🤖 AI Assistant Instructions
1.  **ALWAYS RESEARCH the ticket's desired outcome first** — Read the full WOW ticket `.md` file and understand the intended result before touching any code. Tickets contain research findings, compliance requirements, and specific implementation guidance.
2.  **NEVER DELETE** existing features. If a feature exists in the codebase and the ticket says it should be there, it must remain. Only enhance, never remove.
3.  **ADD CRITICAL FEATURES** based on construction industry standards.
4.  Always maintain full traceability and compliance with RBAC/Multi-tenant policies.
5.  **Verify desired outcome** — After implementing, confirm the result matches the ticket's "Önskat resultat" (desired outcome) section. If unsure, re-read the ticket.

## ✅ Done (Features Implemented)

### Core Infrastructure & Tech Debt
- [x] **WOW-001/006/070/071/081**: Routing, Server Refactor, Agent Standardization, Discovery Protocol, Tool Catalog.
- [x] **WOW-013/015/019**: Orchestrator infra, GitHub backup, Communication channels, Notification infra.
- [x] **WOW-016/024**: Access Control (RBAC, Multi-tenant isolation).
- [x] **WOW-076**: Bug Reports (Admin UI + Notifications).
- [x] **WOW-084**: Agent Staging Area (Persistence Workflow).
- [x] **WOW-085**: PDF Viewer Enhancement (Pan/Zoom).
- [x] **WOW-083**: User Password Management.
- [x] **WOW-080**: Document-Level Chat & Notifications.
- [x] **WOW-096**: OptiCat Tenant/User Isolation.
- [x] **WOW-097**: Docs File Tree & Preview Fixes.
- [x] **WOW-094**: XLSX Viewer (SpreadsheetTable component exists).
- [x] **WOW-098**: Workspace File Operations & Tenant Workspace Template.

## 🚨 Critical Bug Fixes
- [ ] **WOW-105**: Persistent Missing Scrollbar & Rendering Failure on Overview Page

## 🔴 Remaining (Features with Gaps)

### WOW-087: Offer & Invoice System Integration
**Status: Partial — CRUD exists, compliance exports missing**

**Backend — Compliance & Export:**
- [ ] **ROT/RUT XML export** (`server/services/rot-rut-export.ts`) — Generate Skatteverket XML for ROT (Renovering, Ombyggnad, Tillbyggnad) and RUT (Rengöring, Underhåll, Tvätt) deductions. Must specify arbetskostnad, materialkostnad, customer personnummer. Schema defined by Skatteverket.
- [ ] **Peppol BIS Billing 3.0 export** (`server/services/peppol-export.ts`) — Generate UBL XML for Peppol network (mandatory for public sector invoices). Must support PEPPOL:enable header and BIS 3.0 schema.
- [ ] **PDF generation** (`server/offers-api.ts`) — Replace HTML-only document view with proper PDF generation (using a PDF library or puppeteer/chromium). Current flow requires user to Ctrl+P.

**Backend — Signing & Numbering:**
- [ ] **BankID signing stub** (`server/services/bankid.ts`) — Integration stub for BankID e-signature to make offers legally binding. Flow: collect personal number → initiate signing → callback → mark document as signed.
- [ ] **Standard route registration** — Convert `offers-api.ts` from legacy flat-file handler to standard `registerRoutes` pattern matching other route files.

**Frontend:**
- [ ] **Dedicated offers/invoices page** (`src/pages/OffersInvoicesPage.tsx`) — Extract `OffersInvoicesTab` from `AdminDashboard.tsx` into standalone page with proper routing.
- [ ] **Client-facing offer/invoice view** (`src/pages/ClientDashboard.tsx`) — Allow clients to view their own offers/invoices, accept/reject offers, view invoice history.
- [ ] **Frontend service layer** (`src/services/offersService.ts`) — Extract inline `fetch()` calls from AdminDashboard into a proper service with typed methods.

### WOW-088: Digital Project Folder & Document Management
**Status: Partial — Folder creation exists, naming enforcement missing**

**Backend:**
- [x] **Server-side filename validation** (`server/routes/file-system.ts:PUT /api/file, POST /api/fs/entry`) — Reject filenames that don't match `YYYY-MM-DD-Org-Proj-DocType-Auth-vX.Y` schema. Use regex validation with helpful error messages.
- [ ] **Folder cleanup on project deletion** (`server/routes/projects.ts:DELETE /api/projects/:id`) — Remove the project's folder tree from disk when project is deleted. Coordinate with `initializeProjectFolders`.
- [x] **Fix sanitization in project-folders.ts** — Change `projectName.replace(/[^a-z0-9]/gi, '_')` to preserve hyphens and dots so generated folder names align with the naming schema. Add audit log entry when folders are created.
- [ ] **Add REST endpoint for project folder info** (`GET /api/projects/:id/folders`) — Return the folder path and structure for frontend display.

**Frontend:**
- [ ] **Project folder browser** (`src/components/docs/`) — Add a "Project Folders" view in DocsApp that highlights project-specific folders with standardized structure (Ritningar, Bilder, Arbetsordrar, etc.).

### WOW-089: Mobile Time Reporting & Reconciliation
**Status: Partial — API exists, WorkerPortal time tab is placeholder, personalliggare missing**

**Backend — Personalliggare:**
- [x] **Personalliggare endpoint** (`POST /api/portal/personalliggare/check-in`, `/check-out`) — Swedish Tax Agency attendance register requirement for construction sites >4 prisbasbelopp. Log check-in/check-out with: user, project, timestamp, location. Must support on-site inspection queries.
- [x] **Personalliggare report** (`GET /api/portal/personalliggare/report`) — Return attendance register for a given date range / project. Format must be ready for Skatteverket inspection: per-person rows with check-in/check-out times.
- [x] **Link time_sessions to personalliggare** — Add `session_type` column (`'work' | 'attendance'`) to `time_sessions` table to differentiate between time tracking and mandatory attendance logging.

**Frontend — WorkerPortal:**
- [ ] **Real WorkerPortal time dashboard** (`src/pages/WorkerPortal.tsx:372-401`) — Replace demo/hardcoded time cards with real data from `GET /api/portal/time`:
  - Today's hours (sum of today's entries)
  - Pending approvals count (entries with `status='pending'`)
  - This month's hours
  - Weekly chart or breakdown
- [ ] **"Log Time" button handler** — Wire the existing button to open `MobileTime` component or a modal with `TimeEntryForm`.
- [ ] **Personalliggare check-in/check-out button** — Add prominent check-in/check-out button to WorkerPortal for mandatory attendance logging. Show current status (checked in since HH:MM or checked out).

### WOW-090: Material & Procurement Integration
**Status: Partial — EDI parser exists, but xlsx parser unwired, no REST API, material_entries missing from db.ts**

**Backend — xlsx Parser:**
- [ ] **Wire xlsx-parser into a route** (`server/services/xlsx-parser.ts` exists at lines 9-22 but is unused). Register as `POST /api/procurement/parse-xlsx` that accepts an xlsx file path, parses via SheetJS, returns structured material data.
- [ ] **Add xlsx parsing tool for agents** — Register `parse_xlsx_material` in `server/orchestrator-tools-exec.ts` so agents can parse uploaded kalkylark files.

**Backend — REST API:**
- [ ] **Dedicated procurement routes** (`server/routes/procurement.ts`) — Standard registerRoutes pattern:
  - `GET /api/procurement/entries` — List material entries
  - `GET /api/procurement/entries/:id` — Single entry with details
  - `POST /api/procurement/entries` — Create material entry (manual)
  - `PUT /api/procurement/entries/:id` — Update entry
  - `DELETE /api/procurement/entries/:id` — Soft delete
  - `GET /api/procurement/by-project/:projectId` — Project material summary
- [ ] **Register procurement routes** in `server/index.ts`

**Backend — DB:**
- [ ] **Add `material_entries` CREATE TABLE to `server/db.ts`** — Currently only in `schema.sql`, not in runtime `getDb()` schema. The table is referenced by budget-summary but doesn't exist on fresh DBs.
- [ ] **Add supplier table** — `material_suppliers` with columns: `id, tenant_id, name, org_number, contact, payment_terms, agreed_markup_percent`

**EDI Improvement:**
- [ ] **Enhance EDI parser** (`server/services/edi-parser.ts`) — Current implementation is a generic stub. Add support for BEAst format (Byggbranschens Elektroniska Affärsstandard) which is the de facto standard in Swedish construction.

### WOW-091: KMA-Handbok & Digitala Checklistor
**Status: Partial — Backend CRUD exists, UI minimal, project submissions endpoint missing, tables absent from db.ts**

**Backend:**
- [ ] **Add `GET /api/projects/:id/kma-submissions`** (`server/routes/projects.ts` or `server/routes/kma.ts`) — Return all KMA submissions for a given project, with checklist title, user name, submission data, timestamp. Needed for project KMA history view.
- [ ] **Add KMA tables to `server/db.ts`** — `kma_checklists` and `kma_submissions` are currently only in `server/schema.sql` and NOT created by `getDb()`. Add CREATE TABLE IF NOT EXISTS statements to the runtime schema initialization.
- [ ] **Add `POST /api/kma/checklists`** — Create new checklist templates (admin only). Currently no way to create checklists via API — only via seed data or direct DB insert.
- [ ] **Add `PUT /api/kma/checklists/:id`** — Update checklist templates.
- [ ] **Add `DELETE /api/kma/checklists/:id`** — Delete checklist templates.
- [ ] **Add KMA audit log** — Log submissions and checklist changes with `auditLog()`.

**Frontend:**
- [ ] **KMA management page** (`src/pages/KmaPage.tsx`) — Dedicated page for KMA: list checklists, create/edit templates, view submission history per project. Route: `/kma`.
- [ ] **Wire "Generate KMA Report" button** — `src/claw/clawUserUiModules.tsx:336` has an empty onClick handler. Wire to open `KmaChecklistViewer` with a project context.
- [ ] **Photo upload in KMA** — `src/components/kma/KmaChecklistViewer.tsx` has a "photo" type button with `alert("Add Photo — not implemented")`. Implement actual file upload via `POST /api/portal/files/upload` or device camera API.
- [ ] **Mobile KMA checklist form** — Ensure `KmaChecklistViewer` is responsive and usable on mobile for on-site inspections.
- [ ] **SAM compliance checklist** — Add a pre-built SAM (Systematiskt Arbetsmiljöarbete) checklist template with required AFS 2023:1 sections: risk assessment, action plan, follow-up schedule.

### WOW-092: Realtidsbudget & Ekonomisk Uppföljning
**Status: Partial — Budget-summary endpoint exists, no dedicated page, material_entries table missing, budget_spent column missing**

**Backend:**
- [ ] **Add `budget_spent` column to `projects` table** — Currently stripped in destructuring but does not exist in DB. Add column, update budget-summary to write calculated total_spent to it for historical reference.
- [ ] **Add `material_entries` to `server/db.ts`** — Same as WOW-090. Without this, budget-summary material cost is always 0 on fresh DBs.
- [ ] **Replace hardcoded labor rate** (`server/routes/projects.ts:269`) — Currently `laborCost = totalHours * 500` (hardcoded 500 SEK/hr). Query actual average worker rate from `users.hourly_rate` or use a configurable default per tenant.
- [ ] **Add warning threshold** — `budget_warning_pct` column on projects (default 80). When `total_spent / budget_allocated` exceeds this, generate a notification via existing notification system.
- [ ] **Budget allocation history** — Add `budget_changes` table to track when budget_allocated is modified, by whom, from/to what value (audit trail).

**Frontend:**
- [ ] **Budget detail page** (`src/pages/BudgetPage.tsx`) — Full budget dashboard for a project showing:
  - Budget vs actual (progress bar with color coding)
  - Labor cost breakdown (hours by task/worker)
  - Material cost breakdown (by supplier/category)
  - Month-by-month spending chart
  - Budget change history
  - Over-budget alerts
- [ ] **Budget in project create/edit form** — Add `budget_allocated` input field to `ProjectsPage.tsx` create/edit modal (currently hidden).
- [ ] **Budget notification badge** — Show alert badge in project list when a project is approaching or over budget.
- [ ] **Client budget view** — Create a budget-safe subset for clients via existing Economics Shield (currently returns `null` for all budget fields, defeating the purpose).

### Construction Core Features
- [ ] **WOW-101**: Update Skill Definitions to Current System State
- [ ] **WOW-086**: Core Feature Set Audit & Verification (audit document complete; verify all findings)
- [ ] **WOW-060**: Construction Plan Mode Refactor
- [ ] **WOW-061**: ID06 Integration (Swed. Construction ID)
- [ ] **WOW-069**: Open DWG Files (Advanced handling)

### Platform & UX Improvements
- [x] **WOW-104**: System Overview & Landing Page
- [ ] **WOW-102**: Google Workspace Integration
- [ ] **WOW-099**: Kanban File Integration
- [ ] **WOW-100**: Claw Data Isolation Per User
- [ ] **WOW-079**: Honcho Agent Memory & Personalization
- [ ] **WOW-076**: Bug Reports Page (UI Polish)
- [ ] **WOW-062**: Project Page Implementation
- [ ] **WOW-059**: Kanban UI Fixes
- [ ] **WOW-053**: OptiCat HVAC Dashboard UI
- [ ] **WOW-028**: Mobile-First UI/UX

### Infrastructure & Security (GDPR/Compliance)
- [ ] **WOW-064**: GDPR Compliance (Data erasure/anonymization)
- [ ] **WOW-063**: Tenant Data Isolation Architecture (Audit)
- [ ] **WOW-058**: Access Control Gaps Audit
- [ ] **WOW-055**: Investigate Root-Level Bot Registration
- [ ] **WOW-103**: VNC Segfault Fix

### Agent & Skill Ecosystem
- [ ] **WOW-075**: Market Adaptation and Compliance
- [ ] **WOW-073**: Investigate SKURUP Project
- [ ] **WOW-072**: Investigate SANTA MONICA Project
- [ ] **WOW-057**: Skill Creation Skill
- [ ] **WOW-056**: OptiCat Backend and Simulator Skills
- [ ] **WOW-049**: OptiCat WoW Plugin
- [ ] **WOW-046**: Maskinchef Knowledge Base
- [ ] **WOW-008**: Pricing Engine
- [ ] **WOW-009**: Offer & Invoice Agent

### Maintenance & Legacy Cleanup
- [ ] **WOW-005**: Remove Plan Mode (Legacy)
- [ ] **WOW-027**: Systematic Rebrand (wayofpi -> wayofwork)
- [ ] **WOW-051**: Navbar Laggy Navigation
- [ ] **WOW-066**: Hardcoded Filepaths
- [ ] **WOW-050**: Ash Framework Integration (Deferred)
- [ ] **WOW-021**: Kanban Service Fixes
- [ ] **WOW-022**: General Updates and Fixes
- [ ] **WOW-032**: Update Product Documentation
- [ ] **WOW-033**: WayOfMono Telegram Package
- [ ] **WOW-034**: Back Button Navigation Guard
- [ ] **WOW-035**: Separate System from User Workspace
- [ ] **WOW-036**: Agent Surface Mapping / Choose Folder Button
- [ ] **WOW-037**: Plugin Management System
- [ ] **WOW-045**: Way of Work Agent Structure
- [ ] **WOW-047**: Knowledge Base Integration
- [ ] **WOW-048**: Task Time Usage Knowledge Base
- [ ] **WOW-019**: Notification System & User Engagement Enhancement (Active)

---
**Generated**: 2026-06-07
**Next audit**: After completing WOW-087 through WOW-092 feature gaps
