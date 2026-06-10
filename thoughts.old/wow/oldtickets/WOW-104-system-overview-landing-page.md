# WOW-104: System Overview & Landing Page

## Goal
Create a production-ready system overview/landing page for the Way of Work platform. This page will serve as the entry point for users, showcasing the platform's capabilities, tiered service offerings, and core value proposition.

## Problem
The system currently lacks a dedicated public-facing or overview page that effectively communicates the platform's value, features, and pricing structure to potential users.

## Scope
- Design and build an overview page at `/overview` that covers:
  - Core value proposition: "Construction management, automated and intelligent."
  - Feature highlights (7 core capabilities + Claw AI)
  - Pricing tiers: Starter, Pro, Enterprise (SEK/year with monthly breakdown)
  - Trust/Security information (Data privacy, encryption, no model training)
  - Contact information with WhatsApp integration
  - Deep-dive sections for ID06, KMA, Claw, OptiCat, Agent Ecosystem
  - Demo login buttons for Worker/Leader/Client
- Ensure the page is responsive and visually polished (dark theme)
- Implement clear call-to-action buttons (Sign in, Sign up, Välj tier, Demo)
- **CRITICAL**: Page must be fully scrollable on all devices/browsers
- **CRITICAL**: Bilingual support (SV/EN + Spanish, Finnish, Norwegian, Danish)

## Acceptance Criteria
- [x] Overview page is accessible at `/overview` and responsive
- [x] Pricing table is clear, accurate, reflects actual system tiers (30k/65k SEK/år)
- [x] Features and benefits correctly showcased (7 core capabilities including Claw AI)
- [x] Security and Trust section prominent
- [x] Visual design polished, consistent with platform branding (dark theme #1e1e1e/#252526)
- [x] **SCROLLING WORKS** on both Vite dev server (port 5173) and Bun production (port 3333)
- [x] Contact info: josef@way-of.com, craig@way-of.com, +46 70 014 84 92 (WhatsApp)
- [x] Deep-dive sections for all major features (ID06, KMA, Claw, OptiCat, Agents, Skills)
- [x] Demo login buttons in hero section
- [x] Claw AI dedicated section with 6 capability cards
- [x] Floating WhatsApp icon (bottom-right, green, SVG icon)
- [x] Feature detail modals (click card → modal with body + highlights)
- [x] Language selector dropdown (SV/EN/ES/FI/NO/DA) in header and footer
- [x] Pricing read from `shared/pricing.ts` (SEK baseline, language-independent)
- [x] "Välj" buttons link to `/shop?tier=starter|pro|enterprise`

## What Has Been Implemented (2026-06-07)

### Page Structure (`src/pages/SystemOverviewPage.tsx`)
1. **Header** - WAY OF WORK logo, nav (Features/Pricing/Deep Dives/Contact), language dropdown, Sign in / Sign up
2. **Hero** - Value prop, description, "Get started for free" CTA + "Learn more", Demo login buttons (Worker/Leader/Client)
3. **Core Platform Capabilities** (7 clickable cards → detail modals):
   - Advanced Agent Ecosystem → modal with 6 highlights
   - Construction Automation → modal with 5 highlights
   - OptiCat HVAC Plugin → modal with 7 highlights
   - Financial Intelligence → modal with 7 highlights
   - Digital Project Folders → modal with 6 highlights
   - Multi-tenant Isolation → modal with 6 highlights
   - Claw AI — Project Manager's Assistant
4. **Claw AI Section** (between Features and Deep Dives):
   - Dedicated section with 6 capability cards
   - "Claw AI — Ditt operativa kommando- och kontrollcenter"
   - Features: scheduling, multi-channel chat, tickets, project queries, time tracking, HR tools
5. **Deep Dives** (5 sections):
   - OptiCat HVAC — design, simulation, balancing, service, VNC
   - ID06 — Swedish construction compliance
   - KMA — Quality, Environment & Work Environment
   - Claw AI — Intelligent construction assistant
   - Agents — Specialized skills ecosystem
6. **Pricing** (3 tiers from shared/pricing.ts):
   - Starter: 30 000 SEK/år (2 500 SEK/mån) + 50% setup fee
   - Pro: 65 000 SEK/år (5 417 SEK/mån) + 50% setup fee
   - Enterprise: "Kontakta oss" (custom pricing)
   - Hardware & Hosting overview cards
7. **Trust/Security** - Data ownership, no model training, encryption, multi-tenant isolation
8. **Contact** - josef@way-of.com, craig@way-of.com, WhatsApp +46 70 014 84 92
9. **Footer** - Copyright, language toggle, email, WhatsApp, Sign in
10. **Floating WhatsApp icon** - Fixed bottom-right, green (#25D366), SVG icon, links to wa.me/46700148492

### Technical Fixes (WOW-105)
- **Scrolling fixed** via `PublicLayout` wrapper in `src/main.tsx`
- `min-h-screen` + `overflow-y-auto` on public pages
- Removed `overflow-hidden` from body in `index.html`
- Works on both ports 5173 and 3333

### Language System Expansion (2026-06-08)
- `src/contexts/LanguageContext.tsx` — `Language` type expanded to 6: sv, en, es, fi, no, da
- `src/i18n/en.json` — Removed pricing keys (prices moved to `shared/pricing.ts`)
- `src/i18n/sv.json` — Removed pricing keys (prices moved to `shared/pricing.ts`)
- `src/i18n/es.json` — Spanish, ~670 keys translated
- `src/i18n/fi.json` — Finnish, ~670 keys translated
- `src/i18n/no.json` — Norwegian (Bokmål), ~670 keys translated
- `src/i18n/da.json` — Danish, ~670 keys translated
- All language toggles converted from binary to dropdown (SV/EN/ES/FI/NO/DA)

### Pricing Data Separation (2026-06-08)
- `shared/pricing.ts` — New centralized pricing module:
  - TIER_PRICING: Starter (30,000 SEK), Pro (65,000 SEK), Enterprise (custom)
  - EXCHANGE_RATES: SEK=1, USD=0.1065, EUR=0.0924
  - HARDWARE_OPTIONS: none, mac-studio (26,495 SEK), server (enterprise)
  - HOSTING_OPTIONS: cloud (×1.0), dedicated-cloud (+1,500 SEK/mån), on-premise (×0.8), hybrid (×1.3), downloadable (disabled)
- Both ShopPage and SystemOverviewPage import from shared/pricing.ts
- Language files contain only translatable text, no pricing data

## Remaining Work

### Medium Priority
- [ ] Add "Townie" character visual elements
- [ ] Add customer logos/testimonials section
- [ ] Add feature comparison table (Starter vs Pro vs Enterprise)
- [ ] Create `/pricing` dedicated page with FAQ
- [ ] Animation polish (framer-motion)

### Low Priority
- [ ] SEO meta tags
- [ ] Analytics tracking on CTA clicks

## Related Tickets
- **WOW-105** (Scrolling fix) - ✅ DONE
- **WOW-106** (Shop & Stripe Checkout) - ✅ DONE (code), BLOCKED (Stripe keys)
- **WOW-023** (Docs page - Simple view context)
- **WOW-061** (ID06 Integration) - content referenced
- **WOW-091** (KMA Handbook) - content referenced
- **WOW-100** (Claw Data Isolation) - content referenced
- **WOW-OPTICAT** (OptiCat HVAC) - content referenced

## Notes
- Setup fee changed from 10% (original spec) to 50% (updated by stakeholder)
- Pricing moved from translation files to `shared/pricing.ts` (2026-06-08)
- Currency selector on ShopPage: SEK/USD/EUR with SEK baseline
- Exchange rates (2026-06 market): 1 SEK = 0.1065 USD, 1 SEK = 0.0924 EUR
- 6 languages now supported: SV, EN, ES, FI, NO, DA
- WhatsApp link: `https://wa.me/46700148492`
- **Shop page**: See WOW-106 for Stripe Checkout implementation
- **"Välj" buttons** on overview page link to `/shop?tier=starter|pro|enterprise`
