---
name: antigravity_cli
description: Antigravity CLI expert — knows all command line arguments, flags, environment variables, subcommands, output modes, and non-interactive usage. Use when the user needs help running Antigravity from the command line.
docs-url: 
allowed-tools: Read, Bash, Grep, Glob, WebSearch
---

# Antigravity CLI Reference

The Antigravity command line interface is run via the `agy` command:
`agy [options] [@files...] [messages...]` or `agy <command> <subcommand> [options]`

## Global Option Flags
- `--project <name>`, `-P <name>` — Target a specific registered project.
- `--help`, `-h` — Show help output.
- `--mode json` — Programmatic parsing / JSON output mode.
- `--mode rpc` — RPC execution mode.
- `-p` / `--print` — Process the prompt and exit.
- `--tools <t1,t2>` — Restrict tools available in this session.
- `--no-tools` — Run in read-only mode with zero execution tools.
- `--model <provider/id>` — Explicit model selection.
- `--thinking <level>` — Override reasoning effort (e.g. `high`, `medium`, `low`, `minimal`, `off`).
- `-c` / `--continue` — Continue the last session.
- `-r` / `--resume` — Resume a session via interactive picker.
- `--session <path>` — Resume or load a session from a specific file path.
- `--no-session` / `--no-extensions` / `--no-skills` / `--no-themes` — Disable auto-loading.
- `-e <path>` — Load a specific extension file directly.
- `--skill <path>` — Load a specific skill directory directly.
- `@file.md` — Inject the contents of a markdown file into the session context.
- `--system-prompt <text>` / `--append-system-prompt <text>` — Override/append system instructions.

## CLI Subcommands

### 1. Project Management
- `agy init` — Initialize a new Antigravity project. Auto-installs skills to `~/.claude/skills/antigravity`, `~/.config/opencode/skills/antigravity`, `~/.gemini/skills/antigravity`.
- `agy project list` — List all registered projects.
- `agy project add <name> <path> [--isolation mode]` — Add a new project workspace.
- `agy project remove <name> [--force]` — Unregister a project.
- `agy project set-default <name>` — Set the default workspace.

### 2. Task Board & Execution
- `agy task create "<title>" [--attach <file>] [--depends <task-id>] [--node <node-id>]` — Create a new task.
- `agy task plan "[description]"` — Launch interactive AI-guided Q&A to design a task plan (`PROMPT.md`).
- `agy task list` — List all tasks on the board.
- `agy task show <task-id>` — Show task status, node routing, and provenance.
- `agy task logs <task-id> [--follow] [--limit <n>] [--type <type>]` — Stream task logs.
- `agy task steer <task-id> "<instruction>"` — Send mid-execution guidance to an active executor agent.
- `agy task pause <task-id>` / `agy task unpause <task-id>` — Control executor task flow.
- `agy task comment <task-id> "<text>" [--author <name>]` — Post a workflow comment.
- `agy task comments <task-id>` — List comments on a task.
- `agy task attach <task-id> <file>` — Attach trace files or logs.
- `agy task merge <task-id>` — Trigger automated code verification and merge.
- `agy task refine <task-id> --feedback "<feedback>"` — Re-evaluate and correct task outputs.
- `agy task duplicate <task-id>` — Duplicate task definition.
- `agy task archive <task-id>` / `agy task unarchive <task-id>` — Archive/restore tasks.
- `agy task delete <task-id> --force` — Permanently delete a task.
- `agy task pr-create <task-id> --title "<title>" --base <branch>` — Open a Git pull request.
- `agy task import <owner/repo> [--labels <label>] [--limit <n>] [--interactive]` — Import issues.

### 3. Dashboard, HEADless Node & Daemon
- `agy dashboard [--port <port>] [--host <host>] [--token <token>] [--no-auth] [--paused] [--dev]` — Launch TUI and start web dashboard (default port `4040` at `127.0.0.1`).
- `agy serve [--port <port>] [--host <host>] [--paused] [--daemon]` — Headless API server + AI engine node.
- `agy daemon [--port <port>] [--host <host>] [--token <token>] [--paused] [--token-only]` — Token-secured background daemon.
- `agy desktop [--dev] [--paused]` — Electron desktop container.

### 4. Deep Research & Planning
- `agy research create --query "<text>" [--wait] [--max-wait-ms <ms>]` — Execute deep research.
- `agy research list [--status <status>] [--limit <n>]` — List recent research runs.
- `agy research show <run-id>` — Display query, sources, and synthesis.
- `agy research export <run-id> [--format <json|markdown|pdf>] [--output <path>]` — Save results.
- `agy research cancel <run-id>` / `agy research retry <run-id>` — Manage research lifecycle.
- `agy mission create "<title>" "<desc>"` — Define a high-level mission goal.
- `agy mission list` / `agy mission show <mission-id>` — Check mission milestones and feature slices.
- `agy mission activate-slice <slice-id>` — Activate feature slice for task generation.

### 5. Multi-Agent & Mailbox
- `agy agent start <id>` / `agy agent stop <id>` — Resume or pause permanent agent heartbeat timers.
- `agy agent mailbox <id>` — View incoming messages for a specific agent.
- `agy agent import <source> [--dry-run] [--skip-existing]` — Import agents and skills.
- `agy agent export <dir> [--company-name <name>]` — Export agents to package folder.
- `agy message inbox` / `agy message outbox` — Show CLI user direct messages.
- `agy message send <agent-id> "<text>"` — Send a direct message to a running agent.
- `agy message read <message-id>` / `agy message delete <message-id>` — Read/delete messages.

### 6. Plugins & Skills
- `agy plugin list` — List installed plugins and activation states.
- `agy plugin install <path> [--ai-scan]` — Install a plugin with optional security scanning.
- `agy plugin uninstall <id> --force` — Remove a plugin.
- `agy plugin enable <id>` / `agy plugin disable <id>` — Toggle plugin in project scope.
- `agy plugin rescan <id>` — Reload plugin and run fresh security scanning review.
- `agy plugin create <name>` — Scaffold a new plugin directory structure.
- `agy skills search <query>` — Search the skills registry.
- `agy skills install <owner/repo> [--skill <name>]` — Install a skill from registry.

### 7. Utility & Maintenance
- `agy settings` / `agy settings set <key> <value>` — Inspect and change configuration keys.
- `agy settings export` / `agy settings import <file> [--merge]` — Backup/restore settings JSON.
- `agy git status` / `agy git fetch` / `agy git pull --yes` / `agy git push --yes` — Workspace Git hooks.
- `agy backup [--create] [--list] [--restore <file>] [--cleanup]` — Manage database backups.

## Environment Variables
- `ANTIGRAVITY_CODING_AGENT_DIR` — Custom path for agent data and session history.
- `FUSION_DASHBOARD_TOKEN` — Fixed token key for dashboard auth (overrides auto-generation).
- `FUSION_DAEMON_TOKEN` — Stored token key for secure client connections.
- Provider keys: `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, etc.

