# WOW-072-santa-monica-project-investigation

## Problem Statement

The Way of Work platform **MUST** be capable of autonomously managing real-world construction projects from inception to completion, even when faced with complex, unforeseen scenarios. The "SANTA MONICA-GEORGE HANA" project serves as a **SUPER CRITICAL** case study to comprehensively evaluate if the system, particularly its agents, possess the full capability to understand, process, and flawlessly handle *all* project information for the user, working together seamlessly, without manual intervention, and identify any critical gaps in this comprehensive capability.

## Desired Outcome

A crystal-clear and detailed understanding of how the "SANTA MONICA-GEORGE HANA" project can be managed within the Way of Work system, with a **CRITICAL focus on agents working together autonomously to handle every aspect of the project for the user.** This includes:
- A comprehensive mapping of the project's requirements to existing Way of Work agents, skills, and tools, specifically assessing their collective ability to form a cohesive, self-managing unit.
- A prioritized list of new tools, scripts, agents, or foundational features required to achieve **full autonomous project management capability**, where agents can resolve all issues and handle all information for the user.
- Actionable recommendations for integrating any necessary external systems or data sources to enable this comprehensive, autonomous functionality.

## Context & Background

### Current State
The Way of Work system features various agents, skills, and tools designed for project management, documentation, invoicing, scheduling, and communication. However, its **full efficacy and completeness against the demands of a comprehensive, real-world construction project, and especially the autonomous, collaborative capability of agents to manage it end-to-end, has not yet been systematically and critically validated.**

### Why This Matters
Successfully demonstrating the ability for Way of Work agents to **autonomously manage a real construction project like "SANTA MONICA-GEORGE HANA" end-to-end is SUPER CRITICAL.** It will prove the platform's robustness, completeness, and utility in a production environment where user intervention is minimized. Identifying and addressing functional gaps in *autonomous, collaborative agent capability* early will allow for targeted development, ensuring the system meets industry demands for self-managing projects, enhances user confidence through seamless operation, and ultimately drives adoption in highly complex scenarios.

## Project Documentation Overview (SANTA MONICA-GEORGE HANA)
...
## Requirements

### Functional Requirements
- [ ] Conduct a thorough and **CRITICAL** investigation of the "SANTA MONICA-GEORGE HANA" project's available documentation, phases, key stakeholders, and specific project management requirements (e.g., permits, contracts, material tracking, progress reporting, quality control, safety protocols). The investigation **MUST** also specifically assess how agents handle and process all information depending on the project's country context, ensuring full compliance with local regulations and linguistic norms.
- [ ] Map these identified project needs to existing Way of Work agents (`.wo/agents/`), skills (`.wo/skills/`), and server-side tools (`server/tools/`). **Document in extreme detail which existing components *collectively* can fulfill which project requirements, and crucially, where autonomous, collaborative agent interaction—informed by the project's specific country context—would be required.**
- [ ] Identify **ANY AND ALL** project management aspects, workflows, document types, communication needs, regulatory compliance, or data handling requirements that are not adequately covered by the current Way of Work functionalities, with a **specific focus on barriers to full autonomous agent handling.**
- [ ] For each identified gap, propose specific new tools, scripts, agents, or foundational architectural enhancements that would be required to enable agents to handle these aspects **autonomously and collaboratively**. This should include considerations for how these new components would integrate with existing Way of Work systems and data models.
- [ ] Provide **concrete and actionable recommendations** for how the "SANTA MONICA-GEORGE HANA" project can be effectively onboarded, planned, executed, and monitored within the Way of Work platform, focusing on achieving a state where agents **work together seamlessly to process all information and resolve all issues for the user.**

### Identified Gaps and Proposed Development Needs

1.  **Specialized Construction File Format Handling (.pzh, .bc3):**
    *   **Need:** Way of Work currently lacks native capabilities to read, interpret, or interact with specialized construction measurement and budgeting formats like `.pzh` (often proprietary) and `.bc3` (common in Spanish-speaking construction). Extracting structured data from these is vital for project insights.
    *   **Proposed Solution:**
        *   **New Tool/Skill:** Develop a `bc3_parser` or `project_measurement_tool` (e.g., a server-side script) that can extract key data (items, quantities, prices, unit costs) from `.bc3` files. Research integration with third-party libraries or services for `.pzh` if feasible.
        *   **Agent Enhancement:** Enhance existing agents (e.g., `fakturering` for pricing, `projektledare` for budgeting) or create a new `cost_engineer` agent to leverage this tool for automated data extraction and analysis.

2.  **DWG File Viewing and Basic Analysis:**
    *   **Need:** Directly viewing AutoCAD `.dwg` files within the Way of Work interface or via agent interaction is critical for reviewing architectural and structural plans without external software.
    *   **Proposed Solution:**
        *   **New Tool/Skill:** Implement a `dwg_viewer` tool. This could involve integration with an existing web-based DWG viewer API/service or a custom rendering solution. (Note: The pending `WOW-069: Open DWG Files` ticket is directly relevant here and should be prioritized).
        *   **Agent Enhancement:** A `plan_reviewer` agent could use this tool to visually inspect plans, cross-reference components, or extract basic geometric information.

3.  **Advanced PDF Document Processing:**
    *   **Need:** Beyond simple viewing, the system requires enhanced capabilities for processing construction-specific PDFs, especially the "signed" execution documents. This includes verifying digital signatures and accurately extracting structured data from complex layouts (e.g., tables, schedules, material lists within reports).
    *   **Proposed Solution:**
        *   **New Tool/Skill:** Develop an `advanced_pdf_processor` tool capable of digital signature verification, optical character recognition (OCR) with structured data extraction, and possibly integration with semantic parsing libraries.
        *   **Agent Enhancement:** The `docs` agent or a specialized `compliance_officer` agent could use this tool for automated review, validation, and data input from official project documents.

4.  **Localization and Internationalization for Construction Standards (Spanish Context):**
    *   **Need:** The project's language and terminology (`MEDICIONES`, `PROYECTO DWG/PDF`) are Spanish. This implies adherence to Spanish building codes, regulations, and industry practices, which differ from the Swedish context currently supported (e.g., `swedish-building-laws`).
    *   **Proposed Solution:**
        *   **New Skill:** Create a `spanish-building-laws` skill that encapsulates relevant Spanish regulations (e.g., Código Técnico de la Edificación - CTE, Ley de Ordenación de la Edificación - LOE).
        *   **Agent Enhancement:** The `projektledare` agent (or a new `local_compliance_agent`) needs to be aware of and apply these specific Spanish regulations during planning, execution, and review phases. The i18n system must also support Spanish for prompts and tool outputs.

5.  **Intelligent Project Data Extraction and Summarization:**
    *   **Need:** Agents should be able to intelligently parse and extract key project information (e.g., project name, client, key dates, budget totals, material lists, scope of work) from various documents and formats. This data needs to be summarized for human users or integrated into other Way of Work modules (e.g., automatically populating a Kanban project or generating initial project parameters).
    *   **Proposed Solution:**
        *   **Agent Enhancement:** Enhance the `docs` or `projektledare` agents with advanced Natural Language Processing (NLP) capabilities, possibly leveraging a Large Language Model (LLM) with Retrieval Augmented Generation (RAG) over the project documents.
        *   **New Tool/Script:** A `document_data_extractor` that uses AI/ML models or rule-based parsing to identify and pull out specific data points from unstructured and semi-structured text within documents.

6.  **Integration with External Project Management / BIM Systems:**
    *   **Need:** Real-world construction projects often rely on external project management platforms (e.g., Primavera P6, Asta Powerproject) or Building Information Modeling (BIM) software. Seamless data exchange is crucial.
    *   **Proposed Solution:**
        *   **New Tools/Skills:** Develop API integration tools for common construction management platforms.
        *   **Agent Enhancement:** A `bim_integrator` agent could manage the import/export of project data, models, and schedules.

## Leveraging Way of Work UI Surfaces for Project Management (SANTA MONICA-GEORGE HANA)

This section outlines how existing Way of Work UI surfaces can be utilized for managing a complex construction project like "SANTA MONICA-GEORGE HANA," and where further enhancements might be beneficial.

### Kanban View (Workboard)
-   **Applicability:** The Kanban board is ideal for visual task management, tracking project phases, and assigning responsibilities. For the SANTA MONICA project:
    -   **Task Tracking:** Create cards for each major task identified in the execution plans (e.g., "Foundation Laying," "Structural Assembly," "Electrical Installation").
    -   **Phase Management:** Use columns to represent project phases (e.g., "Planning," "Execution - Phase 1," "Execution - Phase 2," "Quality Control," "Client Handover").
    -   **Resource Allocation:** Assign workers (or teams) to specific tasks, linking to time tracking.
    -   **Milestone Tracking:** Mark critical milestones (e.g., "Permits Approved," "Structure Complete").
-   **Enhancement Needs:**
    -   **Integration with Document Data:** Ability for Kanban cards to directly link to or pull data from project documents (e.g., link to a specific PDF plan, display budget from an Excel file).
    -   **Dependencies Visualization:** Improved visualization of task dependencies, potentially leveraging the proposed `suggest_card_dependencies` tool (from WOW-070).

### Docs View
-   **Applicability:** The Docs view is the central hub for managing all project documentation, including the extensive PDF, DWG, Excel, PZH, and BC3 files.
    -   **Document Storage & Versioning:** Store all project documents (`MEDICIONES`, `PROYECTO DWG`, `PROYECTO PDF`) within the `workspace/dokument/Projects/SANTA MONICA-GEORGE HANA` directory, leveraging `workspace-storage` and `workspace_snapshot` for version control.
    -   **Categorization:** Organize documents into folders mirroring the project structure (e.g., `MEDICIONES`, `PROYECTO DWG`, `PROYECTO PDF/1-BASICO_v2`, `PROYECTO PDF/2-EJECUCION`).
    -   **Agent Interaction:** The `docs` agent can assist in filing, reviewing, and ensuring compliance of documents according to defined rules (file naming, folder organization).
-   **Enhancement Needs:**
    -   **In-app Viewers:** Native viewers for DWG, PDF, and specialized construction formats (PZH, BC3) as identified in the "Identified Gaps" section.
    -   **Search & Extraction:** Advanced search capabilities within document content, and intelligent extraction of data for other modules.

### Claw View (Agent Interaction & Communication)
-   **Applicability:** The Claw view provides a conversational interface for interacting with various agents and automating tasks.
    -   **Agent Delegation:** Use the `orchestrator` agent to dispatch tasks to specialized agents for the SANTA MONICA project (e.g., `projektledare` for planning, `fakturering` for invoicing, `docs` for document management).
    -   **Information Retrieval:** Query agents for specific project information (e.g., "What is the budget for 'Foundation Laying'?", "Show me the latest structural plans").
    -   **Reporting:** Generate summaries or progress reports by asking the `projektledare` agent to use its reporting capabilities.
    -   **HITL Approvals:** All critical actions and data changes are routed through `POST /api/pending-changes` and managed via the Claw interface, ensuring human oversight.
-   **Enhancement Needs:**
    -   **Multilingual Support:** As the project is Spanish, agents in Claw should seamlessly understand and respond in Spanish, leveraging proposed `spanish-building-laws` skill and i18n enhancements.
    -   **Proactive Alerts:** Agents could proactively alert project managers via Claw about issues (e.g., overdue tasks, budget overruns, non-compliant documents).

### Worker Portal
-   **Applicability:** Provides field workers with essential project information and tools to report progress and time.
    -   **Task Assignment & Updates:** Workers can view their assigned Kanban cards, update task status, and log time directly.
    -   **Access to Documents:** Quick access to relevant plans and manuals (e.g., `MANUAL DE USO Y MANTENIMIENTO`) from the Docs view for on-site reference.
    -   **Incident Reporting:** Field workers can use the `incident-reporting` skill (potentially via a simplified Claw interface) to report issues from the site.
-   **Enhancement Needs:**
    -   **Mobile-Optimized Views:** Ensure Kanban, Docs, and reporting interfaces are fully responsive and touch-optimized for mobile devices.
    -   **Offline Capabilities:** Ability to access and update some information even without network connectivity, syncing once reconnected.

### Admin Dashboard
-   **Applicability:** Centralized management for project administrators.
    -   **User & Role Management:** Manage project teams, assign roles (e.g., project manager, engineer, worker, client) and permissions specific to the SANTA MONICA project.
    -   **Approval Queue:** Review and approve pending changes (HITL) related to budget adjustments, document finalization, or critical task approvals.
    -   **Audit Logs:** Monitor all actions and changes within the SANTA MONICA project for compliance and accountability.
    -   **System Configuration:** Manage integrations, price lists, and other system-wide settings relevant to the project.
-   **Enhancement Needs:**
    -   **Project-Specific Analytics:** Dashboards showing project health, budget vs. actuals, and progress at a glance.
    -   **Compliance Reporting:** Generate audit reports tailored to construction industry standards.

### TA-Planner (if applicable)
-   **Applicability:** If the SANTA MONICA project involves roadwork or traffic management, the TA-Planner view would be directly applicable for designing and managing traffic arrangement plans.
-   **Enhancement Needs:**
    -   **Localization:** Integration of Spanish traffic management regulations and signage.

6.  **Integration with External Project Management / BIM Systems:**
    *   **Need:** Real-world construction projects often rely on external project management platforms (e.g., Primavera P6, Asta Powerproject) or Building Information Modeling (BIM) software. Seamless data exchange is crucial.
    *   **Proposed Solution:**
        *   **New Tools/Skills:** Develop API integration tools for common construction management platforms.
        *   **Agent Enhancement:** A `bim_integrator` agent could manage the import/export of project data, models, and schedules.

## Leveraging Way of Work UI Surfaces for Project Management (SANTA MONICA-GEORGE HANA)

This section outlines how existing Way of Work UI surfaces can be utilized for managing a complex construction project like "SANTA MONICA-GEORGE HANA," and where further enhancements might be beneficial.

### Kanban View (Workboard)
-   **Applicability:** The Kanban board is ideal for visual task management, tracking project phases, and assigning responsibilities. For the SANTA MONICA project:
    -   **Task Tracking:** Create cards for each major task identified in the execution plans (e.g., "Foundation Laying," "Structural Assembly," "Electrical Installation").
    -   **Phase Management:** Use columns to represent project phases (e.g., "Planning," "Execution - Phase 1," "Execution - Phase 2," "Quality Control," "Client Handover").
    -   **Resource Allocation:** Assign workers (or teams) to specific tasks, linking to time tracking.
    -   **Milestone Tracking:** Mark critical milestones (e.g., "Permits Approved," "Structure Complete").
-   **Enhancement Needs:**
    -   **Integration with Document Data:** Ability for Kanban cards to directly link to or pull data from project documents (e.g., link to a specific PDF plan, display budget from an Excel file).
    -   **Dependencies Visualization:** Improved visualization of task dependencies, potentially leveraging the proposed `suggest_card_dependencies` tool (from WOW-070).

### Docs View
-   **Applicability:** The Docs view is the central hub for managing all project documentation, including the extensive PDF, DWG, Excel, PZH, and BC3 files.
    -   **Document Storage & Versioning:** Store all project documents (`MEDICIONES`, `PROYECTO DWG`, `PROYECTO PDF`) within the `workspace/dokument/Projects/SANTA MONICA-GEORGE HANA` directory, leveraging `workspace-storage` and `workspace_snapshot` for version control.
    -   **Categorization:** Organize documents into folders mirroring the project structure (e.g., `MEDICIONES`, `PROYECTO DWG`, `PROYECTO PDF/1-BASICO_v2`, `PROYECTO PDF/2-EJECUCION`).
    -   **Agent Interaction:** The `docs` agent can assist in filing, reviewing, and ensuring compliance of documents according to defined rules (file naming, folder organization).
-   **Enhancement Needs:**
    -   **In-app Viewers:** Native viewers for DWG, PDF, and specialized construction formats (PZH, BC3) as identified in the "Identified Gaps" section.
    -   **Search & Extraction:** Advanced search capabilities within document content, and intelligent extraction of data for other modules.

### Claw View (Agent Interaction & Communication)
-   **Applicability:** The Claw view provides a conversational interface for interacting with various agents and automating tasks.
    -   **Agent Delegation:** Use the `orchestrator` agent to dispatch tasks to specialized agents for the SANTA MONICA project (e.g., `projektledare` for planning, `fakturering` for invoicing, `docs` for document management).
    -   **Information Retrieval:** Query agents for specific project information (e.g., "What is the budget for 'Foundation Laying'?", "Show me the latest structural plans").
    -   **Reporting:** Generate summaries or progress reports by asking the `projektledare` agent to use its reporting capabilities.
    -   **HITL Approvals:** All critical actions and data changes are routed through `POST /api/pending-changes` and managed via the Claw interface, ensuring human oversight.
-   **Enhancement Needs:**
    -   **Multilingual Support:** As the project is Spanish, agents in Claw should seamlessly understand and respond in Spanish, leveraging proposed `spanish-building-laws` skill and i18n enhancements.
    -   **Proactive Alerts:** Agents could proactively alert project managers via Claw about issues (e.g., overdue tasks, budget overruns, non-compliant documents).

### Worker Portal
-   **Applicability:** Provides field workers with essential project information and tools to report progress and time.
    -   **Task Assignment & Updates:** Workers can view their assigned Kanban cards, update task status, and log time directly.
    -   **Access to Documents:** Quick access to relevant plans and manuals (e.g., `MANUAL DE USO Y MANTENIMIENTO`) from the Docs view for on-site reference.
    -   **Incident Reporting:** Field workers can use the `incident-reporting` skill (potentially via a simplified Claw interface) to report issues from the site.
-   **Enhancement Needs:**
    -   **Mobile-Optimized Views:** Ensure Kanban, Docs, and reporting interfaces are fully responsive and touch-optimized for mobile devices.
    -   **Offline Capabilities:** Ability to access and update some information even without network connectivity, syncing once reconnected.

### Admin Dashboard
-   **Applicability:** Centralized management for project administrators.
    -   **User & Role Management:** Manage project teams, assign roles (e.g., project manager, engineer, worker, client) and permissions specific to the SANTA MONICA project.
    -   **Approval Queue:** Review and approve pending changes (HITL) related to budget adjustments, document finalization, or critical task approvals.
    -   **Audit Logs:** Monitor all actions and changes within the SANTA MONICA project for compliance and accountability.
    -   **System Configuration:** Manage integrations, price lists, and other system-wide settings relevant to the project.
-   **Enhancement Needs:**
    -   **Project-Specific Analytics:** Dashboards showing project health, budget vs. actuals, and progress at a glance.
    -   **Compliance Reporting:** Generate audit reports tailored to construction industry standards.

### TA-Planner (if applicable)
-   **Applicability:** If the SANTA MONICA project involves roadwork or traffic management, the TA-Planner view would be directly applicable for designing and managing traffic arrangement plans.
-   **Enhancement Needs:**
    -   **Localization:** Integration of Spanish traffic management regulations and signage.

## Requirements

### Functional Requirements
- [ ] Conduct a thorough investigation of the "SANTA MONICA-GEORGE HANA" project's available documentation, phases, key stakeholders, and specific project management requirements (e.g., permits, contracts, material tracking, progress reporting, quality control, safety protocols).
- [ ] Map these identified project needs to existing Way of Work agents (`.wo/agents/`), skills (`.wo/skills/`), and server-side tools (`server/tools/`). Document which existing components can fulfill which project requirements.
- [ ] Identify any project management aspects, workflows, document types, communication needs, regulatory compliance, or data handling requirements that are not adequately covered by the current Way of Work functionalities.
- [ ] For each identified gap, propose specific new tools, scripts, or agent enhancements that would be required. This should include considerations for how these new components would integrate with existing Way of Work systems and data models.
- [ ] Provide concrete recommendations for how the "SANTA MONICA-GEORGE HANA" project can be effectively onboarded, planned, executed, and monitored within the Way of Work platform using both current and proposed functionalities.

### Out of Scope
- Actual execution or real-time management of the "SANTA MONICA-GEORGE HANA" project.
- Changes to the core architecture or foundational infrastructure of Way of Work unless a specific architectural limitation is identified as a critical blocker for this type of project and explicitly noted as such.

## Acceptance Criteria

### Automated Verification
- [ ] Build completes successfully: `bun run build` (Ensuring no build regressions are introduced by documentation changes or new tool definitions).

### Manual Verification
- [ ] A comprehensive report (either within this ticket, a linked `thoughts/research/` document, or a new markdown file within the `SANTA MONICA-GEORGE HANA` project directory) detailing the investigation findings. This report must clearly outline:
    - The project's key characteristics and requirements.
    - A matrix or list showing how current Way of Work features map to these requirements.
    - A prioritized list of identified gaps and proposed solutions (new tools, scripts, agent updates).
- [ ] A clear, prioritized list of development needs for the Way of Work platform, directly linked to supporting the requirements of the "SANTA MONICA-GEORGE HANA" project.

## Technical Notes

### Affected Components
- `thoughts/shared/tickets/WOW-072-santa-monica-project-investigation.md` (This ticket itself will evolve with findings)
- `/home/zerwiz/CodeP/wayofwork/workspace/dokument/Projects/SANTA MONICA-GEORGE HANA` (The target project for investigation)
- Various files within `.wo/agents/`, `.wo/skills/`, and `server/tools/` will be analyzed and referenced during the investigation.
- Potential new files under `server/tools/`, `.wo/scripts/`, `.wo/skills/`, `.wo/agents/` based on identified development needs.

---

## Meta

**Created**: 2026-06-06
**Priority**: High
**Estimated Effort**: L
