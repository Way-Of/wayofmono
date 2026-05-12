---
description: Create a detailed WayOfMono implementation plan.
---
# /wom-plan

Generate a structured WayOfMono implementation plan for a specific ticket or task.

## Goal
Transform a requirement (ticket) into a grounded, step-by-step technical plan that can be executed by the `wom-engineer` and audited by the `wom-auditor`.

## Process
1. **Recon:** Invoke the `wom-recon` agent to research relevant file paths, existing patterns, and dependencies.
2. **Design:** Use the `wom-architect` agent to synthesize the research into a coherent implementation strategy.
3. **Audit:** Present the draft plan for initial user feedback or trigger the `wom-auditor` for an automated audit.
4. **Persist:** Save the finalized plan to `thoughts/shared/plans/`.

## Instructions
- Ensure the plan follows the `shared/plans/implementation.md` template.
- Explicitly list all files to be modified or created.
- Include a robust verification strategy (tests, manual checks).
- Identify and document potential risks or breaking changes.

## Output
A link to the generated plan file and a concise summary of the proposed changes.
