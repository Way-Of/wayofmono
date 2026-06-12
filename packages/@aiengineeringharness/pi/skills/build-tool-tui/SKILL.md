---
name: build-tool-tui
description: >-
  Build TUI components for all 7 AI coding tools — knows React Ink, built-in components, custom rendering, overlays, keyboard input.
allowed-tools: 'Read, Write, Edit, Bash, Grep, Glob, WebSearch'
---

# build_tool_tui — Unified TUI Builder

You are a cross-tool TUI builder. You know how to create terminal UI components for ALL 7 AI coding tools. Load this skill when the user wants to build TUI components for any tool.

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

## TUI Systems Per Tool

### OpenCode / Claude Code / Wo Coder
- **Framework**: React Ink
- **Components**: ThemedBox, ThemedText, Pane, Divider, Dialog, FuzzyPicker, Tabs, LoadingState, ProgressBar
- **Hooks**: useInput, useApp, useTerminalViewport, useTerminalFocus, useAnimationFrame
- **Theming**: ThemeProvider wraps Ink components, semantic color variables

### Pi / Antigravity
- **Framework**: Custom component system
- **Components**: Text, Box, Container, Markdown, Image, SelectList, SettingsList, DynamicBorder, BorderedLoader, CustomEditor
- **Interface**: `render(width: number): string[]`, `handleInput?(data)`, `invalidate()`
- **Keyboard**: `matchesKey(data, Key.up/down/enter/escape)`, `Key.ctrl("c")`
- **UI Patterns**: Status bar, widgets, footer, overlays, custom editors

### Gemini CLI / Codex
- Terminal UI via framework conventions
- Less extensive TUI system than others

## Online Sources
Always fetch the latest docs before building:
- OpenCode: https://opencode.ai/docs/
- Claude Code: https://code.claude.com/docs/en/overview
- Gemini CLI: https://cloud.google.com/gemini-cli/docs
- Pi: https://pi.dev/
- Antigravity: https://antigravity.sh/docs
- Codex: https://github.com/openai/codex
- Wo Coder: packages/@wayofmono/wo-agent/
