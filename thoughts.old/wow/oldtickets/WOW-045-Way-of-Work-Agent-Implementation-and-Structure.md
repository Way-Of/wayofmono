# WOW-045: Way of Work Agent Implementation and Structure

## Problem Statement

While significant progress has been made in standardizing skill definitions (`WOW-039`), tool documentation (`WOW-040`), and clarifying agent responsibilities (`WOW-043`), there is a critical architectural inconsistency in how tools are implemented, located, and made available to agents. The established pattern for core orchestrator tools relies on centralized registration in `server/orchestrator-tools-exec.ts`. These core server tools (e.g., for Git, Kanban, Channels) should logically reside in `server/tools/`. However, some agent-specific tools (e.g., `kalkylator/cost-estimation.ts`) currently exist in `.wo/agents/` subfolders and leverage a `createTool` pattern whose integration is unclear. Furthermore, a foundational architectural mandate dictates that *agent-specific tools must reside within the `.wo/tools/` directory* to ensure full utilization by the Way of Work platform and adherence to the "Everything in .wo" principle for agent-related artifacts. This dual inconsistency—both the lack of a dedicated `server/tools/` for core server tools and the misplacement of agent-specific tools—leads to confusion, hinders maintainability, and prevents a truly unified and production-ready agent ecosystem.

## Desired Outcome

Every defined Way of Work agent will have a clear, consistent, and production-ready definition that accurately reflects its operational implementation within the Way of Work platform. This ensures:
- A clear distinction and consistent placement for different types of tools: core server tools in `server/tools/` and agent-specific tools in `.wo/tools/`.
- Each agent (`.wo/agents/agent-name.md`) correctly defines its role and utilizes assigned skills and tools, adhering to the specified canonical locations.
- A standardized approach to defining agents, skills, and tools that facilitates maintenance, development, and verifiability.
- Clear mechanisms for agents to consume their assigned skills and utilize declared tools, leveraging the central tool execution framework (`server/orchestrator-tools-exec.ts`) for server tools, and clarifying the integration for agent-specific tools.
- All agents are verifiable for their operational readiness based on their declarative definitions and the availability of their referenced skills and tools from their canonical locations.

## Context & Background

The Way of Work agents are the core entities that perform tasks within the platform. A clear understanding of their *operational implementation* is critical. Our investigation has revealed a refined architectural pattern:
1.  Agents are primarily declarative markdown definitions (`.wo/agents/agent-name.md`) that define their role, skills, and the tools they utilize.
2.  Tools are separated into two canonical locations:
    *   **Server Tools:** Core functionalities (e.g., Git, Kanban, Channels) implemented as TypeScript functions within `server/tools/` (or `server/orchestrator-tools/`) and centrally registered in `server/orchestrator-tools-exec.ts`.
    *   **Agent-Specific Tools:** Specialized functionalities that should reside in `.wo/tools/`. These might utilize a `createTool` pattern for modular definition.
3.  Agents operate by referencing these tools and utilizing assigned skills. This reframes the understanding of an agent's "tangible, executable presence" to be their correct declarative definition and proper integration with this dual tool registry. This is critical for achieving a "real complex system" as per the master ticket `WOW-038` and enforcing the "Way of Work First" architectural mandate.

## Requirements

### Functional Requirements
- [ ] For every agent listed in the consolidated manifest (`.wo/agents/agents-and-skills-manifest.md`), ensure its `.wo/agents/agent-name.md` definition accurately declares the name of the agent, its description, assigned skills, and the names of tools it utilizes.
- [ ] Establish and enforce the two canonical locations for tool implementation files:
    *   `server/tools/`: For core server-level tools (e.g., Git, Kanban, Channel-related tools, etc.) that are centrally registered in `server/orchestrator-tools-exec.ts`.
    *   `.wo/tools/`: For agent-specific or skill-specific tools. These tools should typically use the `createTool` pattern for modular definition.
- [ ] Migrate all existing tool implementations from `server/orchestrator-*-tools.ts` files into `server/tools/`, updating imports and `server/orchestrator-tools-exec.ts` accordingly.
- [ ] Migrate all existing tools found directly under `.wo/agents/` (e.g., `kalkylator/cost-estimation.ts`, and similar files from `maskinchef/`, `skyddsombud/`, `time-verification/`) to `.wo/tools/`, preserving their `createTool` pattern and updating references.
- [ ] Clarify and document the integration mechanism for tools located in `.wo/tools/` into the agent runtime, distinct from the central `server/orchestrator-tools-exec.ts` registry.
- [ ] Verify that all tools referenced in agent `.md` files (and skill `.md` files) are implemented in their canonical locations (`server/tools/` or `.wo/tools/`) and are correctly accessible/executable by the agent runtime.

### Technical Notes

- This ticket clarifies the correct understanding of agent and tool implementation within Way of Work. It shifts the focus to ensuring tools are correctly located and integrated according to their type (server-level vs. agent-specific).
- This involves refactoring existing tool implementations into the new canonical `server/tools/` and `.wo/tools/` directories.
- The `server/orchestrator-tools-exec.ts` will manage the registration and execution of tools from `server/tools/`. The mechanism for `.wo/tools/` will need to be explicitly defined.
- The agent runtime components (e.g., `server/agent-runtime.ts`) and dispatcher logic remain crucial for interpreting declarative definitions and executing referenced tools from both canonical locations.

## Acceptance Criteria

### Manual Verification
- [ ] Every agent defined in markdown (`.wo/agents/agent-name.md`) accurately declares its name, description, assigned skills, and the names of tools it utilizes, all consistent with the consolidated manifest.
- [ ] All server-level tools (e.g., Git, Kanban, Channel-related tools) are located within `server/tools/`, are registered in `server/orchestrator-tools-exec.ts`, and are functional.
- [ ] All agent-specific tools are located within `.wo/tools/` and are correctly integrated into the agent runtime.
- [ ] A clear, documented mechanism exists for agents to load and use their assigned skills and tools, leveraging the central tool execution framework for server tools, and the clarified integration for agent-specific tools.
- [ ] No agent implementation logic or executable code is found within `.wo/agents/` subfolders (except for the agent's declarative `.md` file).

## Meta

**ID**: WOW-045
**Created**: 2026-06-02
**Priority**: Critical
**Estimated Effort**: M
**Parent Ticket**: WOW-038

## Tool Migration Plan

This section outlines the plan for migrating existing tool implementations to their canonical locations and ensuring their correct integration.

### Track Existing Tools (Pre-Migration State)

The following tables track the current location of tools that need to be migrated or re-evaluated.

#### Tools in `server/` that should move to `server/tools/`

| Tool File (Current Location)                 | Target Location         | Registered in `orchestrator-tools-exec.ts`? | Migrate? | Notes                                                 |
| :------------------------------------------- | :---------------------- | :------------------------------------------ | :------- | :---------------------------------------------------- |
| `server/orchestrator-git-tools.ts`           | `server/tools/git.ts`   | Yes                                         | [x]      |                                                       |
| `server/teams-yaml-mutate.ts`                | `server/tools/teams.ts` | Yes                                         | [x]      |                                                       |
| `server/orchestrator-kanban-tools.ts`        | `server/tools/kanban.ts`| Yes                                         | [x]      |                                                       |
| `server/orchestrator-channel-tools.ts`       | `server/tools/channel.ts`| Yes                                         | [x]      |                                                       |
| `server/agent-dispatch.ts`                   | `server/tools/agent-dispatch.ts`| Yes (`dispatch_agent`)                      | [x]      | Contains `dispatchToAgent` tool                       |
| `server/pending-changes-api.ts`              | `server/tools/pending-changes.ts`| Yes (`suggest_change`)                      | [x]      | Contains `createPendingChange` tool                   |
| `server/orchestrator-cost-estimation-tools.ts`| `server/tools/cost-estimation.ts`| Yes (now registered)                        | [x]      | Migrated from `.wo/agents/kalkylator/`              |
| `server/tools/fs.ts`                            | `server/tools/fs.ts`   | Yes                                         | [x]      | Migrated `read`, `list_dir`, `grep`, `write`, `bash` from `server/orchestrator-tools-exec.ts` |
| `server/tools/calendar.ts`                      | `server/tools/calendar.ts` | Yes                                         | [x]      | Migrated `calendar_list`, `calendar_create`, `calendar_update`, `calendar_delete` from `server/orchestrator-tools-exec.ts` |
| `server/tools/ta-plan.ts`                       | `server/tools/ta-plan.ts`  | Yes                                         | [x]      | Migrated `ta_plan_list`, `ta_plan_get`, `ta_plan_create`, `ta_plan_update` from `server/orchestrator-tools-exec.ts` |

#### Tools in `.wo/agents/` that should move to `.wo/tools/`

| Tool File (Current Location)                 | Target Location          | Associated Agent | Migrate? | Notes                                                 |
| :------------------------------------------- | :----------------------- | :--------------- | :------- | :---------------------------------------------------- |
| `.wo/agents/kalkylator/cost-estimation.ts`   | `.wo/tools/cost-estimation.ts`| `kalkylator`     | [x]      | _(Content moved to `server/tools/cost-estimation.ts`. Old file/directory removed.)_ |
| `.wo/agents/maskinchef/equipment-tools.ts`   | `.wo/tools/equipment.ts` | `maskinchef`     | [x]      | _(Migrated to `.wo/tools/equipment.ts`. Old file/directory removed.)_ |
| `.wo/agents/skyddsombud/tools.ts`            | `.wo/tools/skyddsombud-tools.ts`| `skyddsombud`    | [x]      | _(Migrated from `.wo/agents/skyddsombud/`. Contains `incident_report` and `safety_check`.)_ |
| `.wo/agents/time-verification/dispatch.ts`   | `.wo/tools/dispatch.ts`  | `time-verification`| [ ]      |                                                       |
| `.wo/agents/time-verification/research.ts`   | `.wo/tools/research.ts`  | `time-verification`| [ ]      |                                                       |
| `.wo/agents/time-verification/verify.ts`     | `.wo/tools/verify.ts`    | `time-verification`| [ ]      |                                                       |

### Migration Steps

1.  **Create `server/tools/` and `.wo/tools/` directories.**
2.  **Move Tool Files:** For each tool in the tables above, move the `.ts` file to its specified "Target Location."
3.  **Update Imports:** Adjust all import paths within the moved files and in any files that import them.
4.  **Register Tools:**
    *   For tools moved to `server/tools/`: Ensure they are correctly imported into `server/orchestrator-tools-exec.ts` and their execution logic is added to the `switch` statement, along with their OpenAPI schemas to `ORCHESTRATOR_TOOLS_OPENAI`.
    *   For tools moved to `.wo/tools/`: Document and implement the mechanism by which these tools are loaded and made available to agents (likely leveraging `createTool` and a dynamic loading system).
5.  **Clean Up:** Remove empty `.wo/agents/` subdirectories after tools have been successfully migrated.
6.  **Update Agent `.md` Files:** Ensure the `tools:` field in agent `.md` files correctly references the names of the tools, now available from their canonical locations.
7.  **Verify Functionality:** Confirm all agents can correctly utilize their assigned skills and tools after migration.
