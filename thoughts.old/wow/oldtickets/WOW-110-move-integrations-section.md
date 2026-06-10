# [WOW-110] Highlight Integrations Section and Display Integration Cards

## Problem Statement

The **Integrationer — Anslut dina befintliga system** (Integrations — Connect Your Existing Systems) section needs to be positioned prominently on the System Overview page. This is critical information for:
1. Enterprise clients who prioritize seamless system integration
2. The 9 specific integration cards that showcase key competitive advantages
3. Swedish compliance features (ID06, Skatteverket)
4. Major ERP integrations (Fortnox, Visma, Stripe)
5. Message platforms (WhatsApp Cloud API, Telegram Bot API)

Currently the section is buried lower on the page, reducing its visibility impact.

## Desired Outcome

Move the Integration section higher on the overview page (position 3 after KMA, before Claw AI). The integration cards must display with full details and emojis as provided:

**Swedish Content (Integrationer — Anslut dina befintliga system):**
```
Way of Work integreras med branschledande system för ekonomi, löner,
dokumenthantering och kommunikation — så att du slipper dubbelarbete
och kan arbeta sömlöst över hela din verktygskedja.

▸ Fortnox — Automatisk synkronisering av fakturor, offerter och
bokföring i realtid
▸ Visma — Integration för lön, ekonomi och personaladministration
med tvåvägssynk
▸ ID06 — Obligatorisk svensk byggarbetarregistrering med
elektroniskt ID-kort och NFC-läsare
▸ Skatteverket — Automatisk XML-export för personalliggare och
arbetsgivardeklaration
▸ WhatsApp Cloud API — Flerkanalskommunikation med kunder och
agenter via Meta Business Platform
▸ Telegram Bot API — Chatt, notiser och agentkommandon via Telegram
med bot-kommandon
▸ Google Workspace — Kalender-, Drive- och Docs-integration för
sömlöst projektsamarbete
▸ Trafikverket API — Live trafikdata och vägarbetsinformation för
TA-planering och APV v5.0
▸ Stripe — Betalningshantering för prenumerationer och fakturor med
PCI-kompatibel checkout
```

**English Content (Integrations):**
```
Way of Work integrates with industry-leading systems for finance,
payroll, document management, and communication — eliminating duplicate
work and enabling seamless operations across your entire toolchain.

▸ Fortnox — Automatic synchronization of invoices, quotes, and
accounting in real-time
▸ Visma — Integration for payroll, finance, and HR administration
with two-way sync
▸ ID06 — Mandatory Swedish construction worker registration with
electronic ID card and NFC reader
▸ Skatteverket — Automatic XML export for personnel registry and
employer declaration
▸ WhatsApp Cloud API — Multi-channel communication with customers and
agents via Meta Business Platform
▸ Telegram Bot API — Chat, notifications, and agent commands via Telegram
with bot commands
▸ Google Workspace — Calendar, Drive, and Docs integration for
seamless project collaboration
▸ Trafikverket API — Live traffic data and road work information for
TA planning and APV v5.0
▸ Stripe — Payment processing for subscriptions and invoices with
PCI-compliant checkout
```

## Context & Background

### Current State
- Integration section is the 7th item in the array of 7 deep dives
- Position is after Claw AI and Agents sections
- 9 detailed integration cards are not getting visibility
- Enterprise buyers look for integration capabilities first

### Why This Matters
- **Competitive Advantage**: 9 major integrations with industry leaders
- **Swedish Compliance**: ID06 and Skatteverket are mandatory requirements
- **Enterprise Appeal**: Fortnox + Visma + Stripe signal enterprise readiness
- **Developer Appeal**: GraphQL API + webhook support attract technical buyers
- **Message Platforms**: WhatsApp Cloud API and Telegram Bot API enable multi-channel communication

## Requirements

### Content Requirements
- [ ] Swedish integration section displays with all 9 cards
- [ ] English integration section displays with parallel translations
- [ ] Each card renders with ▸ emoji icon
- [ ] Descriptions match provided text exactly
- [ ] Section header: "Integrationer — Anslut dina befintliga system" (SV) / "Integrations" (EN)
- [ ] Subtitle: "Way of Work integreras med branschledande system..." (SV) / "Way of Work integrates with industry-leading systems..." (EN)

### Visual Layout
- [ ] Integration cards displayed in grid layout (3 columns on desktop)
- [ ] Each card has border: `border border-[#3c3c3c] rounded-lg p-4 bg-[#1e1e1e]`
- [ ] Card title: Bold heading with ▸ emoji
- [ ] Card description: Full description text
- [ ] Cards are equally sized and aligned

### Position Requirements
- [ ] Integration section positioned after KMA (position 3)
- [ ] Integration section positioned before Claw AI
- [ ] Order: OptiCat → ID06 → KMA → **Integrations** → Claw AI → Agents → Kanban

## Acceptance Criteria

### Automated Verification
- [ ] Build completes: `bun run build`
- [ ] No TypeScript errors in SystemOverviewPage.tsx
- [ ] JSON files (en.json, sv.json) valid after integration content is added

### Manual Verification
- [ ] Integration section visible and positioned correctly
- [ ] All 9 integration cards display with correct emojis (▸)
- [ ] Descriptions match provided Swedish/English text exactly
- [ ] No content overlap with other deep dive sections
- [ ] Section renders without errors in UI

---

## Integration Card Inventory

The following 9 integrations must be displayed in this order:

| Order | Integration | Swedish Description | English Description |
|-------|------------|---|---|
| 1 | Fortnox | Automatisk synkronisering av fakturor, offerter och bokföring i realtid | Automatic synchronization of invoices, quotes, and accounting in real-time |
| 2 | Visma | Integration för lön, ekonomi och personaladministration med tvåvägssynk | Integration for payroll, finance, and HR administration with two-way sync |
| 3 | ID06 | Obligatorisk svensk byggarbetarregistrering med elektroniskt ID-kort och NFC-läsare | Mandatory Swedish construction worker registration with electronic ID card and NFC reader |
| 4 | Skatteverket | Automatisk XML-export för personalliggare och arbetsgivardeklaration | Automatic XML export for personnel registry and employer declaration |
| 5 | WhatsApp Cloud API | Flerkanalskommunikation med kunder och agenter via Meta Business Platform | Multi-channel communication with customers and agents via Meta Business Platform |
| 6 | Telegram Bot API | Chatt, notiser och agentkommandon via Telegram med bot-kommandon | Chat, notifications, and agent commands via Telegram with bot commands |
| 7 | Google Workspace | Kalender-, Drive- och Docs-integration för sömlöst projektsamarbete | Calendar, Drive, and Docs integration for seamless project collaboration |
| 8 | Trafikverket API | Live trafikdata och vägarbetsinformation för TA-planering och APV v5.0 | Live traffic data and road work information for TA planning and APV v5.0 |
| 9 | Stripe | Betalningshantering för prenumerationer och fakturor med PCI-kompatibel checkout | Payment processing for subscriptions and invoices with PCI-compliant checkout |

**Total:** 9 integrations

---

## Technical Notes

### Affected Components

| File | Changes |
|------|---|
| `src/pages/SystemOverviewPage.tsx` | Add integration cards component, render 9 integration entries |
| `src/i18n/en.json` | Add integration section with 9 entries and translations |
| `src/i18n/sv.json` | Add integration section with Swedish content |

### Expected JSON Structure

```json
{
  "overview": {
    "integrations": {
      "title": "Integrationer — Anslut dina befintliga system",
      "subtitle": "Väway of Work integreras med branschledande system för ekonomi, löner, dokumenthantering och kommunikation...",
      "integrations": [
        {
          "name": "Fortnox",
          "description": "Automatisk synkronisering av fakturor, offerter och bokföring i realtid"
        },
        { ... }
      ]
    }
  }
}
```

---

## Implementation Status

### Pre-Implementation
- [x] Ticket created and documented
- [x] Integration content collected
- [x] Swedish/English translations prepared
- [ ] UI component to be added to SystemOverviewPage.tsx
- [ ] JSON translations to be added to en.json and sv.json
- [ ] Integration cards to be rendered in grid

### Next Steps (To Be Done)
1. Add integration object structure to en.json and sv.json
2. Create integration cards component in SystemOverviewPage.tsx
3. Reorder deepDiveIds array: move integrations before claw
4. Render integration cards with grid layout
5. Test with both Swedish and English language files

---

## Meta

**Created**: 2026-03-20
**Updated**: 2026-03-20
**Priority**: High
**Estimated Effort**: Medium
**Related To**: WOW-109 (reorganize deep dives), System Overview UI
**Status**: In Progress / Documentation Complete
**Review By**: Product team prior to next release
**Reviewer**: Lead Developer

### Business Impact

| Factor | Impact |
|---|---|
| Sales Enablement | High — key differentiator |
| Enterprise Appeal | High — Fortnox + Visma integrations |
| Swedish Compliance | Critical — ID06 mandatory |
| Developer Appeal | High — API + webhooks |
| Competitive Edge | High — 9 integrations vs competitors |

---