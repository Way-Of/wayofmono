---
name: claude_orchestrate
description: Claude Code build orchestrator — coordinates domain experts to research Claude Code documentation and build skills, settings, project steering rules, output styles, and plugins. Use when the user wants to build or modify Claude Code components.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch, Task
---

# Claude Code Build Orchestration

Orchestrate building Claude Code components by coordinating research and implementation.

## Workflow

### Phase 1: Research
1. Identify which domains are relevant (skills, config, project rules, output styles, keybindings, plugins, MCP servers).
2. Search the codebase for existing patterns and examples.
3. Fetch latest Claude Code online documentation.

### Phase 2: Build
1. Synthesize findings into a clear implementation plan.
2. Write complete files — no stubs or TODO comments.
3. Follow existing conventions found in the codebase.

---

## What You Can Build
- **Project Steering Rules** (`CLAUDE.md`) — Project-level guidelines loaded at session startup (<300 lines).
- **Sub-Scoped Modular Rules** (`.claude/rules/*.md`) — Rules targeted at specific file path patterns using frontmatter.
- **Custom Output Styles** (`.claude/output-styles/*.md`) — Formats and style prompts with keep-coding-instructions options.
- **Skills** (`.claude/skills/<name>/SKILL.md`) — Executable repeatable workflows.
- **Settings** (`settings.json`) — Configuration parameters.
- **MCP Configuration** (`.mcp.json`) — Registered stdio or SSE server connectors.

---

## Locations
- Project Steering Rules: `CLAUDE.md` at root.
- Modular Rules: `.claude/rules/` or global `~/.claude/rules/`.
- Skills: `.claude/skills/<name>/` or global `~/.claude/skills/<name>/`.
- Settings: `.claude/settings.json` or global `~/.claude/settings.json`.
- Output Styles: `.claude/output-styles/` or global `~/.claude/output-styles/`.
- MCP Servers: `.mcp.json` or global `~/.claude/.mcp.json`.

---

## Rules
1. Always research existing patterns before writing code.
2. Keep `CLAUDE.md` concise (<300 lines).
3. Use snake_case for directories under the Claude skills directory, matching harness conventions.
