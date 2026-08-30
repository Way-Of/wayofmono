---
name: help_command
description: "Unified /help system — skills, commands, agents, workflows, practices, search, onboarding"
version: 1.1.0
namespace: core
tools: read, grep, glob
platforms: [claude, opencode, gemini, wocoder, antigravity, codex]
allowed-tools: [read, grep, glob]
dependencies: []
triggers: ["/help", "help", "what can you do", "what skills do you have"]
---

# Help Command Skill

Provides a unified `/help` command across all platforms. Dynamically loads from
manifest.json, SKILL.md files, agent definitions, and thoughts/ docs to present
categorized, up-to-date documentation for both AI agents and human developers.

## Subcommands

| Command | Description |
|---------|-------------|
| `/help` | Top-level overview with quick links |
| `/help skills` | List all skills with descriptions |
| `/help skills <name>` | Detail for a specific skill |
| `/help commands` | List all slash commands |
| `/help agents` | List all agents |
| `/help workflow` | Standard workflows (f-rr-d, TDD, PRD, ODD, etc.) |
| `/help practices` | Production-ready practices guide |
| `/help search <term>` | Search across skills, commands, agents, docs |
| `/help onboarding` | New developer quickstart |
| `/help ticket` | Ticket workflow, naming conventions, namespaces |
| `/help team` | Team setup |
| `/help dashboard` | CTO Dashboard features |
| `/help --json <topic>` | Machine-readable JSON output |
| `/help --markdown <topic>` | Markdown output (agent-friendly) |

## Implementation Guidance for AI Agents

### When the User Asks for Help

1. **Determine what they need**: Is it a skill listing, specific skill detail, command reference, workflow guidance, or onboarding?
2. **Map to subcommand**: Use the table above to route to the right subcommand.
3. **Load dynamically**: Read from manifest.json for skills, agents/ directory for agents, SKILL.md frontmatter for details. Never hardcode.
4. **Format output**: Use markdown structure for readability. Use the companion `help.ts` script for structured data when available.

### Dynamic Data Sources

```
manifest.json                        → skill listing (all tools)
<tool>/agents/*.md                   → agent listing (frontmatter)
<tool>/skills/<name>/SKILL.md        → skill detail (frontmatter + body)
thoughts/<project>/docs/best-practices/ → practices docs
thoughts/shared/tickets/             → ticket examples
```

### Cross-References to Include

When showing a skill detail, always mention:
- **Related commands**: Which `/command` triggers this skill
- **Related skills**: Other skills in the same namespace
- **Related agents**: Which agent might use this skill
- **Workflow**: Where this skill fits in the standard workflow

### Agent Usage

Agents can invoke `/help` autonomously when:
- The user asks "what can you do?"
- The user asks about a specific topic (route to subcommand)
- The agent needs to discover available skills or commands
- The agent needs workflow guidance mid-task

## Usage

```
# From repo root (any tool):
deno run -A packages/@aiengineeringharness/codex/skills/help_command/help.ts
deno run -A packages/@aiengineeringharness/codex/skills/help_command/help.ts skills
deno run -A packages/@aiengineeringharness/codex/skills/help_command/help.ts search ticket
deno run -A packages/@aiengineeringharness/codex/skills/help_command/help.ts --markdown onboarding
deno run -A packages/@aiengineeringharness/codex/skills/help_command/help.ts --json skills
```

## Edge Cases

- **No manifest found**: The help system should still show static subcommand help
- **No agents directory**: Show "no agents found" rather than erroring
- **Missing skill SKILL.md**: Show name and description from manifest, mark as "no detail available"
- **Unknown skill name**: Suggest similar names using fuzzy match
- **Empty search results**: Show "no results found" with suggestions
- **Onboarding for first time**: Use the companion script or walk through steps manually

## Notes

- Pi uses kebab-case: `help-command` directory, `name: help-command` in frontmatter
- The `help.ts` companion script is NOT installed by ai-harness — run from the repo
- All data is loaded dynamically at runtime — no hardcoded skill lists
- Use `--markdown` flag when output is for AI agent consumption
