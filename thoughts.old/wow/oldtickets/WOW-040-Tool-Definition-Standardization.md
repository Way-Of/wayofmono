# WOW-040: Tool Definition Standardization and Documentation

## Problem Statement

The audit revealed inconsistencies in how "tools" are defined and referenced across the agent ecosystem. There's a blend of actual callable tools (e.g., `POST /api/pending-changes`, `web_fetch`) with references to internal backend functions (e.g., `auditLog`, `gitCommit`) or abstract capabilities. Furthermore, many specialized tools (e.g., `ÄTA-API`, `Kanban API`, `Arbetskraftsverktyg`, `safety_check`) are mentioned in agent and skill documentation without comprehensive, centralized documentation of their input schemas, output formats, and expected behavior.

## Desired Outcome

A standardized approach to tool definition and comprehensive, accessible documentation for all tools available to agents.
- A clear distinction between callable agent tools, internal API functions, and abstract capabilities.
- Every callable tool available to agents will be explicitly defined, registered, and documented.
- Comprehensive documentation for each specialized tool, including its purpose, input parameters, output format, and example usage.
- All tools should be verifiable for availability and proper functionality.

## Context & Background

This inconsistency leads to:
- Ambiguity for agents in correctly utilizing tools.
- Difficulty in verifying an agent's access and permissions to use a tool.
- Challenges for developers in maintaining and extending agent toolsets.
- Increased risk of errors or incorrect tool usage.

## Requirements

### Functional Requirements
- [x] Establish a clear definition of what constitutes a "callable agent tool" (i.e., a function or API endpoint that an agent can invoke).
- [x] Audit all tools referenced in agent and skill documentation (both `.wo/agents/*.md` and `.gemini/skills/*.md`).
- [ ] For every identified callable agent tool, create or locate its formal definition (e.g., OpenAI function schema, API documentation).
- [ ] Create comprehensive documentation for each specialized tool, detailing:
    - Its purpose and the problem it solves.
    - Input parameters (data types, required/optional, description).
    - Expected output format.
    - Example usage.
    - Any pre-conditions or post-conditions.
- [ ] Implement a centralized tool registry or documentation system that makes all available tools and their documentation easily discoverable.
- [ ] Ensure the `backlog-groomer` skill's listed tools (`read`, `grep`, `find`, `ls`, `write`) are clarified in the context of the Way of Work agent ecosystem (i.e., whether these are abstract capabilities or specific, implemented agent tools).

### Audited Tools List

Below is a consolidated list of tools explicitly referenced or implied across agent and skill documentation:

**Callable Agent Tools (identified):**
*   `POST /api/pending-changes` (Human-in-the-Loop approval mechanism)
*   `web_fetch` (for external web browsing/data retrieval)
*   `telegram_send` (for sending Telegram messages)
*   `whatsapp_send` (for sending WhatsApp messages)
*   `email_send` (for sending emails)
*   `GET /api/price-lists` (for retrieving internal price lists)
*   `kanban_create_board` (for creating new Kanban boards)
*   `kanban_create_card` (for creating new Kanban cards)
*   `kanban_update_card` (for updating existing Kanban cards)
*   `kanban_log_time` (for logging time entries on Kanban cards)
*   `kanban_card_time_logs` (for retrieving time logs for Kanban cards)
*   `kanban_list_workers` (for listing workers associated with Kanban boards)
*   `ÄTA-API` (encompassing specific endpoints for ÄTA case management):
    *   `GET /api/tickets` (list/search ÄTA cases)
    *   `POST /api/tickets` (create ÄTA case)
    *   `Status change endpoints` (for approving/denying ÄTA cases)
*   `workspace_snapshot` (for creating workspace snapshots or document versions)
*   `doc_history` (for retrieving document version history)
*   `doc_restore` (for restoring documents to previous versions)
*   `workspace_backup_status` (for checking workspace backup status)
*   `safety_check` (for performing safety checks)
*   `create_incident_report` (for creating new incident reports)
*   `attach_media_to_report` (for attaching media to incident reports)
*   `risk_assess` (for conducting risk assessments)
*   `verify_time_entries` (for verifying time entries)
*   `propose_schedule_changes` (for proposing schedule changes)
*   `send_daily_dispatch` (for sending daily work dispatches)
*   `ta_plan_update` (for updating TA-plans, e.g., placing map objects)
*   `read_resource_file` (for reading internal resource files like regulations)
*   `calculate_variance` (for calculating time variances)
*   `get_standard_time_units` (for retrieving standard time-per-unit data)
*   `estimate_labor_costs` (for estimating labor costs)
*   `estimate_material_costs` (for estimating material costs)
*   `estimate_equipment_costs` (for estimating equipment costs)
*   `calculate_overhead` (for calculating project overhead costs)
*   `track_equipment_location` (for tracking equipment location)
*   `check_material_inventory` (for checking material inventory)
*   `coordinate_delivery` (for coordinating material/equipment deliveries)
*   `dispatch_to_agent` (for the Orchestrator to dispatch to other agents)
*   `compare_supplier_data` (for comparing supplier data)
*   `generate_comparison_report` (for generating supplier comparison reports)
*   `generate_offer_document` (for generating offer documents)
*   `generate_invoice_document` (for generating invoice documents)
*   `generate_report` (for generating general reports)
*   `get_project_members` (for retrieving project members)

**Internal Backend Functions (referenced, but not directly callable agent tools by definition):**
*   `auditLog()` helper (`server/audit-logger.ts`)
*   `gitCommit`, `gitPush`, `gitLog` (high-level wrappers in `server/git.ts`)

**Abstract/General Capabilities (requiring clarification):**
*   `read`, `grep`, `find`, `ls`, `write` (listed in `backlog-groomer` skill)
*   `Arbetskraftsverktyg` (Worker tools) - mentioned by `projektledare` and `schemaplanerare`



### Technical Notes

- This may involve creating new documentation files (e.g., `docs/tools/tool-name.md`) or generating schemas from existing code.
- Focus on clarifying the actual mechanism an agent uses to invoke the tool (e.g., an OpenAI function call, a specific API route).
- Consider if a code-generated tool manifest would be beneficial.

## Acceptance Criteria

### Manual Verification
- [ ] All callable tools mentioned in agent/skill documentation have clear, formal definitions.
- [ ] Comprehensive documentation exists for each specialized tool.
- [ ] A clear distinction is made between agent tools and internal backend functions.

## Meta

**ID**: WOW-040
**Created**: 2026-06-02
**Priority**: High
**Estimated Effort**: M
**Parent Ticket**: WOW-038
