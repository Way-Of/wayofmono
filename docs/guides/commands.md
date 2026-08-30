# Commands Reference

> Built-in slash commands available in all Wo-powered tools

## Core Workflow Commands

| Command | Description | Phase |
|---------|-------------|-------|
| `/create_plan` | Generate implementation plan from ticket | Plan |
| `/implement_plan` | Execute approved plan phase-by-phase | Build |
| `/validate_plan` | Verify implementation against plan | Verify |
| `/validate_telemetry` | Validate local telemetry against narrative spec | Observe |
| `/commit` | Create well-structured git commits | Ship |

## Development Commands

| Command | Description |
|---------|-------------|
| `/debug` | Investigate issues during testing |
| `/help` | Unified help system (skills, commands, agents, workflows) |
| `/sync skills` | Sync all skills to all frontends |
| `/init_harness` | Initialize harness (project memory + thoughts/) |

## Ticket Commands

| Command | Description |
|---------|-------------|
| `/ticket new` | Create new ticket |
| `/ticket list` | List tickets by project/status |
| `/ticket show <id>` | Show ticket details |
| `/ticket update <id>` | Update ticket status/fields |

## Session Commands

| Command | Description |
|---------|-------------|
| `/session new` | Start fresh session |
| `/session list` | List saved sessions |
| `/session resume <id>` | Resume previous session |
| `/session fork` | Fork current session |
| `/session tree` | Show session tree |

## Model Commands

| Command | Description |
|---------|-------------|
| `/model` | Show/select current model |
| `/model <name>` | Switch to specific model |
| `/scoped-models` | Show models by provider/scope |

## Utility Commands

| Command | Description |
|---------|-------------|
| `/settings` | Open settings UI |
| `/changelog` | Show recent changelog entries |
| `/hotkeys` | Show keyboard shortcuts |
| `/export` | Export session/conversation |
| `/import` | Import session/conversation |
| `/share` | Generate shareable link |
| `/copy` | Copy last response to clipboard |
| `/name` | Rename current session |
| `/compact` | Compact context manually |
| `/reload` | Reload configuration |
| `/quit` | Exit application |

## Bash Commands

| Prefix | Description |
|--------|-------------|
| `! command` | Run bash command (included in context) |
| `!! command` | Run bash command (excluded from context) |

## Tool-Specific Commands

Some tools have additional commands:

### Wo Coder (wocode)
| Command | Description |
|---------|-------------|
| `/websearch` | Search the web |
| `/fetch` | Fetch URL content |
| `/github` | Clone GitHub repo |
| `/pdf` | Extract PDF content |
| `/youtube` | Analyze YouTube video |

### OpenCode
| Command | Description |
|---------|-------------|
| `/mcp` | Manage MCP servers |
| `/permission` | Manage permission rules |

### Claude Code
| Command | Description |
|---------|-------------|
| `/config` | Manage configuration |
| `/mcp` | Manage MCP servers |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` / `Ctrl+D` | Interrupt / Clear |
| `Ctrl+O` | Show full startup help |
| `Esc` | Interrupt / Clear editor |
| `Esc` `Esc` | Exit / Tree selector |
| `/` | Command palette |
| `!` | Bash command |

## Creating Custom Commands

Commands are defined in the harness and synced to each tool's native format:

1. Add to `packages/@aiengineeringharness/commands/your-command/`
2. Define command metadata and handler
3. Run `ai-harness --sync-docs` to propagate

## References

- [Getting Started](getting-started.md) — Quick start
- [Skills Guide](skills.md) — Using skills with commands
- [AI Engineering Harness](ai-harness/) — Command management internals