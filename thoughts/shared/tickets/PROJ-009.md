---
title: "[PROJ-009] Adapt @wayofmono/wo-agent — 141 files from pi/coding-agent, 0% adapted"
type: "Feature"
priority: "Critical"
status: "In Progress"
assignee: "@zerwiz"
created: "2026-05-13"
---

## Context
wo-agent now has the FULL pi/coding-agent (141 files). It will be adapted into an embeddable user agent SDK.

## What It Is
```ts
import { createAgent } from "@wayofmono/wo-agent";

const agent = await createAgent({
  model: { api: "anthropic", modelId: "claude-sonnet-4-20250514" },
  skills: ["documentation", "file-operations", "search"],
});

const result = await agent.prompt("summarize the README files");
console.log(result.content);
```

Pure async API. No stdin/stdout dependency. No TUI dependencies. Programmable.

## What It Has (from pi/coding-agent, all need adaptation)
- AgentSession (3110 lines) — session management, tool loop, events
- Interactive mode (5512 lines + 36 components) — TUI for local use
- Tools (bash, read, write, edit, grep, find, ls) — file operations
- Extensions system — plugin loading
- Skills system — SKILL.md loading
- Settings, auth, model registry, session manager
- CLI infrastructure — arg parsing, session picker, config selector
- Utilities — shell, git, syntax highlighting, paths, etc.
- Print mode, RPC mode

## Adaptation Needed
- [ ] Create/restore package.json with correct name, deps, exports
- [ ] Bulk find-and-replace ALL `@earendil-works/pi-*` → `@wayofmono/wo-*`
- [ ] Fix index.ts exports
- [ ] Fix type/schema differences
- [ ] Build: fix TypeScript errors (ITERATE)
- [ ] Transform CLI-oriented code into pure async SDK where appropriate

## Blocking Dependencies
- wo-ai (50 files, needs adaptation first)
- wo-tui (25 files, needs adaptation first - for interactive mode)
- wo-agent-core (25 files, needs adaptation first)

## Success Criteria
- [ ] `npm run build` zero errors
- [ ] All 141 files compile with wo import paths
- [ ] `createAgent()` factory works
