# WOW-078-spreadsheet-data-visualization

## Problem Statement

The Way of Work platform currently lacks the capability to directly read, parse, or visualize content from binary Excel/spreadsheet files (e.g., `.xlsx`). Critical project planning templates, such as "Project Planing Template German AF 2025.xlsx," remain inaccessible to both the system agents and the user interface (Simple and Docs views), creating a significant barrier for effective project data management and visibility.

## Desired Outcome

The Way of Work platform can handle structured project data from spreadsheet-based templates, enabling:
- Seamless visualization of spreadsheet data directly within the "Docs" view (as structured tables).
- Intelligent analysis, summarization, and retrieval of spreadsheet data by AI agents in the "Simple" (Claw/Chat) view.
- A streamlined workflow for users to import, view, and interact with spreadsheet-based project planning data.

## Context & Background

### Current State
Spreadsheet files (`.xlsx`) are stored within the `workspace/dokument` structure but are treated as opaque binary blobs. The platform currently has no parser to convert this data into a system-readable format (e.g., CSV or JSON), nor does it have UI components to render this data in a tabular format.

### Why This Matters
Construction planning often relies heavily on spreadsheet-based templates for measurements, scheduling, and budgeting. If these files cannot be parsed or visualized, users are forced to rely on external software, breaking the "all in one place" value proposition of Way of Work. Furthermore, agents cannot assist in analyzing, verifying, or planning based on this data, reducing the potential for autonomous project management.

## Requirements

### Functional Requirements
- [ ] **Data Parsing Backend:** Implement a backend utility (server-side) to convert spreadsheet files (converting to CSV or JSON as a pre-processing step) into a structured format that the platform can read and manipulate.
- [ ] **Structured Docs View:** Develop a React component (e.g., `SpreadsheetTable.tsx`) capable of rendering the parsed JSON data into a clean, searchable, and sortable table within the "Docs" view.
- [ ] **Agent Integration:** Update relevant agent tools/skills (e.g., `docs`, `projektledare`) to leverage the new parser, allowing agents to read, query, and summarize spreadsheet data upon user request in the "Simple" (Chat) view.
- [ ] **Workflow Documentation:** Document the process for converting existing `.xlsx` files into the required system-readable format (e.g., CSV).

### Non-Functional Requirements
- [ ] **Performance:** The parsing and rendering process must be performant, ensuring large spreadsheets do not cause UI hangs or long load times.
- [ ] **Usability:** The rendered table in the Docs view must be intuitive, easy to read, and searchable.

### Out of Scope
- Direct native editing or creation of `.xlsx` files within the Way of Work platform.
- Integration with external cloud spreadsheet services (e.g., Google Sheets, Excel Online).

## Acceptance Criteria

### Automated Verification
- [ ] Build completes successfully: `bun run build`.
- [ ] Backend parsing tests confirm data accuracy and integrity when converting from CSV/JSON.

### Manual Verification
- [ ] Users can upload or point to a spreadsheet (converted to CSV/JSON) and see the structured data rendered as a table in the "Docs" view.
- [ ] Users can query agents in the "Simple" (Chat) view for specific information extracted from the parsed spreadsheet data, and agents provide accurate responses.
- [ ] The table view supports basic sorting and searching, matching the requirements of a functional project planning dashboard.

## Technical Notes

### Affected Components
- `server/tools/` - New tool for parsing CSV/JSON data.
- `src/components/docs/` - New component (`SpreadsheetTable.tsx`) for rendering structured spreadsheet data.
- `server/routes/workspace.ts` - Potential updates for fetching/parsing spreadsheet-based data files.
- `.wo/agents/` - Updated prompts for relevant agents (e.g., `docs`, `projektledare`) to enable structured data analysis.
- `CHANGELOG.md` - Will be updated to reflect this feature implementation.

---

## Meta

**Created**: 2026-06-06
**Priority**: High
**Estimated Effort**: M
