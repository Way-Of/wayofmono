# WOW-070-agent-update-logic

## Problem Statement

The existing agents in the system require **SUPER CRITICAL** updates to align more closely with the system's core functions and to achieve production-readiness, specifically focusing on their ability to work together autonomously. There's a risk of agents being too simplistic or not fully leveraging available system capabilities in a coordinated manner, hindering overall efficiency, reliability, and the ability to solve complex problems for the user without intervention.

## Desired Outcome

All agents are thoroughly updated, optimized, and deeply aligned with the core functionalities of the Way of Work platform, capable of **working together seamlessly and autonomously to resolve complex user problems and manage projects end-to-end.** They will be production-ready, implying robustness, efficiency, and full integration, moving beyond basic functionality to intelligent, system-aware, and reliable *collaborative* operations.

## Context & Background

### Current State
Agents are currently implemented but may not be fully optimized or integrated with the latest system features, skills, and tools, especially concerning their ability to coordinate actions and share information to achieve larger goals autonomously. Their existing logic might be too generic, lack the depth required for advanced use cases, or not fully adhere to production-grade standards for error handling and performance within a collaborative framework.

### Why This Matters
**Achieving truly production-ready and collaboratively intelligent agents is SUPER CRITICAL** for automating complex workflows, ensuring data integrity, and providing reliable, intelligent support to users within the Way of Work platform without requiring manual intervention. Misaligned, under-developed, or overly simplistic agents that cannot collaborate effectively can lead to:
- Increased need for manual interventions and orchestration.
- Higher potential for errors and inconsistencies in complex workflows.
- Diminished user experience due to limited autonomous problem-solving capabilities.
- Reduced overall system efficiency and scalability in handling real-world scenarios.

## Requirements

### Functional Requirements
- [ ] Conduct a comprehensive review of each existing agent within the `.wo/agents/` directory and its current capabilities, with a **CRITICAL focus on its potential for autonomous operation and collaborative interaction with other agents.**
- [ ] Investigate the implementation of existing foundational tools (e.g., `glob`, `search_file_content`, `read_file`, `write_file`) to ensure they are correctly implemented, robust, and optimally suited for agent interaction and system stability, particularly in multi-agent workflows.
- [ ] Identify specific areas where agent logic can be deepened, enhanced, or better integrated with existing Way of Work system functions (e.g., by utilizing specific skills, tools, data models, or communication channels). This includes assessing the need for agents to execute scripts or use existing specialized tools, **and critically, how agents can delegate to or cooperate with other agents.**
- [ ] Based on the assessment, either update agents to leverage existing tools and scripts more effectively (including those provided by other agents), or design and implement new tools/scripts to fulfill required functionalities, **with a strong emphasis on enabling autonomous, collaborative problem-solving.**
- [ ] Implement necessary code changes and prompt updates (`.wo/agents/*.md`) to enhance agent intelligence, robustness, and alignment with system functions, **specifically focusing on improving inter-agent communication, delegation, and collective problem resolution.**
- [ ] Ensure all agents adhere to production-readiness standards, including comprehensive error handling, appropriate logging, and optimized performance, particularly when operating in a collaborative, autonomous context.
- [ ] Verify that agents utilize relevant skills and tools effectively and as intended by their design, and that **their combined functionality can autonomously address complex user requests end-to-end.**

### Out of Scope
- Creation of entirely new agent types or functional domains not currently covered by existing agents.
- Major architectural redesigns or refactoring of the core agent framework or execution environment.
- Changes to the underlying LLM models or core AI infrastructure.

## Acceptance Criteria

### Automated Verification
- [ ] Build completes successfully: `bun run build`
- [ ] All relevant unit tests and integration tests for modified agents pass without errors.

### Manual Verification
- [ ] Each updated agent performs its designated functions reliably, accurately, and efficiently in a production-like environment.
- [ ] Agents demonstrate intelligent and nuanced use of Way of Work system functionalities, reducing the need for human intervention.
- [ ] No regressions are introduced in the behavior or performance of any agents.
- [ ] Agent responses and actions are consistent with their updated prompts and system integrations.

## Examples of Agent Enhancement Opportunities

Below are concrete examples illustrating how agents can be improved by better leveraging existing tools/scripts or by creating new ones. These serve as inspiration for identifying similar opportunities across other agents.

### Example 1: Proactive Document Compliance (Docs Agent)
- **Current State:** The `docs` agent (`.wo/agents/docs.md`) has strict file naming and folder organization rules defined in its prompt. It uses `workspace_snapshot` for version control.
- **Enhancement:**
    - **New Tool/Script:** Implement a server-side script `check_document_compliance(file_path)` that analyzes a document's name and its location against the defined naming and folder rules, returning a compliance status or specific suggestions for correction.
    - **Agent Logic:** The `docs` agent could proactively invoke `check_document_compliance` after a document is created or moved. If non-compliant, the agent could then suggest renaming/moving the file via `POST /api/pending-changes` (subject to HITL approval), outlining the necessary changes to the user.
    - **Benefit:** Automates compliance checks, reduces manual errors, and ensures consistency in document management.

### Example 2: Automated Resource Procurement (Fakturering/Supply Agent)
- **Current State:** The `fakturering` agent (`.wo/agents/fakturering.md`) uses `GET /api/price-lists` and manages offers/invoices. Separately, the `opticat-hvac` tools (`server/tools/opticat-hvac.ts`) can search for articles (`opticat_search_articles`).
- **Enhancement:**
    - **New Tool/Script:** Develop a tool `procure_materials(article_id, quantity, project_id)` that can initiate a procurement request, e.g., by creating a draft purchase order, interacting with an external supplier API, or adding items to a global shopping cart (`opticat_get_cart`).
    - **Agent Logic:** If the `fakturering` agent identifies a need for specific materials (e.g., from an accepted offer) or if an `opticat-designer` or `opticat-service-tech` agent recommends parts after a system diagnosis (`opticatSearchArticles`), it could call `procure_materials` to automate the ordering process, always subject to `POST /api/pending-changes` for HITL approval.
    - **Benefit:** Streamlines procurement workflows, reduces manual data entry, and potentially shortens lead times by integrating supply chain actions directly into agent capabilities.

### Example 3: Dynamic Project Health Checks (Projektledare Agent)
- **Current State:** The `projektledare` agent (`.wo/agents/projektledare.md`) provides strategic oversight and delegates detailed tasks to specialized agents (e.g., `kanban` for board management). It utilizes `Kanban API` (delegated) and `ÄTA-API` (delegated).
- **Enhancement:**
    - **New Tool/Script:** Create a script `generate_project_health_report(project_id)` that aggregates critical data from various sources: task progress and overdue items from Kanban boards, planned vs. actual hours from time logs (leveraging `kanban_card_time_logs`), and potentially resource availability from `workers` skill data. This script would synthesize a summary of the project's health.
    - **Agent Logic:** The `projektledare` agent could be configured to run `generate_project_health_report` daily or weekly. It would then present key risks, milestones, or performance indicators to the project manager. If significant issues are detected, the agent could automatically suggest actions or escalate findings via `POST /api/pending-changes` or client communication tools.
    - **Benefit:** Provides proactive project oversight, enables early identification of potential issues, and facilitates data-driven decision-making for project managers.

### Example 4: Contextual Kanban Card Creation (Kanban Agent)
- **Current State:** The `kanban` agent (`.wo/agents/kanban.md`) can autonomously generate boards and cards based on project descriptions using tools like `kanban_create_board` and `kanban_create_card`.
- **Enhancement:**
    - **New Tool/Script:** Develop a tool `suggest_card_dependencies(card_description, project_id)` that analyzes a newly created card's description against existing cards and their relationships within the specified project. It would suggest potential dependencies or common preceding/succeeding tasks based on predefined rules or historical data.
    - **Agent Logic:** When the `kanban` agent creates a new card, it could automatically invoke `suggest_card_dependencies`. If the tool returns relevant dependency suggestions, the agent would present them to the user for confirmation. Upon user approval, the agent would update the card with these dependencies using `kanban_update_card`.
    - **Benefit:** Improves project planning by automatically identifying and suggesting task interdependencies, leading to more realistic timelines and optimized workflow sequences.

## Technical Notes

### Affected Components
- `.wo/agents/*.md` - Agent prompt and configuration files.
- `.wo/skills/*.md` - Potentially new or updated skill definitions that agents will leverage.
- `server/*.ts` - Backend logic related to agent tool execution, data retrieval, or system integrations.
- `scripts/` - Development and implementation of new scripts for agent use.
- `server/tools/` - Development and implementation of new specialized tools for agents.
- **Core Tool Implementations**: Investigation and potential refinement of core tool implementations like `glob`, `search_file_content`, `read_file`, `write_file`.
- `CHANGELOG.md` - Will be updated to reflect changes to each agent.

---

## Meta

**Created**: 2026-06-06
**Priority**: High
**Estimated Effort**: L
