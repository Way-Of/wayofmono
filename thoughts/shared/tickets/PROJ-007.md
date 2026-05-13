---
title: "[PROJ-007] Implement @wayofmono/wo-coding-agent — CLI Coding Agent"
type: "Feature"
priority: "Critical"
status: "In Progress"
assignee: "@zerwiz"
created: "2026-05-13"
---

## Context
The `@wayofmono/wo-coding-agent` package is the CLI application. Reference: `@earendil-works/pi-coding-agent` (363 source files). Wo has 43 source files — **88% missing**.

### Architecture: Project-Local
`wo` stores everything in `<project-root>/.wo/`. Global `~/.wo/` fallback is secondary.

## Where We Actually Are

| Category | pi ref files | wo files | Coverage |
|----------|-------------|---------|----------|
| Interactive mode | 1 + 36 components + theme = 38 | 1 stub | **3%** |
| Core session | ~30 files | ~8 files | **27%** |
| Tools | 15 files | 13 files | **87%** |
| CLI infra | 10 files | 3 files | **30%** |
| Utils | 22 files | 14 files | **64%** |
| Extensions | 8 files | 0 | **0%** |
| Config/other | 5 files | 4 files | **80%** |

## Critical Path: Interactive Mode — BULK COPY FROM PI

The interactive mode at `ref/pi/coding-agent/src/modes/interactive/` is 5512 lines + 36 components + theme system. It must be copied wholesale, then import paths adapted. DO NOT REWRITE.

### What needs to happen:
- [x] Phase 1: Scaffold (DONE)
- [x] Phase 2: Real AgentSession with ReAct loop (DONE)
- [x] Phase 3: Real Tool implementations (DONE)
- [ ] **Phase 4: Interactive Mode — BULK COPY from pi reference**
  - [ ] Copy entire `ref/pi/coding-agent/src/modes/interactive/` (38 files)
  - [ ] Find-and-replace `@earendil-works/pi-*` → `@wayofmono/wo-*`
  - [ ] Copy missing wo-tui components that interactive mode depends on
  - [ ] Copy missing wo-coding-agent core modules (keybindings, footer-data-provider, etc.)
  - [ ] Build and fix TypeScript errors — ITERATE UNTIL GREEN
- [ ] Phase 5: Session persistence (DONE — JSONL via wo-agent-core)
- [ ] Phase 6: Compaction (DONE)
- [ ] Phase 7: Settings & Auth (need file persistence)
- [ ] Phase 8: Extensions & Skills (0% — need bulk copy from pi)
- [ ] Phase 9: Package Manager (0%)
- [ ] Phase 10: RPC Mode & Export (0%)

## Dependencies
- `@wayofmono/wo-tui` — 39% coverage, needs bulk copy of 12+ missing components
- `@wayofmono/wo-ai` — 10% coverage, needs bulk copy of 15+ missing providers
- `@wayofmono/wo-agent-core` — 47% coverage, needs agent loop + session system

## Success Criteria
- [ ] `wo` binary works with full interactive TUI
- [ ] All 36 interactive components render
- [ ] Chat, editor, footer, model selector, session picker all work
- [ ] `npm run build` — zero errors
