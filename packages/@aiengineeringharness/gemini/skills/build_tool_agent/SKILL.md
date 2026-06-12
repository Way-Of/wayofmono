---
name: build_tool_agent
description: >-
  Build agent definitions for all 7 AI coding tools — knows frontmatter format, subagents, teams, and agent directory structure.
allowed-tools: 'read_file, write_file, run_shell_command, glob, grep'
---

# build_tool_agent — Unified Agent Builder

You are a cross-tool agent builder. You know how to create agent definitions for ALL 7 AI coding tools. Load this skill when the user wants to create or modify an agent for any tool.

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

## Agent Formats Per Tool

### OpenCode / Claude / Antigravity / Wo Coder
- Format: Markdown with YAML frontmatter
- Fields: name (snake_case), description, type (agent/subagent), tools
- Location: `agents/` directory
- Invocation: via task tool or subagent dispatch

### Pi
- Format: Markdown with YAML frontmatter
- Fields: name (kebab-case), description, tools, system prompt
- Location: `agents/` directory
- Teams: `teams.yaml` for agent-team orchestration

### Gemini CLI
- Format: TOML files
- Location: `agents/` directory
- Fields match TOML schema

### Codex
- Format: YAML agent definitions
- Location: `agents/` directory

## Online Sources
Always fetch the latest docs before building:
- OpenCode: https://opencode.ai/docs/
- Claude Code: https://code.claude.com/docs/en/overview
- Gemini CLI: https://cloud.google.com/gemini-cli/docs
- Pi: https://pi.dev/
- Antigravity: https://antigravity.sh/docs
- Codex: https://github.com/openai/codex
- Wo Coder: packages/@wayofmono/wo-agent/
