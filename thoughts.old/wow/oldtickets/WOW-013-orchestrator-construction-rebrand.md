# WOW-013 [Orchestrator & GitHub for Construction] GitHub version control + orchestrator dispatch for construction users

## Problem Statement

**GitHub complexity:** GitHub is currently presented as a developer tool (branches, PRs, merge commits). Construction workers and project managers do not know or care about Git — they need simple "save my document" and "go back to yesterday's version." GitHub should be invisible infrastructure for version-controlled document storage.

**Orchestrator confusion:** The "Orchestrator" is currently the fallback agent for all chat surfaces (Claw, Docs, Kanban, Simple) showing a generic "Hi! I'm ready to help" message. Each surface should use its own specialized agent. The Orchestrator should be the **Simple mode system agent** — the main Way of Work application agent only for the Simple interface, responsible for coordinating the platform, dispatching to sub-agents, and handling system-level tasks. Other chat interfaces (Claw, Docs, Kanban) should use their own specific agents and never fall back to Orchestrator.

**No automatic backups:** Documents, price lists, offers, and workspace files have no automatic version control. If something is deleted or overwritten, there is no way to recover.

## Desired Outcome

1. **GitHub as invisible document storage** — construction users see "Save version" and "View history" buttons, not "git push" and "git checkout"
2. **Automated daily backup** — workspace changes pushed to GitHub daily with organized branch names (`backup/2026-05-22`)
3. **Agent skill for document storage** — agents can call a `workspace_snapshot` or `doc_save` skill to commit and push documents
4. **Orchestrator = Way of Work Simple mode agent + channel handler** — handles system-level tasks for the Simple interface AND all inbound Telegram/WhatsApp traffic into the platform. Channel messages route through Orchestrator which dispatches to appropriate sub-agents.
5. **Sub-agent dispatch** — Orchestrator can send out specialised agents (fakturering, projektledare, forskare) as sub-agents for specific subtasks
6. **Surface-specific agents (no Orchestrator fallback)** — Claw uses claw agent, Docs uses docs agent, Kanban uses kanban agent. Orchestrator is only for Simple mode (UI) + channel message handling.

## Context & Background

### Current State

**GitHub integration:**
- `github-connection.ts` stores a PAT in `workspace/.wo/github-credentials.json` (migrate from legacy `.wayofpi/`)
- `orchestrator-git-tools.ts` provides raw Git tools: `git_add`, `git_commit`, `git_push`, `git_branches`, `git_checkout`, `git_merge`
- Tools are exposed as orchestrator function tools — only usable by LLM agents that know Git
- No UI for non-developer users

**Orchestrator:**
- Orchestrator is the default "session lead" when no agent is selected
- Uses a orchestrator system prompt with dispatch tools (no direct git/bash access)
- Shows generic greeting: "Hi! I'm ready to help with your Way of Work session"
- No surface awareness — used the same way in Claw, Docs, Kanban, and Simple
- No sub-agent dispatch mechanism

**Surface agents:**
- Claw has auto-select logic for `claw.md` agent
- Kanban has auto-select logic for `kanban.md` agent
- Docs has NO auto-select logic (missing)
- Simple uses Orchestrator (no agent)
- All surfaces share the same WebSocket session (WOW-012)

### Why This Matters

- Construction workers need "save my drawing" not "git commit -m"
- Project managers need "show me yesterday's version" not "git log"
- Daily automated backups prevent data loss
- Each surface needs the right agent personality and tools
- Orchestrator should orchestrate, not be a generic chat bot

## Requirements

### Functional Requirements

#### Phase 1: GitHub Simplification
- [ ] Rename "GitHub" to "Version Storage" or "Backup" in UI
- [ ] Add "Save Version" button in Docs view that runs `git_add` + `git_commit` + `git_push` invisibly
- [ ] Add "Version History" view showing dates/commits without Git terminology
- [ ] Add "Restore Version" that checks out a previous commit to a temp branch
- [ ] Configure default git user name/email from env or settings
- [ ] GitHub connection UI in Admin Console (token + login, not CLI)

#### Phase 2: Automated Daily Backup
- [ ] Daily cron/schedule at 23:00 that:
  - Creates branch `backup/YYYY-MM-DD` from current state
  - Adds all workspace changes (`git_add --all`)
  - Commits with message: "Daily backup YYYY-MM-DD"
  - Pushes to origin
- [ ] Keep last 30 daily backups (auto-prune older remote branches)
- [ ] Backup only workspace files (not `.wo/` internal state, `agent/sessions/`)
- [ ] Admin toggle: enable/disable automatic backups
- [ ] Backup status indicator in Admin Console

#### Phase 3: Agent Skill for Document Storage
- [x] Create `.wo/skills/workspace-storage/SKILL.md`:
  - `workspace_snapshot` — commit workspace state with description
  - `doc_history <path>` — show version history for a file
  - `doc_restore <path> <version>` — restore file from version
  - `workspace_backup_status` — check last backup time
- [x] Wire skill into agents: `fakturering`, `projektledare`, `docs`
- [x] Agents can save documents after creating/modifying them

#### Phase 4: Orchestrator Rework
- [x] Orchestrator becomes the **Way of Work Simple mode agent + channel handler** — not a generic chat bot
- [x] Orchestrator handles all inbound Telegram/WhatsApp traffic (see WOW-015)
- [x] Channel messages route through Orchestrator which dispatches to appropriate sub-agents
- [x] Orchestrator system prompt describes: coordinating the platform, dispatching sub-agents, channel message handling, system configuration, user management
- [x] Orchestrator has a `dispatch_agent <name> <task>` tool that:
  - Spawns a sub-agent with the given name
  - Passes the task description as context
  - Receives the sub-agent's output/result
  - Returns the result to the user
- [x] Sub-agent dispatch is isolated — each dispatch gets a fresh context (not shared history)
- [x] Orchestrator can dispatch: `fakturering` (create offer), `projektledare` (cost estimate), `forskare` (research price), `schemaplanerare` (plan schedule)
#### Phase 5: Surface-Specific Agents
- [x] **Simple** → Orchestrator (system agent, no specialized tools)
- [x] **Claw** → `claw` agent (coding/workspace management)
- [x] **Docs** → `docs` agent (document writing + workspace-storage skill)
- [x] **Kanban** → `kanban` agent (board management + time tracking)
- [x] Each surface auto-selects its agent on navigation (see WOW-012)
- [ ] Agent cleanup when leaving a surface — orchestrator takes over in Simple
### Out of Scope
- Git GUI or diff viewer in the browser — future
- Multi-repo backup (one GitHub repo per tenant) — future
- S3/alternative storage backends — future
- Automatic conflict resolution — future
- End-to-end encryption of backed-up files — future

## Acceptance Criteria

### Automated Verification
- [x] Build completes: `bun run build`

### Manual Verification
- [ ] Admin can connect GitHub via Admin Console with PAT
- [ ] "Save Version" in Docs creates a git commit + push
- [ ] "Version History" shows list of previous versions with timestamps
- [ ] Daily backup runs and creates `backup/YYYY-MM-DD` branch
- [ ] Old backups (>30 days) are pruned automatically
- [x] Agent can call `workspace_snapshot` to save documents
- [x] Orchestrator can dispatch `fakturering` as sub-agent to create an offer
- [x] Sub-agent result is returned to user through Orchestrator
- [x] Claw uses `claw` agent by default
- [x] Docs uses `docs` agent by default
- [x] Kanban uses `kanban` agent by default
- [x] Simple uses Orchestrator by default
## Technical Notes

### Git for Non-Developers

The key insight: construction users should never see or type Git commands. All Git operations are triggered by UI buttons or agent tool calls:

```
User clicks "Save Version"
  → UI calls POST /api/workspace/snapshot
  → Server runs: git add -A && git commit -m "Saved by <user> at <timestamp>" && git push
  → Response: { ok: true, version: "abc1234", timestamp: "2026-05-22T14:30:00" }
```

```
User clicks "Version History" for file X
  → UI calls GET /api/workspace/history?path=X
  → Server runs: git log --oneline --follow -- <path>
  → Response: { versions: [{ hash, message, date, author }] }
```

```
User clicks "Restore" for file X at version abc1234
  → UI calls POST /api/workspace/restore
  → Server runs: git checkout abc1234 -- <path>
  → Response: { ok: true, path, restoredVersion }
```

### Daily Backup Schedule

```
23:00 daily via ClawScheduleExecutor:
  1. Check if backups enabled (config in DB or workspace settings)
  2. Run: git add -A (respecting .gitignore)
  3. Run: git commit -m "Daily backup YYYY-MM-DD" (allow-empty if no changes)
  4. Run: git push origin backup/YYYY-MM-DD
  5. Prune: delete remote branches backup/ older than 30 days
  6. Log: results to workspace .wo/backup-log.json
```

### Agent Skill: workspace-storage

```
Skill file: .wo/skills/workspace-storage/SKILL.md

Available tools:
  workspace_snapshot(path?, description?)
    - Commit current state or specific file
    - path: optional, single file to snapshot (default: all workspace)
    - description: optional human-readable note

  doc_history(path)
    - Return version history for a file
    - path: required, workspace-relative file path

  doc_restore(path, version)
    - Restore file from a previous version
    - path: required, workspace-relative
    - version: commit hash or "latest", "previous"
```

### Orchestrator Sub-Agent Dispatch

The `dispatch_agent` tool allows the Orchestrator to call specialized agents:

```
User: "Create an offer for project X"
Orchestrator:
  → dispatch_agent("fakturering", "Create offer for project #42, client is ByggAb")
  → fakturering agent runs in isolated context:
      - Uses its own skills (document-generation, client-communication)
      - Calls POST /api/offers to create the offer
      - Returns: { result: "Offer ANB-2026-015 created", offerId: "..." }
  → Orchestrator receives result
  → Orchestrator: "Done! Offer ANB-2026-015 created for ByggAb, project X. Total: 45 000 SEK"
```

Technical approach:
- `dispatch_agent` creates a temporary sub-session on the server
- The sub-agent gets only the task description + its own skills as system prompt
- The sub-agent runs its own tool loop (isolated)
- The sub-agent's final response is captured and returned
- The sub-agent session is discarded after completion
- Implementation: new endpoint `POST /api/agents/dispatch` or via WebSocket message type `dispatch`

### Surface Agent Mapping

Central config (shared between frontend and server):
```
simple → null         (Orchestrator — system agent)
claw   → "claw"       (coding/workspace)
docs   → "docs"       (documents + workspace-storage)
kanban → "kanban"     (boards + time)
work   → null         (Orchestrator)
admin  → null         (Orchestrator)
```

### Affected Components
- `server/github-connection.ts` — extend with backup schedule config
- `server/workspace-snapshot.ts` — **New file**: workspace snapshot/restore API
- `server/backup-scheduler.ts` — **New file**: daily backup schedule
- `server/agent-dispatch.ts` — **New file**: sub-agent dispatch handler
- `server/orchestrator-git-tools.ts` — add `workspace_snapshot` tool
- `server/index.ts` — new API routes + WebSocket dispatch message type
- `server/claw-schedule-executor.ts` — daily backup schedule entry
- `src/pages/AdminDashboard.tsx` — GitHub connection UI, backup toggle
- `src/components/docs/DocsApp.tsx` — "Save Version" / "Version History" buttons
- `.wo/skills/workspace-storage/SKILL.md` — **New skill**
- `.wo/agents/orchestrator.md` — **New agent**: orchestrator system prompt
- Various agent `.md` files — update to use workspace-storage skill

---

## Meta

**Created**: 2026-05-22
**Priority**: High
**Estimated Effort**: XL
**Depends on**: WOW-012 (chat per surface), WOW-010 (human-in-the-loop)
