# WOW-009 [Offer & Invoice Agent] Offer and invoice agent with document generation and communication

## Problem Statement

There is no system for creating professional offers (anbud) and invoices (faktura) for construction projects. The AI agents cannot generate documents, send them to clients via WhatsApp/Telegram, or manage the offer-to-invoice lifecycle.

## Desired Outcome

An admin/leader can create offers with line items from price lists, generate HTML documents ready for PDF export, send them to clients via WhatsApp or Telegram, track status (draft → sent → accepted → invoiced), and create invoices from accepted offers.

## Context & Background

### Current State
- Price list CRUD exists but no offer/invoice generation
- WhatsApp bot accounts exist but no outbound sending code
- Telegram bot exists (`sendTelegramMessage`) with full infrastructure
- No email sending capability
- No document generation (HTML or PDF)
- `tickets` table has an `invoiced` status but generates no actual invoice document
- Communication channels (WhatsApp, Telegram) linked via `user_channel_links` table

### Why This Matters
Construction companies need to send professional offers and invoices to clients. The goal is to handle the entire workflow in one system: create offer → send to client → client accepts → create invoice → send invoice → track payment.

## Requirements

### Functional Requirements
- [x] Create offers with line items (name, quantity, unit, unit_price)
- [x] Auto-generated offer numbers (`ANB-YYYY-NNN`) per tenant
- [x] Offer status workflow: draft → sent → accepted → rejected → invoiced
- [x] Generate HTML document for offer (printable to PDF)
- [x] Send offer to client via Telegram (if linked)
- [x] Send offer to client via WhatsApp (if linked + env vars configured)
- [x] Create invoice from accepted offer
- [x] Auto-generated invoice numbers (`INV-YYYY-NNN`) per tenant
- [x] Invoice status workflow: draft → sent → paid → overdue → cancelled
- [x] Generate HTML document for invoice (printable to PDF)
- [x] Send invoice via Telegram/WhatsApp
- [x] OCR number auto-generation for invoices
- [x] VAT calculation (25%) on invoices

### Out of Scope
- Email sending (needs SMTP env vars + nodemailer) — future
- PDF generation library (HTML + browser print is current approach) — future
- Automatic OCR payment matching — future
- Fortnox/Visma accounting export — future
- E-invoice (PDF/A, Svefaktura) — future

## Acceptance Criteria

### Automated Verification
- [x] Build completes: `bun run build`

### Manual Verification
- [x] `POST /api/offers` creates offer with number `ANB-2026-001`
- [x] `GET /api/offers` returns list of offers
- [x] `PUT /api/offers/:id` updates draft offer
- [x] `DELETE /api/offers/:id` deletes offer (admin only)
- [x] `GET /api/offers/:id/document` returns styled HTML
- [x] `POST /api/offers/:id/send?channels=telegram` sends via Telegram
- [x] `POST /api/invoices` creates invoice from offer, marks offer as invoiced
- [x] `GET /api/invoices/:id/document` returns styled HTML
- [x] `POST /api/invoices/:id/send?channels=telegram` sends via Telegram

## Technical Notes

### Database

Three new tables in `server/db.ts`:

**`offers`**:
| Column | Type | Description |
|---|---|---|
| id | TEXT PK | UUID |
| tenant_id | TEXT FK | Multi-tenant |
| project_id | TEXT? | Linked project |
| client_id | TEXT? | Linked client user |
| offer_number | TEXT | `ANB-2026-001` |
| title | TEXT | Project name |
| status | TEXT | draft/sent/accepted/rejected/invoiced |
| items_json | TEXT | `[{name, quantity, unit, unit_price}]` |
| total_amount | REAL | Sum of items |
| valid_until | TEXT? | Offer expiry |
| created_by | TEXT? | User ID |

**`invoices`**:
| Column | Type | Description |
|---|---|---|
| id | TEXT PK | UUID |
| offer_id | TEXT? | Source offer |
| invoice_number | TEXT | `INV-2026-001` |
| total_amount | REAL | Net |
| vat_amount | REAL | 25% VAT |
| grand_total | REAL | Total incl. VAT |
| due_date | TEXT? | Payment due |
| ocr_number | TEXT? | Payment ref |
| paid_at | TEXT? | When paid |

**`document_counters`**: Auto-incrementing counters per tenant/prefix/year.

### API

`server/offers-api.ts` — exports `handleOfferInvoiceApi(path, method, auth, req)` same pattern as `tickets-api.ts`.

Routes:
- `GET/POST /api/offers` — List/Create
- `GET/PUT/DELETE /api/offers/:id` — Read/Update/Delete
- `POST /api/offers/:id/send?channels=telegram,whatsapp` — Send
- `GET /api/offers/:id/document` — HTML document
- `GET/POST /api/invoices` — List/Create
- `GET/PUT/DELETE /api/invoices/:id` — Read/Update/Delete
- `POST /api/invoices/:id/send?channels=telegram,whatsapp` — Send
- `GET /api/invoices/:id/document` — HTML document

### Document Generation

Documents are generated as styled HTML with CSS print media queries. Users print to PDF via browser (Ctrl+P → "Save as PDF"). Documents include:
- Header with document type and number
- Info grid (date, validity/due date, project)
- Line item table
- Summary with VAT breakdown
- Footer with payment terms

### WhatsApp Sending

Uses WhatsApp Cloud API (`graph.facebook.com/v21.0`). Requires env vars:
- `WOP_WHATSAPP_PHONE_NUMBER_ID`
- `WOP_WHATSAPP_ACCESS_TOKEN`
- `WOP_WHATSAPP_BUSINESS_ACCOUNT_ID`

Client must have a WhatsApp link in `user_channel_links`.

### Telegram Sending

Uses existing `sendTelegramMessage` function from `telegram-bot.ts`. Requires:
- `WOP_TELEGRAM_BOT_TOKEN` env var or bot in `bot_telegram_accounts`
- Client must have a Telegram link in `user_channel_links`

### Affected Components
- `server/db.ts` — new tables (offers, invoices, document_counters)
- `shared/offer-types.ts` — new shared types
- `server/offers-api.ts` — new API file (543 lines)
- `server/index.ts` — wired offers API after tickets API
- `.wo/agents/fakturering.md` — new agent
- `.wo/skills/document-generation/SKILL.md` — new skill
- `.wo/skills/client-communication/SKILL.md` — new skill

---

## Meta

**Created**: 2026-05-22
**Priority**: High
**Estimated Effort**: XL
**Status**: Implementation Feedback — users can't write JSON. Items need form-based editor.

### Remaining Work
- [x] Replace JSON textarea in `OffersInvoicesTab` with a proper item table editor — add/remove/edit rows for name, quantity, unit, unit_price, with auto-calculated totals
- [ ] Price list integration: allow picking items from existing price lists instead of manual entry
- [ ] Template offers: save/load common offer templates
