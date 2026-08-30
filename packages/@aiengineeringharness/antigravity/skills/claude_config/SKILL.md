---
name: claude_config
description: Claude Code configuration expert — knows settings.json, .mcp.json, steering rules hierarchy, and all configuration options. Use when the user needs help configuring Claude Code.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch
---

# Claude Code Configuration Reference

Claude Code uses a multi-tiered configuration system. Settings are merged in order of precedence: Managed > User (Global) > Project > Local.

## Configuration Locations
- **Managed Settings**: Managed by enterprise administrators, typically at platform-specific paths (e.g. `/etc/claude/managed-settings.json` or policy folders).
- **User (Global) Settings**: `~/.claude/settings.json` (and `~/.claude/settings.local.json` for local overrides).
- **Project Settings**: `.claude/settings.json` in the root of your project/repository.
- **Local Overrides**: `.claude/settings.local.json` (ignored by git, machine-specific).
- **MCP Servers**: `.mcp.json` or registered globally via `~/.claude/.mcp.json`.

---

## Configuration Keys in settings.json

### 1. General & UI Settings
- `theme` — `"dark" | "light" | "dark-daltonized" | "light-daltonized" | "dark-ansi" | "light-ansi" | "auto"` (Default: `"auto"`)
- `language` — String for response and dictation language (e.g., `"japanese"`, `"spanish"`).
- `defaultShell` — `"bash" | "powershell"` (Default: `"bash"`).
- `respectGitignore` — Whether the file picker respects gitignore rules (Default: `true`).
- `terminalTitleFromRename` — Update terminal tab title when `/rename` command is used (Default: `true`).
- `cleanupPeriodDays` — Days to retain chat transcripts (Default: `30`). Set to `0` to disable history persistence.
- `syntaxHighlightingDisabled` — Disable syntax highlighting in diffs (Default: `false`).

### 2. Model & Execution Controls
- `model` — Override default main loop model identifier.
- `alwaysThinkingEnabled` — Enable or disable model's reasoning/thinking behavior.
- `effortLevel` — Thinking budget effort (`"low" | "medium" | "high"`).
- `fastMode` — Toggle fast mode execution.
- `fastModePerSessionOptIn` — Reset fast mode to off at the beginning of each session.
- `agent` — Select a built-in or custom agent to use for the main thread.
- `availableModels` — Allowlist of model IDs users can select.

### 3. Permissions Scope
- `permissions` — Object with `allow`, `deny`, and `ask` permission rules arrays:
  - `allow` / `deny` / `ask` — Rule patterns for file reads, writes, and commands.
  - `defaultMode` — `"auto" | "ask" | "allow" | "deny"`.
  - `additionalDirectories` — Array of directories to add to allowed scopes.

### 4. MCP Server Configuration
- `enableAllProjectMcpServers` — Automatically approve all project-specific MCP servers.
- `enabledMcpjsonServers` — List of approved MCP server identifiers from `.mcp.json`.
- `disabledMcpjsonServers` — List of rejected MCP server identifiers.
- `allowedMcpServers` — Allowlist matching servers by `serverName`, `serverCommand`, or `serverUrl`.
- `deniedMcpServers` — Blocklist matching servers by `serverName`, `serverCommand`, or `serverUrl`.

### 5. Git & Custom Scripts
- `attribution` — Custom attribution trailer text for git commits and PRs.
- `includeGitInstructions` — Inject git commit/PR instructions in system prompt (Default: `true`).
- `apiKeyHelper` — Script path to fetch API keys.
- `awsCredentialExport` / `awsAuthRefresh` / `gcpAuthRefresh` — Scripts for cloud credentials refresh.
- `worktree` — Worktree management setup (symlink directories, sparsePaths checkout lists).

---

## MCP Server Configuration (`.mcp.json`)
The Model Context Protocol allows adding external servers via stdio or SSE. Format:
```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/server.js"],
      "env": {
        "ENV_VAR": "value"
      }
    }
  }
}
```
Register or manage them via command line:
- `claude mcp add <name> <command> [args...]`
- `claude mcp remove <name>`
- `claude mcp list`
