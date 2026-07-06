# AI Engineering Harness

> **For AI Agents**: This document provides structured reference data for AI coding assistants. For human-readable documentation, see [README.md](README.md).

## Quick Reference

**Purpose**: Configuration harness for AI coding agents with reusable prompts, agents, and workflows.

**Supported Tools**: OpenCode, Claude Code, Pi, Wo Coder, Antigravity, Codex

**Installation**: `./setup.sh <tool>` (macOS/Linux) or `.\install.ps1 -Tool all` (Windows/PowerShell)

## Repository Structure

```
ai-engineering-harness/
├── skills/             # CANONICAL SKILLS (single source of truth)
│   ├── skill-registry.json   # Registry of all available skills
│   ├── ticket-manager/       # Ticket Manager (PROJ-013)
│   ├── team-setup/           # Team Setup (PROJ-018)
│   ├── skill-auto-update/    # Skill Auto-Update (PROJ-014)
│   ├── auto-ticket-creator/  # Auto-Ticket Creation (PROJ-017)
│   ├── docs-sync-updater/    # Docs Sync Updater (PROJ-022)
│   ├── cto-dashboard/        # CTO Dashboard (PROJ-019)
│   ├── skill-adapter/        # Skill Adapter (PROJ-020)
│   └── help-command/         # /help Command (PROJ-024)
├── agents/             # CORE AGENTS registry + definitions
│   ├── agent-registry.json   # Registry of all core agents
│   ├── codebase_analyzer.md
│   ├── codebase_locator.md
│   ├── codebase_pattern_finder.md
│   ├── thoughts_analyzer.md
│   ├── thoughts_locator.md
│   └── web_search_researcher.md
├── opencode/           → ~/.config/opencode/
│   ├── agents/         # 6 agents (snake_case)
│   ├── commands/       # 11 slash commands
│   ├── skills/         # 25+ skills (auto-triggered)
│   └── opencode.json   # MCP configuration
├── claude/             → ~/.claude/
│   ├── agents/         # 6 agents (snake_case)
│   ├── skills/         # 35+ skills (13 manual + 22+ auto)
│   ├── .mcp.json       # MCP configuration
│   └── settings.json   # Settings schema
│   ├── agents/         # 6 agents (snake_case)
│   ├── commands/       # 14 commands (TOML format)
│   └── skills/         # 33+ skills (auto-triggered)
├── pi/                 → ~/.pi/agent/
│   ├── agents/         # 6 agents (kebab-case)
│   ├── prompts/        # 11 prompt templates (Pi's commands)
│   ├── skills/         # 31+ skills (auto-triggered)
│   └── extensions/     # subagent extension (multi-agent workflows)
├── wocode/            → ~/.wocode/agent/
│   ├── agents/         # 13 agents (kebab-case, incl. subagent agents)
│   ├── extensions/     # subagent, open-editor, theme-cycler
│   ├── packets/        # web-access extension code
│   ├── prompts/        # 24 prompt templates (kebab-case)
│   ├── skills/         # 79 skills (kebab-case)
│   ├── themes/         # 12 themes (kebab-case)
│   ├── README.md       # Tool docs
│   └── wocode.json    # MCP configuration
├── codex/              → ~/.codex/
│   ├── agents/         # 7 agents (snake_case)
│   ├── skills/         # 50+ skills (auto-triggered)
│   └── README.md       # Platform notes
└── thoughts/           # Context engineering artifacts
    ├── shared/tickets/ # Work items (organized by category)
    ├── shared/plans/   # Implementation plans
    ├── shared/research/# Research documents
    └── global/         # Cross-repo concerns
```

## Commands & Skills

| Command | OpenCode | Claude | Pi | Wo Code | Antigravity | Codex | Type | Description |
|---------|:--------:|:------:|:------:|:--:|:--------:|:-----------:|:----:|------|-------------|
| `/init_harness` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Initialize harness (creates AGENTS.md/CLAUDE.md + thoughts/) |
| `/create_plan` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Generate implementation plan from ticket |
| `/implement_plan` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Execute approved plan phase-by-phase |
| `/validate_plan` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Verify implementation against plan |
| `/commit` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Create well-structured git commits |
| `/debug` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Investigate issues during testing |
| `/debug_k8s` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Debug Kubernetes (prefers MCP, falls back to kubectl) |
| `/research_codebase` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Comprehensive codebase research |
| `/validate_telemetry` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Validate local telemetry against a narrative spec |
| `/work <ticket-id>` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Start working on a ticket (requires ticket-manager) |
| `/complete <ticket-id>` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Complete a ticket, syncs status (requires ticket-manager) |
| `/sync team` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Show team dashboard (requires ticket-manager) |
| `/help` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Unified help system (requires help-command) |
| `/sync skills` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Sync all skills to all frontends (requires skill-auto-update) |
| `ticket_manager` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Manage tickets across namespaces with full lifecycle |
| `team_setup` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Initialize and manage team configuration |
| `skill_auto_update` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Auto-discover and sync skills across frontends |
| `auto_ticket_creator` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Monitor and auto-create tickets from changes |
| `docs_sync_updater` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Fetch latest docs and auto-update skill configs |
| `cto_dashboard` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | CTO dashboard with review queue and developer progress |
| `skill_adapter` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Platform-specific skill loading and format adapters |
| `help_command` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Unified /help across all platform frontends |
| `observability_driven_development` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Design the trace before the feature; local OTel feedback loop |
| `git_commit_helper` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Triggers on "commit" keywords |
| `pr_description_generator` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Triggers when creating PRs |
| `experimental_pr_workflow` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Formalizes experimental work |
| `interview` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Stress-test plans via relentless user interview |
| `improve_codebase_architecture` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Find architectural friction, propose deep-module refactors |
| `prd_to_issues` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Break a PRD into vertical-slice issue files |
| `tdd` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Red-green-refactor TDD discipline |
| `write_a_prd` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Generate a PRD from a client brief |
| `womono_version_updater` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Bump WoM harness version across all files and tools |
| `build_pi_agent` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Build Pi agent definitions with frontmatter format |
| `pi_cli` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Pi CLI expert — CLI flags, subcommands, output modes |
| `pi_config` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Pi configuration — settings, providers, models, packages |
| `build_pi_extension` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Build Pi extensions — tools, events, commands, providers |
| `pi_keybindings` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Pi keyboard shortcuts — registerShortcut, key IDs |
| `pi_orchestrate` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Orchestrate Pi domain experts to research and build Pi components |
| `pi_prompts` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Pi prompt templates — .md format, arguments, /template |
| `build_pi_skill` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Build Pi skills — SKILL.md format, frontmatter, validation |
| `pi_themes` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Pi themes — JSON, 51 color tokens, vars, hex/256-color |
| `pi_tui` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Pi TUI — built-in & custom components, keyboard, widgets |

**Naming**: OpenCode, Pi, and Wo Coder use kebab-case; Claude, Codex, and Antigravity use snake_case.

## Agents

All agents are shared across all six tools:

| Agent | OpenCode | Claude | Pi | Wo Coder | Antigravity | Codex | Purpose |
|-------|:--------:|:------:|:------:|:--:|:--------:|:-----------:|:----:|--------|
| `codebase_analyzer` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Analyze implementation details, trace data flow |
| `codebase_investigator` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Investigate codebase structure and dependencies |
| `codebase_locator` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Find files/directories by feature or task |
| `codebase_pattern_finder` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Discover similar implementations and patterns |
| `thoughts_analyzer` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Extract insights from research documents |
| `thoughts_locator` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Discover documents in thoughts/ directory |
| `web_search_researcher` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Research information from web sources |
| `coder` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Implementation and code generation |
| `planner` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Architecture and implementation planning |
| `reviewer` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Code review and quality checks |
| `scout` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Fast codebase reconnaissance |
| `netlify_troubleshooter` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Netlify CI/CD diagnostics and build pipeline |

## Workflow

```
Ticket → /create_plan → /implement_plan → /validate_plan → [/validate_telemetry] → /commit
```

1. Create ticket in `thoughts/shared/tickets/` (use ticket-template.md)
2. Run `/create_plan <ticket-path>` to generate plan
3. Run `/implement_plan <plan-path>` to execute
4. Run `/validate_plan` to verify
5. (Optional, telemetry-bearing features only) Run `/validate_telemetry [<spec>]` to verify the trace narrative
6. Run `/commit` to commit changes

## MCP Configuration

| Tool | File | Disable Syntax |
|------|------|----------------|
| OpenCode | `opencode.json` | `"enabled": false` |
| Claude Code | `.mcp.json` | `"disabled": true` |
| Pi | N/A | N/A |
| Wo Coder | `wocode.json` | `"enabled": false` |
| Codex | N/A | N/A |

Available MCP servers: `kubernetes` (disabled by default), `aspire-dashboard` (disabled by default; see [microsoft/aspire#14733](https://github.com/microsoft/aspire/issues/14733) for the standalone-Docker MCP caveat)

## Tool-Specific Notes

### OpenCode
- Project memory: `AGENTS.md` (generated by `/init`)
- Commands and skills are separate directories
- Agent naming: Uses snake_case convention
- Config location: `~/.config/opencode/`

### Claude Code
- Project memory: `CLAUDE.md` (generated by `/init`)
- Commands implemented as skills with `disable-model-invocation: true`
- Agent naming: Uses snake_case convention
- Config location: `~/.claude/`
- Supports `.claude/rules/` for modular instructions

