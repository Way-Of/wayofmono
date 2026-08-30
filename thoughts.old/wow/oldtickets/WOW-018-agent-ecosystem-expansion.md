# WOW-018 [Agent Ecosystem Expansion] Refine and expand the specialized agents in .wo

## Problem Statement

With the completion of WOW-016 (Access Control & Daily Workflow) and WOW-017 (TA-Planner), the foundational multi-agent architecture is in place. The Orchestrator successfully routes requests, and specialized agents handle specific domains. However, the current roster of agents (`fakturering`, `projektledare`, `schemaplanerare`, `ata`, etc.) only scratches the surface of the construction management lifecycle.

To fully leverage the Way of Work platform, we need to expand the `.wo` agent ecosystem to cover more granular, specialized tasks, and introduce cross-cutting skills that enhance the intelligence of existing agents.

## Desired Outcome

A richer, more specialized agent ecosystem inside `.wo/agents/` and `.wo/skills/` that covers site safety, equipment management, and deeper financial analysis. Furthermore, we need to enhance the Orchestrator's ability to handle ambiguous intents and manage multi-agent collaboration (where one agent hands off to another).

## Context & Background

### Current State (from WOW-016 Phase 7)
- **Orchestrator:** Routes messages via the `dispatch-agent` skill.
- **Specialized Agents:** `fakturering`, `forskare`, `projektledare`, `schemaplanerare`, `ata`, `docs`, `kanban`, `claw`.
- **Human-in-the-Loop:** All agents are constrained to use `POST /api/pending-changes` for writes.
- **Channel Persistence:** Handled securely via `claw-bot-bridge.ts`.

### Why This Matters
The construction industry is highly segmented. A "Project Manager" (`projektledare`) agent becomes a bottleneck if it's forced to handle deep safety inspections, heavy machinery logistics, and complex budget forecasting simultaneously. Breaking these into specialized sub-agents improves response quality and reduces context bloat.

## Requirements & Proposals

### 1. New Specialized Agents (`.wo/agents/`)

- [x] **`skyddsombud` (Safety Representative / Inspector)**
  - **Purpose:** Focuses exclusively on site safety, AFS compliance, and risk assessments.
  - **Skills:** `safety`, `swedish-building-laws`, `incident-reporting` (new).
  - **Use Case:** "Generate a risk assessment for working at heights on block C."

- [x] **`maskinchef` (Equipment & Logistics Manager)**
  - **Purpose:** Manages heavy machinery, tool rentals, and material deliveries.
  - **Skills:** `logistics` (new), `project-pricing`.
  - **Use Case:** "We need an excavator for next week. Find the daily rate and schedule the delivery."

- [x] **`kalkylator` (Estimator / Cost Engineer)**
  - **Purpose:** Deep financial analysis, creating detailed project budgets, and analyzing profit margins. Offloads financial heavy-lifting from `fakturering`.
  - **Skills:** `cost-estimation` (new), `project-pricing`, `time-calculation`.
  - **Use Case:** "Analyze the variance report from yesterday. Are we over budget on the TA plan implementation?"

### 2. New Cross-Cutting Skills (`.wo/skills/`)

- [x] **`incident-reporting`**
  - Instructions on how to structure a formal incident report (Tillbud/Olycka) for the Swedish Work Environment Authority (Arbetsmiljöverket).
- [x] **`logistics`**
  - Guidelines for scheduling deliveries, managing lead times, and tracking rented equipment costs.
- [x] **`cost-estimation`**
  - Advanced methodologies for bottom-up and top-down cost estimating, incorporating risk buffers and indirect costs.

### 3. Orchestrator Enhancements

- [x] **Multi-Agent Handoff:** Update the `dispatch-agent` skill so the Orchestrator can coordinate sequential tasks.
  - *Example:* User says "Create a TA plan and invoice the client." -> Orchestrator dispatches to `projektledare` (for the plan) and THEN to `fakturering` (for the invoice).
- [x] **Ambiguity Resolution:** Improve the Orchestrator's prompt to ask clarifying multiple-choice questions when the user's intent spans multiple agents.

### 4. Integration with New Features

- [x] **TA-Planner Integration:** Ensure the `tma-planner` or `projektledare` agent is explicitly instructed to use the new `ta_plans` database schema via the `pending-changes` queue (following WOW-017 completion).

## Acceptance Criteria
- [x] New agent markdown files exist in `.wo/agents/` with correct YAML frontmatter.
- [x] New skill markdown files exist in `.wo/skills/`.
- [x] Orchestrator's `dispatch-agent` skill is updated to map the new agents.
- [x] All new agents strictly adhere to the Human-in-the-Loop (`pending-changes`) constraint.

*Note*: Agent expansion is ongoing based on project needs. The specialized roster (`skyddsombud`, `maskinchef`, `kalkylator`) is fully functional.

## Meta
**Created:** 2026-05-22
**Priority:** Medium
**Estimated Effort:** M
**Status:** Ongoing maintenance
