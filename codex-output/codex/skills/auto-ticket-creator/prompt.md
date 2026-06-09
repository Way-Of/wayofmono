> **Platform**: Codex | **Skill**: auto-ticket-creator | **Version**: 1.0.0
>
> _Auto-generated from canonical format. Do not edit directly._


# Auto-Ticket Creation Skill (PROJ-017)

Autonomously monitors the codebase, dependencies, and external sources for updates, and automatically creates tickets.

## Monitored Sources

- Git commits, tags, branches (`git-adapter`)
- npm registry for package updates (`npm-adapter`)
- Deno/JSR registry for module updates (`deno-adapter`)
- GitHub releases, security advisories (`github-adapter`)
- `ref/skills/` and `ref/agents/` for new content (`ref-adapter`)
- Agent frontend releases (`platform-adapter`)

## Commands

- `ai-harness monitor --once` - Single scan
- `ai-harness monitor --daemon` - Continuous monitoring
- `ai-harness monitor --source=github,npm,ref` - Selective sources

## Change Classification

Detected changes are classified as: `agent-update`, `skill-update`, `dep-update`, `security`, `breaking-change`

Tickets are created with proper namespace (WOW, OPT, PROJ, TEAM) and auto-assigned based on change type.
