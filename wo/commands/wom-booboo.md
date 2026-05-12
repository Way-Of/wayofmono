---
name: wom-booboo
description: Fast, automated bug fixing for small diagnostics and lint errors.
---
# /wom-booboo

Trigger a high-speed "fast-fix" cycle for small errors, diagnostics, or lint violations. This command skips full planning for trivial changes.

## Goal
Rapidly resolve minor technical debt without full vertical-slice overhead.

## Process
1. **Identify:** Detect current lint errors or small diagnostic warnings.
2. **Execute:** Apply the most probable fix immediately.
3. **Verify:** Run the `wom-auditor` in "Fast Mode" to confirm the fix works.
4. **Finalize:** Automatically stage the change.

## Constraints
- Only for small, localized changes (< 5 lines).
- Not for changes to business logic or architecture.
