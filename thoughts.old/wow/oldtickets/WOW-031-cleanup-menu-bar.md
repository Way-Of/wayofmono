# [WOW-031] Clean up Menu Bar — Remove dead VS Code-style editor menus

## Problem Statement

The header menu bar displays File, Edit, Selection, Go, Run, Terminal, Help, Agents, and Settings buttons. Some menus (Selection, Go, Run, Terminal) are VS Code-style editor menus inherited from Way of Pi. They only function in "Technical" mode and show disabled/placeholder items in "Simple" mode. They clutter the header.

## Desired Outcome

A clean, minimal header menu bar with only menus relevant to Way of Work's actual functionality. The dead editor menus are removed; the remaining menus (File, Edit, View, Help, Agents, Settings) are streamlined to contain only working actions.

## Context & Background

### Current State

The header (`src/components/MenuBar.tsx`) renders 10 menu labels:
- **File** — Save, Revert file from disk, Refresh workspace tree, Copy workspace path (only works in Technical mode; shows these few items in Simple mode) — **KEEP** (used to open folders in file tree)
- **Edit** — Undo/Redo, Cut/Copy/Paste, Find/Replace, comment toggles (all disabled/no-op in Simple mode) — **KEEP**
- **Selection** — Select All, expand/shrink, multi-cursor (all disabled/no-op in Simple mode)
- **View** — Command palette, layout switching, Appearance/Editor Layout flyouts, chat mode, workspace views catalog (partially functional)
- **Go** — Back/Forward, Go to File, Go to Symbol, etc. (no-op/disbled in Simple mode)
- **Run** — Start/Stop debugging, breakpoints (no-op in Simple mode)
- **Terminal** — New Terminal, Split Terminal, Run Task, etc. (no-op in Simple mode)
- **Help** — Keyboard shortcuts, documentation links (partially functional) — **KEEP**
- **Agents** — Open teams.yaml, create agent markdown, reload agents, configure model (functional)
- **Settings** — Various settings modals (functional)

There is already a `src/components/menus/` directory with extracted sub-components (`FileMenu.tsx`, `EditMenu.tsx`, `GoMenu.tsx`, `HelpMenu.tsx`, `RunMenu.tsx`, `ViewMenu.tsx`) per the WOW-030 refactoring plan, but the main `MenuBar.tsx` still renders inline menus directly.

### Why This Matters

Users interact with non-functional menu items and get a broken/cluttered impression. Removing dead weight reduces code size, improves load time, and makes the app's actual capabilities obvious.

## Requirements

### Functional Requirements
- [x] Keep **File** menu — review and streamline submenu items
- [x] Keep **Edit** menu — review and streamline submenu items
- [x] Remove **Selection** menu button and all its submenu code
- [x] Remove **Go** menu button and all its submenu code
- [x] Remove **Run** menu button and all its submenu code
- [x] Remove **Terminal** menu button and all its submenu code

- [ ] Keep **View** menu — streamline to show only functional items (layout switching, chat mode). Remove broken/dead items
- [ ] Keep **Agents** menu — ensure all items work
- [ ] Keep **Settings** menu — ensure all items work
- [ ] Keep **Help** menu — ensure all items work. Review what Help currently offers (keyboard shortcuts, docs links) and streamline
- [x] Clean up unused props/interfaces from all parent components that passed `selectionMenu`, `goMenu`, `runMenu`, `terminalMenu` handlers
- [ ] Verify the header renders correctly in both Simple and Technical modes
- [x] Remove or deprecate the `src/components/menus/` sub-components that are now unnecessary

### Out of Scope
- Adding new menu items or functionality — this is purely a cleanup ticket
- Refactoring MenuBar.tsx's internal structure beyond removing dead code
- Touch the `src/components/menus/MenuBar.tsx` alternative (different component, not used)

## Acceptance Criteria

### Automated Verification
- [x] Build completes: `bun run build`
- [x] No TypeScript errors in `MenuBar.tsx` or any parent component that was cleaned up

### Manual Verification
- [ ] Header shows only File, Edit, View, Help, Agents, and Settings menus (plus the Way of Work logo and sidebar toggle)
- [ ] Clicking each remaining menu shows functional, working items
- [ ] Layout switching in View menu still works
- [ ] Agents menu still opens teams.yaml, creates agent stubs, reloads agents
- [ ] Settings menu still opens agent setup, agent permissions, LLM model config
- [ ] The app does not crash in Simple or Technical mode

## Technical Notes

### Affected Components
- `src/components/MenuBar.tsx` — remove 4 menu sections (Selection, Go, Run, Terminal), their flyout state variables, associated imports, and the `menuLabels` array entries. Keep File, Edit, View, Help, Agents, Settings.
- Parent components that pass menu handlers — search for props like `editMenu`, `selectionMenu`, `goMenu`, `runMenu`, `terminalMenu`, `helpMenu`, `fileMenu` and remove them
- `src/types/workspaceEditor.ts` — may have unused type interfaces (`EditMenuHandlers`, `SelectionMenuHandlers`, `GoMenuHandlers`, `RunMenuHandlers`, `TerminalMenuHandlers`, `HelpMenuHandlers`) that can be removed
- `src/types/fileMenu.ts` — `FileMenuProps` may be unused after cleanup

### Approach
1. In `MenuBar.tsx`, remove the menu buttons and their inline submenu JSX for Selection, Go, Run, Terminal. Keep File, Edit, View, Help, Agents, Settings.
2. Trace each removed menu's handler prop upward through parent components and delete the prop passing
3. Remove unused type imports and interfaces
4. Build and manually verify
5. Optionally, remove the `src/components/menus/` sub-components if they become dead code

---

## Meta

**Created**: 2026-05-26
**Priority**: High
**Estimated Effort**: M
