---
title: "[PROJ-005] Adapt @wayofmono/wo-agent-core — 25 files from pi/agent, 0% adapted"
type: "Feature"
priority: "Critical"
status: "In Progress"
assignee: "@zerwiz"
created: "2026-05-13"
---

## Context
25 pi/agent source files copied in. ALL imports reference `@earendil-works/pi-*`. Need full adaptation to `@wayofmono/wo-*`.

## Files (25 from pi/agent)
- `agent.ts` + `agent-loop.ts` — Core agent loop (LLM request/response, tool calling, steering)
- `proxy.ts` — Remote proxy streaming
- `types.ts` — Agent types (AgentState, AgentEvent, AgentTool, StreamFn, etc.)
- `index.ts` — Barrel exports
- `harness/` — Harness system: agent-harness, messages, system-prompt, prompt-templates, skills, types, execution-env
- `harness/compaction/` — Compaction (cut-point, LLM summarization, branch summarization)
- `harness/session/` — Session system (session.ts, uuid.ts, storage/ jsonl+memory, repo/ jsonl+memory+shared)
- `harness/env/` — Node.js execution environment
- `harness/utils/` — Shell output, truncation

## Requirements
- [ ] Create/restore package.json with correct name, deps, exports
- [ ] Bulk find-and-replace all pi import paths → wo
- [ ] Fix index.ts exports (must export what wo-agent needs)
- [ ] Fix type/schema differences between pi types and wo types
- [ ] Build with zero TypeScript errors

## Dependencies
- wo-ai (for Message, Model, streamSimple types)

## Success Criteria
- [ ] `npm run build` zero errors
- [ ] All 25 files compile
- [ ] Agent loop logic preserved
