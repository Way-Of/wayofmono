# WOW-036 [Bug] "Choose folder…" Button Does Nothing

## Problem Statement

The **"Choose folder…"** button in *Projects & Workspace* (Simple UI) is dead — clicking it does nothing. It should open a native folder picker dialog and switch the workspace, identical to **File → Open Folder** in the menu bar.

## Root Cause

`src/pages/SimplePage.tsx:318` passes `onOpenFolder={() => {}}` (empty stub) to the `SimpleApp` component instead of the existing `handleOpenFolder` callback defined at line 75 of the same file.

The `handleOpenFolder` function was already fully implemented and wired to the `fileMenu` object (line 164) — it calls `/api/native-dialog/pick` then `/api/workspace op: "open_folder"`. It just wasn't passed to the `SimpleProjectsView` component prop.

## Fix

**File:** `src/pages/SimplePage.tsx:318`

```diff
- onOpenFolder={() => {}}
+ onOpenFolder={handleOpenFolder}
```

## Acceptance Criteria

- [ ] "Choose folder…" button opens native folder picker
- [ ] After selecting a folder, workspace switches and tree refreshes
- [ ] File → Open Folder in menu bar still works (unchanged)
- [ ] `bun run build` passes

## Meta

**Created**: 2026-06-02
**Priority**: Medium
**Estimated Effort**: Trivial (< 5 min, already fixed)
**Depends on**: None
**Status**: Fixed
