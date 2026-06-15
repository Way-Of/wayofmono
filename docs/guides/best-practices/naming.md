# Naming Conventions

Standard naming conventions across WayOfMono.

## File & Directory Naming

| Artifact | Convention | Example |
|----------|------------|---------|
| Code files | camelCase | `dashboardStore.ts` |
| Config files | kebab-case | `ticket-template.md` |
| Scripts | snake_case | `deploy_dashboard.sh` |
| Projects | kebab-case | `wo-ai`, `wo-coding-agent` |
| Skills | `SKILL.md` | uppercase extension |
| Tickets | `XXX-NNNN` | `WOMONO-150` |

## Tool-Specific Skill Naming

| Tool | Skill Directory Naming | Config Dir |
|------|------------------------|------------|
| OpenCode | snake_case | `~/.config/opencode/` |
| Claude Code | snake_case | `~/.claude/` |
| Gemini CLI | snake_case | `~/.gemini/` |
| Pi | kebab-case | `~/.pi/agent/` |
| Codex | snake_case | `~/.codex/` |
| Antigravity | snake_case | `~/.antigravity/` |
| Wo Coder | snake_case | `~/.wocode/` |

**OpenCode Critical**: Skill directory name MUST match frontmatter `name` exactly (regex `^[a-z0-9]+(-[a-z0-9]+)*$`)

## Package Naming

All NPM packages under `@wayofmono` scope:

| Package | Name |
|---------|------|
| Multi-Provider LLM API | `@wayofmono/wo-ai` |
| Terminal UI Library | `@wayofmono/wo-tui` |
| Agent Runtime | `@wayofmono/wo-agent-core` |
| User Agent SDK | `@wayofmono/wo-agent` |
| Coding Agent | `@wayofmono/wo-coding-agent` |
| Documentation Expert | `@wayofmono/wo-skill-docs` |
| Mermaid Renderer | `@wayofmono/wo-mermaid` |
| Web Tools | `@wayofmono/web-access` |
| Codebase Analysis | `@wayofmono/lens` |
| Web UI Components | `@wayofmono/wo-web-ui` |
| Telemetry | `@wayofmono/telemetry` |
| Telegram Bot | `@wayofmono/telegram` |
| WhatsApp Bot | `@wayofmono/whatsapp` |

## Branch Naming

```
<project-slug>/<namespace>/<ticket-id>-<short-desc>
```

Examples:
- `wayofmono/womono/WOMONO-001-centralized-repo`
- `wow/wow/WOW-016-access-control`
- `opticat/opt/OPT-005-simulator-api`

## Ticket Prefixes

| Prefix | Project | Namespace |
|--------|---------|-----------|
| WOMONO | WayOfMono | womono |
| WOW | WayOfWork | wow |
| OPT | OptiCat | opticat |

## Related

- [Git Commits](git-commits.md)
- [File Structure](file-structure.md)
- [Ticket Format](../getting-started.md#tickets)