---
name: build_skill_creator
description: >-
  Auto-create skills with proper documentation, prompts, keybindings, and
  orchestration logic
allowed-tools: 'Codegen, Write, File'
---

# Skill Creator Skill

Automatically creates skills with proper documentation, prompts, keybindings, and orchestration logic.

## Commands

- `/create-skill <name> <description> <namespace>` - Create new skill
- `/generate-docs <skill-path>` - Generate documentation
- `/create-prompts <skill-name>` - Create prompts
- `/validate-syntax` - Validate skill file before commit

## Documentation Structure

Each skill includes:
- `SKILL.md` - Main documentation
- `readme.md` - User-facing readme  
- `docs/requirements.md` - Requirements
- `docs/examples/` - Example usage

## Tool-Specific Setup

Creates harness-specific files:
- Prompt templates
- Keybindings
- Orchestration logic
- Visual themes
- TUI panels

## Naming Convention

- Canonical: kebab-case in `docs/skills/`
- Tool-specific: `<tool>_skillname` or just `skillname`
- Examples: `auto-ticket-creator.md` (canonical)
