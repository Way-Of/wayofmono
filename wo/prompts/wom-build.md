---
description: Execute a WayOfMono implementation plan.
---
# /wom-build

Execute the steps defined in an approved WayOfMono implementation plan.

## Goal
Turn architectural designs into production-ready code while maintaining WayOfMono's high quality and project standards.

## Process
1. **Load Plan:** Read the specified implementation plan from `thoughts/shared/plans/`.
2. **Branching:** Ensure you are working on a dedicated feature branch.
3. **Execute:** Invoke the `wom-engineer` agent to perform surgical edits using the `replace` and `write_file` tools.
4. **Verify:** Run tests and linters after each logical change to ensure no regressions.
5. **Log:** Keep a record of changes for the `wom-auditor`.

## Instructions
- Adhere strictly to the plan. If the plan is found to be flawed during execution, halt and request a plan update.
- Prioritize code readability and idiomatic patterns.
- Ensure all new code is accompanied by corresponding tests.

## Completion
Signal when all phases of the plan are complete and ready for the final `wom-auditor` check.
