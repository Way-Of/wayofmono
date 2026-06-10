# WOW-012 [Isolated Chat per Surface] Each view (claw, kanban, docs) has its own chat instance

## Problem Statement

Currently all surfaces (Claw, Kanban, Docs, Simple, Work, Admin) share the same chat instance. When switching between different views, you see the same chat history and the same generic Orchestrator greeting, even though each view is designed for different use cases and has different agents associated with it.

Additionally, the server finds **no agents** because `WOP_WORKSPACE` points to `workspace/` (empty directory) while agents and skills are in the repo root `.wo/agents/` and `.wo/skills/`. The server's agent scanner looks under `join(WOP_WORKSPACE, ".wo", "agents")` i.e. `workspace/.wo/agents/` — which doesn't exist. Therefore the Orchestrator fallback is always used regardless of selected view.

## Desired Outcome

Each surface (Claw, Kanban, Docs, Simple, etc.) should have its own isolated chat instance with:
- Own chat history (separate JSONL files on disk)
- Own active session/context and own chat tabs
- **Correct agent auto-selected per surface** — Claw → `claw.md`, Docs → `docs.md`, Kanban → `kanban.md`, etc.
- Agents and skills from `.wo/` must be accessible by the server
- Fix double-bubble during thinking

## Context & Background

### Current State — Chat Architecture

The chat uses a WebSocket (`/ws`) with per-connection state (`ChatWsData`). All surfaces share the same connection in the frontend via a global React context (`useRefactor()` → `session` object from `useWoSession()`).

**Existing surfaces** (routes in `src/App.tsx`):

| Route | Component | Surface | Chat component |
|---|---|---|---|
| `/simple` | `SimplePage` | Simple | `SimpleChatView` |
| `/claw` | `ClawPage` | Claw | `ChatPanel` / `ClawChatView` |
| `/docs` | `DocsPage` | Docs | `SimpleChatView` |
| `/kanban` | `KanbanPage` | Kanban | `KanbanChatPanel` |
| `/workboard` | `WorkPage` | Work | (no chat) |
| `/admin` | `AdminDashboard` | Admin | (no chat) |

**Important:** `ReferenceApp.tsx` (separate from `App.tsx`) calls `useWoSession(chatSurfaceId, ...)` with surface-ID, but it's not used at runtime. The active app is `App.tsx` which calls `useWoSession()` **without surfaceId**.

### Current State — Agent Discovery

Server's agent scanning (`server/agents.ts:128-144`):
```typescript
const roots = [
  join(workspaceRoot, ".wo", "agents"),
  join(workspaceRoot, "agents"),
  join(workspaceRoot, ".claude", "agents"),
  ...
];
```

`workspaceRoot` comes from `getPrimaryWorkspacePath()` which reads `WOP_WORKSPACE` (`.env`).
- `WOP_WORKSPACE=/home/zerwiz/CodeP/wayofwork/workspace`
- Agents are in `/home/zerwiz/CodeP/wayofwork/.wo/agents/`
- === **Server finds no agents** ===

### Current State — Agent selection in frontend

The agent picker in `ChatPanel.tsx` (lines 1162-1188) is a `<select>` with:
- **Default (empty):** `""` = Orchestrator (session lead)
- **Picker:** agents from `useAgents()` which fetches from localStorage (`wop-agents-api`)
- **Roster-only:** names from `teams.yaml` without matching `.md`

The frontend can technically select an agent manually, but since the server doesn't find any `.md` file, you always get "Hi! I'm ready to help..." from Orchestrator regardless of selection.

### Current State — Existing agents

**7 agents** in `.wo/agents/` (repo root — all inaccessible to the server):

| File | Name | Skills |
|---|---|---|
| `claw.md` | claw | — |
| `kanban.md` | kanban | kanban-time |
| `fakturering.md` | fakturering | document-generation, client-communication, project-pricing, swedish-building-laws, research |
| `forskare.md` | forskare | research, project-pricing |
| `projektledare.md` | projektledare | kanban-time, ata, workers, safety, swedish-building-laws, project-pricing, time-calculation, research |
| `schemaplanerare.md` | schemaplanerare | scheduling, kanban-time, workers, client-communication |
| `ata.md` | ata | ata, research |

**11 skills** in `.wo/skills/`: `ata/`, `client-communication/`, `document-generation/`, `kanban-time/`, `project-pricing/`, `research/`, `safety/`, `scheduling/`, `swedish-building-laws/`, `time-calculation/`, `workers/`

**No docs agent existed at ticket creation (created 2026-05-22).**

### Chat UI-related files

**Main components:**
- `src/components/ChatPanel.tsx` — Main chat (1267 lines, tabs, messages, agent picker, mode)
- `src/components/simple/SimpleChatView.tsx` — Simple chat (953 lines)
- `src/components/claw/ClawChatView.tsx` — Claw-specific chat
- `src/components/kanban/KanbanChatPanel.tsx` — Kanban chat
- `src/components/technical/TechnicalChatPanel.tsx` — Technical chat
- `src/components/docs/PMChatPanel.tsx` — Docs PM chat
- `src/components/documenthandler/Chat.tsx`, `ChatMessages.tsx`, `ChatPanel.tsx`, `ChatExplorer.tsx` — Document handler chat
- `src/components/AgentTeamPulseGrid.tsx` — Agent pulse
- `src/components/ContextUsageRing.tsx` — Context usage

**Hooks & state:**
- `src/hooks/useWoSession.ts` — WebSocket connection, session management, tabs (rename from `useWayOfPiSession.ts`)
- `src/hooks/useAgents.ts` — Agent list via localStorage
- `src/types/chat.ts` — ChatRow, LogRow, ChatSessionTab

**Server (chat logic):**
- `server/index.ts` — WebSocket upgrade, `ChatWsData`, message handler, `runChatTurn()`, `processActivateSession()`
- `server/chat.ts` — `ChatMessage`, `streamChatCompletion()`
- `server/wop-session-jsonl.ts` — JSONL persistence
- `server/session-prompts.ts` — System prompt composition
- `server/agents.ts` — Agent scanning, parsing, skill resolution
- `server/chat-slash-commands.ts` — Slash command evaluation
- `server/chat-orchestrator-tools.ts` — Tool calling
- `server/chat-usage.ts` — Token counting
- `server/chat-context-budget.ts` — Context window management

**Helper files:**
- `src/utils/workspaceChatAgentPicker.ts` — Agent picker helpers
- `src/utils/workspaceAgentDisplay.ts` — Agent display names
- `src/utils/agentPermissionsStorage.ts` — Agent permissions
- `src/utils/chatQueueTranscript.ts` — Chat queue transcript
- `src/utils/chatSlashAutocomplete.ts` — Slash command autocomplete
- `src/utils/chatComposerInjectBus.ts` — Composer injection
- `src/lib/chatAttachment.ts` — Attachment handling
- `src/lib/parseMessageSegments.ts` — Message parsing

### Bug: Extra chat bubble during thinking (unsolved)

When the chat starts and the AI begins thinking (reasoning), **two bubbles appear simultaneously**:
1. **Top bubble** — shows thinking text
2. **Bottom bubble** — empty

When the AI response comes after thinking, they merge into one bubble. The bug is likely in how `assistant_turn_start`, `assistant_reasoning_delta` and `assistant_delta` are handled in `useWoSession.ts` (processMessage around lines 223–313) — an extra empty bubble is created at `assistant_turn_start` and another at the first `assistant_delta`.

### Why This Matters

- Users see the same generic greeting regardless of view → think the chat is broken
- Different surfaces have different use cases (Claw = code, Docs = documentation, Kanban = planning) — sharing history confuses the LLM
- Agents and skills are completely unusable due to WOP_WORKSPACE path issue
- Double-bubble is visually distracting

## Requirements

### Functional Requirements
- [x] Each surface has its own WebSocket isolation (own session/state)
- [x] Each surface has its own chat tabs not visible in other surfaces
- [x] JSONL files saved per surface: `wo-chat-<surface>-<sessionKey>.jsonl` (rename from `wayofpi-chat-`)
- [x] **Correct agent auto-selected per surface** – Claw → claw, Docs → docs (new), Kanban → kanban, Simple → null (Orchestrator)
- [x] Agents from `.wo/agents/` must be accessible to the server (fix WOP_WORKSPACE or agent scan roots)
- [x] Skills from `.wo/skills/` must work
- [x] Create docs agent (`docs.md`) for documentation work
- [x] Double-bubble during thinking fixed – exactly one bubble per assistant-turn

### Out of Scope
- Complete rebuild of WebSocket architecture
- Changing existing JSONL structure for historical sessions

## Acceptance Criteria

### Automated Verification
- [x] Build completes: `bun run build`

### Manual Verification
- [x] Open Claw view — chat should automatically use `claw` agent
- [x] Open Docs view — chat should automatically use `docs` agent
- [x] Open Kanban view — chat should automatically use `kanban` agent
- [x] Switch view mid-conversation — chat in previous view preserved
- [x] Verify agent skills are loaded (e.g. `kanban-time` for kanban agent)
- [x] Verify thinking doesn't create double bubbles
## Technical Notes

### Changes already made (2026-05-22)
- ✅ `workspace/.wo` → `../.wo` — symlink so agents & skills are found by server
- ✅ `.wo/agents/docs.md` — new docs agent created

### Affected Components (remaining work)
- `server/index.ts` – WebSocket state isolation per surface
- `server/wop-session-jsonl.ts` – surface-prefixed JSONL file names
- `server/session-prompts.ts` – surface-dependent agent auto-select
- `server/chat-slash-commands.ts` – `/clear` etc per surface
- `src/hooks/useWoSession.ts` – session isolation per surface, fix extra bubble bug
- `src/components/ChatPanel.tsx` – surface-aware tab rendering and auto agent-select
- `src/components/simple/SimpleChatView.tsx` – generic auto-select instead of hardcoded `clawChrome`
- `src/App.tsx` – routing for surface-aware session

### Agent Auto-Select Strategy — Current & Desired State

**Current implementation — fragmented and hardcoded:**

| Surface | Auto-select | Where | Mechanism |
|---|---|---|---|
| **Claw** | ✅ `claw` | `ReferenceApp.tsx` (lines 2250–2302) + `ClawChatView`/`SimpleChatView` | Navigation effect + `sessionLeadFallbackLabel="Claw"` with hardcoded `clawChrome` check |
| **Kanban** | ✅ `kanban` | `KanbanChatPanel.tsx` (lines 24–29) | `useEffect` with `agentSetRef` guard, calls `setChatAgent("kanban")` |
| **Docs** | ❌ None | — | `DocsApp.tsx` passes **no** `sessionLeadFallbackLabel` props, never calls `setChatAgent` |
| **Simple** | ✅ None (Orchestrator) | `ReferenceApp.tsx` | Explicitly set to `null` on navigation |

**Problems:**
1. **Hardcoded agent selection** — `SimpleChatView.tsx` (lines 156–161) has `const clawChrome = sessionLeadFallback === "Claw"` which only works for Claw. Other surfaces cannot use the same mechanism without code changes.
2. **Shared session** — All surfaces call `session.setChatAgent()` globally. When Kanban sets agent to `kanban`, Simple and Docs are affected. `KanbanChatPanel` has its own `useWoSession()` instance but still shares the same WebSocket/session as the rest.
3. **No cleanup** — No surface resets the agent when navigating away (except `ReferenceApp.tsx` which supports `simple`, `technical` and `claw` — but not `docs` or `kanban`).

**Desired implementation:**

Each surface should automatically select the correct agent with a unified mechanism:

- **Surface → Agent mapping** (in a central config, e.g. in `src/App.tsx` or a new `surface-agents.ts`):
  ```
  simple → null (Orchestrator)
  claw   → "claw"
  docs   → "docs"
  kanban → "kanban"
  work   → null
  admin  → null
  ```

- **On navigation** (in router/navigation effect): call `session.setChatAgent(mapping[surface])` when user switches views.

- **On surface init** (in page component): call `session.setChatAgent(agentName)` with `useRef` guard (like Kanban) if the agent isn't already set for that surface.

- **SimpleChatView generic**: Replace `clawChrome` with a generic `autoSelectAgent` prop or derive the agent name from `sessionLeadFallbackLabel.toLowerCase()`:
  ```tsx
  // Instead of hardcoded clawChrome:
  const autoAgent = sessionLeadFallbackLabel?.trim().toLowerCase() || null;
  const useAutoAgent = autoAgent && agentAvailable(autoAgent);
  const sessionPick = useAutoAgent && !sessionPickRaw ? autoAgent : sessionPickRaw;
  ```

### Arkitektur: workspace vs system

```
/home/zerwiz/CodeP/wayofwork/                   ← System (app-kod, server, repo)
  ├── server/                                   ← Bun-server, API, WebSocket
  ├── src/                                      ← React-frontend
  ├── .wo/
  │   ├── agents/                               ← Agent .md-filer (kanonisk källa)
  │   ├── skills/                               ← Skill .md-filer
  │   ├── agent/auth.json                       ← Auth (legacy, kept for compat)
  │   ├── agent/sessions/                       ← Sessions (legacy)
  │   └── ...
  ├── .claw/                                    ← CLAW per-user workspace (privat per person)
  │   ├── workspace/
  │   │   ├── SOUL.md                           ← Claw identity
  │   │   ├── AGENTS.md                         ← Claw agent config
  │   │   ├── USER.md                           ← User profile
  │   │   ├── MEMORY.md                         ← Memory store
  │   │   ├── HEARTBEAT.md                      ← Heartbeat log
  │   │   ├── TOOLS.md                          ← Tool definitions
  │   │   ├── SECURITY.md                       ← Security rules
  │   │   └── memory/YYYY-MM-DD.md              ← Daily session logs
  │   ├── telegram.json                         ← Telegram config
  │   ├── whatsapp.json                         ← WhatsApp config
  │   ├── schedule/
  │   │   ├── claw-schedules.v1.json            ← Schedule definitions
  │   │   └── claw-schedule-runs.v1.json        ← Schedule run history
  │   └── mission-events/
  │       └── claw-mission-events.v1.json       ← Automation run events
  ├── data/                                     ← SQLite databaser
  │   └── wayofwork.sqlite                      ← All affärsdata (tenants, users, projects, etc)
  └── workspace/                                ← Företags-globala filer (användardata)
      ├── .wo → ../.wo                          ← SYMLINK — agents & skills tillgängliga
      ├── github-credentials.json               ← GitHub PAT (känsligt)
      └── ...
      ├── agent/
      │   └── sessions/                         ← Chat-transkript (JSONL)
      │       └── wo-chat-*.jsonl
      ├── plans/                                ← Planeringsdokument
      │   └── PLAN-*.md
├── agents/                               ← Scan-root agents
├── .claude/agents/                       ← Scan-root (Claude)
├── .cursor/agents/                       ← Scan-root (Cursor)
├── skills/                               ← Scan-root skills
├── .claude/skills/                       ← Scan-root (Claude)
├── .cursor/skills/                       ← Scan-root (Cursor)
      └── [dokument, ritningar, fakturor, etc]  ← Företagets filer
```

**Why:** The server's agent scanner looks under `WOP_WORKSPACE/.wo/agents/` (= `workspace/.wo/agents/`). Agents and skills must exist in the workspace for the server to find them. `.wo/` in the repo root is the canonical source, the workspace has a symlink. Claw has its own private workspace under `.claw/` (per person), while `workspace/` is for company-global files.

**Future Docker setup:** Workspace is mounted as a volume with `.wo/` copied or mounted inside.

### Changes already made (2026-05-22)
1. **Created symlink** `workspace/.wo` → `../.wo` — agents and skills now accessible to the server
2. **Created docs agent** `.wo/agents/docs.md` — new agent for documentation work

---

## Meta

**Created**: 2026-05-22
**Updated**: 2026-05-22 (fully translated to English)
**Priority**: High
**Estimated Effort**: L
