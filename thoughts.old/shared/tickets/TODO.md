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
- [x] [PROJ-013](./aiharness/harness/PROJ-013-implement-ticket-manager-skill.md): Implement Ticket Manager Skill — skill dir, SKILL.md, ticket-schema.json, tools.json, sync.ts, cross-platform wrappers
- [x] [PROJ-014](./aiharness/skills/PROJ-014-skill-auto-update-sync.md): Skill Auto-Update & Sync — sync-skills.ts with --status, --dry-run, --watch, ref-skill guard
- [x] [PROJ-015](./aiharness/agents/PROJ-015-agent-namespacing-separation.md): Agent Namespacing — agents/ dir created with agent-registry.json, 6 core agents copied, loader precedence documented
- [x] [PROJ-016](./aiharness/skills/PROJ-016-import-ref-skills-agents.md): Import Ref Skills/Agents — import-ref-skills.ts, 59 ref skills imported to all 6 platforms (354 imports, 0 errors); codex added as 7th via adapter
- [x] [PROJ-017](./aiharness/docs-sync/PROJ-017-auto-ticket-creation-skill.md): Auto-Ticket Creation Skill — monitor.ts with git/npm/ref/codebase/platform source adapters
- [x] [PROJ-018](./aiharness/team/PROJ-018-team-project-setup.md): Team & Project Setup — team-init.ts with init/list/add/assign commands, cross-platform wrappers
- [x] [PROJ-019](./aiharness/team/PROJ-019-cto-dashboard-reporting.md): CTO Dashboard & Developer Reporting — dashboard.ts with --summary, --review, --dev, --aging, --json, --watch
- [x] [PROJ-020](./aiharness/skills/PROJ-020-platform-specific-skill-loading.md): Platform-Specific Skill Loading — adapter.ts generate/list/validate CLI, 7 platforms (claude/opencode/gemini/pi/wocoder/antigravity/codex)
- [x] [PROJ-021](./aiharness/team/PROJ-021-personal-todo-hierarchy.md): Personal TODO Hierarchy — sync_personal_todos() implemented in ticket-manager/sync.ts
- [x] [PROJ-022](./aiharness/docs-sync/PROJ-022-docs-sync-updater.md): Documentation Sync Updater — docs-sync.ts already existed, stub skill created linking to it
- [x] [PROJ-023](./aiharness/templates/PROJ-023-ticket-folder-organization.md): Ticket Folder Organization — already done (migrate-tickets.ts exists, tickets in categorized subfolders)
- [x] [PROJ-024](./aiharness/commands/PROJ-024-ai-harness-help-command.md): /help Command — help.ts with overview/skills/commands/agents/detail/workflow views, SKILL.md, wrappers, registry
- [x] [PROJ-025](./aiharness/harness/PROJ-025-codex-first-class-platform.md): Platform-Agnostic Cleanup & Codex Integration — stripped hardcoded PROJ refs, made help.ts data-driven, created codex/ platform dir, manifest/installer/setup.sh/docs
- [ ] [PROJ-026](./aiharness/harness/PROJ-026-centralized-ticket-repo.md): Centralized Ticket Repository — extract thoughts/ into shared f-rr-d repo, clone on init, per-project subfolders
  - [x] Push wayofmono thoughts/ to f-rr-d (thoughts/wayofmono/)
  - [x] Remove thoughts/ from wayofmono git tracking + .gitignore
  - [x] Create harness.json config (project_slug, f_rrd_url)
  - [x] Update sync.ts — pull/push from f-rr-d, project-scoped paths
  - [x] Update team-init.ts — clone f-rr-d on init, create project dirs, harness config
  - [x] Update monitor.ts — pull before scan, push after ticket creation
  - [x] Update dashboard.ts — pull before load
  - [x] Update help.ts — project-scoped path references
  - [x] Copy updated files to all 7 platforms

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
├── system/
└── aiharness/
    ├── harness/
    ├── skills/
    ├── agents/
    ├── team/
    ├── templates/
    ├── commands/
    └── docs-sync/
```

## Next Actions

1. ✅ All system tickets (PROJ-013 through PROJ-025) implemented — 8 system skills, 59 ref skills, 6 core agents, 7 platforms (codex added)
2. Use `deno run packages/@aiengineeringharness/skills/ticket-manager/sync.ts --sync-todos` to generate personal TODOs
3. Use `deno run packages/@aiengineeringharness/skills/team-setup/team-init.ts init` to init team config
4. Use `deno run packages/@aiengineeringharness/skills/help-command/help.ts` to explore the harness
5. Tackle [PROJ-010](./architecture/PROJ-010-bootstrap-wocoder.md) (Bootstrap WoCoder) or [PROJ-011](./architecture/PROJ-011-fix-npm-packages-republish.md) (Fix NPM packages) next