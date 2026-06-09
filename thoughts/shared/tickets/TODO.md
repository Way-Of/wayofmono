# Wo — COMPREHENSIVE STATUS (2026-06-09)

## Architecture

```
wo-ai (providers) — 50 files from pi/ai/src/
  ↑
wo-tui (terminal UI) — 25 files from pi/tui/src/
  ↑
wo-agent-core (runtime) — 25 files from pi/agent/src/
  ↑
wo-agent (USER AGENT SDK) — ~139 files from pi/coding-agent/src/ (no cli.ts, no bun/)
  ↑
wo-coding-agent (CLI BINARY) — ~141 files from pi/coding-agent/src/ (keeps everything)
```

## Package Status

| Package | Files | tsconfig | Imports Fixed | tsc build | Assets copied |
|---------|-------|----------|---------------|-----------|---------------|
| wo-ai | 50 | ✅ | ✅ | ✅ | N/A |
| wo-tui | 25 | ✅ | ✅ | ✅ | N/A |
| wo-agent-core | 25 | ✅ | ✅ | ✅ | N/A |
| wo-agent | ~139 | ✅ | ✅ | ✅ | ✅ |
| wo-coding-agent | ~141 | ✅ | ✅ | ✅ | ✅ |
| telemetry | 5 | ✅ | N/A (native) | ✅ | N/A |
| lens | 14 .ts + 800+ .yml | ✅ | N/A | ✅ (9 missing modules created) | N/A |
| wo-web-ui | 8 files | ✅ | N/A | ✅ (React 19 components) | N/A |

## Key Differences: wo-agent vs wo-coding-agent

| Aspect | wo-agent (SDK) | wo-coding-agent (CLI) |
|--------|---------------|----------------------|
| `cli.ts` | ❌ Removed | ✅ Kept |
| `bun/` dir | ❌ Removed | ✅ Kept |
| `bin` in pkg.json | ❌ None | ✅ `"wo": "src/cli.ts"` |
| Intended use | `import { createAgent } from "@wayofmono/wo-agent"` | `npx wo` |

## Active Tickets (Categorized)

### System (Harness, Tools, Team, Templates)
- [x] [PROJ-013](./system/harness/PROJ-013-implement-ticket-manager-skill.md): Implement Ticket Manager Skill — skill dir, SKILL.md, ticket-schema.json, tools.json, sync.ts, cross-platform wrappers
- [x] [PROJ-014](./system/skills/PROJ-014-skill-auto-update-sync.md): Skill Auto-Update & Sync — stub skill created (needs full sync logic)
- [x] [PROJ-015](./system/agents/PROJ-015-agent-namespacing-separation.md): Agent Namespacing — agents/ dir created with agent-registry.json, 6 core agents copied, loader precedence documented
- [ ] [PROJ-016](./system/skills/PROJ-016-import-ref-skills-agents.md): Import Ref Skills/Agents — 58 ref skills and 6 ref agents identified, canonical structure created
- [x] [PROJ-017](./system/docs-sync/PROJ-017-auto-ticket-creation-skill.md): Auto-Ticket Creation Skill — stub skill created (needs source adapters)
- [x] [PROJ-018](./system/team/PROJ-018-team-project-setup.md): Team & Project Setup — team-init.ts created with init/list/add/assign commands, cross-platform wrappers
- [x] [PROJ-019](./system/team/PROJ-019-cto-dashboard-reporting.md): CTO Dashboard & Developer Reporting — stub skill created (needs dashboard TUI logic)
- [x] [PROJ-020](./system/skills/PROJ-020-platform-specific-skill-loading.md): Platform-Specific Skill Loading — stub skill created (needs platform generators)
- [x] [PROJ-021](./system/team/PROJ-021-personal-todo-hierarchy.md): Personal TODO Hierarchy — sync_personal_todos() implemented in ticket-manager/sync.ts
- [x] [PROJ-022](./system/docs-sync/PROJ-022-docs-sync-updater.md): Documentation Sync Updater — docs-sync.ts already existed, stub skill created linking to it
- [x] [PROJ-023](./system/templates/PROJ-023-ticket-folder-organization.md): Ticket Folder Organization — already done (migrate-tickets.ts exists, tickets in categorized subfolders)

### Architecture
- [ ] [PROJ-010](./architecture/PROJ-010-bootstrap-wocoder.md): Bootstrap WoCoder
- [ ] [PROJ-011](./architecture/PROJ-011-fix-npm-packages-republish.md): Fix NPM Package Contents and Republish
- [ ] [PROJ-012](./architecture/PROJ-012-fix-pnpm-workspace-protocol-for-bun-compat.md): Fix PNPM Workspace Protocol for Bun Compat

### AI Agents
- [ ] [WOW-001](./ai-agents/WOW-001-implement-ticket-manager-skill.md): Implement Ticket Manager Skill (WOW spec)

## Team Configuration (Current)

| Developer | Role | Projects | Folder |
|-----------|------|----------|--------|
| Craig | CTO | WO, OPT, PROJ | `thoughts/craig/` |
| Josef | Senior | WO, PROJ | `thoughts/josef/` |
| Andre | Junior | WO | `thoughts/andre/` |
| Tomas | Junior | WO | `thoughts/tomas/` |
| Zrewiz | Lead | WO, OPT, PROJ | `thoughts/zerwiz/` |

*Roles and project assignments are configurable per project via `.wo/config/team-config.json`*

## Personal TODO Structure

Each developer has:
- `thoughts/<dev>/TODO.md` - Auto-generated from assigned shared tickets + personal breakdown
- `thoughts/<dev>/tickets/` - Personal tickets (e.g., `CRAIG-001-review-prd.md`) linking to shared tickets via `parent_ticket`
- `thoughts/<dev>/plans/` - Personal plans
- `thoughts/<dev>/research/` - Personal research

## Ticket Folder Structure

```
thoughts/shared/tickets/
├── frontend/
├── backend/
├── architecture/
├── infrastructure/
├── communications/
├── ai-agents/
├── testing/
├── documentation/
├── security/
├── performance/
└── system/
    ├── harness/
    ├── skills/
    ├── agents/
    ├── team/
    ├── templates/
    └── docs-sync/
```

## Next Actions

1. ✅ Run `ai-harness team init` to configure team (PROJ-018) — script created
2. ✅ Run migration script to reorganize tickets into folders (PROJ-023) — already done
3. ✅ Implement Ticket Manager Skill (PROJ-013) — SKILL.md, schema, tools, sync.ts, wrappers done
4. 🔄 Implement full Skill Auto-Update logic (PROJ-014) — sync-skills.ts needed
5. 🔄 Implement full Skill Adapter platform generators (PROJ-020) — adapter.ts needed
6. 🔄 Implement full CTO Dashboard TUI (PROJ-019) — dashboard.ts needed
7. 🔄 Implement full Auto-Ticket Creator adapters (PROJ-017) — source-adapters/ needed
8. 🔄 Import 58 ref skills from ref/skills/ to harness structure (PROJ-016)
9. Use `deno run packages/@aiengineeringharness/skills/ticket-manager/sync.ts --sync-todos` to generate personal TODOs
10. Use `deno run packages/@aiengineeringharness/skills/team-setup/team-init.ts init` to init team config