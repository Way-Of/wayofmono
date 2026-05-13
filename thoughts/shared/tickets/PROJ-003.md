---
title: "[PROJ-003] Implement @wayofmono/wo-tui — Terminal UI Library"
type: "Feature"
priority: "Critical"
status: "In Progress"
assignee: "@zerwiz"
created: "2024-05-09"
---

## Context
The `@wayofmono/wo-tui` package provides terminal rendering primitives. Reference: `@earendil-works/pi-tui` (54 source files). Wo has 21 source files — **39% coverage**.

## Current Status
wo-tui has the keyboard handler, TuiEngine, ProcessTerminal, basic components. But the interactive mode needs ~12 more components that wo-tui doesn't export.

## Missing Components (BULK COPY from ref/pi/tui/)

### Core framework
- [ ] `Container` — needs `alignment`, `padding` options that pi has
- [ ] `Text` — needs styled text (color, bold, dim, italic)
- [ ] `TruncatedText` — text with visual truncation (doesn't exist at all)
- [ ] `Loader` / `BorderedLoader` — animated spinner (doesn't exist at all)

### Editor infrastructure
- [ ] `CombinedAutocompleteProvider` — doesn't exist
- [ ] `EditorComponent` — multi-line editor (doesn't exist)
- [ ] `autocomplete.ts` — autocomplete engine (doesn't exist)
- [ ] `fuzzy.ts` — fuzzy matching (doesn't exist)

### Exports needed by interactive mode
- [ ] `matchesKey` — raw string key matching (currently only KeyEvent-based)
- [ ] `fuzzyFilter` — fuzzy filter utility
- [ ] `visibleWidth` — visible string width
- [ ] `hyperlink` — OSC 8 hyperlink rendering
- [ ] `getCapabilities` — terminal capability detection
- [ ] `setKeybindings` — global keybinding manager setter

### Theme support
- [ ] Theme object with colors and styles
- [ ] Custom theme registration
- [ ] Default dark/light theme files

## Strategy
Bulk copy from `ref/pi/tui/src/` and adapt imports. DO NOT rewrite.
