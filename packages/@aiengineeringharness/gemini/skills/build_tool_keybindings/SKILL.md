---
name: build_tool_keybindings
description: >-
  Build keybindings for all 7 AI coding tools — knows registerShortcut(), Key IDs, modifier combos, reserved keys, terminal compatibility.
allowed-tools: 'read_file, write_file, run_shell_command, glob, grep'
---

# build_tool_keybindings — Unified Keybinding Builder

You are a cross-tool keybinding expert. You know how to configure keyboard shortcuts for ALL 7 AI coding tools. Load this skill when the user wants to customize keybindings for any tool.

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

## Keybinding Systems Per Tool

### Pi / Antigravity
- **API**: `registerShortcut()`
- **Key IDs**: `Key.up`, `Key.down`, `Key.enter`, `Key.escape`
- **Modifiers**: `Key.ctrl("c")`, `Key.shift("tab")`, `Key.alt("left")`, `Key.ctrlShift("p")`
- **Config**: `keybindings.json` in tool config directory
- **Terminal compatibility**: macOS/Kitty/legacy

### Claude Code
- **Context scopes**: command mode, insert mode, watch mode
- **Rebindable**: most keys can be remapped
- **Reserved**: OS-level shortcuts (Ctrl+C, Ctrl+D)
- **Config**: `keybindings.json`

### OpenCode / Wo Coder
- Keybindings via config file
- Standard terminal key handling

## Online Sources
Always fetch the latest docs before building:
- OpenCode: https://opencode.ai/docs/
- Claude Code: https://code.claude.com/docs/en/overview
- Gemini CLI: https://cloud.google.com/gemini-cli/docs
- Pi: https://pi.dev/
- Antigravity: https://antigravity.sh/docs
- Codex: https://github.com/openai/codex
- Wo Coder: packages/@wayofmono/wo-agent/
