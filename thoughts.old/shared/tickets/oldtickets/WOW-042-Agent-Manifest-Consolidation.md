# WOW-042: Agent and Skill Manifest Consolidation

## Problem Statement

The current agent ecosystem contains multiple manifest-like files (`agents-registration.md`, `skills-assignments.md`, `wow-018.md`) that attempt to list agents, skills, and their assignments. These files are inconsistent in naming conventions, content, and the distinction between agents, skills, and tools, leading to confusion and maintenance overhead.

## Desired Outcome

A single, canonical source of truth for the registration and overview of all agents and skills within the Way of Work platform. This consolidated manifest will:
- Clearly distinguish between agents and skills.
- Use consistent naming conventions.
- Provide an accurate and up-to-date mapping of which skills are assigned to which agents.
- Potentially serve as a dynamic source for agent discovery and skill loading.

## Context & Background

The current proliferation of inconsistent manifest files creates:
- Difficulty in understanding the overall agent ecosystem.
- Challenges in identifying all available agents and skills.
- Increased risk of outdated or conflicting information.
- Manual synchronization errors.

## Requirements

### Functional Requirements
- [x] Identify all manifest-like files in the `.wo/agents/` directory (e.g., `agents-registration.md`, `skills-assignments.md`, `wow-018.md`).
- [x] Analyze their content to extract all unique agent names and their associated skills.
- [x] Propose a single, standardized format for a new consolidated manifest file (e.g., `agents-and-skills-manifest.md` or a structured data file like JSON/YAML).
- [x] Create the new consolidated manifest file, ensuring it includes all relevant agents, their descriptions, and the skills they utilize, with consistent terminology.
- [x] Remove redundant and inconsistent manifest files, or update them to dynamically generate from the canonical source if that approach is deemed more beneficial for development workflows.
- [ ] Integrate the new consolidated manifest with the Orchestrator agent (`orchestrator.md`) to enable dynamic discovery and efficient dispatch of all Way of Work agents, ensuring the Orchestrator is aware of all available agents and their capabilities.

### Proposed Consolidated Manifest Format

A Markdown file (`agents-and-skills-manifest.md`) with a comprehensive YAML frontmatter section that lists all agents and skills, structured as follows:

```yaml
---
agents:
  - name: ata
    description: Swedish ÄTA-expert — ändrings-, tilläggs- och avgående arbeten
    file: .wo/agents/ata.md
    skills:
      - ata
      - research
      - swedish-building-laws
    tools_used:
      - POST /api/pending-changes
      - ÄTA-API (list, create, update, review, approve, deny cases)
      - GET /api/tickets
      - POST /api/tickets
  # ... other agents

skills:
  - name: ata
    description: Handles ÄTA processes, including creating, reviewing, approving, and denying cases.
    file: .gemini/skills/ata/SKILL.md
    tools_declared:
      - name: ÄTA-API
        description: API for managing ÄTA cases.
        endpoints:
          - GET /api/tickets
          - POST /api/tickets
          - Status change endpoints
    dependencies:
      - project-pricing
      - swedish-building-laws
  # ... other skills
---
```
### Technical Notes

- The new manifest should clearly differentiate between a "Way of Work Agent" (defined in `.wo/agents/*.md`) and a "Gemini Skill" (defined in `.gemini/skills/*.md`).
- Consider the implications for agent discovery in `server/agent-runtime.ts` and `server/index.ts` (websocket handler) when creating this consolidated manifest.

## Acceptance Criteria

### Manual Verification
- [ ] A single, canonical manifest file exists that accurately lists all agents and their assigned skills.
- [ ] All redundant or inconsistent manifest files are removed or updated to reference the canonical source.
- [ ] The manifest uses consistent naming conventions and terminology.

## Meta

**ID**: WOW-042
**Created**: 2026-06-02
**Priority**: Medium
**Estimated Effort**: M
**Parent Ticket**: WOW-038
