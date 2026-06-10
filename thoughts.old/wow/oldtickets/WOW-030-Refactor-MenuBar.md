# Ticket: [WOW-030] Refactor MenuBar.tsx into Smaller Sub-Components

## Objective
Break down the large `MenuBar.tsx` component into smaller, more manageable, and reusable sub-components to improve maintainability, readability, and development efficiency.

## Problem Statement
The `MenuBar.tsx` component has accumulated a significant amount of JSX and logic, handling various menus (File, Edit, View, Go, Run, Terminal, Help, Agents, Settings) and top-level navigation. Its monolithic structure makes it hard to understand, test, and extend.

## Desired Outcome
The `MenuBar.tsx` file will be refactored into a clear, modular structure. Each distinct menu (e.g., `FileMenu`, `EditMenu`, `ViewMenu`, etc.) and potentially other logical groups within the header (e.g., `NotificationsArea`, `LlmSelector`) will be extracted into their own dedicated components. The main `MenuBar.tsx` will then primarily act as an orchestrator, assembling these smaller components.

## Requirements
### Code Structure
- [x] **Component Extraction:** Extract logical sections of `MenuBar.tsx` into new, dedicated React components:
    - [ ] `FileMenu.tsx` — extracted but not imported (dead; `FileMenuContent.tsx` is used instead)
    - [ ] `EditMenu.tsx` — extracted but not imported (dead; inline JSX used)
    - [ ] ~~`SelectionMenu.tsx`~~ — **REMOVED** per WOW-031 (Selection menu deleted)
    - [ ] ~~`ViewMenu.tsx`~~ — extracted but not imported (dead; inline JSX used)
    - [ ] ~~`GoMenuContent.tsx`~~ — **NOT NEEDED** (Go menu removed per WOW-031)
    - [ ] ~~`RunMenuContent.tsx`~~ — **NOT NEEDED** (Run menu removed per WOW-031)
    - [ ] ~~`TerminalMenuContent.tsx`~~ — **NOT NEEDED** (Terminal menu removed per WOW-031)
    - [ ] `HelpMenu.tsx` — extracted but not imported (dead; inline JSX used)
    - [ ] `AgentsMenuContent.tsx` (remaining — inline JSX in MenuBar.tsx)
    - [ ] `SettingsMenuContent.tsx` (remaining — inline JSX in MenuBar.tsx)
    - [x] `NotificationsArea.tsx` (existing `NotificationsDropdown` component)
    - [ ] `LlmSelector.tsx` (remaining)
    - [x] `LanguageSwitcher.tsx` (remaining)
- [ ] **Prop Drilling Minimization:** Design new components to receive only the necessary props.
- [ ] **File Organization:** Components live in `src/components/menus/` but are unused; `FileMenuContent.tsx` lives at `src/components/FileMenuContent.tsx` and IS used.

### Functionality
- [x] **Maintain Existing Functionality:** Ensure all existing menus, buttons, and interactions within the MenuBar remain fully functional after refactoring.
- [x] **Performance (Non-Regression):** Verify that the refactoring does not introduce performance regressions.

### Code Quality
- [x] **Readability:** Improve the overall readability of the MenuBar codebase.
- [x] **Maintainability:** Enhance the ease of maintaining and extending specific sections of the MenuBar.
- [x] **Type Safety:** Maintain or improve TypeScript type safety across all new and modified components.

## Acceptance Criteria
- `MenuBar.tsx` is significantly reduced in line count and complexity.
- All extracted components are clearly named and logically grouped.
- The MenuBar functions identically to its pre-refactoring state.
- Code quality is improved, adhering to project conventions.

## Notes
- WOW-031 removed Selection, Go, Run, Terminal menus entirely. Any extracted sub-components for those menus are now dead code and should be cleaned up.
- `src/components/menus/` contains unused extracted sub-components (not imported anywhere). Only `FileMenuContent.tsx` is actively used.
- No `src/components/menubar/` directory exists; components are in `src/components/menus/`.

## Meta
**Created**: 2026-05-24
**Priority**: Medium
**Estimated Effort**: M