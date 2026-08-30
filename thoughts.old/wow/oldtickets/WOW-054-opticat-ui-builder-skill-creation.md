# [WOW-054] OptiCat UI Builder Skill Creation

## Problem Statement

The Gemini CLI agent currently lacks a dedicated skill to efficiently assist in building or enhancing UI components and dashboards specifically for the OptiCat application. This leads to manual, repetitive tasks for UI generation and data visualization related to HVAC projects and OptiCat APIs.

## Desired Outcome

A new Gemini CLI skill, `opticat-ui-builder`, is created and installed. This skill will provide the agent with specialized knowledge, patterns, and templates to streamline the development of OptiCat-related UI components, dashboards, and data visualizations. It will encapsulate best practices for OptiCat API integration, WoW dark theme adherence, and common UI patterns.

## Context & Background

### Current State
- OptiCat is integrated as a plugin (`plugin/opticat`).
- Existing OptiCat-related skills are located in `.wo/skills/`.
- UI development often involves manually writing React components, fetching data, and ensuring theme consistency.
- A previous ticket, `WOW-053-opticat-ui-improvements.md`, highlights the need for dashboard enhancements, which this skill would help facilitate.

### Why This Matters
Creating this skill will significantly improve the agent's efficiency and autonomy when tasked with OptiCat UI development. It ensures adherence to project conventions, leverages existing API documentation, and provides reusable code structures, ultimately accelerating feature delivery and maintaining code quality.

## Requirements

### Functional Requirements
- [ ] Create a new Gemini CLI skill named `opticat-ui-builder`.
- [ ] The skill's `SKILL.md` must clearly define its purpose: "Facilitates the generation and enhancement of OptiCat-related UI components and dashboards."
- [ ] The skill must include references to OptiCat API documentation (`references/opticat-api-docs.md`) for data fetching.
- [ ] The skill must include references to WoW UI patterns and best practices (`references/ui-patterns.md`) for consistent styling.
- [ ] The skill must provide basic React component templates for dashboard elements (e.g., `assets/ui-templates/dashboard-card.tsx`, `assets/ui-templates/data-table.tsx`).
- [ ] The skill must be installed in the agent's environment, preferably with `workspace` scope.

### Out of Scope
- Actual implementation of new OptiCat UI features (this is covered by `WOW-053`). This ticket is solely for the creation and installation of the enabling skill.
- Extensive custom scripts or complex tools within the skill (can be added in future iterations if needed).

## Acceptance Criteria

### Automated Verification
- [ ] Skill packaging completes successfully without errors.

### Manual Verification
- [ ] The `opticat-ui-builder` skill appears in the list of installed skills (e.g., by running `/skills list` in the Gemini CLI).
- [ ] The `SKILL.md` content is accurate and informative.
- [ ] The reference and asset files are present within the skill directory.

## Technical Notes

### Affected Components
- `.gemini/skills/opticat-ui-builder/` - New skill directory.
- `CHANGELOG.md` - To be updated with skill creation.
- `thoughts/shared/tickets/TODO.md` - To be updated with this ticket.

---

## Meta

**Created**: 2026-06-05
**Priority**: High
**Estimated Effort**: S
