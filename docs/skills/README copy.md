# AI Engineering Harness — Skills Registry

Canonical source of truth for all AI skills across all supported frontends.

## Overview

| Metric | Value |
|--------|-------|
| Total skills in harness | 67 |
| Supported frontends | 7 (Claude, OpenCode, Gemini, Pi, Wo Coder, Antigravity, Codex) |
| Registry | `skill-registry.json` |

## Installation Status Per Tool

| Tool | Dir exists | Skills installed | Status |
|------|:----------:|:----------------:|--------|
| **Pi** | ✅ `~/.pi/agent/skills/` | 33 of 67 | Partial — 6 have truncated descriptions (`>`), missing `wow_*` skills |
| **OpenCode** | ✅ `~/.config/opencode/skills/` | 19 of 67 | Partial — has `wow_*` skills but missing Pi-specific, otel, codebase agents |
| **Gemini CLI** | ✅ `~/.gemini/skills/` | 18 of 67 | Partial — has unique skills (`create_plan`, `worktree`) but missing most |
| **Codex** | ✅ `~/.codex/skills/` | **0 of 67** | Empty — needs full install |
| **Claude Code** | ❌ `~/.claude/skills/` | **0 of 67** | Missing — directory does not exist |
| **Antigravity** | ❌ `~/.antigravity/skills/` | **0 of 67** | Missing — directory does not exist |
| **Wo Coder** | ❌ `~/.wocoder/skills/` | **0 of 67** | Missing — directory does not exist (if used) |

## All 67 Skills

### Core Platform Skills (shared across tools)

| Skill | Registry | Pi | OpenCode | Gemini | Description |
|-------|:--------:|:--:|:--------:|:------:|-------------|
| `ticket-manager` | ✅ all 7 | ❌ | ❌ | ❌ | Manage tickets across all namespaces with full lifecycle |
| `team-setup` / `team_setup` | ✅ all 7 | ❌ | ❌ | ❌ | Initialize and manage team configuration |
| `skill-auto-update` / `skill_auto_update` | ✅ all 7 | ❌ | ❌ | ❌ | Auto-discover and sync skills across frontends |
| `auto-ticket-creator` / `auto_ticket_creator` | ✅ all 7 | ❌ | ❌ | ❌ | Monitor and auto-create tickets from changes |
| `docs-sync-updater` / `docs_sync_updater` | ✅ all 7 | ❌ | ❌ | ❌ | Fetch latest docs and auto-update skill configs |
| `cto-dashboard` / `cto_dashboard` | ✅ all 7 | ❌ | ❌ | ❌ | CTO dashboard with review queue and developer progress |
| `skill-adapter` / `skill_adapter` | ✅ all 7 | ❌ | ❌ | ❌ | Platform-specific skill loading and format adapters |
| `help-command` / `help_command` | ✅ all 7 | ❌ | ❌ | ❌ | Unified /help across all platform frontends |
| `backlog_groomer` | ✅ all 7 | ❌ | ❌ | ❌ | Product & Ticket Manager (transforms ideas to tickets) |
| `ticket_context` | ✅ all 7 | ❌ | ❌ | ❌ | Associate work with a specific ticket ID |
| `wow_tickets` | ✅ all 7 | ❌ | ❌ | ❌ | Manage understanding tickets (WOW-prefixed) |

### Common Development Skills (installed on 2-3 tools)

| Skill | Pi | OpenCode | Gemini | Notes |
|-------|:--:|:--------:|:------:|-------|
| `experimental-pr-workflow` | ✅ | ✅ | ✅ | Naming: Pi `-`, OpenCode `-`, Gemini `_` |
| `git-commit-helper` / `git_commit_helper` | ✅ | ✅ | ✅ | Naming: Pi/OpenCode `-`, Gemini `_` |
| `improve-codebase-architecture` | ✅ | ✅ | ✅ | Consistent name across tools |
| `init-harness` / `init_harness` | ✅ | ✅ | ✅ | Naming: Pi `-`, OpenCode/Gemini `_` |
| `interview` | ✅ | ✅ | ✅ | Consistent |
| `pr-description-generator` / `pr_description_generator` | ✅ | ✅ | ✅ | Naming: Pi/OpenCode `-`, Gemini `_` |
| `prd-to-issues` / `prd_to_issues` | ✅ | ✅ | ✅ | Naming: Pi/OpenCode `-`, Gemini `_` |
| `tdd` | ✅ | ✅ | ✅ | Consistent |
| `write-a-prd` / `write_a_prd` | ✅ | ✅ | ✅ | Naming: Pi/OpenCode `-`, Gemini `_` |
| `observability-driven-development` / `observability_driven_development` | ✅ (desc broken) | ✅ (desc broken) | ⚠️ named `validate_telemetry` | **Different name in Gemini!** Descriptions truncated on Pi + OpenCode |

### Pi-Only Skills (installed on Pi, not on OpenCode/Gemini)

`agent-creation`, `codebase-analyzer`, `codebase-locator`, `codebase-pattern-finder`, `code-rewiew`, `context-loader`, `create-extension`, `doc-generating`, `file-deletion-protection`, `github`, `indexer`, `planning`, `ralph`, `rules-lookup`, `skill-creation`, `thoughts-analyzer`, `thoughts-locator`, `web-search-researcher`, `otel-collector`, `otel-instrument`, `otel-instrumentation`, `otel-ottl`, `otel-semantic-conventions`

### OpenCode-Only Skills (WoW platform)

`wow_access_control`, `wow_agent_dev`, `wow_backend_dev`, `wow_backlog_groomer`, `wow_communications`, `wow_core_architecture`, `wow_frontend_dev`, `wow_human_in_the_loop`, `wow_ui_surfaces`

### Gemini-Only Skills

`commit`, `create_plan`, `debug`, `debug_k8s`, `implement_plan`, `research_codebase`, `validate_plan`, `worktree`

### Harness-Only Skills (in registry, NOT installed on any tool)

- `ticket-manager` / `ticket_manager`
- `team-setup` / `team_setup`
- `skill-auto-update` / `skill_auto_update`
- `auto-ticket-creator` / `auto_ticket_creator`
- `docs-sync-updater` / `docs_sync_updater`
- `cto-dashboard` / `cto_dashboard`
- `skill-adapter` / `skill_adapter`
- `help-command` / `help_command`
- `backlog_groomer`
- `ticket_context`
- `wow_tickets`

### Missing Entirely

- **Codex**: 0 skills installed (empty dir) — needs setup
- **Claude Code**: No skills directory — needs `mkdir` + setup
- **Antigravity**: No skills directory — needs `mkdir` + setup

## Naming Inconsistencies

The same skill has different names across tools:

| Canonical Name | Pi | OpenCode | Gemini |
|----------------|:--:|:--------:|:------:|
| `init-harness` | `init-harness` | `init_harness` | `init_harness` |
| `git-commit-helper` | `git-commit-helper` | `git-commit-helper` | `git_commit_helper` |
| `pr-description-generator` | `pr-description-generator` | `pr-description-generator` | `pr_description_generator` |
| `prd-to-issues` | `prd-to-issues` | `prd-to-issues` | `prd_to_issues` |
| `write-a-prd` | `write-a-prd` | `write-a-prd` | `write_a_prd` |
| `observability-driven-development` | `observability-driven-development` | `observability-driven-development` | `validate_telemetry` ⚠️ |

## Broken Skills (truncated descriptions)

These skills have `>` as their description instead of real text (broken YAML frontmatter):

- Pi: `observability-driven-development`, `otel-collector`, `otel-instrument`, `otel-instrumentation`, `otel-ottl`, `otel-semantic-conventions`
- OpenCode: `observability-driven-development`
- Gemini: `validate_telemetry`

## Ticket-Creation Skills Per Tool

| Skill | Creates tickets? | Pi | OpenCode | Gemini |
|-------|:----------------:|:--:|:--------:|:------:|
| `planning` / `create_plan` | ✅ Plans | ✅ | ❌ | ✅ |
| `prd-to-issues` / `prd_to_issues` | ✅ Issues from PRD | ✅ | ✅ | ✅ |
| `experimental-pr-workflow` | ✅ Retroactive | ✅ | ✅ | ✅ |
| `backlog_groomer` | ✅ Tickets from ideas | ❌ | ❌ | ❌ |
| `ticket-manager` / `ticket_manager` | ✅ Full lifecycle | ❌ | ❌ | ❌ |
| `auto-ticket-creator` / `auto_ticket_creator` | ✅ Auto from changes | ❌ | ❌ | ❌ |
| `wow_backlog_groomer` | ✅ WoW tickets | ❌ | ✅ | ❌ |
| `wow_tickets` | ✅ WOW-prefixed | ❌ | ❌ | ❌ |
| `ticket_context` | ❌ (linking only) | ❌ | ❌ | ❌ |

## Recommendations

1. **Unify naming** — Pick one convention (recommend snake_case for registry, convert per-tool)
2. **Fix broken descriptions** — 8 skills have truncated YAML frontmatter
3. **Install missing tools** — Codex, Claude Code, Antigravity need `mkdir` + `setup.sh`
4. **Sync harness skills to all tools** — Registry claims all 7 platforms but only 3 have partial installs
5. **Cross-tool ticket skills** — Only OpenCode has `wow_backlog_groomer`; Pi/Gemini need equivalent
