---
title: "[PROJ-022] Documentation Sync Updater: Auto-Fetch Latest Tool Docs"
type: "Feature"
priority: "High"
status: "Backlog"
assignee: "@wo-team"
created: "2026-06-09"
---

## Context
We need a system that continuously monitors and fetches the latest documentation from all supported agent frontends to keep our skills, agents, extensions, sidecars, and tool-specific configurations up to date. This ensures the AI Engineering Harness always reflects current best practices and APIs.

**Source URLs to Monitor:**
- Pi: https://pi.dev/docs/latest
- Gemini CLI: https://geminicli.com/docs/
- OpenCode: https://opencode.ai/docs/cli/
- Claude Code: https://code.claude.com/docs/en/overview
- Codex: https://developers.openai.com/codex/cli
- Antigravity: https://antigravity.google/docs/cli-overview

## Requirements & Scope
- [ ] Create `docs-sync-updater` skill at `packages/@aiengineeringharness/skills/docs-sync-updater/`
- [ ] Create `SKILL.md` with system prompt for autonomous documentation monitoring
- [ ] Create `doc-fetcher.ts` - Core fetching logic (Deno, cross-platform)
- [ ] Create `source-adapters/` - Pluggable adapters for each documentation source:
  - [ ] `pi-adapter.ts` - Fetches from pi.dev/docs/latest
  - [ ] `gemini-adapter.ts` - Fetches from geminicli.com/docs/
  - [ ] `opencode-adapter.ts` - Fetches from opencode.ai/docs/cli/
  - [ ] `claude-adapter.ts` - Fetches from code.claude.com/docs/en/overview
  - [ ] `codex-adapter.ts` - Fetches from developers.openai.com/codex/cli
  - [ ] `antigravity-adapter.ts` - Fetches from antigravity.google/docs/cli-overview
- [ ] Implement `fetch_latest_docs()` - Runs all adapters, returns normalized doc changes
- [ ] Implement `detect_breaking_changes()` - Compares fetched docs with current skill/agent configs
- [ ] Implement `generate_update_tickets()` - Creates PROJ tickets for required updates (uses PROJ-017 auto-ticket-creator)
- [ ] Implement `update_skill_configs()` - Auto-updates skill configs for non-breaking changes (new commands, flags, options)
- [ ] Add scheduling:
  - [ ] Runs on harness startup
  - [ ] Runs on timer (configurable, default 24 hours)
  - [ ] Runs on manual trigger: `ai-harness docs sync`
- [ ] Add CLI commands:
  - [ ] `ai-harness docs sync` - Fetch all, show diff, create tickets
  - [ ] `ai-harness docs sync --source=claude,gemini` - Selective sources
  - [ ] `ai-harness docs watch` - Continuous monitoring daemon
  - [ ] `ai-harness docs status` - Show last sync, pending updates
- [ ] Cross-platform: `.sh` + `.bat`/.ps1 for all scripts

## Technical Notes
- Uses Deno runtime (cross-platform, built-in HTTP, HTML parsing via `deno-dom` or similar)
- Adapters use strategy pattern for easy extension
- State tracking: `.wo/state/docs-sync-state.json` (last fetch, etags, content hashes)
- Configuration: `.wo/config/docs-sync.json` (sources, intervals, auto-update vs ticket-only)
- Breaking change detection: diff tool descriptions, command schemas, config formats
- Non-breaking auto-updates: new flags, deprecated notices, example updates
- Breaking changes → create PROJ tickets via Ticket Manager (PROJ-013)
- Integration with Skill Auto-Update (PROJ-014) for skill config updates
- Cross-platform Deno scripts with `.sh`/`.bat`/`.ps1` wrappers
- **All documentation and tickets in English**

## Success Criteria
- [ ] `ai-harness docs sync` fetches from all 6 sources in <60 seconds
- [ ] Detects new commands, flags, config options, deprecations
- [ ] Auto-updates skill configs for non-breaking changes
- [ ] Creates PROJ tickets for breaking changes with context
- [ ] Daemon mode runs continuously with configurable interval
- [ ] State persists across runs (etags, hashes for efficient diffing)
- [ ] Works on Linux, macOS, Windows
- [ ] All generated tickets and documentation in English