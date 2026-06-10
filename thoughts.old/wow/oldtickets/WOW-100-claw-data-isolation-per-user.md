# WOW-100: Claw Data Isolation per User — Personal Claw Workspaces

## Status
🆕 Draft

## Type
🛠 Feature / 🔒 Security

## Area
- Claw mode
- User isolation
- Multi-tenancy
- Data privacy

## Önskat resultat (Desired Outcome)

Varje användare ska ha ett **personligt Claw-utrymme** — helt isolerat från andra användare. Detta gäller ALL data i Claw-läget:

1. **Personliga .claw/ filer** — Varje användare har sin egen kopia av `.claw/workspace/`-filer (SOUL.md, AGENTS.md, USER.md, MEMORY.md, etc.)
2. **Personliga chatt-sessioner** — Chat transcripts är isolerade per användare (inte bara per tenant)
3. **Personliga agent-inställningar** — Agent-konfiguration, tools, och skills är per användare
4. **Personliga scheman** — Schedule-definitioner under `.claw/schedule/` är per användare
5. **Personliga kanaler** — Telegram/email config är per användare
6. **Admin/Users-sidan i Claw** — När admin tittar på users i Claw-läget ser de bara sina egna tenants användare (redan isolerat per tenant), men Claw-kontexten (agenter, sessions) är personlig
7. **Ingen data läcker** — User A kan inte se User B:s filer, sessions, eller konfiguration

## Nuvarande problem

### Problem 1: `.claw/` är globalt — alla användare delar samma filer

```
.claw/
├── workspace/          ← ALLA användare delar samma SOUL.md, AGENTS.md, etc.
│   ├── SOUL.md
│   ├── AGENTS.md
│   ├── USER.md
│   └── MEMORY.md
├── telegram.json       ← DELAD — alla använder samma bot-konfig
├── schedule/           ← DELAD
└── mission-events/     ← DELAD
```

`getClawDotDirAbs()` returnerar EN global sökväg för hela servern — oavsett tenant eller user.

### Problem 2: Chat sessions är inte user-isolerade

```
{workspaceRoot}/{tenantId}/agent/sessions/
├── wo-chat-docs-abc123.jsonl      ← tenant-isolerad men INTE user-isolerad
├── wo-chat-kanban-def456.jsonl     ← två users i samma tenant
└── wo-chat-claw-ghi789.jsonl       ← med samma sessionKey skriver till samma fil
```

Filen innehåller inte userId — `woSessionBasename(sessionKey)` använder bara `surface` och `sessionKey`.

### Problem 3: Inget per-user utrymme för Claw-konfiguration

Agent-definitioner (`.wo/agents/`), skills (`.wo/skills/`), och tools är gemensamma per tenant. Det finns ingen mekanism för per-user agent-konfig inom Claw.

### Problem 4: Admin/Users i Claw saknar personlig kontext

Admin-sidan i Claw (team view, settings) visar tenant-data men Claw-verktygen (agenter, sessions, .claw-filer) är inte anpassade per user. En admin som byter till Claw-läget får samma .claw-workspace som alla andra.

## Arkitektur

### Alternativ A: User-scoped `.claw/` subdirectories (rekommenderas)

```typescript
// server/claw-workspace-root.ts
getClawDotDirAbs(userId?: string): string {
  const hostRoot = getClawHostRepoRoot();
  if (userId) return resolve(hostRoot, ".claw", "users", userId);
  return resolve(hostRoot, ".claw");
}
```

Struktur på disk:
```
.claw/
├── workspace/                    ← GLOBAL (shared team scaffold)
│   └── SOUL.md, AGENTS.md, ...
├── users/
│   ├── user_abc/
│   │   ├── workspace/            ← PERSONLIGA agent-filer
│   │   │   ├── USER.md
│   │   │   └── MEMORY.md
│   │   ├── sessions/             ← PERSONLIGA chat transcripts
│   │   ├── telegram.json         ← PERSONLIG bot-config
│   │   ├── schedule/             ← PERSONLIGA scheman
│   │   └── mission-events/       ← PERSONLIGA event logs
│   └── user_def/
│       └── ...
├── telegram.json                 ← GLOBAL (fallback)
└── schedule/                     ← GLOBAL (fallback)
```

**Fördelen**: Minimal ändring — `.claw/` strukturen behålls, bara user-subdirectory läggs till. Globala filer används som fallback om user-specifik saknas.

### Alternativ B: Tenant+User-scoped paths i workspace

```typescript
// Använd getPrimaryWorkspacePath(tenantId) + userId
const clawUserDir = resolve(getPrimaryWorkspacePath(tenantId), ".claw", userId);
```

**Fördelen**: Full multi-tenant isolation + user isolation.
**Nackdelen**: `.claw/` flyttas från host checkout till workspace — påverkar alla befintliga integrationer.

### Rekommendation: Alternativ A — minst ändring, tydlig isolering

### Chat session isolation

Lägg till userId i session-filnamnet:
```typescript
// server/wo-session-jsonl.ts
woSessionBasename(sessionKey: string, userId?: string): string {
  const userPart = userId ? `-${userId}` : "";
  return `wo-chat-{surface}${userPart}-{sessionKey}.jsonl`;
}
```

### Claw file tree — user-scoped

`GET /api/claw/tree` ska returnera user-scoped `.claw/users/{userId}/workspace/` tree:
```typescript
// server/routes/claw.ts
router.get("/api/claw/tree", async (_req, _params, auth) => {
  if (!auth) return json({ error: "Unauthorized" }, 401);
  const userClawDir = getClawDotDirAbs(auth.userId);
  const tree = await buildTreeAtPath(userClawDir);
  return json(tree);
});
```

## Backend Changes

| Fil | Förändring |
|-----|-----------|
| `server/claw-workspace-root.ts` | Lägg till `getClawDotDirAbs(userId?)` — returnerar user-scoped path om userId anges |
| `server/claw-workspace-root.ts` | Lägg till `resolveWorkspaceOrClawAbs(rel, tenantId, userId?)` |
| `server/wo-session-jsonl.ts` | Lägg till `userId` i session filename |
| `server/routes/claw.ts` | Använd `userId` för alla claw file operations |
| `server/routes/file-system.ts` | För `.claw/` paths, använd userId för resolution |
| `server/tree.ts` | `buildClawHostTree(userId?)` — user-scoped tree |
| `server/index.ts` | WebSocket upgrade: inkludera userId i session data |

## Frontend Changes

| Komponent | Förändring |
|-----------|-----------|
| `src/hooks/useClawHostFileTree.ts` | Anropa `/api/claw/tree?userId=` (user-scoped) |
| `src/components/claw/ClawApp.tsx` | Ladda user-scoped claw data |
| `src/components/claw/ClawChatView.tsx` | Använd user-scoped sessions |
| `src/components/claw/ClawTeamView.tsx` | Visa users i tenant (redan isolerat per tenant) |
| `src/components/claw/ClawSettingsView.tsx` | Spara inställningar per user |
| `src/pages/AdminDashboard.tsx` | Claw admin: länka till user-scoped claw workspace |

## TODO

### P1 — Backend: User-scoped claw paths
- [ ] Uppdatera `getClawDotDirAbs()` att acceptera `userId` och returnera `.claw/users/{userId}/`
- [ ] Skapa user-scoped katalog vid första användning (mkdir)
- [ ] Kopiera globala .claw/workspace/ scaffold-filer till user-scoped katalogen vid första användning (templating)
- [ ] Uppdatera `resolveWorkspaceOrClawAbs()` att använda userId för `.claw/` paths

### P1 — Backend: User-scoped chat sessions
- [ ] Lägg till `userId` i `woSessionBasename()` — session-filen blir `wo-chat-{surface}-{userId}-{sessionKey}.jsonl`
- [ ] Uppdatera WebSocket upgrade att skicka userId (görs redan: `server/index.ts:235`)
- [ ] Uppdatera `agentSessionsDir()` att använda userId i sökvägen

### P2 — Frontend: Claw data per user
- [ ] Uppdatera `useClawHostFileTree()` att anropa `/api/claw/tree?userId=current`
- [ ] Uppdatera ClawApp att visa user-scoped filer
- [ ] Uppdatera ClawChatView att använda user-scoped sessions

### P2 — Admin/Users i Claw
- [ ] ClawTeamView: visa users i aktuell tenant
- [ ] Claw admin settings: spara per user
- [ ] Admin-dashboard → Claw: öppna user-scoped claw workspace

### P3 — Migration
- [ ] Migrationsskript: skapa `.claw/users/{userId}/` för alla befintliga users
- [ ] Kopiera befintliga session-filer till user-scoped paths
- [ ] Backward compatibility: fallback till global .claw/ om user-scoped inte finns

## Dependencies
- **Depends on:** WOW-098 (workspace paths, tenant isolation)
- **Depends on:** WOW-063 (multi-tenant workspace paths)
- **Related:** WOW-016 (agent architecture)
- **Related:** WOW-012 (UI surfaces and session isolation)

## Referenser
- `server/claw-workspace-root.ts:29-44` — `getClawDotDirAbs()` (global path)
- `server/wo-session-jsonl.ts:23-46` — `agentSessionsDir()` + `woSessionBasename()`
- `server/tree.ts:142-154` — `buildClawHostTree()` (global claw tree)
- `server/routes/claw.ts` — Claw routes
- `server/index.ts:218-241` — WebSocket upgrade (inkluderar userId)
- `src/hooks/useClawHostFileTree.ts` — Claw file tree hook
- `src/components/claw/ClawApp.tsx` — Claw root component
- `src/components/claw/ClawSessionSidebar.tsx` — Session sidebar
- `src/components/claw/ClawTeamView.tsx` — Team view (users)
- `src/pages/AdminDashboard.tsx` — Admin users page
