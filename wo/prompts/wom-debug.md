---
description: Debug an issue in the WayOfMono environment.
---
# /wom-debug

Systematically investigate and resolve bugs, errors, or unexpected behavior in the WayOfMono (Wom) ecosystem.

## Goal
Identify the root cause of an issue and propose/implement a durable fix.

## Process
1. **Reproduce:** Create a minimal reproduction case (e.g., a new test).
2. **Analyze:** Examine logs, stack traces, and state using `run_shell_command` and `read_file`.
3. **Hypothesize:** Formulate a theory on the cause.
4. **Fix:** Implement the fix following the standard Plan → Act → Validate cycle.
5. **Verify:** Confirm the fix resolves the issue and introduces no regressions.

## Instructions
- Document the root cause clearly.
- Ensure the fix addresses the underlying problem, not just the symptom.
- Add a regression test to prevent the bug from returning.
