# AI Engineering Harness

> **For AI Agents**: This document provides structured reference data for AI coding assistants. For human-readable documentation, see [README.md](README.md).

## Quick Reference

**Purpose**: Configuration harness for AI coding agents with reusable prompts, agents, and workflows.

**Supported Tools**: OpenCode, Claude Code, Gemini CLI, Pi, Wo Coder, Antigravity

**Installation**: `./setup.sh <tool>` where tool is `opencode`, `claude`, `gemini`, `pi`, `wocoder`, or `all`

## Repository Structure

```
ai-engineering-harness/
├── opencode/           → ~/.config/opencode/
│   ├── agents/         # 6 agents (snake_case)
│   ├── commands/       # 11 slash commands
│   ├── skills/         # 25 skills (auto-triggered)
│   └── opencode.json   # MCP configuration
├── claude/             → ~/.claude/
│   ├── agents/         # 6 agents (snake_case)
│   ├── skills/         # 35 skills (13 manual + 22 auto)
│   ├── .mcp.json       # MCP configuration
│   └── settings.json   # Settings schema
├── gemini/             → ~/.gemini/
│   ├── agents/         # 6 agents (snake_case)
│   ├── commands/       # 14 commands (TOML format)
│   └── skills/         # 33 skills (auto-triggered)
├── pi/                 → ~/.pi/agent/
│   ├── agents/         # 6 agents (kebab-case)
│   ├── prompts/        # 11 prompt templates (Pi's commands)
│   ├── skills/         # 31 skills (auto-triggered)
│   └── extensions/     # subagent extension (multi-agent workflows)
├── wocoder/            → ~/.wocoder/
│   ├── antigravity/        → ~/.antigravity/
│   ├── agents/         # 6 agents (snake_case)
│   ├── commands/       # 11 slash commands
│   ├── skills/         # 25 skills (auto-triggered)
│   ├── extensions/     # subagent extension (multi-agent workflows)
│   └── wocoder.json    # MCP configuration
└── thoughts/           # Context engineering artifacts
    ├── shared/tickets/ # Work items
    ├── shared/plans/   # Implementation plans
    ├── shared/research/# Research documents
    └── global/         # Cross-repo concerns
```

## Commands & Skills

| Command | OpenCode | Claude | Gemini | Pi | Wo Coder | Antigravity | Type | Description |
|---------|:--------:|:------:|:------:|:--:|:--------:|:-----------:|------|-------------|
| `/init_harness` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Initialize harness (creates AGENTS.md/CLAUDE.md/GEMINI.md + thoughts/) |
| `/create_plan` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Generate implementation plan from ticket |
| `/implement_plan` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Execute approved plan phase-by-phase |
| `/validate_plan` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Verify implementation against plan |
| `/commit` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Create well-structured git commits |
| `/debug` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Investigate issues during testing |
| `/debug_k8s` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Debug Kubernetes (prefers MCP, falls back to kubectl) |
| `/research_codebase` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Comprehensive codebase research |
| `/validate_telemetry` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Manual | Validate local telemetry against a narrative spec |
| `observability_driven_development` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Design the trace before the feature; local OTel feedback loop |
| `git_commit_helper` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Triggers on "commit" keywords |
| `pr_description_generator` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Triggers when creating PRs |
| `experimental_pr_workflow` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Formalizes experimental work |
| `interview` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Stress-test plans via relentless user interview |
| `improve_codebase_architecture` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Find architectural friction, propose deep-module refactors |
| `prd_to_issues` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Break a PRD into vertical-slice issue files |
| `tdd` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Red-green-refactor TDD discipline |
| `write_a_prd` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Generate a PRD from a client brief |
| `build_pi_agent` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Build Pi agent definitions with frontmatter format |
| `pi_cli` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Pi CLI expert — CLI flags, subcommands, output modes |
| `pi_config` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Pi configuration — settings, providers, models, packages |
| `build_pi_extension` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Build Pi extensions — tools, events, commands, providers |
| `pi_keybindings` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Pi keyboard shortcuts — registerShortcut, key IDs |
| `pi_orchestrate` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Orchestrate Pi domain experts to research and build Pi components |
| `pi_prompts` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Pi prompt templates — .md format, arguments, /template |
| `build_pi_skill` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Build Pi skills — SKILL.md format, frontmatter, validation |
| `pi_themes` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Pi themes — JSON, 51 color tokens, vars, hex/256-color |
| `pi_tui` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Auto | Pi TUI — built-in & custom components, keyboard, widgets |

**Naming**: OpenCode, Claude, Gemini, and Wo Coder use snake_case. Pi uses kebab-case (its native convention).

## Agents

All agents are shared across all five tools:

| Agent | OpenCode | Claude | Gemini | Pi | Wo Coder | Antigravity | Purpose |
|-------|:--------:|:------:|:------:|:--:|:--------:|:-----------:|--------|
| `codebase_analyzer` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Analyze implementation details, trace data flow |
| `codebase_locator` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Find files/directories by feature or task |
| `codebase_pattern_finder` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Discover similar implementations and patterns |
| `thoughts_analyzer` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Extract insights from research documents |
| `thoughts_locator` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Discover documents in thoughts/ directory |
| `web_search_researcher` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Research information from web sources |

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
| Gemini CLI | TBD | TBD |
| Pi | N/A | N/A |
| Wo Coder | `wocoder.json` | `"enabled": false` |

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

### Gemini CLI
- Project memory: `GEMINI.md` (generated by `/init`)
- Commands/skills: TOML format in `commands/` and `skills/`
- Agent naming: Uses snake_case convention
- Config location: `~/.gemini/`

### Pi
- Commands implemented as prompt templates in `prompts/` directory
- Agent naming: Uses kebab-case convention
- Config location: `~/.pi/agent/`
- Includes `subagent` extension for multi-agent workflows (chain, parallel, single)
- Subagent extension provides additional agents (`planner`, `reviewer`, `scout`, `worker`) and workflow prompts
- Skills serve double duty: auto-triggered behaviors and subagent delegation targets

### Wo Coder
- Project memory: `AGENTS.md` (generated by `/init`)
- Commands and skills are separate directories
- Agent naming: Uses snake_case convention
- Config location: `~/.wocoder/`
- Includes `subagent` extension for multi-agent workflows (chain, parallel, single), matching Pi's extension system

### Antigravity
- Project memory: `ANTIGRAVITY.md` (generated by `/init`)
- Commands and skills are separate directories
- Agent naming: Uses snake_case convention
- Config location: `~/.antigravity/`
