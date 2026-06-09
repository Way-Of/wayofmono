---
title: "[PROJ-003] Adapt @wayofmono/wo-tui — 25 files from pi/tui, 0% adapted"
type: "Feature"
priority: "Critical"
status: "In Progress"
assignee: "@zerwiz"
created: "2026-05-13"
---

## Context
25 pi/tui source files copied in. ALL imports reference `@earendil-works/pi-*`. Need full adaptation.

## Files (25 total from pi/tui)
- `tui.ts` — TUI framework core
- `terminal.ts` — ProcessTerminal + NodeTTY backends
- `keys.ts` — Key event parsing (Kitty protocol, legacy)
- `keybindings.ts` — Keybinding system
- `stdin-buffer.ts` — Raw stdin buffering
- `terminal-image.ts` — Image display protocols
- `autocomplete.ts` — Autocomplete engine
- `fuzzy.ts` — Fuzzy string matching
- `editor-component.ts` — Editor component
- `kill-ring.ts` — Emacs kill ring
- `undo-stack.ts` — Undo/redo stack
- `utils.ts` — Terminal utilities
- `index.ts` — Barrel exports
- `components/` — 12 component files (box, text, input, editor, select-list, settings-list, spacer, loader, cancellable-loader, markdown, image, truncated-text)

## Requirements
- [ ] Create/restore package.json with correct name, deps, exports
- [ ] Bulk find-and-replace all pi import paths → wo
- [ ] Fix index.ts exports (must export ALL components that wo-agent needs)
- [ ] Fix any type/schema differences from pi to wo
- [ ] Build with zero TypeScript errors

## Dependencies
- wo-ai (for types used in some tui components)

## Success Criteria
- [ ] `npm run build` zero errors
- [ ] All 25 files compile
- [ ] Components render correctly via TuiEngine
