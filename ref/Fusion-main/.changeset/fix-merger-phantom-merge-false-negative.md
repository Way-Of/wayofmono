---
"@runfusion/fusion": patch
---

Fix tasks getting stuck in In Review with "verification fix succeeded but no merge commit could be created" even when the merge commit had already landed on main.

Root cause: when attempt 1 of the merge hit a verification failure (test command failed) under default smart conflict resolution, the catch in `executeMergeAttempt` swallowed the error and returned `false`, triggering a redundant attempt 2. Attempt 2 captured a stale `preAttemptHeadSha` (the AI commit from attempt 1), found the branch already merged, ran the in-merge fix, and the finalizer's phantom-merge guard then saw `!hasStaged && !headMoved` against the wrong baseline — even though the task's content was already on HEAD.

- `executeMergeAttempt` now propagates `VerificationError` directly so the in-merge fix runs once on attempt 1 with the correct baseline. Auto-conflict-resolution can't fix a verification failure, so retrying with attempt 2 was always wrong for this error.
- `commitOrAmendMergeWithFixes` adds a defense-in-depth check: if HEAD already carries the task's `Fusion-Task-Id` trailer, treat the no-progress finalize as success rather than tripping the phantom-merge guard. The trailer match is anchored to line boundaries so unrelated task IDs in the body can't false-positive.
