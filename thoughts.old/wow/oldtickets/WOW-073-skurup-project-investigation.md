# WOW-073-skurup-project-investigation

## Problem Statement

The Way of Work platform **MUST** be capable of autonomously managing the initial phases of Swedish construction projects, which often involve specialized financial, legal, and planning documents, even when faced with complex, unforeseen scenarios. The "SKURUP" project serves as a **SUPER CRITICAL** case study to comprehensively evaluate if the system, particularly its agents, possess the full capability to understand, process, and flawlessly handle *all* early-stage project information for the user, **intelligently processing this information depending on the country context (Sweden),** working together seamlessly, without manual intervention, and identify any critical gaps in this comprehensive capability relevant to the Swedish context.

## Desired Outcome

A crystal-clear and detailed understanding of how the "SKURUP" project's initial documentation can be efficiently managed and processed within the Way of Work system, with a **CRITICAL focus on agents working together autonomously to handle every aspect of the project for the user, based on Swedish regulatory and linguistic norms.** This includes:
- A comprehensive mapping of the project's early-stage requirements to existing Way of Work agents, skills, and tools, specifically assessing their collective ability to form a cohesive, self-managing unit.
- A prioritized list of new tools, scripts, agents, or foundational features required to achieve **full autonomous project management capability** for early-stage Swedish projects, where agents can resolve all issues and handle all information for the user, **intelligently adapted to the Swedish context.**
- Actionable recommendations for enhancing Swedish language processing and localization within the platform to enable this comprehensive, autonomous functionality.

## Context & Background

### Current State
The Way of Work system features various agents, skills, and tools for general project management, documentation, and invoicing. Previous investigations have focused on broader technical documentation or specific construction formats. This ticket specifically targets the needs arising from early-stage, Swedish-specific project documentation, which includes cost estimates, legal agreements, and general planning maps. However, the **autonomous, collaborative capability of agents to manage it end-to-end, without user intervention, and specifically adapted to the Swedish context, has not yet been systematically and critically validated.**

### Why This Matters
Successfully demonstrating the ability for Way of Work agents to **autonomously handle the initial documentation for Swedish construction projects end-to-end, intelligently adapted to the Swedish context, is SUPER CRITICAL** for accurate financial planning, legal compliance, and efficient project initiation. It will prove the platform's robustness, completeness, and utility in a production environment where user intervention is minimized. Identifying and addressing functional gaps in *autonomous, collaborative agent capability* early will allow for targeted development, ensuring the system supports the entire project lifecycle for local contexts, enhances user confidence through seamless operation, and ultimately drives adoption in complex, early-stage scenarios.

## Project Documentation Overview (SKURUP)
- **`Skurup kalkyl.pdf`**: Cost calculation.
- **`Skurup karta.pdf`**: Map.
- **`Skurup köpavtal.pdf`**: Purchase agreement.
- **`Skurup letter of int.pdf`**: Letter of intent.
- **`Uppl. kostander Skurup.pdf`**: Development costs.

## Requirements

### Functional Requirements
- [ ] Conduct a thorough and **CRITICAL** investigation of the "SKURUP" project's available documentation, phases, key stakeholders, and specific project management requirements. The investigation **MUST** specifically assess how agents handle and process all information depending on the project's country context (Sweden), ensuring full compliance with Swedish regulations and linguistic norms.
- [ ] Map these identified project needs to existing Way of Work agents (`.wo/agents/`), skills (`.wo/skills/`), and server-side tools (`server/tools/`). **Document in extreme detail which existing components *collectively* can fulfill which project requirements, and crucially, where autonomous, collaborative agent interaction—informed by the Swedish project context—would be required.**
- [ ] Identify **ANY AND ALL** project management aspects, workflows, document types, communication needs, regulatory compliance, or data handling requirements that are not adequately covered by the current Way of Work functionalities, with a **specific focus on barriers to full autonomous agent handling in the Swedish early-stage project context.**
- [ ] For each identified gap, propose specific new tools, scripts, agents, or foundational architectural enhancements that would be required to enable agents to handle these aspects **autonomously and collaboratively**. This should include considerations for how these new components would integrate with existing Way of Work systems and data models, especially for Swedish language and legal/financial specifics.
- [ ] Provide **concrete and actionable recommendations** for how the "SKURUP" project can be effectively onboarded, planned, executed, and monitored within the Way of Work platform, focusing on achieving a state where agents **work together seamlessly to process all information and resolve all issues for the user.**

## Leveraging Way of Work UI Surfaces for Project Management (SKURUP)

### Kanban View (Workboard)
- **Applicability:** Task tracking (Legal Review, Financial Planning), phase management, resource assignment.
- **Enhancement Needs:** Link cards to document status (e.g., "Purchase Agreement Signed" updates card status).

### Docs View
- **Applicability:** Centralized storage/versioning, categorization (`Legal`, `Financial`, `Maps`), agent-assisted compliance.
- **Enhancement Needs:** Semantic search for Swedish PDFs, document comparison tools.

### Claw View (Agent Interaction & Communication)
- **Applicability:** Financial/legal queries, planning assistance, HITL approvals.
- **Enhancement Needs:** Native Swedish language support for legal/financial topics, proactive alerts on deadlines/variances.

### Worker Portal
- **Applicability:** Data collection for site surveys if needed.
- **Enhancement Needs:** Mobile-optimized forms for site data.

### Admin Dashboard
- **Applicability:** User management, approvals, audit logs.
- **Enhancement Needs:** Project setup wizard for Swedish construction, financial dashboards.

### Out of Scope
- Actual execution/management of SKURUP project.
- Core architecture changes unless critical.

## Acceptance Criteria

### Automated Verification
- [ ] Build completes successfully: `bun run build`.

### Manual Verification
- [ ] Comprehensive investigation report mapping requirements to WoW features, identifying gaps (autonomous, Swedish context), and proposing solutions.
- [ ] Prioritized list of development needs linked to supporting SKURUP requirements.

## Technical Notes

### Affected Components
- `thoughts/shared/tickets/WOW-073-skurup-project-investigation.md`
- `/home/zerwiz/CodeP/wayofwork/workspace/dokument/Projects/SKURUP`
- Various files within `.wo/agents/`, `.wo/skills/`, and `server/tools/`.
- Potential new files under `server/tools/`, `.wo/scripts/`, `.wo/skills/`, `.wo/agents/` based on identified development needs, especially for Swedish financial/legal processing and geospatial tools.

---

## Meta

**Created**: 2026-06-06
**Priority**: High
**Estimated Effort**: M
