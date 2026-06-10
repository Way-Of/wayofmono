---
name: claude-cli
description: Claude Code CLI expert — knows all command line arguments, flags, environment variables, subcommands, and non-interactive usage. Use when the user needs help running Claude Code from the command line.
allowed-tools: Read, Bash, Grep, Glob, WebSearch
---

# Claude Code CLI Reference

The Claude Code command line interface is run via the `claude` command:
`claude [options] [messages...]` or `claude <subcommand> [options]`

## Global Option Flags
- `--bare` — Run in simple, non-interactive mode. Skip background supervisor daemon (UDS messaging) and teammate/swarm features. Sets `CLAUDE_CODE_SIMPLE=1` internally.
- `--model <name>` — Specify an explicit model (e.g. `claude-3-7-sonnet`) to use for the main loop.
- `--version`, `-v`, `-V` — Print version and exit.
- `--tmux` / `--tmux=classic` — Enable tmux integration features.
- `--worktree`, `-w`, `--worktree=<name>` — Load the session inside a dedicated git worktree workspace.
- `--background`, `--bg` — Run the session or command in the background.
- `--dump-system-prompt` — Dump the compiled system prompt (for diagnostic purposes).

## Subcommands
- `claude init` — Initialize the project workspace. Generates a project-level `CLAUDE.md` steering file and guides through onboarding setup.
- `claude mcp <add|remove|list>` — Add, remove, or list Model Context Protocol (MCP) servers.
- `claude config` — Launch the interactive configuration wizard to adjust settings like themes, language, and model parameters.
- `claude remote-control` / `rc` / `remote` / `sync` / `bridge` — Turn the current workspace into a bridge environment allowing remote control or sync capabilities.
- `claude daemon` — Run the long-running supervisor daemon.
- `claude ps` / `claude logs` / `claude attach` / `claude kill` — Monitor and control background sessions.
- `claude new` / `claude list` / `claude reply` — Manage template jobs.
- `claude update` / `claude upgrade` — Check for updates and upgrade the Claude Code CLI binary.
- `claude self-hosted-runner` — Start a headless self-hosted runner worker.
- `claude environment-runner` — Start a headless BYOC runner.

## Environment Variables
- `CLAUDE_CONFIG_DIR` — Custom directory path for global config files (default: `homedir()`).
- `CLAUDE_CODE_REMOTE` — Run in remote/container environment mode, which auto-adjusts heap size options.
- `CLAUDE_CODE_SIMPLE` — Forces simple/bare non-interactive mode when set to `1`.
- `CLAUDE_CODE_DISABLE_THINKING` — Set to `1` to disable Anthropic's thinking/reasoning model capabilities.
- `DISABLE_INTERLEAVED_THINKING` — Disable visual rendering of thinking cycles in interactive terminals.
- `DISABLE_COMPACT` — Disable compacting old messages in the conversation history.
- `DISABLE_AUTO_COMPACT` — Disable auto-triggering history compaction when token count is high.
- `CLAUDE_CODE_DISABLE_AUTO_MEMORY` — Disable saving local project memories.
- `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` — Prevent Claude Code from executing background processes.
- `CLAUDE_CODE_HOST_PLATFORM` — Override detected analytics platform (`win32` | `darwin` | `linux`).
- `ANTHROPIC_API_KEY` — API key used for authenticating Anthropic requests.
