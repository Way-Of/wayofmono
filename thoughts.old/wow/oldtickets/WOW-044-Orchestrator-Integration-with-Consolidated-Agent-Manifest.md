# WOW-044: Orchestrator Integration with Consolidated Agent Manifest

## Problem Statement

The `WOW-042: Agent and Skill Manifest Consolidation` ticket has successfully created a single, canonical manifest (`thoughts/shared/agents-and-skills-manifest.md`) for all agents and skills. However, the Orchestrator agent currently relies on its own internal logic and potentially outdated separate manifest files for agent discovery and dispatch. Without integrating the new consolidated manifest, the Orchestrator cannot fully leverage this single source of truth, leading to potential inconsistencies and inefficiencies in agent dispatch.

## Desired Outcome

The Orchestrator agent will dynamically load and utilize the `thoughts/shared/agents-and-skills-manifest.md` to identify and dispatch all Way of Work agents. This integration will ensure:
- The Orchestrator has an up-to-date and comprehensive understanding of all available agents and their capabilities.
- Efficient and accurate routing of user requests to the most appropriate specialized agents.
- Reduced maintenance overhead by centralizing agent and skill definitions.

## Context & Background

The Orchestrator agent is critical for routing user intents to specialized agents. Its effectiveness is directly tied to its awareness of the agent ecosystem. The new consolidated manifest provides the necessary structured data; this ticket focuses on implementing the software changes to make the Orchestrator consume and act upon this manifest.

## Requirements

### Functional Requirements
- [ ] Modify the Orchestrator agent's loading or initialization process (e.g., in `server/agent-runtime.ts` or `server/agents.ts`) to parse the `thoughts/shared/agents-and-skills-manifest.md` file.
- [ ] Update the Orchestrator's agent discovery mechanism to use the information from the consolidated manifest.
- [ ] Ensure the Orchestrator's dispatch logic can correctly identify and invoke agents based on the manifest's data (agent name, skills, tools_used).
- [ ] Implement error handling for scenarios where the manifest file is missing or malformed.
- [ ] Verify that the Orchestrator can successfully dispatch to all agents listed in the new manifest.

### Technical Notes

- The manifest is a Markdown file with YAML frontmatter. The implementation will need to parse this YAML frontmatter to extract the `agents` and `skills` lists.
- Consider caching the parsed manifest data to avoid repeated file reads.
- This will likely involve modifications to `server/orchestrator.md` (to document the change), `server/agent-dispatch.ts`, `server/agent-runtime.ts`, or other related files responsible for agent loading and dispatch.

## Acceptance Criteria

### Automated Verification
- [ ] Unit tests confirm the Orchestrator can parse the new manifest file correctly.
- [ ] Integration tests verify that the Orchestrator successfully dispatches to agents defined only in the new manifest.

### Manual Verification
- [ ] The Orchestrator agent can successfully interact with and dispatch to all active agents in the system.
- [ ] Changes to `agents-and-skills-manifest.md` are reflected in the Orchestrator's dispatch behavior without requiring code changes to the orchestrator itself.

## Meta

**ID**: WOW-044
**Created**: 2026-06-02
**Priority**: High
**Estimated Effort**: M
**Parent Ticket**: WOW-042
