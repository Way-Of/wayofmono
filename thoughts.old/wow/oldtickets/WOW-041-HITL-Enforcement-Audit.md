# WOW-041: Human-in-the-Loop (HITL) Enforcement Audit and Standardization

## Problem Statement

The audit revealed inconsistencies in the enforcement and documentation of the Human-in-the-Loop (HITL) constraint. While the `wow_human_in_the_loop` skill clearly mandates the use of `POST /api/pending-changes` for all production data modifications, not all agents explicitly reference this workflow or fully describe the HITL process in their documentation. This creates a risk of agents bypassing the approval mechanism.

## Desired Outcome
  
Consistent and explicit HITL enforcement across all agents that modify production data.
- Every agent designed to alter production data will clearly document its adherence to the `POST /api/pending-changes` workflow.
- Agent prompts and internal instructions will explicitly guide agents to use the HITL mechanism for all data-modifying actions.
- Any ambiguities or missing HITL references in agent documentation will be rectified.

## Context & Background

The HITL mechanism (WOW-010) is a critical security and control feature designed to prevent unauthorized or unintended AI-generated changes to production data. Inconsistent enforcement or documentation of this mechanism poses a significant risk to data integrity and system reliability.

## Requirements

### Functional Requirements
- [x] Identify all agents in `.wo/agents/*.md` that are designed to modify production data (e.g., creating/updating/deleting tasks, projects, financial records, configurations).
- [x] For each identified data-modifying agent, review its `.md` file to ensure it explicitly references and adheres to the `POST /api/pending-changes` workflow for all such actions.
- [x] Update agent prompts where necessary to explicitly instruct the agent to use the HITL mechanism.
- [x] Ensure that agents communicate to the user when a change has been submitted for admin approval ("Förslag skickat till admin för godkännande").
- [x] Rectify any documentation gaps or ambiguities regarding HITL enforcement in agent descriptions and instructions.

### Identified Data-Modifying Agents

The following agents have been identified as capable of modifying production data. Potential Human-in-the-Loop (HITL) documentation gaps are noted:

*   **ata.md**: Explicitly references `POST /api/pending-changes`. **No HITL gap.**
*   **claw.md**: Explicitly references `POST /api/pending-changes`. **No HITL gap.**
*   **docs.md**: Explicitly references `POST /api/pending-changes`. **No HITL gap.**
*   **fakturering.md**: Explicitly references `POST /api/pending-changes`. **No HITL gap.**
*   **forskare.md**: Explicitly references `POST /api/pending-changes`. **No HITL gap.**
*   **kalkylator.md**: Explicitly references `POST /api/pending-changes`. **No HITL gap.**
*   **kanban.md**: **HITL Gap:** "Always confirm before destructive operations" but does not explicitly mention `POST /api/pending-changes`.
*   **maskinchef.md**: Explicitly references `POST /api/pending-changes`. **No HITL gap.**
*   **projektledare.md**: Explicitly references `POST /api/pending-changes`. **No HITL gap.**
*   **schemaplanerare.md**: Explicitly references `POST /api/pending-changes`. **No HITL gap.**
*   **skyddsombud.md**: Explicitly references `POST /api/pending-changes`. **No HITL gap.**
*   **supply-agent.md**: **HITL Gap:** Implies data modification but does not explicitly mention `POST /api/pending-changes`.
*   **ta-planner.md**: **HITL Gap:** Mentions human approval for significant modifications but does not explicitly mention `POST /api/pending-changes`.
*   **time-verification.md**: **HITL Gap:** "Propose Changes — Create pending_changes for schedule adjustments" implies HITL but could be more explicit about `POST /api/pending-changes`.

### Technical Notes

- This audit will involve carefully reading agent prompts and tool usage sections to infer intent regarding data modification.
- Agents that modify data indirectly (e.g., by suggesting changes that are then manually applied) should still acknowledge the HITL process.

## Acceptance Criteria

### Manual Verification
- [ ] Every agent capable of modifying production data explicitly documents its use of the `POST /api/pending-changes` mechanism.
- [ ] Agent prompts are clear about the HITL process.
- [ ] There are no agents that bypass the HITL for production data changes.

## Meta

**ID**: WOW-041
**Created**: 2026-06-02
**Priority**: High
**Estimated Effort**: M
**Parent Ticket**: WOW-038
