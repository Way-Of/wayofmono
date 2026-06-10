# WOW-101: Update Skill Definitions to Current System State

## Goal
Update all existing skill definition files (`SKILL.md`) within `.gemini/skills/` to accurately reflect the current system architecture, available tools, and operational workflows of the Way of Work platform.

## Background
Over recent development cycles, the system's architecture, agent responsibilities, and available tools have evolved significantly. The current documentation in the `SKILL.md` files is outdated, leading to potential misguidance for agents and developers when utilizing these skills.

## Scope of Work
Review and update the `SKILL.md` files for the following skills:
1. `wow_human_in_the_loop`
2. `wow_communications`
3. `wow_frontend_dev`
4. `wow_core_architecture`
5. `wow_access_control`
6. `wow_backend_dev`
7. `wow_ui_surfaces`
8. `wow_agent_dev`
9. `wow-skill-creator`

## Acceptance Criteria
- [ ] Each specified `SKILL.md` file is reviewed against the current codebase implementation.
- [ ] Documentation is updated to reflect current tools, API endpoints, and architectural patterns.
- [ ] Instructions are concise, accurate, and aligned with `GEMINI.md` and `WOW` architectural mandates.
- [ ] No obsolete information remains.

## Priority
Medium - Essential for developer productivity and AI agent alignment.
