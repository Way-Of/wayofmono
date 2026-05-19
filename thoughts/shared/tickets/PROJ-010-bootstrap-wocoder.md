---
title: "[PROJ-010] Bootstrap wocoder package as full wayofmono harness target"
type: "Feature"
priority: "High"
status: "Backlog"
assignee: "@zerwiz"
created: "2026-05-19"
---

## Context

`packages/@aiengineeringharness/wocoder/` is an empty directory. It needs the same agents, commands, skills, and config files that claude, gemini, opencode, and pi already have — so the wo coder agent has feature parity with those tools.

## Requirements & Scope

### 1. Populate `agents/` directory
Create 6 agent `.md` files matching the shared agents (snake_case convention, like opencode/claude):
- `codebase_analyzer.md`
- `codebase_locator.md`
- `codebase_pattern_finder.md`
- `thoughts_analyzer.md`
- `thoughts_locator.md`
- `web_search_researcher.md`

Contents can reference existing agents in `opencode/agents/` as the source of truth.

### 2. Populate `commands/` directory
Create `.md` command files (opencode convention) for all shared commands:
- `commit.md`
- `create_plan.md`
- `debug.md`
- `debug-k8s.md`
- `implement_plan.md`
- `init_harness.md`
- `research_codebase.md`
- `validate_plan.md`
- `validate_telemetry.md`
- `worktree.md`
- `otel_instrument.md` (if not already in opencode)

Contents can reference `opencode/commands/` as the source of truth.

### 3. Populate `skills/` directory
Create all shared skills matching the other tools:
- `experimental-pr-workflow/`
- `git-commit-helper/`
- `improve-codebase-architecture/`
- `init_harness/`
- `interview/`
- `observability-driven-development/`
- `otel_collector/`
- `otel_instrumentation/`
- `otel_instrument/`
- `otel_ottl/`
- `otel_semantic_conventions/`
- `pr-description-generator/`
- `prd-to-issues/`
- `tdd/`
- `write-a-prd/`

Contents can reference `opencode/skills/` as the source of truth.

### 4. Populate `extensions/` directory
Copy extensions from `pi/extensions/` to give wocoder the same extension capabilities:
- `open-editor.ts` — Open files from cwd in `$VISUAL/$EDITOR`
- `subagent/` — Multi-agent workflows (planner, reviewer, scout, worker)

### 5. Create config files
Create a `wocoder.json` (or equivalent config file) with MCP server definitions matching the pattern from `opencode/opencode.json`.

### 6. Update `setup.sh`
Add `wocoder` as a supported tool:
- Target directory: `~/.wocoder/` (or appropriate path)
- Handle in the `get_target_dir()` case statement
- Add to the "all" installer loop

### 7. Update `manifest.json`
Add a `"wocoder"` entry under `"tools"` with all components, files, and their destinations.

### 8. Update `AGENTS.md`
Add wocoder row to the tables in `packages/@aiengineeringharness/AGENTS.md`.

### 9. Update `install.ts`
Update help text and repo mode instructions to include wocoder.

### 10. Update `README.md`
Add wocoder to supported tools and installation instructions.

## Technical Notes

- Use the same snake_case naming convention as opencode/claude.
- Agent `.md` frontmatter should omit tool-specific fields (no `tools:` or `model:` from pi's kebab-case agents).
- Skill contents should reference the existing `opencode/skills/` files as templates (they are the most complete set).
- The wocoder config file should mirror `opencode/opencode.json` structure.

## Success Criteria

- [ ] `packages/@aiengineeringharness/wocoder/` has agents, commands, skills, extensions, and config files matching other tools
- [ ] `setup.sh wocoder` runs without error
- [ ] `setup.sh all` includes wocoder
- [ ] `manifest.json` has complete wocoder entry (including extensions)
- [ ] `AGENTS.md` has wocoder in all tables
- [ ] `README.md` and `install.ts` reference wocoder
