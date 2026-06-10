# WOW-106: Shop & Stripe Checkout System

## Goal
Create a complete shop/checkout system for Way of Work tier subscriptions with Stripe integration, supporting both cloud hosting and hardware delivery options, with multi-currency display (SEK/USD/EUR) and multilingual support (SV/EN/ES/FI/NO/DA).

## Problem
The System Overview page (`/overview`) has pricing tiers with "Välj" buttons but no checkout flow. Users cannot purchase subscriptions.

## Scope
- Create `/shop` page with Stripe Checkout integration
- Support 3 tiers: Starter, Pro, Enterprise
- Hardware add-on options (Mac Studio, dedicated server)
- Hosting options (cloud, dedicated cloud, local/on-premise, hybrid, downloadable)
- Billing toggle: Monthly vs Yearly (10% yearly discount)
- Onboarding training addon (500 SEK/employee/month)
- 50% setup fee for cloud provisioning/hardware pre-configuration
- Currency selector: SEK, USD, EUR (SEK baseline)
- Webhook handling for subscription events
- Success/cancel pages
- All text fully translatable across 6 languages

## Pricing Structure

### Subscription (SEK baseline, converted to selected currency)

| Tier | Yearly | Monthly | Setup Fee (50%) | Hardware Options |
|------|--------|---------|-----------------|------------------|
| Starter | 30 000 SEK | 2 500 SEK | 15 000 SEK | Mac Studio (+26 495 SEK) |
| Pro | 65 000 SEK | 5 417 SEK | 32 500 SEK | Mac Studio (+26 495 SEK) |
| Enterprise | Custom | Custom | — | Dedicated server |

### Hosting Multipliers & Addons (SEK)
| Option | Multiplier | Monthly Addon |
|--------|-----------|---------------|
| Cloud (ours) | ×1.0 | 0 |
| Dedicated Cloud | ×1.0 | +1 500 SEK/mån |
| Local (on-premise) | ×0.8 | 0 |
| Hybrid | ×1.3 | 0 |
| Downloadable | ×1.0 | 0 (coming soon) |

### Exchange Rates (June 2026)
- 1 SEK = 0.1065 USD
- 1 SEK = 0.0924 EUR

## Acceptance Criteria
- [x] `/shop` page accessible and responsive
- [x] Tier selection with feature lists from translations
- [x] Pricing displayed in selected currency (SEK/USD/EUR)
- [x] Billing toggle: Monthly / Yearly with 10% yearly discount
- [x] Hardware selection integrated (Mac Studio, server, none)
- [x] Hosting option selection (cloud, dedicated cloud, local, hybrid, downloadable)
- [x] Setup fee calculated automatically (50% of yearly)
- [x] Onboarding training addon with employee count input
- [x] Order summary separates subscription currency from SEK addons
- [x] Alpha notice with founder pricing messaging
- [x] Back to overview button + language/currency selectors in header
- [x] Contact WhatsApp link in footer
- [ ] Stripe Checkout sessions created for each tier (needs STRIPE_SECRET_KEY)
- [ ] Webhook handles: `checkout.session.completed`, `customer.subscription.*`
- [ ] Success page shows order confirmation
- [ ] Cancel page allows retry
- [ ] Email sent on successful purchase
- [ ] Multi-tenant: creates tenant + user on first purchase
- [ ] Existing users can upgrade/downgrade

## Technical Implementation

### Backend (`server/routes/shop.ts`)
- `POST /api/shop/checkout` - Create Stripe Checkout session (requires STRIPE_SECRET_KEY env)
- `POST /api/shop/webhook` - Stripe webhook handler (requires STRIPE_WEBHOOK_SECRET env)
- `GET /api/shop/checkout-success` - Verify session, provision tenant
- `GET /api/shop/checkout-cancel` - Handle cancellation

### Database (`server/db.ts`)
- `shop_orders` table created for order tracking

### Frontend (`src/pages/ShopPage.tsx`)
- Tier selection cards matching overview page
- Hardware options radio (none, Mac Studio, dedicated server)
- Hosting options radio (cloud, dedicated cloud, local, hybrid, downloadable)
- Onboarding training toggle with employee count
- Price calculator (yearly/monthly + hosting multiplier + setup fee + hardware + onboarding)
- Currency selector (SEK/USD/EUR dropdown in header)
- Order summary with subscription vs SEK addon separation
- "Proceed to checkout" button → Stripe (or contact for Enterprise)
- All labels from translation files via `t()`

### Shared Config (`shared/pricing.ts`)
- TIER_PRICING — all base prices in SEK
- EXCHANGE_RATES — SEK, USD, EUR
- HARDWARE_OPTIONS — price in SEK, suitability per tier, translation keys
- HOSTING_OPTIONS — multiplier, monthlyAddon in SEK, translation keys

## Dependencies
- **WOW-104** (System Overview) - ✅ Done, provides tier structure, navigation
- **WOW-105** (Scrolling fix) - ✅ Done, shop page uses PublicLayout
- Stripe account & API keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) — **BLOCKED**
- Stripe CLI for local webhook testing

## Priority
High - Required for revenue generation

## Related Tickets
- WOW-104 (System Overview - pricing structure, navigation from overview)
- WOW-105 (Scrolling - shop uses PublicLayout)
- WOW-098 (Workspace template for tenants - needed for provisioning)
- WOW-086 (Core feature audit - subscription gates features)

## Notes
- **Setup fee changed from 10% (original spec) to 50%** — confirmed by stakeholder during implementation
- **Currency display**: SEK baseline, converted for UI only. Server always receives SEK values.
- **Language independence**: Pricing data in `shared/pricing.ts`, not in translation files
- **Hardware**: Mac Mini removed from options; Mac Studio (26 495 SEK) available for all tiers
- **Enterprise tier**: Contact flow via WhatsApp, no Stripe checkout
- **Stripe integration**: Backend routes exist but require `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` env vars to function
- **VAT (25%)**: Not yet implemented — Stripe Tax or manual calculation pending
- **Invoice language**: Swedish
- **Test mode first**, then production