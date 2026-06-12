# Gemini CLI — Comprehensive Reference

Data verified against official docs (June 2026). Gemini CLI is being replaced by Antigravity CLI on June 18th for unpaid/Google One users.

## Quick Facts

| Attribute | Value |
|-----------|-------|
| **Binary** | `gemini` |
| **Runtime** | TypeScript/Node.js |
| **Install** | `npm install -g @google/gemini-cli` |
| **GitHub** | https://github.com/google-gemini/gemini-cli |
| **Docs** | https://geminicli.com/docs/ |
| **User config** | `~/.gemini/settings.json` |
| **Project config** | `.gemini/settings.json` |
| **System config** | `/etc/gemini-cli/settings.json` (Linux) |
| **Project context** | `GEMINI.md` (hierarchical, like AGENTS.md) |
| **Auth** | Google account / Vertex AI |
| **License** | Apache 2.0 |
| **Replacement** | Antigravity CLI (June 18, 2026) |

## In This Monorepo

### Harness Integration
The AI Engineering Harness at `packages/@aiengineeringharness/gemini/` deploys to `~/.gemini/`:

| Component | Location | Description |
|-----------|----------|-------------|
| **Skills** | `skills/` | Auto-triggered skills (SKILL.md YAML frontmatter, snake_case dirs) |
| **Config** | `settings.json` | Project/user settings |

### Key Differences from Antigravity / OpenCode
- **TOML custom commands** — Custom commands use `.toml` format (unique among tools)
- **Hierarchical memory** — `GEMINI.md` files cascade from global → project → subdir
- **Plan Mode** — Built-in read-only planning mode with `/plan` command
- **YAML-only SKILL.md** — No TOML or JSON alternatives accepted for skill frontmatter
- **Built-in skill-creator** — Meta-skill to scaffold new skills via prompt
- **No command/skill split** — Skills and commands share the skills/ directory
- **Checkpointing** — Automatic snapshots before file edits (opt-in)

### Naming Convention
- **Skill directory naming**: snake_case
- **Skill frontmatter `name`**: must match directory name exactly (regex `^[a-z0-9]+(-[a-z0-9]+)*$`)
- **Frontmatter format**: YAML only
- **allowed-tools**: lowercase (e.g., `read, write, bash, web, code`)
- **Agent naming**: snake_case
- **Config format**: JSON (settings.json)
- **Custom commands format**: TOML

## Built-in Tools

| Tool | Permission Setting | Kind |
|------|-------------------|------|
| `run_shell_command` — Execute shell commands | Execute | Confirmation required |
| `read_file` — Read file contents | File System (Read) | |
| `read_many_files` — Read multiple files (triggered by `@`) | File System (Read) | |
| `write_file` — Create/overwrite files | File System (Edit) | Confirmation required |
| `replace` — Precise text replacement in files | File System (Edit) | Confirmation required |
| `glob` — Find files by glob patterns | File System (Search) | |
| `grep_search` — Search file contents with regex | File System (Search) | |
| `list_directory` — List directory contents | File System (Read) | |
| `ask_user` — Interactive questions to user | Interaction | |
| `write_todos` — Track subtask progress | Interaction | |
| `activate_skill` — Load skill from skills/ directory | Memory | |
| `get_internal_docs` — Access CLI's own docs | Memory | |
| `enter_plan_mode` — Switch to read-only Plan Mode | Planning | |
| `exit_plan_mode` — Finalize plan and get approval | Planning | |
| `google_web_search` — Google Search | Web | |
| `web_fetch` — Fetch URL content | Web | Warning: can access localhost |
| `complete_task` — Finalize subagent mission | System | |
| `update_topic` — Update current topic/status | Task Tracking | |
| `tracker_create_task` — Create tracking task | Task Tracker (exp) | |
| `tracker_update_task` — Update task status | Task Tracker (exp) | |
| `tracker_get_task` — Get task details | Task Tracker (exp) | |
| `tracker_list_tasks` — List tracked tasks | Task Tracker (exp) | |
| `tracker_add_dependency` — Add task dependency | Task Tracker (exp) | |
| `tracker_visualize` — ASCII tree of tasks | Task Tracker (exp) | |
| `list_mcp_resources` — List MCP server resources | MCP | |
| `read_mcp_resource` — Read MCP resource content | MCP | |

### Tool argument keys (for policy engine)

| Tool | JSON keys |
|------|-----------|
| `run_shell_command` | `command`, `description`, `dir_path`, `is_background` |
| `read_file` | `file_path`, `start_line`, `end_line` |
| `write_file` | `file_path`, `content` |
| `replace` | `file_path`, `old_string`, `new_string`, `instruction`, `allow_multiple` |
| `glob` | `pattern`, `dir_path`, `case_sensitive`, `respect_git_ignore` |
| `grep_search` | `pattern`, `dir_path`, `include_pattern`, `exclude_pattern` |
| `activate_skill` | `name` |

## Configuration

### Configuration Layers (lowest to highest precedence)

1. **Default values** — Hardcoded application defaults
2. **System defaults file** — `/etc/gemini-cli/system-defaults.json`
3. **User settings file** — `~/.gemini/settings.json`
4. **Project settings file** — `.gemini/settings.json`
5. **System settings file** — `/etc/gemini-cli/settings.json` (admin overrides)
6. **Environment variables** — `.env` files, `$VAR` references in settings
7. **Command-line arguments** — CLI flags

### Schema
- Hosted: `https://raw.githubusercontent.com/google-gemini/gemini-cli/main/schemas/settings.schema.json`
- Local: `schemas/settings.schema.json` in the GitHub repo
- Format: JSON

### Settings Categories
- `general` — preferredEditor, vimMode, approvalMode, checkpointing, plan, notifications
- `output` — format (text/json)
- `ui` — theme, autoThemeSwitching, footer items, terminal rendering
- `ide` — IDE integration mode
- `privacy` — usageStatisticsEnabled
- `billing` — overageStrategy, vertexAi
- `model` — model name, maxSessionTurns, compressionThreshold
- `modelConfigs` — aliases, customAliases, overrides, modelDefinitions, modelIdResolutions
- `policyPaths` — Additional policy files
- `adminPolicyPaths` — Admin policy files
- `tools` — Tool config (pager, browser)

### MCP Configuration
MCP servers configured via `.gemini/settings.json` or project settings:
```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "package-name"],
      "enabled": true
    }
  }
}
```
- Supports STDIO transport
- Manage via `/mcp` commands: list, enable, disable, reload, auth, schema, desc
- Per-server enable/disable

## Agents (Subagents)

- **Local subagents**: Defined in `~/.gemini/agents/` or `.gemini/agents/`
- **Remote subagents**: Connected via MCP or network
- **Built-in agents**: Included with Gemini CLI
- Management: `/agents` command (list, reload, enable, disable, config)
- Subagent format: Markdown with frontmatter

## Skills System

- **Format**: `SKILL.md` with YAML frontmatter
- **Naming**: snake_case directory names, name must match directory
- **Frontmatter fields**: `name`, `description` (required); optional: `allowed-tools`
- **Discovery tiers** (lowest to highest):
  1. Built-in skills
  2. Extension skills
  3. User skills: `~/.gemini/skills/` or `~/.agents/skills/`
  4. Workspace skills: `.gemini/skills/` or `.agents/skills/`
- **Activation**: Auto on matching task (via description), consent prompt shown
- **Management**: `/skills list`, `/skills enable`, `/skills disable`, `/skills reload`
- **CLI commands**: `gemini skills list --all`, `gemini skills install <url>`, `gemini skills uninstall <name>`
- **Directory structure**:
  ```
  my-skill/
  ├── SKILL.md       (Required) Instructions and YAML frontmatter
  ├── scripts/       (Optional) Executable scripts
  ├── references/    (Optional) Static documentation
  └── assets/        (Optional) Templates and other resources
  ```

### SKILL.md Example
```yaml
---
name: my-skill
description: Description triggers auto-activation
---
# Skill instructions
When this skill is active...
```

## Commands (Slash)

All built-in slash commands:

`/about`, `/agents`, `/auth`, `/bug`, `/chat`, `/clear`, `/commands`, `/compress`, `/copy`, `/directory` (or `/dir`), `/docs`, `/editor`, `/extensions`, `/help` (or `/?`), `/hooks`, `/ide`, `/init`, `/mcp`, `/memory`, `/model`, `/permissions`, `/plan`, `/policies`, `/privacy`, `/quit` (or `/exit`), `/restore`, `/rewind`, `/resume`, `/settings`, `/shells` (or `/bashes`), `/setup-github`, `/skills`, `/stats`, `/terminal-setup`, `/theme`, `/tools`, `/upgrade`, `/vim`

### At Commands (`@`)
- `@<path>` — Inject file/directory content into prompt
- Git-aware filtering (respects `.gitignore`)
- Uses `read_many_files` tool

### Custom Commands
- Format: TOML files in `~/.gemini/commands/` or `.gemini/commands/`
- Managed via `/commands list`, `/commands reload`

### Shell Passthrough (`!`)
- `!<command>` — Execute shell command inline
- `!` (alone) — Toggle shell mode
- Sets `GEMINI_CLI=1` env var in subprocess

## Keyboard Shortcuts

Customizable via `~/.gemini/keybindings.json` (JSON array, VS Code-like schema):
```json
[
  { "command": "edit.clear", "key": "cmd+l" },
  { "command": "-app.toggleYolo", "key": "ctrl+y" }
]
```
- Unbind with `-` prefix on command name
- Modifiers: `ctrl`, `shift`, `alt`/`opt`/`option`, `cmd`/`meta`
- Special keys: up/down/left/right, home, end, pageup, pagedown, enter, escape, tab, space, backspace, delete, f1-f35
- Vi mode supported via `/vim` toggle or `general.vimMode: true`

## Unique Capabilities

| Capability | Supported |
|------------|-----------|
| Plan Mode | ✅ Built-in `/plan` read-only mode |
| Hierarchical GEMINI.md | ✅ Global → project → subdirectory cascading |
| Auto Memory | ✅ Experimental persistent context |
| Checkpointing | ✅ Automatic snapshots before file edits |
| Sandboxing | ✅ Containerized tool execution |
| Headless mode | ✅ JSON output, scripting |
| Model routing | ✅ Automatic Pro/Flash fallback |
| Hooks | ✅ Pre/post lifecycle hooks |
| IDE integration | ✅ ACP mode, VS Code/Cursor/Windsurf |
| Custom commands | ✅ TOML format |
| Token caching | ✅ Performance optimization |
| Git worktrees | ✅ Experimental |
| Policy engine | ✅ Fine-grained execution control (TOML rules) |
| Web search/fetch | ✅ Google Search + URL fetch |
| Subagents | ✅ Local + remote subagents |
| Extensions | ✅ npm-based extension system |
| Notifications | ✅ Terminal run-event notifications |
| Telemetry | ✅ Usage stats (opt-out) |
| Rewind | ✅ Navigate back through conversation + revert changes |
| Vim mode | ✅ Full NORMAL/INSERT with counts |
| Broadcast mode | Experimental |

## Research URLs for Agents

| Source | URL |
|--------|-----|
| Official docs | https://geminicli.com/docs/ |
| Commands reference | https://geminicli.com/docs/reference/commands/ |
| Configuration reference | https://geminicli.com/docs/reference/configuration/ |
| Tools reference | https://geminicli.com/docs/reference/tools/ |
| Keyboard shortcuts | https://geminicli.com/docs/reference/keyboard-shortcuts/ |
| Creating Skills | https://geminicli.com/docs/cli/creating-skills/ |
| Agent Skills overview | https://geminicli.com/docs/cli/skills/ |
| Settings | https://geminicli.com/docs/cli/settings/ |
| GitHub | https://github.com/google-gemini/gemini-cli |
| Changelog | https://geminicli.com/docs/changelogs/ |
