# WOW-043: Agent Responsibility Review and Refinement

## Problem Statement

The audit identified critical functional overlaps and unclear scopes among several agents. Specifically, `pricing` and `scheduling` are currently handled across multiple agents with distinct tasks that require clear separation. Agents like `projektledare` and `schemaplanerare` also exhibit overlapping responsibilities in planning and task assignment. Furthermore, the `forskare` agent's role needs refinement, including a potential rename to `research` to allow for multiple specialized research agents focused on continuously updating the system with current regulations, certifications, and other vital information. This redundancy leads to inefficient development, unclear delegation of tasks, and potential for inconsistent behavior or user experience.

## Desired Outcome

A clear and distinct definition of responsibilities for each agent within the Way of Work ecosystem.
- Agent scopes will be refined to minimize functional overlap.
- Clear lines of responsibility will be established for common tasks (e.g., pricing, scheduling).
- Opportunities for consolidating redundant logic into shared skills or tools will be identified.
- Agents will operate with well-defined boundaries, leading to a more modular and maintainable system.

## Context & Background

As the agent ecosystem grows, maintaining distinct roles for each agent becomes crucial for scalability and maintainability. Unclear boundaries can lead to:
- "Feature creep" within individual agents.
- Duplication of effort in development.
- Difficulty in debugging and isolating issues.
- Confusion for the orchestrator when dispatching tasks.

## Requirements

### Functional Requirements
- [x] Review agents identified with potential functional overlap, specifically focusing on the separation of:
    - **Pricing tasks**: Currently spread across `forskare`, `kalkylator`, `supply-agent`, and `projektledare`.
    - **Scheduling tasks**: Currently spread across `kanban`, `projektledare`, and `schemaplanerare`.
    - **Agent roles**: Clearly distinguish between `projektledare` (overall project management) and `schemaplanerare` (detailed daily scheduling).
    - **Research tasks**: Review the `forskare` agent's role, considering a rename to `research` and the potential for creating multiple specialized research agents (e.g., `regulations-researcher`, `certifications-researcher`) responsible for continuously updating the system with relevant information.
- [x] For each group of overlapping functionalities or agents, analyze their current descriptions, skills, and tool usage to precisely identify the areas of redundancy.
- [x] Propose revised scopes and responsibilities for each agent to minimize overlap and establish clear distinctions. Specific proposals include:
    - **Pricing Agents**: Dedicated agents for pricing-related tasks, clearly separated from scheduling.
    - **Scheduling Agents**: Dedicated agents for scheduling-related tasks, clearly separated from pricing.
    - **Projektledare**: Focus exclusively on high-level project management, strategic oversight, and overall project health.
    - **Schemaplanerare**: Focus exclusively on detailed daily/weekly scheduling, resource allocation at an operational level, and time verification.
    - **Research Agents**: Rename `forskare` to `research-core` and potentially create specialized `regulations-researcher`, `certifications-researcher` agents to continuously update the system with relevant, compliant information.
- [x] Identify opportunities to centralize common functionalities into new or existing shared skills or tools (e.g., a dedicated `Pricing` skill/agent or a `Scheduling` skill/agent).
- [x] Document the refined responsibilities and proposed changes in agent descriptions (`.wo/agents/*.md`).
- [x] For research agents (e.g., the refined `forskare` or new specialized `research` agents), define clear responsibilities and mechanisms for updating and maintaining dedicated folders and files containing current laws, regulations, certifications, and other compliance-related information. This includes ensuring these resources are readily accessible and compliant.
- [x] Explore and define mechanisms for agents to collaborate on tasks involving overlapping responsibilities, rather than strict separation, especially where a workflow requires input from multiple specialized agents. This may involve defining protocols for inter-agent communication and task hand-offs, potentially facilitated by the orchestrator.

### Agent Collaboration Mechanisms

Given the "Agent Isolation Mandate" (from `GEMINI.md`), direct arbitrary communication between agents is prohibited. Agent collaboration on overlapping responsibilities must therefore be mediated and formally structured. Potential mechanisms, facilitated by the Orchestrator, include:

*   **Orchestrator-Mediated Handoffs**:
    *   **Sequential Dispatch**: The Orchestrator dispatches a task to Agent A. Agent A performs its part, generates a partial result, and returns it to the Orchestrator. The Orchestrator then dispatches the task (potentially with Agent A's output) to Agent B, and so on. The Orchestrator is responsible for combining and presenting the final output.
    *   **Conditional Dispatch**: Based on initial task analysis, the Orchestrator determines which sequence of agents is required and dispatches accordingly, potentially iteratively.

*   **Shared Context/Scratchpad (Orchestrator-Managed)**:
    *   The Orchestrator maintains a shared, transient context (like a "scratchpad") for a complex, multi-agent task. Agents contribute to this context, and the Orchestrator ensures data consistency and manages access. This allows agents to "see" the progress of others without direct communication.

*   **Formalized Communication Tools (Orchestrator-Brokered)**:
    *   Introduction of explicit tools (e.g., `orchestrator_relay_message(target_agent, message, context_id)`) that allow an agent to request information or action from another agent *via the Orchestrator*. The Orchestrator acts as a secure intermediary, logging the interaction and potentially applying access controls.

*   **Role-Based Delegation**:
    *   Where responsibilities truly overlap, define a clear "lead" agent for a task. This lead agent would then have the authority to formally delegate sub-tasks to other agents via the Orchestrator, treating other agents as "subordinates" for that specific workflow.

These mechanisms ensure collaboration while maintaining the security and traceability required by the multi-tenant architecture.

### Technical Notes

- This may involve creating new skills (e.g., `pricing-management`, `advanced-scheduling`) to encapsulate shared logic.
- Agent re-prompts might be necessary to reinforce new responsibilities.

## Acceptance Criteria

### Manual Verification
- [ ] Each agent has a clear and distinct set of responsibilities documented in its `.wo/agents/*.md` file.
- [ ] Identified functional overlaps are minimized or justified with clear distinctions.
- [ ] Proposed shared skills or tools are documented as new tickets if they require implementation.

## Meta

**ID**: WOW-043
**Created**: 2026-06-02
**Priority**: Medium
**Estimated Effort**: M
**Parent Ticket**: WOW-038
