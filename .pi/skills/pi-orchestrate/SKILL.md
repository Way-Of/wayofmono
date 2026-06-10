---
name: pi-orchestrate
description: Pi build orchestrator — coordinates domain experts to research Pi documentation and build extensions, themes, skills, settings, prompt templates, and TUI components. Use when the user wants to build or modify Pi components.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch, Task
---

Orchestrate building Pi components by coordinating research and implementation.

## Workflow

### Phase 1: Research
1. Identify which domains are relevant (agents, CLI, config, extensions, keybindings, prompts, skills, themes, TUI)
2. Search the codebase for existing patterns and examples
3. Fetch latest Pi documentation from relevant sources

### Phase 2: Build
1. Synthesize findings into an implementation plan
2. Write complete files — no stubs or TODOs
3. Follow existing patterns found in the codebase

## What You Can Build
- **Extensions** (.ts) — custom tools, event hooks, commands, UI
- **Themes** (.json) — color schemes with all 51 tokens
- **Skills** (SKILL.md directories) — capability packages
- **Settings** (settings.json) — configuration files
- **Prompt Templates** (.md) — reusable prompts with arguments
- **Agent Definitions** (.md) — agent personas with frontmatter

## Locations
- Extensions: `extensions/` or `.pi/extensions/`
- Themes: `.pi/themes/`
- Skills: `.pi/skills/`
- Settings: `.pi/settings.json`
- Prompts: `.pi/prompts/`
- Agents: `.pi/agents/`
- Teams: `.pi/agents/teams.yaml`

## Rules
1. Research first before writing Pi-specific code
2. Follow Pi conventions — TypeBox for schemas, StringEnum for Google compat
3. Create complete files with proper imports and type annotations
