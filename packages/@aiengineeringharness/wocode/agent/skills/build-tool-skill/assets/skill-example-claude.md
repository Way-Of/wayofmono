---
name: example_skill
description: "Example skill for Claude Code — uses snake_case dir naming and PascalCase allowed-tools"
version: "1.0"
allowed-tools: Read, Write, Bash, Grep, Glob
disable-model-invocation: true
---

# Example Skill for Claude Code

This file demonstrates the correct frontmatter for a Claude Code skill.

## Requirements
- Directory name: `example_skill` (snake_case)
- `name` field matches directory name exactly
- `allowed-tools` values are PascalCase (e.g., `Read`, `Write`, `Bash`)
- `disable-model-invocation: true` for command-style skills
- Config directory: `~/.claude/skills/`
