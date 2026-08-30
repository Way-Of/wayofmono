---
name: antigravity_orchestrate
description: Antigravity build orchestrator — coordinates domain experts to research Antigravity documentation and build extensions, themes, skills, settings, prompt templates, and TUI components. Use when the user wants to build or modify Antigravity components.
docs-url: 
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch, Task
---

Orchestrate building Antigravity components by coordinating research and implementation.

## Workflow

### Phase 1: Research
1. Identify which domains are relevant (agents, CLI, config, extensions, keybindings, prompts, skills, themes, TUI)
2. Search the codebase for existing patterns and examples
3. Fetch latest Antigravity documentation from relevant sources

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
- **Plugins** (plugin.json) — namespaced bundles grouping skills, hooks, rules, and MCP servers
- **Background Sidecars** (sidecar.json) — managed background cron processes or service daemons
- **Hooks & Interceptors** (hooks.json) — shell-interceptors for lifecycle events (e.g. PreToolUse, PostInvocation)

## Locations
- Extensions: `extensions/` or `.agents/extensions/`
- Themes: `.agents/themes/`
- Skills: `.agents/skills/`
- Settings: `.agents/settings.json`
- Prompts: `.agents/prompts/`
- Agents: `.agents/agents/`
- Teams: `.agents/agents/teams.yaml`
- Plugins: `plugins/<plugin_name>/plugin.json`
- Sidecars: `.agents/sidecar.json`
- Hooks: `.agents/hooks.json`

## Rules
1. Research first before writing Antigravity-specific code
2. Follow Antigravity conventions — TypeBox for schemas, StringEnum for Google compat
3. Create complete files with proper imports and type annotations
4. Always use snake_case for directories and filenames under Antigravity configurations

