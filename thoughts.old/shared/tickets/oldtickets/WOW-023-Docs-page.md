# [WOW-023] Document and Validate `.wo` Directory Symlink

## Problem Statement
The project structure includes a symbolic link `.wo` within the `workspace/` directory that points to the main `.wo` directory at the project root (`/home/zerwiz/CodeP/wayofwork/.wo`). This has caused confusion regarding which directory is the authoritative source.

## Desired Outcome
Clearly document the purpose of the symlink in project documentation (e.g., `README.md` or a new `ARCH.md`) to prevent future confusion.

## Context & Background
- The main directory is `/home/zerwiz/CodeP/wayofwork/.wo`.
- `/home/zerwiz/CodeP/wayofwork/workspace/.wo` is a symbolic link to the main directory.
- This setup is likely for convenience when tools/agents run inside the `workspace/` subdirectory.

## Requirements
- [x] Confirm this symlink is intended behavior.
- [x] Document this structure in `README.md` (already documented).

## Acceptance Criteria
- [x] Team members understand that `.wo` is the single source of truth.

## Extension: Native Dialogs & DWG Document Previews

### Context & Requirements
In Simple View (which houses the Docs page and workspace file tree), Electron's sandboxed environment prevents browser-native `window.prompt` dialogs from rendering correctly. 
To support creating workspace files/folders and opening CAD designs (DWG format):
- [x] **Native Dialog Prompts**: Implemented the `POST /api/native-dialog/prompt` endpoint utilizing OS-native dialog systems (zenity, kdialog, osascript, or PowerShell inputbox) and wired it into the simple view file tree right-click creation menu.
- [ ] **AI Chat**: The AI chat feature integrated into the Docs page is currently non-functional and requires investigation and repair.

## Meta
**Created**: 2026-05-23
**Priority**: Low
**Estimated Effort**: S
