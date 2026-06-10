# WOW-069 Open DWG Files

## Problem Statement

The system currently cannot open or render DWG files. Since DWG is a proprietary binary CAD format, users (especially construction project managers and designers) cannot preview blueprint drawings directly within the browser/app workspaces. They have to download the files and use external CAD software to view them.

## Desired Outcome

Users should be able to view, preview, or open DWG files within the system. The file tree and workspace file viewer should identify `.dwg` files and offer a preview/view option.
In web/browser mode, the file should be parsed/rendered (e.g., converted to SVG/PDF on the server, or rendered via a canvas/WebGL viewer in the browser).
In desktop (Electron) mode, the system should allow opening the DWG file using the native host application (e.g. AutoCAD, DWG TrueView, LibreCAD).

## Context & Background

### Current State
Currently, clicking a `.dwg` file in the file tree does nothing, or displays a "binary file cannot be viewed" message in the editor pane.

### Why This Matters
Blueprints, designs, and architectural drawings are almost exclusively in DWG format in Swedish construction projects. Seamless integration with DWG files is critical for site managers, calculators, and safety officers using Way of Work.

## Requirements

### Functional Requirements
- [ ] **File Tree Integration**: Correctly detect `.dwg` file extension and show a CAD/blueprint icon.
- [ ] **Native Host Integration (Electron)**: Provide an "Open in Default App" button/context menu item that calls the native OS command to launch the file in the default CAD viewer on the host machine.
- [ ] **Web Viewer/Preview Component**: Add a CAD viewer pane in the React frontend.
  - Option A: Integrate a lightweight library like `dxf-parser` / `three-dxf` (converting DWG to DXF on the backend, or viewing DXF directly).
  - Option B: Server-side conversion to SVG/PDF using CLI tools (e.g. `libreoffice`, `ezdxf` Python CLI, or Open Design Alliance / LibreCAD utilities) and render the SVG/PDF in the React app.
- [ ] **Role & Access Controls**: Ensure tenant data isolation (Economics Shield) and permission checking when loading and rendering DWG files.

### Out of Scope
- Full CAD editing capabilities (viewing/previewing and zooming/panning is sufficient).

## Acceptance Criteria

### Automated Verification
- [ ] Build completes: `bun run build`
- [ ] Files compile with no TypeScript errors.

### Manual Verification
- [ ] Add a sample `.dwg` file to the workspace.
- [ ] Right-click the `.dwg` file in the file tree. It should offer "Open in default application" (on Electron) or show a preview (on web).
- [ ] Clicking the file in the file tree opens the preview component showing the CAD geometry.

## Technical Notes

### Affected Components
- `src/components/simple/SimpleFileTree.tsx` - [Add CAD icon for `.dwg` files]
- `src/components/FileViewer.tsx` or similar file preview component - [Render CAD preview or trigger native open]
- `server/routes/file-system.ts` - [Create helper endpoint to open file with default OS application (using `open` on npm or native shell command) and CAD conversion endpoint]

---

## Meta

**Created**: 2026-06-06
**Priority**: High
**Estimated Effort**: L
