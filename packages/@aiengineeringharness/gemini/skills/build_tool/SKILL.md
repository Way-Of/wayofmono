---
name: build_tool
description: Universal builder — generates ANY component type (skills, agents, extensions, commands, configs, keybindings, themes, prompts, TUI) for ANY of 7 AI coding tools. Knows ALL per-tool formats, casing rules, naming conventions, and frontmatter specs. Fetches latest online docs before generating.
allowed-tools: read, write, bash, edit, grep, glob, webfetch, websearch, question
---

# Build Tool — Universal Component Generator

Generates any AI coding tool component for any of 7 target tools using per-tool format specs. Always fetch latest online docs at generation time rather than relying solely on local reference.

## Supported Targets

| Tool | Binary | Naming | allowed-tools Casing | Config Format | Docs URL |
|------|--------|--------|---------------------|---------------|----------|
| OpenCode | `opencode` | snake_case | lowercase | JSON | https://opencode.ai/docs/ |
| Claude Code | `claude` | snake_case | Title Case | JSON | https://code.claude.com/docs/en/overview |
| Gemini CLI | `gemini` | snake_case | lowercase | JSON | https://geminicli.com/docs/ |
| Pi | `pi` | kebab-case | Title Case | JSON | https://pi.dev/ |
| Antigravity | `agy` | snake_case | lowercase | JSON | https://antigravity.google/docs/cli-overview |
| Codex | `codex` | snake_case | lowercase | JSON | https://developers.openai.com/codex/cli |
| Wo Coder | `wocode` | snake_case | lowercase | JSON | internal (wo-coder.md) |

Always read `thoughts/global/docs/ai-coding-tools/<tool>.md` for current format specs before generating.

---

## Component Types

### 1. Skills

Each tool uses SKILL.md with YAML frontmatter. Per-tool rules:

**Naming**: snake_case (opencode, claude, gemini, antigravity, codex, wocoder) or kebab-case (pi)
**Name field**: Must exactly match parent directory name, regex `^[a-z0-9]+(-[a-z0-9]+)*$`
**allowed-tools**: Space-delimited string (not array). Casing per tool spec below.

| Tool | allowed-tools Example | Allowed Values |
|------|----------------------|----------------|
| opencode | `read, write, bash, edit, grep, glob` | lowercase: `read, write, bash, edit, grep, glob, webfetch, websearch, question, todowrite, skill` |
| claude | `Read, Write, Bash, Edit, Glob, Grep` | Title Case: `Read, Write, Bash, Edit, Glob, Grep, WebFetch, WebSearch, Web` |
| gemini | `read, write, bash, glob, grep, web, code` | lowercase: `read, write, bash, glob, grep, web, code` |
| pi | `Read, Write, Bash, Edit, Glob, Grep` | Title Case: `Read, Write, Bash, Edit, Glob, Grep, WebFetch, WebSearch` |
| antigravity | `read, write, bash, glob, grep, web, code` | lowercase: `read, write, bash, glob, grep, web, code` |
| codex | `read_file, write_file, run_shell_command` | lowercase: `read_file, write_file, run_shell_command` |
| wocoder | `read, write, bash, edit, grep, glob` | lowercase: `read, write, bash, edit, grep, glob` |

Allowed frontmatter fields per tool: `name` (required), `description` (required), `allowed-tools` (optional). Some tools also support: `docs-url`, `disable-model-invocation`, `on` (trigger keywords). Strip all other fields.

### 2. Agents

All tools use Markdown frontmatter format for agent definitions. Per-tool rules:

| Tool | Dir | Naming | Format |
|------|-----|--------|--------|
| opencode | `agents/` | snake_case | .md with YAML frontmatter |
| claude | `agents/` | snake_case | .md with YAML frontmatter |
| gemini | `agents/` | snake_case | .md with YAML frontmatter |
| pi | `agents/` | kebab-case | .md with YAML frontmatter |
| antigravity | `agents/` | snake_case | .md with YAML frontmatter |
| codex | `agents/` | snake_case | .md with YAML frontmatter |
| wocoder | `agents/` | snake_case | .md with YAML frontmatter |

Required fields: `name`, `description`, `tools`, system prompt in body.

### 3. Commands

| Tool | Dir | Format |
|------|-----|--------|
| opencode | `commands/` | Markdown .md files |
| claude | N/A (commands = skills with `disable-model-invocation: true`) | SKILL.md |
| gemini | `commands/` | TOML format |
| pi | `prompts/` | Markdown prompt templates |
| antigravity | `commands/` | Markdown .md files |
| codex | N/A | N/A |
| wocoder | `commands/` | Markdown .md files |

### 4. Extensions

| Tool | Format | Details |
|------|--------|---------|
| claude | plugin.json | Plugin manifest with relative paths, custom commands, hook interceptors |
| pi | TypeScript/JS module | Extension API lifecycle: `activate`, `deactivate` |
| opencode | MCP server config | Configure in opencode.json `mcpServers` section |
| gemini | N/A | No extension system |
| antigravity | N/A | No packaged plugin system |
| codex | N/A | No extension system |
| wocoder | TypeScript/JS module | Same pattern as Pi (fork) |

### 5. CLI Configurations

All tools use JSON config files. Key files per tool:

| Tool | Config File | Format |
|------|-------------|--------|
| opencode | `~/.config/opencode/opencode.json` | JSON/JSONC |
| claude | `~/.claude/settings.json` | JSON |
| gemini | `~/.gemini/config.json` | JSON |
| pi | `~/.pi/agent/config.json` | JSON |
| antigravity | `~/.antigravity/settings.json` | JSON |
| codex | `~/.codex/config.json` | JSON |
| wocoder | `~/.wocoder/wocoder.json` | JSON |

### 6. Keybindings

| Tool | File | Format |
|------|------|--------|
| opencode | `~/.config/opencode/keybindings.json` | JSON |
| claude | `~/.claude/keybindings.json` | JSON |
| pi | `~/.pi/agent/keybindings.json` | JSON |
| antigravity | `~/.antigravity/keybindings.json` | JSON |

### 7. Themes

| Tool | Format | Tokens |
|------|--------|--------|
| claude | Built-in presets only (7 themes) | RGB true color, ANSI fallback, daltonized |
| pi | JSON | 51 color tokens, vars system, hex/256-color |
| antigravity | JSON | 51 color tokens, vars system, hex/256-color |

### 8. TUI Components

| Tool | Framework | Details |
|------|-----------|---------|
| claude | React Ink | Custom components, hooks (useInput, useTerminalFocus) |
| pi | Custom TUI framework | Built-in: Text, Box, Container, Markdown, Image, SelectList, SettingsList, BorderedLoader |
| antigravity | Custom TUI framework | Same built-in components as Pi |

---

## Generation Workflow

1. **Identify target tool** — Ask user which of 7 tools the component is for
2. **Identify component type** — Skill, Agent, Command, Extension, Config, Keybinding, Theme, or TUI
3. **Fetch latest docs** — Read `thoughts/global/docs/ai-coding-tools/<tool>.md` AND fetch the official docs URL
4. **Generate with correct naming** — snake_case or kebab-case per tool
5. **Use correct casing** — allowed-tools values must match per-tool spec exactly
6. **Validate frontmatter** — Only include fields supported by target tool
7. **Write to correct directory** — Place in harness dir or user config dir per tool
8. **Run compliance check** — `deno run -A packages/@aiengineeringharness/scripts/compliance-check.ts` to validate

---

## Tool Locations in This Harness

| Tool | Harness Path |
|------|-------------|
| opencode | `packages/@aiengineeringharness/opencode/` → `~/.config/opencode/` |
| claude | `packages/@aiengineeringharness/claude/` → `~/.claude/` |
| gemini | `packages/@aiengineeringharness/gemini/` → `~/.gemini/` |
| pi | `packages/@aiengineeringharness/pi/` → `~/.pi/agent/` |
| antigravity | `packages/@aiengineeringharness/antigravity/` → `~/.antigravity/` |
| codex | `packages/@aiengineeringharness/codex/` → `~/.codex/` |
| wocoder | `packages/@aiengineeringharness/wocoder/` → `~/.wocoder/` |

---

## Reference Docs

Local fallback: `thoughts/global/docs/ai-coding-tools/`
Online docs (always fetch at generation time):

- OpenCode: https://opencode.ai/docs/
- Claude Code: https://code.claude.com/docs/en/overview
- Gemini CLI: https://geminicli.com/docs/
- Pi: https://pi.dev/
- Antigravity: https://antigravity.google/docs/cli-overview
- Codex: https://developers.openai.com/codex/cli
