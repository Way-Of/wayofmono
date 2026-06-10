# WOW-039: Skill Definition Standardization and Creation

## Problem Statement

A comprehensive audit of the agent ecosystem revealed a significant inconsistency in skill definitions. Many "skills" referenced by agents in `.wo/agents/*.md` files (e.g., `ata`, `research`, `kanban-time`, `document-generation`, `project-pricing`, `cost-estimation`, `logistics`, `dispatch-agent`, `scheduling`, `incident-reporting`, `safety`, `web-browsing`, `market-research`, `supplier-comparison`, `tma`, `workspace-storage`) lack corresponding explicit `SKILL.md` definitions in `.gemini/skills/`. The existing `.gemini/skills/` are primarily high-level architectural guides, leading to ambiguity and hindering systematic development and verification.

## Desired Outcome

A standardized and complete set of skill definitions. Every skill referenced by an agent in its frontmatter will have a corresponding `SKILL.md` file in `.gemini/skills/`. Each `SKILL.md` file will clearly define the skill's purpose, usage instructions, required tools, and any dependencies, ensuring consistency and verifiability across the agent ecosystem.

## Context & Background

The current state makes it difficult to:
- Understand the precise capabilities of an agent without deep code inspection.
- Verify that agents have access to the instructions and tools they need.
- Maintain and update agent behavior systematically.
- Ensure production readiness due to undefined or implicitly understood skills.

## Requirements

### Functional Requirements
- [ ] For every unique skill name found in the `skills:` frontmatter of `.wo/agents/*.md` files that does *not* currently have a corresponding `SKILL.md` in `.gemini/skills/`, a new `SKILL.md` file must be created.
- [ ] Each newly created `SKILL.md` file must adhere to the standard skill template, including `name`, `description`, and a section for `tools` or `dependencies` if applicable.
- [ ] Existing `.gemini/skills/*.md` files that are currently high-level guides (e.g., `wow_access_control`, `wow_agent_dev`, `wow_backend_dev`, `wow_communications`, `wow_core_architecture`, `wow_frontend_dev`, `wow_human_in_the_loop`, `wow_ui_surfaces`) should be reviewed. If agents explicitly reference these as skills, their `SKILL.md` content should be enriched to provide actionable instructions for agents, or their usage by agents should be re-evaluated for clarity.
- [ ] For each skill, define its clear purpose and how an agent should leverage it.
- [ ] Explicitly list any tools that the skill requires the agent to use.

### Technical Notes

- The process will involve iterating through agent files, extracting skill names, checking for existing `SKILL.md` files, and creating new ones as needed.
- Content for new `SKILL.md` files will need to be derived from the agent's description and implied usage. This might require some contextual understanding of the system.
- Consider grouping related capabilities into single skills where appropriate (e.g., `kanban-time` and `workers` might be part of a broader `kanban-management` skill).

## Acceptance Criteria

### Manual Verification
- [ ] Every skill listed in the `skills:` frontmatter of any agent markdown file has a corresponding `SKILL.md` file in `.gemini/skills/`.
- [ ] Each `SKILL.md` provides a clear description of the skill and its usage.
- [ ] The content of `SKILL.md` files is actionable for an agent.

## Meta

**ID**: WOW-039
**Created**: 2026-06-02
**Priority**: High
**Estimated Effort**: L
**Parent Ticket**: WOW-038
