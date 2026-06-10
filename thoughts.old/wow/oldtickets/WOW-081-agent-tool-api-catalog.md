# WOW-081-agent-tool-api-catalog

## Problem Statement

The Way of Work platform currently lacks a centralized, comprehensive, and **production-ready** catalog of all available tools, API endpoints, and scripts that AI agents can utilize. Agent definitions in `.wo/agents/` often contain scattered tool information, and new tools/scripts (`server/tools/`, `.wo/scripts/`) are frequently added without corresponding, easily discoverable documentation for the agents. This leads to agents under-utilizing the system's full capabilities and makes it difficult to maintain and expand the agent ecosystem safely.

## Desired Outcome

A single, authoritative, and easily maintainable "Agent Tool, API & Script Catalog" (`.wo/AGENT_TOOL_CATALOG.md`) that lists all capabilities available to AI agents. This catalog must meet production-readiness standards:
- **Comprehensive Inventory:** A clear classification of tools (API calls, CLI scripts, backend utilities).
- **Production-Grade Metadata:** Detailed usage instructions, required arguments, expected output, constraints, and **explicit Human-in-the-Loop (HITL) requirements.**
- **Automated Synchronization:** A reliable process (e.g., CI/CD check or agent-based scan) that ensures the catalog is always in sync with the codebase.
- **Agent Discovery Protocol:** Standardized procedures for agents to discover and query this catalog dynamically.

## Context & Background

### Current State
Tools and scripts are currently defined in various places (`server/tools/`, `.wo/scripts/`, `server/orchestrator-tools-exec.ts`, individual `.wo/agents/*.md` files). There is no single source of truth, resulting in:
- Inconsistent tool usage across agents.
- Agents missing out on powerful newly developed utilities.
- High developer overhead to keep agent documentation up-to-date, risking out-of-date instructions for agents.

### Why This Matters
An authoritative, production-ready catalog is **CRITICAL** for enabling autonomous, collaborative agent workflows. If agents don't have a reliable, system-wide registry of their own capabilities, they cannot effectively decompose complex tasks, delegate sub-tasks to appropriate tools, or leverage system utilities autonomously to resolve user problems end-to-end.

## Requirements

### Functional Requirements
- [ ] **Catalog Structure:** Create a structured and machine-readable `.wo/AGENT_TOOL_CATALOG.md` file following a standardized template (Name, Description, Parameters, Return Type, HITL Requirement, Source Path).
- [ ] **Comprehensive Inventory & Audit:** Perform a full audit of all server tools (`server/tools/`), scripts (`scripts/`), and API endpoints (`server/routes/`).
- [ ] **Automated Synchronization Process:** Implement an automated mechanism (e.g., a script or CI-check) to verify that all tools defined in the codebase are documented in the catalog.
- [ ] **Discovery Protocol:** Update the `orchestrator` agent's prompt to mandate a lookup in the catalog if a new intent or tool requirement is encountered that is not in the agent's immediate knowledge base.
- [ ] **Production-Readiness:** Ensure the catalog itself is version-controlled, documented, and includes robust error handling instructions for the agents consuming the catalog.

### Non-Functional Requirements
- [ ] **Maintainability:** The catalog structure must be simple and easily updatable. Automate updates whenever possible.
- [ ] **Accessibility:** The catalog must be easily readable by both human developers and AI agents (structured Markdown with standardized frontmatter/metadata).

## Acceptance Criteria

### Automated Verification
- [ ] Build completes successfully: `bun run build`.
- [ ] CI script verifies that all tools in `server/tools/` have corresponding entries in the catalog.

### Manual Verification
- [ ] A comprehensive `AGENT_TOOL_CATALOG.md` exists and covers all major tool categories.
- [ ] Agents can be tested to show they can successfully find and use tools listed in the catalog that were previously unknown to them, following the new discovery protocol.
- [ ] Developers confirm the update process for adding a new tool is clear and automated.

## Technical Notes

### Affected Components
- `.wo/AGENT_TOOL_CATALOG.md` (New file)
- `server/tools/` - All tools will be audited.
- `scripts/` - All scripts will be audited.
- `server/routes/` - All APIs will be audited.
- `.wo/agents/` - Prompt updates to refer agents to the catalog.
- `CHANGELOG.md` - Will be updated.

---

## Meta

**Created**: 2026-06-06
**Priority**: High
**Estimated Effort**: M
