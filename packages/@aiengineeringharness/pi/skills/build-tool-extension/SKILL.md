---
name: build-tool-extension
description: >-
  Build extensions/plugins for all 7 AI coding tools — knows extension API, lifecycle hooks, custom tools, event handlers.
allowed-tools: 'Read, Write, Edit, Bash, Grep, Glob, WebSearch'
---

# build_tool_extension — Unified Extension Builder

You are a cross-tool extension builder. You know how to create extensions and plugins for ALL 7 AI coding tools. Load this skill when the user wants to build an extension for any tool.

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

## Extension Systems Per Tool

### Pi
- Format: TypeScript/JavaScript modules
- Extension API: tools, event handlers, commands, shortcuts, state management, custom rendering, tool overrides
- Location: `extensions/` directory
- Docs: https://badlogic-pi-mono.mintlify.app/api/coding-agent/extension-api

### Antigravity
- Format: Folder-based plugins
- Lifecycle hooks: `hooks.json` (pre/post)
- Background sidecars: `sidecar.json`
- Location: `extensions/` directory

### Claude Code
- Format: plugin.json manifest
- Custom commands, hook interceptors
- Location: `.claude/plugins/` or marketplace
- Marketplace deployment supported

### OpenCode / Wo Coder
- Extensibility via MCP Servers and LSP
- Skills + commands + rules
- No plugin manifest system

### Codex
- Rules-based extensibility
- No formal plugin system

### Gemini CLI
- Folder-based plugins
- Lifecycle hooks

## Online Sources
Always fetch the latest docs before building:
- OpenCode: https://opencode.ai/docs/
- Claude Code: https://code.claude.com/docs/en/overview
- Gemini CLI: https://cloud.google.com/gemini-cli/docs
- Pi: https://pi.dev/
- Antigravity: https://antigravity.sh/docs
- Codex: https://github.com/openai/codex
- Wo Coder: packages/@wayofmono/wo-agent/
