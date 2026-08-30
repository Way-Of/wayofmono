# WOW-108: Comprehensive Shop, Terms, ngrok & Translations

## Summary
Consolidated ticket for recent work across ShopPage, Terms of Service, ngrok configuration, and translation management.

## Changes Implemented

### 1. ShopPage Fixes
- **Setup fee calculation**: Fixed to be 50% of annual fee (år 1), not extra on top
- **Hosting label**: Changed "Moln (vår)" → "Moln (Way of Work)" 
- **Terms checkbox**: Added required checkbox linking to /terms page
- **Validation**: Checkout blocked until terms accepted
- **Error message**: "Du måste godkänna användarvillkoren" / "You must accept the Terms of Service"

### 2. Terms of Service Page (/terms)
- Created `TermsPage.tsx` with full alpha-phase legal terms
- 9 sections covering: Alpha disclaimer, Services, Payment, Hardware/Hosting, Data/AI/Integrations, IP, Termination, Governing Law, Changes
- Added route in App.tsx
- Footer link added to SystemOverviewPage

### 3. SystemOverviewPage Updates
- Hero CTA: "Kom igång gratis" → "Kom igång" / "Get started for free" → "Get started"
- Hero CTA now navigates to `/shop` instead of `/login`
- Footer "Användarvillkor" link to `/terms`

### 4. ngrok Configuration
- **OLD**: Domain `ethically-coauthor-backpedal.ngrok-free.dev` reserved for old account (josef.lindbom@gmail.com)
- **NEW**: Account `josefnordicglobaltrade@gmail.com` authtoken: `3Er0B8cyTzfS7xS37ppauOQ8vON_2Zp2kGgZ33paG472HgRbY`
- **CURRENT ISSUE**: ngrok still tries to use old reserved domain `ethically-coauthor-backpedal.ngrok-free.dev` because authtoken has it reserved in ngrok cloud
- **FIX NEEDED**: Reserve new domain at https://dashboard.ngrok.com/domains/new for new account, or release old domain from old account
- **TEMPORARY**: Disabled `WOP_NGROK_DOMAIN` and `WOP_PUBLIC_URL` in .env and start scripts
- **START SCRIPTS**: Updated `startdev.sh` and `startdeve.sh` to explicitly `unset WOP_NGROK_DOMAIN` and `WOP_PUBLIC_URL`

### 5. Translations - Archive Non-SV/EN Languages
**Moved to storage (not in active repo):**
- `/home/zerwiz/CodeP/wayofwork/i18n-archive/es.json` (Spanish)
- `/home/zerwiz/CodeP/wayofwork/i18n-archive/fi.json` (Finnish)
- `/home/zerwiz/CodeP/wayofwork/i18n-archive/no.json` (Norwegian)
- `/home/zerwiz/CodeP/wayofwork/i18n-archive/da.json` (Danish)

**Keep active (SV/EN only):**
- `/home/zerwiz/CodeP/wayofwork/src/i18n/sv.json`
- `/home/zerwiz/CodeP/wayofwork/src/i18n/en.json`

**Updated LanguageContext.tsx** to only import/load SV and EN.

### 6. Terms Translations Added (SV/EN)
Full alpha-phase terms translations in both sv.json and en.json under `overview.terms.*` and `overview.shop.errorTermsRequired`, `overview.shop.termsAccept`, `overview.shop.termsLink`.

### 7. Electron Desktop App
- **ISSUE**: UI not visible — likely due to ngrok domain conflict (ngrok fails to start tunnel with reserved domain)
- **NEEDS**: Fix ngrok domain → then Electron UI should load

## Files Modified
- `src/pages/ShopPage.tsx` - Setup fee, hosting label, terms checkbox, validation
- `src/pages/SystemOverviewPage.tsx` - Hero CTA text/link, footer terms link
- `src/pages/TermsPage.tsx` - NEW
- `src/App.tsx` - Added TermsPage route
- `src/i18n/sv.json` - Shop/Terms translations
- `src/i18n/en.json` - Shop/Terms translations
- `src/contexts/LanguageContext.tsx` - SV/EN only
- `startdev.sh` / `startdeve.sh` - unset WOP_NGROK_DOMAIN/WOP_PUBLIC_URL
- `.env` - commented out old reserved domains

## Next Steps (Priority Order)
1. **Reserve new ngrok domain** at https://dashboard.ngrok.com/domains/new for account `josefnordicglobaltrade@gmail.com`
2. Update `.env` with new `WOP_NGROK_DOMAIN=new-domain.ngrok-free.dev`
3. Test ngrok tunnel with new domain
4. Test Electron desktop app (`./startdeve.sh`) — UI should appear
5. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` for live Stripe
6. Test checkout flow end-to-end with terms checkbox

## Priority
High — Shop checkout, legal compliance, and Electron desktop app all blocked by ngrok domain issue
