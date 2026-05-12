---
description: Audit a WayOfMono implementation plan or code.
---
# /wom-audit

Audit a WayOfMono (Wom) plan's design or its resulting implementation to ensure correctness and quality.

## Goal
Provide an objective assessment of a plan or code change, acting as the final quality gate before merging.

## Process
1. **Review:** Invoke the `wom-auditor` agent to audit the plan or code against WayOfMono's technical standards.
2. **Test:** Execute the verification suite defined in the plan.
3. **Checklist:** Verify adherence to `STRUCTURE.md`, security policies, and performance targets.
4. **Report:** Generate an audit report in `shared/research/reviews/`.

## Instructions
- Be critical and thorough. Look for edge cases, security flaws, and absolute paths.
- Provide actionable feedback for any failures.
- Confirm that the implementation perfectly matches the plan's intent.

## Output
A `PASS` or `FAIL` status with a link to the detailed audit report.
