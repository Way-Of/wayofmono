# WOW-105: Scrollbar and Rendering Failure - Status Report

## Current Status (2026-06-07) — **FIXED** ✅

The System Overview Page (`/overview`) now scrolls correctly on both Vite dev server (port 5173) and Bun production server (port 3333).

---

## What Has Been Done (Complete Fix)

### Root Cause Identified
**Two separate layout systems conflicting:**
1. **Authenticated routes** (`/*`): Render `<App/>` component which has `h-screen overflow-hidden` wrapper with internal `overflow-y-scroll` container
2. **Public routes** (`/overview`, `/login`, `/welcome`, `/setup`): Rendered directly at root router level, bypassing `<App/>` entirely

**The Real Problem:** Public pages like `SystemOverviewPage` were rendered directly into `#root` which inherits global CSS constraints:
- `index.html`: `<body class="m-0 overflow-hidden">` - locks body scroll
- `index.css`: implicit height constraints on `html`
- `#root` has no explicit height but inherits body/html constraints

When `SystemOverviewPage` used `min-h-full`, it looked for a parent with defined height - but `#root`/`body`/`html` had `overflow-hidden` and no explicit height, so `min-h-full` resolved to viewport height only, clipping content.

### Final Fix Applied (WORKS - Verified on Both Ports)

1. **`src/main.tsx`**: Created `PublicLayout` wrapper component
   ```tsx
   function PublicLayout({ children }: { children: ReactNode }) {
     return <div className="w-full min-h-screen overflow-y-auto bg-[#1e1e1e]">{children}</div>;
   }
   ```
   - Wraps `/overview`, `/login`, `/welcome`, `/setup` routes
   - Provides independent scroll context: `min-h-screen` + `overflow-y-auto`
   - Bypasses locked workspace layout entirely

2. **`src/pages/SystemOverviewPage.tsx` (line 8)**: Changed `min-h-full` → `min-h-screen`

3. **`index.html` (line 10)**: Removed `overflow-hidden` from body
   - `<body class="m-0">` - allows natural scroll

4. **`src/App.tsx`**: Kept existing workspace layout for authenticated routes (unchanged)

5. **`src/pages/AdminDashboard.tsx`**: Fixed same pattern for consistency

6. **Removed broken component**: `src/components/UpdateNotification.tsx` (missing @mui imports)

7. **Built production assets**: `bun run build` ✓

### Verified Working
- **Vite dev server**: `http://localhost:5173/overview` ✓ - SCROLLS CORRECTLY
- **Bun production server**: `http://localhost:3333/overview` ✓ - SCROLLS CORRECTLY
- All content visible: Hero, Features, Pricing, Trust, Footer

---

## Additional Updates Applied

### Pricing Updated (SEK/year with 10% setup fee + hardware options)
- **Starter**: 30 000 SEK/år (2 500 SEK/mån) — för enskilda som behöver uppgiftsautomatisering
- **Pro**: 65 000 SEK/år (5 417 SEK/mån) — full rutinsvit och samarbetsverktyg  
- **Enterprise**: Anpassad — dedikerad support och säkerhetsgranskningar

**Hardware options** (add-on):
- Mac Mini / Mac Studio (för små/medelstora företag)
- Dedikerad server-hårdvara (för stora företag)
- Hårdvara levereras med systemet förinstallerat — körs som lokal server

**Hosting options**:
- Molnhosting av oss (ingår i startavgift 10%)
- Lokal installation på levererad hårdvara
- Hybrid: moln + lokal backup

### Contact Info Added
- **E-post**: josef@way-of.com, craig@way-of.com
- **Telefon/WhatsApp**: +46 70 014 84 92 (Josef) — klickbar WhatsApp-länk på översiktssidan

### Deep-dive Sections Added (from ticket research)
- **ID06**: Autonoma förnyelsearbetsflöden, NFC-skanning, webbplatsåtkomstkontroll, multi-tenant isolering
- **KMA**: Digitala checklistor, riskanalyser, fotodokumentation, SAM-efterlevnad (AFS 2023:1), incidentrapportering
- **Claw**: Personliga `.claw/` workspaces per användare, isolerade chatt-sessioner, per-användare agent-konfiguration
- **OptiCat HVAC**: Projektering (design/simulering), Injustering (balansering), Inventering, Service, Felsökning (7-stegsprocess), flödes/tryck/energiberäkningar, VNC-strämd Flutter desktop app
- **Agentekosystem**: 19 agenter (orchestrator, projektledare, skyddsombud, fakturering, kalkylator, kanban, TA-planner, maskinchef, schemaplanerare, docs, forskare, ata, claw, opticat-service-tech, opticat-designer, time-verification, supply-agent, construction-planner, agents-and-skills-manifest)
- **25 Skills**: ata, client-communication, construction-planning, cost-estimation, dispatch-agent, document-generation, incident-reporting, kanban-time, logistics, opticat-hvac, opticat-procurement, opticat-service, procurement, project-pricing, research, safety, scheduling, spanish-building-laws, swedish-building-laws, time-calculation, time-verification, tma, weather, workers, workspace-storage

---

## Next Steps
1. Create `/shop` page for Stripe checkout (separate ticket)
2. Test in Electron (`bun run electron:dev` - kill port 3333 first with `pkill -f "bun run server/index.ts"`)
3. Verify other public pages (`/login`, `/welcome`, `/setup`) scroll correctly
4. Ensure authenticated routes still work with locked layout
