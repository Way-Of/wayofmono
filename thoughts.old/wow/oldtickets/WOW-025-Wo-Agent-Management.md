# Ticket: [WOW-025] Wo Agent Management and "My AI Team" Restoration

## Objective
Migrate the existing "My AI Team" functionality from legacy "Pi" agents to the new "Wo" agent system, ensuring proper agent discovery, team management, and UI integration.

## Problem Statement
The current system retains references to "Pi" agents and their `.wo/agents` configuration, leading to an inconsistent experience where the "My AI Team" section either displays no agents or operates on outdated agent definitions. This hinders the ability to manage "Wo" agents effectively.

## Desired Outcome
- "My AI Team" section correctly discovers, displays, and manages "Wo" agents.
- Users can create, edit, and define teams for "Wo" agents through the UI.
- All legacy "Pi" agent references are replaced with "Wo" agent terminology.

## Requirements
### Functional Requirements
- [x] **Agent Discovery:** Update agent discovery mechanisms to scan `.wo/agents/` exclusively.
- [x] **Agent Roster Management:** Rework `teams.yaml` parsing and creation to specifically manage `Wo` agents within `.wo/agents/`.
- [x] **UI Renaming:** Update all UI elements related to "Pi" agents and "My AI Team" to reflect "Wo" agent branding.
- [x] **Agent Editing:** Ensure the "Edit prompt on an agent" functionality correctly targets and modifies `Wo` agent Markdown bodies and frontmatter exclusively within `.wo/`.
- [x] **Team Creation:** Restore/implement the ability to create new agent teams, linking them to discovered `Wo` agents exclusively from the `.wo/` path.

### Frontend Refactoring
- [x] **Path Cleanup:** Systematically replace all `.wo/` hardcoded paths and references in `src/components/` with the corresponding `.wo/` equivalents (e.g., `.wo/settings.json` → `.wo/settings.json`, `.wo/agents/` → `.wo/agents/`).
- [x] **UI Messaging:** Update all user-facing documentation/tooltips in UI components (e.g., `ClawHelpModal`, `NewAgentModal`) to refer to the `.wo/` directory structure.
- [x] **Roster Management:** Ensure visual editors (e.g., `TeamsGuiEditorModal`) correctly interact with `.wo/agents/teams.yaml`.
- [x] **Configuration UI:** Update `TechnicalSidePanels` and `HostDoctorModal` to correctly locate and manage `.wo/` configuration files.

## Acceptance Criteria
- [x] "My AI Team" tab in Simple mode correctly lists available "Wo" agents.
- [x] Creating a new agent or team functions as expected for "Wo" agents.
- [x] No visible "Pi" agent terminology in the agent management UI.
## Meta
**Created**: 2026-05-23
**Priority**: High
**Estimated Effort**: M