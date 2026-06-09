---
title: "[PROJ-017] Auto-Ticket Creation Skill: Monitor Updates & Generate Tickets"
type: "Feature"
priority: "High"
status: "Backlog"
assignee: "@wo-team"
created: "2026-06-09"
---

## Context
We need a skill that autonomously monitors the codebase, dependencies, and external sources for updates/new code, and automatically creates tickets for:
- Agent updates (core, WOW, Opticat, project agents)
- Skill updates (new skills in ref/, updated skills in harness)
- Dependency updates (npm packages, Deno modules, system dependencies)
- Security advisories
- New platform features (Claude Code, Gemini, OpenCode, Codex releases)
- Breaking changes in upstream projects

This skill works with the Ticket Manager (PROJ-013) and Skill Auto-Update (PROJ-014) to create a closed loop: detect change → create ticket → assign → track → complete → sync.

## Requirements & Scope
- [ ] Create skill at `packages/@aiengineeringharness/skills/auto-ticket-creator/`
- [ ] Create `SKILL.md` with system prompt for autonomous monitoring
- [ ] Create `monitor.ts` - Core monitoring logic (Deno, cross-platform)
- [ ] Create `ticket-generator.ts` - Generates tickets from detected changes
- [ ] Create `source-adapters/` - Pluggable adapters for different sources:
  - [ ] `git-adapter.ts` - Monitors git commits, tags, branches for changes
  - [ ] `npm-adapter.ts` - Monitors npm registry for package updates
  - [ ] `deno-adapter.ts` - Monitors Deno registry (jsr.io) for module updates
  - [ ] `github-adapter.ts` - Monitors GitHub releases, security advisories, dependabot
  - [ ] `ref-adapter.ts` - Monitors `ref/skills/` and `ref/agents/` for new content
  - [ ] `platform-adapter.ts` - Monitors agent frontend releases (Claude, Gemini, OpenCode, Codex, etc.)
- [ ] Implement `detect_changes()` - Runs all adapters, returns normalized change events
- [ ] Implement `classify_change()` - Categorizes: agent-update, skill-update, dep-update, security, breaking-change
- [ ] Implement `generate_ticket()` - Creates ticket markdown with proper namespace (WOW, OPT, PROJ, TEAM)
- [ ] Implement `assign_ticket()` - Auto-assigns based on change type (WOW→WOW agents, Opticat→Opticat agents, etc.)
- [ ] Add scheduling: runs on startup, on timer (configurable), on git hooks (post-merge, post-checkout)
- [ ] Add CLI commands:
  - [ ] `ai-harness monitor --once` - Single scan
  - [ ] `ai-harness monitor --daemon` - Continuous monitoring
  - [ ] `ai-harness monitor --source=github,npm,ref` - Selective sources
- [ ] Cross-platform: `.sh` + `.bat`/.ps1 for all scripts, Deno for core logic
- [ ] Integrate with Ticket Manager tools (`create_ticket`, `update_ticket`)
- [ ] Integrate with Skill Auto-Update (PROJ-014) for skill-related tickets

## Technical Notes
- Uses Deno runtime (cross-platform, built-in HTTP, FS watching, subprocess)
- Adapters use strategy pattern for easy extension
- Ticket generation uses templates per namespace (WOW, OPT, PROJ, TEAM)
- Deduplication: tracks seen changes via content hash in `.wo/state/monitor-state.json`
- Configuration: `.wo/config/monitor.json` (sources, intervals, filters, assignees)
- Windows: `.bat` wrappers call `deno run -A monitor.ts`; PowerShell for advanced features
- Git hooks: `.git/hooks/post-merge` (Unix) + `.git/hooks/post-merge.bat` (Windows)
- Must work on Linux, macOS, Windows (tested on all three)

## Success Criteria
- [ ] Skill detects new skills in `ref/skills/` and creates PROJ tickets
- [ ] Skill detects npm/Deno dependency updates and creates PROJ tickets
- [ ] Skill detects GitHub security advisories and creates HIGH priority tickets
- [ ] Skill detects WOW/Opticat spec changes and creates WOW/OPT tickets
- [ ] Skill detects agent frontend releases and creates update tickets
- [ ] Generated tickets have correct namespace, assignee, priority, and context
- [ ] `ai-harness monitor --once` completes in <30 seconds
- [ ] Daemon mode runs continuously with configurable interval (default 1 hour)
- [ ] Cross-platform: all scripts work on Linux, macOS, Windows
- [ ] Integration with Ticket Manager: tickets appear in `/sync team` dashboard
- [ ] Deduplication prevents duplicate tickets for same change