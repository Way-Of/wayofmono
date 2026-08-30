> **Platform**: Pi | **Skill**: help-command | **Version**: 1.1.0
>
> _Auto-generated from canonical format. Do not edit directly._


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

## Usage

```
deno run -A packages/@aiengineeringharness/pi/skills/help-command/help.ts
deno run -A packages/@aiengineeringharness/pi/skills/help-command/help.ts skills
deno run -A packages/@aiengineeringharness/pi/skills/help-command/help.ts search ticket
deno run -A packages/@aiengineeringharness/pi/skills/help-command/help.ts --markdown onboarding
deno run -A packages/@aiengineeringharness/pi/skills/help-command/help.ts --json skills
```