---
name: tdd
description: Test-Driven Development workflow (Red-Green-Refactor).
trigger: manual
---

# Test-Driven Development (TDD)

TDD is our primary discipline for ensuring code correctness and maintainability. It focuses on vertical slices—building one behavior at a time.

## The Vertical Slice Philosophy
**Do not write all tests first.** Instead, write one test, pass it, and move to the next. This ensures tests are grounded in actual implementation needs and avoids "imagined" behavior.

## Workflow

### 1. RED: Write a Failing Test
- Identify the smallest next piece of behavior.
- Write a test that exercises this behavior through the **public interface**.
- Run the test and confirm it fails for the expected reason.

### 2. GREEN: Make it Pass
- Write the **minimal** amount of code required to make the test pass.
- Do not add "just-in-case" features or refactor existing code yet.
- Confirm the test passes.

### 3. REFACTOR: Clean it Up
- Now that you are on **Green**, look for ways to improve the code.
- Remove duplication, improve naming, and deepen modules.
- Ensure the tests still pass after every refactor step.

## Rules for Good Tests
- **Test Behavior, Not Implementation:** If you refactor the internal logic and the behavior stays the same, the test should still pass.
- **Public API Only:** Avoid testing private methods or internal state directly.
- **Atomic:** Each test should focus on one specific scenario.

## Checklist
- [ ] Is the test failing for the right reason?
- [ ] Is the implementation minimal?
- [ ] Have I refactored to improve maintainability?
- [ ] Do all tests still pass?
