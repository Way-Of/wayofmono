---
title: "[PROJ-002] Adapt @wayofmono/wo-ai — 50 files from pi/ai, 0% done"
type: "Feature"
priority: "Critical"
status: "In Progress"
assignee: "@zerwiz"
created: "2026-05-13"
---

## Context
50 pi/ai source files copied in. ALL imports reference `@earendil-works/pi-*`. Need full adaptation to `@wayofmono/wo-*`.

## Requirements
- [ ] Create package.json with correct name, deps, exports
- [ ] Bulk find-and-replace all pi import paths → wo
- [ ] Fix index.ts exports
- [ ] Fix type/schema differences
- [ ] Build with zero TypeScript errors
- [ ] Test

## Deps
wo-ai has no internal wo deps (it's the bottom of the stack).

## Success Criteria
- [ ] `npm run build` zero errors
- [ ] All provider files compile (18 providers from pi)
