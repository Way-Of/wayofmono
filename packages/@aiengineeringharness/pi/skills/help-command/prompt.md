> **Platform**: Pi | **Skill**: help-command | **Version**: 1.0.0
>
> _Auto-generated from canonical format. Do not edit directly._


# Help Command Skill

Provides a unified `/help` command across all platforms. Reads skill/agent registries
and SKILL.md files to present categorized documentation.

## Subcommands

- `/help` — Top-level overview
- `/help skills` — List all skills by namespace
- `/help commands` — List slash commands
- `/help agents` — List core agents
- `/help <skill-name>` — Detail for a specific skill
- `/help ticket` — Ticket workflow
- `/help team` — Team setup
- `/help dashboard` — CTO dashboard usage

## Usage

```
deno run -A help.ts                  Top-level overview
deno run -A help.ts skills           List skills
deno run -A help.ts commands         List commands
deno run -A help.ts agents           List agents
deno run -A help.ts ticket-manager   Help for ticket-manager skill
deno run -A help.ts ticket           Ticket workflow
```
