---
title: "[PROJ-003] Implement @wayofmono/wo-tui — Terminal UI Library"
type: "Feature"
priority: "Critical"
status: "In Progress"
assignee: "@zerwiz"
created: "2024-05-09"
---

## Context
The `@wayofmono/wo-tui` package provides terminal rendering primitives for the agent runtime and extensions. Reference: `@earendil-works/pi-tui` (25 source files). This ticket tracks porting pi-tui's TUI framework, components, and editor infrastructure to wo-tui.

## Current Status
wo-tui package exists but is far behind pi/tui. Most components and the core TUI framework are missing.

## Missing vs pi/tui (20+ files)

### Core Framework
- [ ] `tui.ts` — TUI framework: Container hierarchy, Component lifecycle, render tree, process management, input dispatch
- [ ] `terminal.ts` — Terminal backends: `NodeTTY` (raw mode, resize, focus), `ProcessTerminal` (process embedding)
- [ ] `index.ts` — Barrel exports with all components

### Components (pi has 12, wo needs port)
- [ ] `components/text.ts` — Styled text element (color, bold, dim, italic, underline)
- [ ] `components/box.ts` — Bordered container with title, padding, alignment
- [ ] `components/input.ts` — Single-line input with cursor, placeholder
- [ ] `components/editor.ts` — Multi-line editor (Emacs keybindings, selection, scroll)
- [ ] `components/select-list.ts` — Interactive selection list with keyboard navigation
- [ ] `components/settings-list.ts` — Settings-style key/value list
- [ ] `components/loader.ts` — Loading spinner (animated frames)
- [ ] `components/cancellable-loader.ts` — Cancelable spinner with abort callback
- [ ] `components/markdown.ts` — Markdown to ANSI rendering
- [ ] `components/image.ts` — Terminal image rendering (kitty protocol, sixel, iterm2)
- [ ] `components/spacer.ts` — Flexible vertical/horizontal spacing
- [ ] `components/truncated-text.ts` — Text with visual truncation indicator

### Editor Infrastructure
- [ ] `editor-component.ts` — Full editor component (autocomplete, undo, kill-ring, paste detection)
- [ ] `autocomplete.ts` — Autocomplete engine (fuzzy matching, suggestion rendering)
- [ ] `fuzzy.ts` — Fuzzy string matching (score, find, filter)
- [ ] `kill-ring.ts` — Emacs-style kill ring for cut/copy/paste
- [ ] `undo-stack.ts` — Undo/redo stack with checkpoint support
- [ ] `stdin-buffer.ts` — Raw stdin buffering with paste detection (bracketed paste)

### Input/Key Handling
- [ ] `keys.ts` — Key event types (KeyPress, KeyModifier, escape sequence parsing)
- [ ] `keybindings.ts` — Keybinding system (register, unregister, dispatch, chord handling)
- [ ] `utils.ts` — Terminal utilities (cursor movement, clear, scroll, save/restore)

### Terminal Utilities
- [ ] `terminal-image.ts` — Image display protocol negotiation and rendering

## Text Utilities (may belong in wo-sh if it existed)
- [ ] `truncateToWidth()` — Smart string truncation with ellipsis
- [ ] `wrapText()` — Word-wrap for terminal output
- [ ] `stripAnsi()` — Strip ANSI codes for width calculation
- [ ] OSC 8 hyperlink rendering (file links, URLs)

## Theme Support
- [ ] Theme object with colors and styles
- [ ] Custom theme registration
- [ ] Default dark/light themes

## Verification
- [ ] `npm run test` passes
- [ ] `npm run build` produces valid ESM output
- [ ] Text and Box render correct ANSI output
- [ ] Widget system renders and updates lifecycle
- [ ] `ui.input()` captures input interactively
- [ ] ProcessTerminal captures raw keypresses
