# WOW-111: Dev Server, ngrok & Electron Desktop App Issues

## Summary
Critical issues blocking development and testing of the Way of Work platform, particularly the Electron desktop app and public tunnel access.

## Current State (2026-06-08)

### ✅ Working
- **Build**: `bun run build` passes cleanly
- **ShopPage**: Terms checkbox, setup fee (50%), currency selector, pricing logic fixed
- **TermsPage**: `/terms` route with full alpha-phase legal terms
- **SystemOverviewPage**: Hero CTA "Kom igång" → `/shop`, footer terms link, demo buttons, 7 deep dives
- **Languages**: SV/EN only (es/fi/no/da archived)
- **ErrorBoundary**: "Send bug report" button
- **Bug Reports**: SUPER_ADMINs globally notified
- **Code**: All TypeScript compiles cleanly

### 🔴 Critical Blockers

#### 1. Dev Server Won't Stay Running
- **Problem**: `bun run server/index.ts` starts but exits immediately (SIGTERM) when run via `concurrently` or `bun run dev`
- **Symptoms**: 
  - Server logs show "Way of Work server http://127.0.0.1:3333" then process exits
  - `cross-env NODE_ENV=development bun run server/index.ts exited with code SIGTERM`
  - Running directly with `bun run server/index.ts` works but blocks terminal
  - `nohup bun run server/index.ts > server.log 2>&1 &` starts but doesn't accept connections on `http://127.0.0.1:3333/api/health`
- **Suspected Cause**: 
  - `concurrently` sending SIGTERM when one process exits
  - Server binding to `127.0.0.1:3333` but ngrok trying to connect to `localhost:3333` (IPv6 vs IPv4)
  - Process management issue with background processes

#### 2. ngrok Tunnel Issues
- **Domain**: `ethically-coauthor-backpedal.ngrok-free.dev` (owned by `josefnordicglobaltrade@gmail.com`)
- **Authtoken**: `3Er0B8cyTzfS7xS37ppauOQ8vON_2Zp2kGgZ33paG472HgRbY`
- **Problems**:
  - `ngrok http --url=https://ethically-coauthor-backpedal.ngrok-free.dev http://127.0.0.1:3333` works manually
  - Server auto-ngrok spawn fails: "WOP_ALLOW_NGROK_SPAWN is off" or tries to tunnel port 5173 (Vite) with same domain
  - `WOP_VITE_PORT=3333` added to .env but server still tries to tunnel port 5173
  - `WOP_ALLOW_NGROK_SPAWN=0` in .env disables auto-spawn but manual ngrok works
- **Error Codes Seen**:
  - ERR_NGROK_320: Domain reserved for another account (old issue, now fixed)
  - ERR_NGROK_3200: Endpoint offline (backend not running)
  - ERR_NGROK_8012: Connection refused to upstream (server not accepting on 127.0.0.1:3333)

#### 3. Electron Desktop App - No UI Visible
- **Script**: `./startdeve.sh` starts `bun run electron:dev` + OptiCat Flutter
- **Symptoms**: 
  - Electron window opens but no UI visible (blank/white)
  - ngrok tries to start with reserved domain `unvocable-oligopoly-lorraine.ngrok-free.dev` (old account)
  - Electron loads `https://ethically-coauthor-backpedal.ngrok-free.dev` but tunnel fails
  - Console shows: `[ngrok] Spawning: /usr/local/bin/ngrok http --url https://unvocable-oligopoly-lorraine.ngrok-free.dev 5173`
- **Root Cause**: Electron app loads the ngrok URL but tunnel fails because:
  1. Old reserved domain in startdeve.sh logic
  2. Server not running when Electron tries to load
  3. ngrok auth conflict with old domain

### 📁 Files Involved
- `/home/zerwiz/CodeP/wayofwork/startdev.sh` — Server + Vite (concurrently)
- `/home/zerwiz/CodeP/wayofwork/startdeve.sh` — Electron + OptiCat + ngrok
- `/home/zerwiz/CodeP/wayofwork/server/index.ts` — Bun server (binds 127.0.0.1:3333)
- `/home/zerwiz/CodeP/wayofwork/.env` — ngrok config, ports, spawn flags
- `/home/zerwiz/CodeP/wayofwork/electron/electron-main.mjs` — Electron entry
- `/home/zerwiz/CodeP/wayofwork/server/ngrok-tunnel-manager.ts` — Auto-ngrok logic
- `electron/preload.cjs` — Preload script

### 🔧 Attempted Fixes
1. Set `WOP_NGROK_DOMAIN=ethically-coauthor-backpedal.ngrok-free.dev` in .env
2. Set `WOP_VITE_PORT=3333` in .env
3. Set `WOP_ALLOW_NGROK_SPAWN=0` to disable auto-spawn
4. Removed `unset` commands from start scripts
5. Manual ngrok: `ngrok http --url=https://ethically-coauthor-backpedal.ngrok-free.dev http://127.0.0.1:3333` ✅ works
6. Set `WOP_ALLOW_NGROK_SPAWN=0` in .env to prevent server auto-spawn

### 🎯 Next Steps Required
1. **Fix dev server process management**: Investigate why `concurrently` kills server process
2. **Configure ngrok properly**: 
   - Reserve domain at https://dashboard.ngrok.com/domains/new if needed
   - Ensure authtoken has domain permission
   - Configure `WOP_NGROK_DOMAIN` to only tunnel API port (3333)
3. **Fix Electron app**: 
   - Update `startdeve.sh` to use correct domain
   - Ensure server is running before Electron loads
   - Fix ngrok spawn logic in `ngrok-tunnel-manager.ts` to only tunnel port 3333
4. **Fix server binding**: Ensure server accepts connections on `127.0.0.1:3333` (not just `*:3333`)

### Priority
**CRITICAL** — Blocks all development, testing, and Electron desktop app delivery

### Related Tickets
- WOW-108: Comprehensive Shop, Terms, ngrok & Translations
- WOW-104: System Overview & Landing Page
- WOW-106: Shop & Stripe Checkout
- WOW-105: Scrolling/Rendering Bug
