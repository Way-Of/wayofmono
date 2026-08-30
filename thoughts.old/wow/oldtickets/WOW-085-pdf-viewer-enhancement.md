# WOW-085-pdf-viewer-enhancement

## Problem Statement

The current PDF viewer in the "Docs" mode utilizes a simple `iframe` for rendering, which provides a sub-optimal user experience. It lacks refined control for panning and zooming, making it difficult for users to inspect detailed blueprints or documents properly. Users need intuitive control to move around (pan) and zoom in/out with the scroll wheel.

## Desired Outcome

An improved PDF viewing experience where:
- Users can easily pan across document content (right/left/up/down) when zoomed in.
- Scrolling with the mouse wheel naturally zooms the PDF view.
- (Long-term) Replace `iframe` with a dedicated, interactive PDF rendering library (e.g., `react-pdf`) for full control over zoom, pan, and text selection.

## Context & Background

### Current State
The platform uses a basic HTML5 `iframe` to embed the browser's native PDF viewer. While functional for basic viewing, it restricts the ability to programmatically control zoom and pan from the parent application and often results in scrolling conflicts with the main dashboard layout.

### Why This Matters
For construction project managers, estimators, and site workers, the ability to inspect blueprints, material schedules, and detailed reports in PDF format is **CRITICAL**. A poor viewing experience leads to:
- Reduced efficiency when reviewing complex documents.
- Higher risk of errors due to inability to zoom in on critical details.
- User dissatisfaction with the platform's core document management capability.

## Requirements

### Functional Requirements
- [ ] **CSS/Container Refinement:** Improve the container styles for the PDF `iframe` to allow proper panning within the viewing pane if possible.
- [ ] **Interactive Viewer (Phase 2):** Integrate a professional PDF rendering library (e.g., `react-pdf`) to provide native support for:
    - Smooth, controlled zoom via scroll wheel.
    - Responsive panning (click-and-drag or scroll-based).
    - Optional: Text selection, thumbnail navigation.

### Non-Functional Requirements
- [ ] **Usability:** The viewer must be highly intuitive, mirroring standard browser/OS PDF viewer behaviors.
- [ ] **Performance:** High-resolution blueprints must load and render without stuttering.

## Acceptance Criteria

### Automated Verification
- [ ] Build completes successfully: `bun run build`.

### Manual Verification
- [ ] Users can pan across a zoomed-in document (if not handled by native browser zoom).
- [ ] Mouse wheel zooming works as expected (if integrated with a PDF library).
- [ ] The viewer is responsive and fits the screen correctly without forcing horizontal scrolling of the main application.

## Technical Notes

### Affected Components
- `src/components/simple/SimpleFilePanel.tsx` - Current PDF rendering logic.
- `src/components/documenthandler/FileItem.tsx` - Potential update to handle PDF previews.
- `CHANGELOG.md` - Will be updated.

---

## Meta

**Created**: 2026-06-06
**Priority**: High
**Estimated Effort**: M
