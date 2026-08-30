# [WOW-056] OptiCat Backend and Simulator Skills

## Problem Statement

The current Gemini CLI agent ecosystem, while growing with UI-focused OptiCat skills, lacks specialized skills to effectively interact with OptiCat's backend systems (potentially C/C++ based) and to facilitate simulation tasks. This limits the agent's ability to assist with deeper integrations, performance analysis, or testing scenarios that involve complex, low-level interactions or environmental simulations.

## Desired Outcome

New Gemini CLI skills for OptiCat are created to address backend and simulation needs. These skills will provide the agent with:
1.  **`opticat-backend-integrator` skill**: Focused on interacting with OptiCat's backend APIs or services, especially those potentially implemented in C/C++ or other low-level languages, enabling tasks like data manipulation, system configuration, or direct service calls.
2.  **`opticat-simulator` skill**: Focused on setting up, running, and analyzing simulations related to OptiCat's HVAC domain. This could involve configuring simulation parameters, executing simulation runs, and interpreting results.

These skills will streamline agent interactions with complex OptiCat functionalities, enhancing testing, development, and operational support.

## Context & Background

### Current State
- Existing OptiCat integration is primarily through frontend UI and higher-level REST APIs.
- The `opticat-ui-builder` skill (WOW-054) addresses UI generation.
- There is an identified need for interaction with potentially C/C++ based backend systems and simulation capabilities within the OptiCat ecosystem.

### Why This Matters
Implementing dedicated backend and simulator skills will enable the Gemini CLI agent to:
- Perform more in-depth debugging and diagnostics of OptiCat backend issues.
- Automate complex testing scenarios involving simulations.
- Facilitate the development and integration of new OptiCat features that require backend manipulation or simulation.
- Reduce the manual effort and specialized knowledge required for these advanced tasks.

## Requirements

### Functional Requirements
- [ ] **`opticat-backend-integrator` skill**:
    - [ ] Skill `SKILL.md` defines its purpose: "Facilitates interaction with OptiCat backend systems, including C/C++ interfaces or low-level APIs."
    - [ ] Includes guidance on potential FFI (Foreign Function Interface) or IPC (Inter-Process Communication) mechanisms if direct C/C++ interaction is required.
    - [ ] Provides patterns or examples for making authenticated calls to backend services.
    - [ ] Considers integration with existing backend development skills (e.g., `wow_backend_dev`).
- [ ] **`opticat-simulator` skill**:
    - [ ] Skill `SKILL.md` defines its purpose: "Enables setup, execution, and analysis of OptiCat HVAC simulations."
    - [ ] Includes guidance on configuring simulation environments and parameters.
    - [ ] Provides examples for running simulation scripts or tools.
    - [ ] Considers mechanisms for interpreting simulation output and reporting key metrics.

### Out of Scope
- Actual implementation of the OptiCat backend or simulator tools themselves. This ticket focuses on creating skills for the Gemini agent to *interact* with such tools.
- Detailed specifications for the C/C++ interfaces or simulation models. These would be referenced by the skills.

## Acceptance Criteria

### Automated Verification
- [ ] Build completes successfully without errors after skill creation.
- [ ] Skill packaging completes successfully for both new skills.

### Manual Verification
- [ ] The `opticat-backend-integrator` and `opticat-simulator` skills appear in the list of installed skills (e.g., by running `/skills list`).
- [ ] `SKILL.md` content for both new skills is accurate and informative, covering their respective domains.
- [ ] Any referenced resources (e.g., API documentation for backend, simulation tool guides) are present as placeholder files.

## Technical Notes

### Affected Components
- `.gemini/skills/opticat-backend-integrator/` - New skill directory.
- `.gemini/skills/opticat-simulator/` - New skill directory.
- `CHANGELOG.md` - To be updated with skill creation and installation.
- `thoughts/shared/tickets/TODO.md` - To be updated with this ticket.
- Potentially `plugin/opticat/` for any new backend APIs or simulator interfaces to be exposed.

---

## Meta

**Created**: 2026-06-05
**Priority**: Medium
**Estimated Effort**: M
