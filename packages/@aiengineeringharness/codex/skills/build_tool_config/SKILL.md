---
name: build_tool_config
description: >-
  Configure all 7 AI coding tools — knows settings.json, providers, models, packages, keybindings, all configuration options.
allowed-tools: 'read_file, write_file, run_shell_command, glob, grep'
---

# build_tool_config — Unified Configuration Reference

You are a cross-tool configuration expert. You know how to configure ALL 7 AI coding tools. Load this skill when the user needs help configuring any tool.

## Tool Format Reference

### OpenCode
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **allowed-tools**: lowercase (`read, write, edit, bash, grep, glob`)
- **Config**: `~/.config/opencode/`
- **Docs**: https://opencode.ai/docs/

### Claude Code
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **allowed-tools**: PascalCase (`Read, Write, Edit, Bash, Grep, Glob`)
- **Config**: `~/.claude/skills/`
- **Docs**: https://code.claude.com/docs/en/overview

### Gemini CLI
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **Format**: TOML files (not YAML frontmatter)
- **allowed-tools**: lowercase (`read_file, write_file, run_shell_command, glob, grep`)
- **Config**: `~/.gemini/skills/`
- **Docs**: https://cloud.google.com/gemini-cli/docs

### Pi
- **Directory naming**: kebab-case
- **Name field**: kebab-case, matches directory name
- **allowed-tools**: PascalCase (`Read, Write, Edit, Bash, Grep, Glob`)
- **Config**: `~/.pi/agent/skills/`
- **Docs**: https://pi.dev/

### Antigravity
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **allowed-tools**: lowercase (`read, write, edit, bash, grep, glob`)
- **Config**: `~/.antigravity/skills/`
- **Docs**: https://antigravity.sh/docs

### Codex
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **Format**: skill.yaml + prompt.md (two files per skill)
- **allowed-tools**: lowercase (`read_file, write_file, run_shell_command, glob, grep`)
- **Config**: `~/.codex/skills/`
- **Docs**: https://github.com/openai/codex

### Wo Coder
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **allowed-tools**: PascalCase (`Read, Write, Edit, Bash, Grep, Glob`)
- **Config**: `~/.wocoder/skills/`
- **Docs**: Internal (WayOfMono monorepo)

## Config Systems Per Tool

### OpenCode
- **Main config**: `~/.config/opencode/opencode.json`
- **TUI config**: `~/.config/opencode/tui.json`
- **Project config**: `.opencode/opencode.json`
- **MCP servers**: opencode.json

### Claude Code
- **Global**: `~/.claude/settings.json`
- **MCP**: `.claude/.mcp.json` or embedded in settings.json
- **Project**: `.claude/settings.json`
- **Local**: `.claude/settings.local.json` (gitignored)

### Pi
- **Config**: `~/.pi/agent/config.json`
- **Project**: `.agents/config.json`
- **Providers**: OpenAI, Anthropic, Google, custom
- **Models**: configurable per provider

### Antigravity
- **Config**: `~/.antigravity/antigravity.json`
- **Providers**: Google, OpenAI, Anthropic
- **Sidecars**: sidecar.json
- **Hooks**: hooks.json

### Gemini CLI
- **Config**: `~/.gemini/config.json`
- **Providers**: Google

### Codex
- **Config**: `~/.codex/config.yaml`
- **Providers**: OpenAI

### Wo Coder
- **Config**: `~/.wocoder/wocoder.json`
- **Providers**: OpenAI, Anthropic, Google

## Online Sources
Always fetch the latest docs before building:
- OpenCode: https://opencode.ai/docs/
- Claude Code: https://code.claude.com/docs/en/overview
- Gemini CLI: https://cloud.google.com/gemini-cli/docs
- Pi: https://pi.dev/
- Antigravity: https://antigravity.sh/docs
- Codex: https://github.com/openai/codex
- Wo Coder: packages/@wayofmono/wo-agent/
