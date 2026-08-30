# WOW-095: Multi-User & Multi-Tenant Concurrency Stability Audit

## ⚠️ CRITICAL MANDATE
INVESTIGATE WHAT THE SYSTEM HAS. DO NOT TAKE AWAY FEATURES: ONLY ENHANCE FEATURES. WE NEED ALL FEATURES IMPLEMENTED. PRODUCTION READY.

## Audit Summary (2026-06-07)

Efter djupgående kodgranskning av hela `server/`:

| Area | Status | Risk |
|------|--------|------|
| **DB: Single `db`-singleton** (`server/db.ts:10`) | ❌ Alla tenants delar en SQLite-anslutning | 🔴 Kritisk |
| **DB: Inga transaktioner** | ❌ `BEGIN`/`COMMIT`/`ROLLBACK` används ingenstans | 🔴 Kritisk |
| **DB: WAL mode** | ⚠️ Bara i `schema.sql`, **inte** i `db.ts` | 🟡 Medel |
| **VNC: Ingen auth** (`server/index.ts:165`) | ❌ `/ws/opticat/vnc` saknar JWT-verifiering | 🔴 Kritisk |
| **VNC: Single target** (`server/vnc-proxy.ts:10-11`) | ❌ EN display för ALLA användare (127.0.0.1:5900) | 🔴 Kritisk |
| **Workspace: Tenant-ignorant** (`server/workspace-state.ts`) | ❌ Alla workspace-routes ignorerar `auth.tenantId` | 🔴 Kritisk |
| **Tool-log broadcast** (`server/tool-log-broadcast.ts:11`) | ❌ Global `Set` — alla subscribers får alla logs | 🟡 Hög |
| **Agent cache** (`server/agents.ts:39`) | ❌ Evig singleton, aldrig tenant-specifik | 🟡 Hög |
| **WebSocket per-connection** (`ws-handler.ts`) | ✅ Data är isolerad per anslutning | 🟢 OK |
| **Routes: `tenant_id`-filtrering** | ✅ De flesta routes filtrerar korrekt | 🟢 OK |
| **Xvfb/x11vnc display-hantering** | ❌ Finns inte alls | 🔴 Kritisk |
| **OptiCat audio redirection** | ❌ Finns inte alls | 🟡 Hög |
| **Belastningstest / stresstest** | ❌ Finns inte alls | 🟡 Hög |

## Problemställning
OptiCat-applikationen och andra delar av systemet kraschar under samtidig belastning från flera användare och företag. Detta indikerar brister i hanteringen av delat tillstånd (shared state) och potentiella problem med samtidiga databasoperationer.

## Önskat resultat
Ett system som är 100% stabilt under hög belastning från flera användare och olika företag (tenants), där varje session är isolerad och ingen data läcker eller korrumperas vid samtidig exekvering.

---

## Krav — Prioriterad ordning

### 🔴 P0: Akuta säkerhetshål (görs först)

- [ ] **VNC WebSocket-auth**: Lägg till JWT-verifiering på `/ws/opticat/vnc` i `server/index.ts:165`. Utan detta kan vem som helst se alla VNC-sessioner. Detta är en del av OptiCat unified auth — se WOW-082 (merged into this ticket).
- [ ] **VNC per session**: Ersätt singel-target i `server/vnc-proxy.ts` med dynamisk display-hantering. Starta Xvfb på `:99`, `:100`, etc per user/tenant. Mappa via tenantId och userId.
- [ ] **Auth Bridge (WOW-082)**: OptiCat Flutter och backend måste acceptera WoW JWT och skicka med i alla API-anrop. Ingång: `plugin/opticat/chat_server/lib/auth_service.dart`.
- [ ] **Role Mapping (WOW-082)**: Mappa WoW rollhierarki (`WORKER`, `LEADER`, `ADMIN`, `CLIENT`) till OptiCat-specifika permissions via `hasPermission(role, capability)` i `server/accessControl.ts`.
- [ ] **Data Isolation på OptiCat endpoints (WOW-082)**: Alla `api/opticat/*` endpoints måste filtrera på `tenant_id` — OptiCat-verktygen i `server/tools/opticat-hvac.ts` är idag stubbar utan någon isolation.
- [ ] **DB: WAL + transaktioner**: Sätt `PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;` i `server/db.ts` (inte bara i schema.sql). Wrappa alla batch-skrivningar i `BEGIN`/`COMMIT`.

### 🔴 P1: Datadelning mellan företag

- [ ] **Workspace FS-isolering**: Alla anrop i `server/routes/workspace.ts` måste skicka `auth.tenantId` till workspace-state funktionerna. Varje tenant får egen rot i `workspace/<tenant_id>/`.
- [ ] **Multi-DB eller connection-pool**: Byt från singleton `db` (`server/db.ts:10`) till per-tenant databas (`data/wayofwork-<tenant_id>.sqlite`) eller connection-pool med Map<tenantId, Database>. Detta är den ENDA garanterade isolationen — `tenant_id`-kolumner räcker inte vid race conditions.
- [ ] **Audit av alla globala variabler**: Ersätt följande singletons med tenant-nycklade strukturer:

| Fil | Variabel | Typ |
|-----|----------|-----|
| `server/db.ts:10` | `db` | `Database` → `Map<string, Database>` |
| `server/agents.ts:39` | `cachedManifest` | `Map<string, ConsolidatedManifest>` (key: tenantId) |
| `server/tool-log-broadcast.ts:11` | `subscribers` | `Map<string, Set<LogSender>>` (key: tenantId) |
| `server/orchestrator-dispatch-intent.ts:15` | `rosterCache` | `Map<string, ...>` + TTL |
| `server/orchestrator-tools-exec.ts:96-97` | `*RuntimeOverride` | `Map<string, boolean>` |
| `server/workspace-index.ts:413` | `_isSyncing` | `Map<string, boolean>` |
| `server/workspace-index.ts:507` | `_autoSyncTimer` | `Map<string, Timer>` |
| `server/telegram-bot.ts:17` | `lastUpdateIds` | Redan Map men saknar tenant-scoping |
| `server/ngrok-tunnel-manager.ts:8` | `wopNgrokChild` | `Map<string, Subprocess>` |

### 🟡 P2: Stabilitet & prestanda

- [ ] **Tool-log tenant-filtrering**: I `broadcastToolLog()`, filtrera subscribers på `tenantId` så att användare från olika företag inte ser varandras tool-logs.
- [ ] **Belastningstest**: Skapa ett stresstest-skript som simulerar 10+ samtidiga användare över flera tenants. Testa DB-skrivningar, WebSocket-anslutningar, och workspace-operationer samtidigt.
- [ ] **Xvfb/x11vnc display-manager**: Implementera en display-pool som allokerar lediga display-nummer per session och återvinner dem vid disconnect.
- [ ] **OptiCat Audio Redirection**: Implementera ljudströmning från server-display till klienten (PulseAudio-nätverkssink + WebRTC eller WebSocket-audio).

### 🟢 P3: Förbättringar

- [ ] **Agent-cache per tenant**: Nyckla `cachedManifest` på `(tenantId, rootPath)`.
- [ ] **Terminal WS auth**: Lägg till `tenantId` i terminal WebSocket-data (saknas idag).
- [ ] **GDPR cleanup per tenant**: Verifiera att `server/services/retention-cleanup.ts` körs tenant-vis.

---

## Identifierade globala state-variabler (full audit)

```
server/db.ts:10           db (Database)              — SINGLETON
server/auth.ts:4,9        SECRET_RAW, SECRET          — OK (JWT secret, global per design)
server/vnc-proxy.ts:10-11 VNC_TARGET_HOST/PORT        — SINGLETON (måste bli dynamisk)
server/workspace-state.ts:19 frozenInitialPath        — OK (boot-time constant)
server/workspace-state.ts:21 tenantFolders            — Map (OK, redan per tenant)
server/agents.ts:39        cachedManifest             — SINGLETON (måste bli per tenant)
server/tool-log-broadcast.ts:11 subscribers           — GLOBAL SET (måste bli per tenant)
server/ngrok-tunnel-manager.ts:8 wopNgrokChild        — SINGLETON (måste bli per tenant)
server/telegram-bot.ts:17  lastUpdateIds              — Map, men saknar tenant-scoping
server/orchestrator-dispatch-intent.ts:15 rosterCache — SINGLETON (måste bli per tenant)
server/orchestrator-tools-exec.ts:96-97 *Override     — GLOBAL FLAGS (måste bli per tenant)
server/workspace-index.ts:413 _isSyncing              — GLOBAL LOCK (måste bli per tenant)
server/workspace-index.ts:507 _autoSyncTimer           — SINGLETON (måste bli per tenant)
server/tunnel-gate.ts:37   cache                      — SINGLETON (OK, config-cache)
```

## Routes som saknar tenant-scoping

| Route | Fil | Problem |
|-------|-----|---------|
| `/api/workspace` | `server/routes/workspace.ts:36-43` | Anropar `getPrimaryWorkspacePath()` och `listWorkspaceFolders()` utan tenantId |
| `/api/workspace` POST | `server/routes/workspace.ts:46-118` | Alla ops (open_folder, add_folder etc) anropar utan tenantId |
| `/api/workspace/problems` | `server/routes/workspace.ts:120` | Anropar `getPrimaryWorkspacePath()` utan tenantId |
| `/ws/opticat/vnc` | `server/index.ts:165` | Ingen auth alls |
| `/ws/terminal` | `server/index.ts:176` | Har auth men sparar inte tenantId |

---
## Meta
**Skapad**: 2026-06-06
**Uppdaterad**: 2026-06-07
**Prioritet**: Critical
**Estimated Effort**: XL (12-15 delmoment)
**Status**: Audit klar — redo för implementation
**Merged**: WOW-082-opticat-unified-auth är sammanslagen med denna ticket eftersom VNC-auth, OptiCat JWT-integration och tenant-isolering måste lösas tillsammans.
