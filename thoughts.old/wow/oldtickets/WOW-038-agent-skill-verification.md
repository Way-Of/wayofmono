# WOW-038: Agent and Skill Verification

## Problem Statement

As the Way of Work platform evolves, the distinction and alignment between `.wo/agents/` and `.gemini/skills/` have become critical for ensuring a robust, production-ready system. There is a pressing need for a comprehensive, system-wide audit to verify that each agent and skill is not only correctly configured and equipped with necessary tools (including appropriate permissions), but also that it meets production-grade standards. This audit must identify redundancies or inconsistencies between agents and skills, uncover underutilized capabilities, and propose new integrations. The ultimate goal is to foster a cohesive and efficient agent ecosystem that operates as a real, complex system, moving beyond mock or simple implementations. This effort will involve generating specific sub-tickets for each agent and skill requiring alignment, enhancement, or a transition to production readiness.

## Desired Outcome

A production-ready, highly aligned, and optimized agent ecosystem where:
- All agents in `.wo/agents/` and skills in `.gemini/skills/` are consistent, clearly defined, and operating at a production-grade level, free from mock implementations.
- Specialized tools are correctly integrated and utilized by their designated agents and skills, with appropriate permissions.
- Opportunities for improvement are identified, and new tool/system integrations are proposed to enhance overall functionality and efficiency.
- A series of granular, actionable sub-tickets (`WOW-XXX-agent-name` or `WOW-XXX-skill-name`) are generated for each agent and skill, outlining the specific steps required to achieve full alignment, production readiness, and optimization. These sub-tickets will address any identified gaps, misconfigurations, unused capabilities, or proposed enhancements.

## Context & Background

The agent system relies on a clear mapping between agents, skills, and the tools they can utilize. Errors in these mappings or missing external resources can lead to silent failures or incorrect agent behavior, impacting the overall reliability of the Way of Work platform.

### Affected Components
- `.wo/agents/` - Agent definitions and configurations.
- `.gemini/skills/` - Skill definitions and instructions.
- `server/agent-runtime.ts` - Agent execution logic.
- `server/session-prompts.ts` - Prompt templates used by agents.

## Requirements

### Functional Requirements
- [ ] Conduct a system-wide audit of all agents in `.wo/agents/` and skills in `.gemini/skills/`.
- [ ] For each agent, comprehensively understand its intended purpose, current capabilities, and desired outcomes within the "real complex system" context (no mock, no simple implementations).
- [ ] For each agent, identify all associated skills, ensuring a clear alignment and dependency mapping.
- [ ] For each skill, verify required tools are available and correctly configured, including checking for appropriate permissions (e.g., read, write, execute) needed for their designated tasks. This includes specialized tools unique to agents like Kanban and TA agents.
- [ ] Check if prompt templates referenced by agents/skills are complete, accurate, and optimized for production use cases.
- [ ] Identify and document any unused tools or system capabilities that could potentially enhance agent/skill performance or broaden their functionality.
- [ ] Propose new tools, system integrations, or architectural changes that would enable agents/skills to better achieve their desired outcomes and meet production requirements.
- [ ] Identify instances where agents and skills are "the same" or have overlapping functionality that could be unified or streamlined.
- [ ] Based on the audit, generate individual, detailed sub-tickets (e.g., `WOW-XXX-AgentName-Alignment`, `WOW-XXX-SkillName-Productionize`) for each agent and skill, outlining concrete steps for:
    - Achieving full alignment between agents and skills.
    - Enhancing capabilities to meet production-ready standards.
    - Integrating identified new tools or systems.
    - Resolving any identified gaps, misconfigurations, or inefficiencies.

### Out of Scope
- Automated testing of agent behavior (focus is on configuration and dependencies).
- Implementing fixes for identified issues (focus is on verification and documentation).

## Acceptance Criteria

### Automated Verification
- N/A (Manual verification is primary for this ticket, but future tickets may automate parts).

### Manual Verification
- [ ] A comprehensive list of all agents and their linked skills is generated.
- [ ] Each agent's configuration (e.g., `tools` in frontmatter) is cross-referenced with available tools.
- [ ] Each skill's requirements are noted and compared against known system capabilities.
- [ ] A report detailing any discrepancies or missing elements for agents and skills is produced.

## Technical Notes

This verification process will involve:
- Reading agent definition files (`.md` files in `.wo/agents/`).
- Parsing skill definition files (`SKILL.md` files in `.gemini/skills/`).
- Cross-referencing tool names used in agent/skill definitions with actual available tools.
- Examining prompt templates for placeholders and completeness.

## Meta

**ID**: WOW-038
**Created**: 2026-06-02
**Priority**: Medium
**Estimated Effort**: M
