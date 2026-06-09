---
title: "[PROJ-025] Platform-Agnostic Cleanup & Codex Integration"
type: "Feature"
priority: "High"
status: "Done"
assignee: "@zerwiz"
reporter: "@zerwiz"
project: "PROJ"
namespace: "proj"
category: "infrastructure"
created: "2026-06-09"
---

## Context

Two related problems discovered during system skill implementation:

**1. Hardcoded PROJ ticket references in skill files** — SKILL.md titles, .ts file headers, and help.ts user-facing output contain hardcoded `(PROJ-013)` style references. These couple the skills to the tickets that created them, making the system non-portable and creating maintenance burden. Skills should be project-agnostic — they don't need to know "I was built for PROJ-022".

**2. Codex is not a first-class platform** — The adapter already has `"codex"` in PLATFORMS array and a `toCodex()` generator, but there's no `codex/` platform directory, no manifest entry, no installer support, and no documentation.

## Requirements & Scope

### Cleanup: Remove Hardcoded PROJ References
- [ ] Strip `(PROJ-XXX)` from all SKILL.md titles (6 files: auto-ticket-creator, docs-sync-updater, help-command, skill-adapter, skill-auto-update, cto-dashboard)
- [ ] Strip `(PROJ-XXX)` from .ts file headers (5 files: monitor.ts, help.ts, adapter.ts, sync-skills.ts, dashboard.ts, team-init.ts)
- [ ] Make help.ts data-driven — replace hardcoded PROJ numbers with descriptions from skill-registry.json
- [ ] Fix ticket ID examples to use generic IDs like `TKT-001` instead of `PROJ-013` (sync.ts, team-init.ts, tools.json, help.ts)
- [ ] Keep PROJ/WOW/OPT/TEAM namespace format documentation where it documents the *ticket naming convention* (not hardcoded instance numbers)

### Platform Directory
- [ ] Create `packages/@aiengineeringharness/codex/` directory
- [ ] Create `codex/agents/` with 6 core agents (matching other platforms: codebase_analyzer, codebase_locator, codebase_pattern_finder, thoughts_analyzer, thoughts_locator, web_search_researcher)
- [ ] Create `codex/README.md` with platform-specific notes
- [ ] Create `codex/rules/` for Codex-native rules-based configuration

### Manifest & Installer
- [ ] Add `codex` tool entry to `manifest.json` (target: `~/.codex/`)
- [ ] Codex skill files in manifest (all skills, using `skill.yaml` + `prompt.md` format)
- [ ] Add `codex` to `install.ts` tool definitions and help text

### Setup Script
- [ ] Add `codex` to `setup.sh`:
  - [ ] `get_target_dir()` case entry (local and home modes)
  - [ ] Tool help text and usage examples
  - [ ] The `"all"` loop in `main()`
  - [ ] The post-install summary loop
  - [ ] Argument validation pattern

### Documentation
- [ ] Update `AGENTS.md` supported tools list to include Codex
- [ ] Update `AGENTS.md` commands table to add Codex column
- [ ] Update `AGENTS.md` agents table to add Codex column
- [ ] Update `AGENTS.md` tool-specific notes with Codex entry
- [ ] Update root `README.md` to list Codex as supported frontend

### Adapter & Generator
- [ ] Verify `adapter.ts` `toCodex()` output format is correct (skill.yaml + prompt.md)
- [ ] Run adapter to generate all codex platform skills
- [ ] Regenerate all platform copies after cleanup edits

## Technical Notes
- PROJ-XXX in SKILL.md *namespace docs* (e.g. `| PROJ-XXX | proj |`) stays — that documents the ticket format, not a hardcoded instance
- Breakage on line 37 of docs-sync-updater/SKILL.md ("create PROJ tickets") is about namespace convention — keep it
- Codex uses `rules/` directory for instructions (like Claude's `.claude/rules/`) — agents go there
- After all source edits, run adapter to regenerate all platform copies: `deno run -A adapter.ts generate --all --platform=all`

## Success Criteria
- [ ] Zero `(PROJ-0XX)` or `(PROJ-1XX)` in any skill's user-facing output
- [ ] Generic example IDs used throughout (TKT-001, TICKET-123)
- [ ] help.ts workflow views show no hardcoded PROJ numbers
- [ ] `packages/@aiengineeringharness/codex/` exists with agents, rules, and README
- [ ] `manifest.json` has `codex` tool entry
- [ ] `install.ts` accepts `--tool=codex`
- [ ] `setup.sh codex` works with dry-run
- [ ] `AGENTS.md` shows Codex column
- [ ] All platform copies regenerated and verified

## Review Notes (CTO/Lead only)
- Status: Pending
- Comments:
- Reviewed by:
- Reviewed at:

## Personal Task Breakdown (Developer fills this)
