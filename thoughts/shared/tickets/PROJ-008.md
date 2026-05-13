---
title: "[PROJ-008] BULK COPY pi reference → @wayofmono/* packages"
type: "Task"
priority: "Critical"
status: "In Progress"
assignee: "@zerwiz"
created: "2026-05-13"
---

## Context
Pi reference at `ref/pi/` has 587 source files across 4 packages. Wo has 98 source files across 4 packages. **17% coverage.** Selective porting wasted time — we need to bulk copy entire directories, then adapt imports.

## File Count Reality

| Package | pi files | wo files | Coverage | Copy Priority |
|---------|----------|----------|----------|---------------|
| wo-ai | 125 | 13 | 10% | Medium |
| wo-agent-core | 45 | 21 | 47% | Low (diff arch) |
| wo-tui | 54 | 21 | 39% | High |
| wo-coding-agent | 363 | 43 | 12% | **CRITICAL** |

## Strategy: Copy everything, then adapt

1. Copy entire pi directories over wo source directories
2. Bulk find-and-replace `@earendil-works/pi-*` → `@wayofmono/wo-*`
3. Fix type mismatches, build, iterate

## Immediate: wo-coding-agent interactive mode (38 files)

`ref/pi/coding-agent/src/modes/interactive/` → `wo-coding-agent/src/modes/interactive/`
- `interactive-mode.ts` (5512 lines — contains ALL the TUI logic)
- `components/` (36 files — every UI widget)
- `theme/` (4 files — dark/light themes)

Then adapt:
- `@earendil-works/pi-tui` → `@wayofmono/wo-tui`
- `@earendil-works/pi-ai` → `@wayofmono/wo-ai`
- `@earendil-works/pi-agent-core` → `@wayofmono/wo-agent-core`
- Various internal core imports (`../../core/keybindings.js`, `../../core/footer-data-provider.js`, etc.)

### Blocking: Missing wo-tui exports
The interactive mode imports from pi-tui which wo-tui doesn't export yet:
- `Container`, `Text`, `Spacer`, `Markdown`, `Loader`, `TruncatedText`
- `matchesKey` (raw key matching), `ProcessTerminal`
- `TUI` (TuiEngine), `fuzzyFilter`, `visibleWidth`
- `hyperlink`, `getCapabilities`, `setKeybindings`
- `CombinedAutocompleteProvider`, `EditorComponent`

### Blocking: Missing wo-coding-agent core modules
- `../../core/keybindings.js` — KeybindingsManager
- `../../core/footer-data-provider.js` — FooterDataProvider
- `../../core/extensions/` — Extension runner + contexts
- `../../core/slash-commands.js` — Built-in slash commands
- `../../core/provider-display-names.js` — Display names
- `../../core/session-cwd.js` — CWD validation
- `../../core/resource-loader.js` — Resource loader
- `../../core/source-info.js` — Source info types
- `../../core/session-manager.js` — Session tree manager
- `../../core/messages.js` — Custom messages

## Plan

### Round 1: Interactive mode (NOW)
- [x] Copy `ref/pi/coding-agent/src/modes/interactive/` → wo-coding-agent (38 files)
- [ ] Replace all pi import paths → wo import paths
- [ ] Copy missing wo-tui exports from pi/tui reference
- [ ] Create stubs for missing wo-coding-agent core modules
- [ ] Build and fix errors

### Round 2: wo-tui missing components
- [ ] Copy `ref/pi/tui/src/components/` → wo-tui (12+ missing)
- [ ] Copy `ref/pi/tui/src/` infrastructure files (autocomplete, fuzzy, etc.)
- [ ] Export everything from index.ts
- [ ] Build and fix errors

### Round 3: wo-coding-agent core modules
- [ ] Copy remaining core modules from pi reference
- [ ] Adapt to wo-* types
- [ ] Build and fix errors

### Round 4: wo-ai providers
- [ ] Copy additional providers from pi/ai (vertex, bedrock, azure, etc.)
- [ ] Adapt types to wo-ai schema
- [ ] Build and fix errors
