# [WOW-057] Way of Work Skill Creation Skill

## Problem Statement

The current process for creating new Gemini CLI skills for the Way of Work (WoW) platform is manual and relies on general `skill-creator` guidance. While functional, it lacks WoW-specific best practices, architectural patterns (e.g., multi-tenancy, access control, HITL), and conventions for skill development within the WoW ecosystem. This can lead to inconsistencies, delays, and a steeper learning curve for agents developing new WoW-specific skills.

## Desired Outcome

A new Gemini CLI skill, tentatively named `wow-skill-creator` (or similar), is developed. This skill will act as a specialized skill creator for the Way of Work platform, encapsulating WoW-specific knowledge, templates, and workflows. Its purpose is to streamline the creation of new WoW skills by providing:
1.  **WoW-specific templates**: Pre-configured `SKILL.md` templates that include WoW architectural mandates and common sections.
2.  **Best practice guidance**: Instructions on how to integrate with WoW's multi-tenancy, access control, human-in-the-loop (HITL), and communication channels.
3.  **Resource examples**: Placeholder `scripts/`, `references/`, and `assets/` that align with WoW's tech stack (e.g., React, Bun, SQLite, Tailwind).
4.  **Validation checklists**: Automated or guided checks to ensure new skills comply with WoW's critical mandates.

This will accelerate skill development, ensure consistency, and reduce errors within the WoW agent ecosystem.

## Context & Background

### Current State
- New WoW skills are currently created using the general `skill-creator` utility.
- WoW has several critical architectural mandates (multi-tenancy, access control, HITL, etc.) that need to be consistently applied to new skills.
- Existing WoW skills (e.g., `wow_backend_dev`, `wow_frontend_dev`, `wow_agent_dev`) provide context but no direct "skill creation" utility.

### Why This Matters
A dedicated WoW skill creation skill will:
- Standardize the development of new WoW skills, ensuring they adhere to architectural mandates from inception.
- Reduce the time and effort required to create new, compliant skills.
- Improve the overall quality and maintainability of the WoW agent ecosystem.
- Empower agents to more effectively extend the WoW platform's capabilities.

## Requirements

### Functional Requirements
- [ ] Create a new Gemini CLI skill named `wow-skill-creator` (or similar, to be determined during design).
- [ ] The skill's `SKILL.md` must clearly define its purpose: "Facilitates the creation of new Gemini CLI skills specifically for the Way of Work platform, ensuring adherence to WoW architectural mandates and best practices."
- [ ] Provide a WoW-specific `SKILL.md` template with sections for:
    - WoW architectural mandates and how the new skill complies.
    - Integration points (multi-tenancy, access control, HITL).
    - Recommended technologies (Bun, React, Tailwind, SQLite).
- [ ] Include example placeholder files for `scripts/`, `references/`, and `assets/` that are relevant to WoW development (e.g., a basic React component template, a backend API call example).
- [ ] Include guidance on testing and validating new WoW skills.
- [ ] The skill should provide instructions on how to package and install new skills.

### Out of Scope
- Automated code generation for the skill's *functionality*. The skill should guide creation, not fully implement the new skill's core logic.
- Replacing the general `skill-creator` tool. This is a specialized overlay.

## Acceptance Criteria

### Automated Verification
- [ ] Build completes successfully without errors after skill creation.
- [ ] Skill packaging completes successfully for the new `wow-skill-creator` skill.

### Manual Verification
- [ ] The `wow-skill-creator` skill appears in the list of installed skills.
- [ ] `SKILL.md` content is accurate and informative, detailing WoW-specific skill creation guidelines.
- [ ] The generated templates and resources are aligned with WoW conventions.
- [ ] The skill successfully guides an agent through creating a simple, compliant WoW skill.

## Technical Notes

### Affected Components
- `.gemini/skills/wow-skill-creator/` - New skill directory.
- `CHANGELOG.md` - To be updated with skill creation and installation.
- `thoughts/shared/tickets/TODO.md` - To be updated with this ticket.
- Potentially existing WoW skill definitions for examples/references.

---

## Meta

**Created**: 2026-06-05
**Priority**: High
**Estimated Effort**: M
