---
title: "[PROJ-007] Adapt @wayofmono/wo-coding-agent — SAME pi/coding-agent copy, needs redefinition"
type: "Feature"
priority: "Critical"
status: "In Progress"
assignee: "@zerwiz"
created: "2026-05-13"
---

## Context
wo-coding-agent has the same 141 pi/coding-agent files as wo-agent. This was a bulk copy. These packages need to be differentiated:

- **wo-agent** — embeddable user agent SDK (pure async, programmable API, no CLI)
- **wo-coding-agent** — thin CLI shell that uses wo-agent (the `wo` binary)

Currently both have identical content. wo-coding-agent needs to be trimmed to JUST the CLI wrapper.

## Requirements
- [ ] Remove core/ duplicated wo-agent logic (keep only CLI dispatch)
- [ ] Instead of its own core, import from wo-agent
- [ ] Keep only: main.ts, cli.ts, cli/ (args, file-processor, etc.), modes/ (thin wrappers)
- [ ] Build with zero TypeScript errors

## Dependencies
- wo-agent (for agent logic)
- wo-tui (for TUI interactive mode)
- wo-ai (for model config)

## Success Criteria
- [ ] `wo` binary works via wo-coding-agent
- [ ] Calls through to wo-agent for all agent logic
- [ ] `npm run build` zero errors
