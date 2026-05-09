---
"@runfusion/fusion": patch
---

Fix executor step-index reconciliation so `fn_task_update` and `fn_review_step` share 0-indexed in-memory verdict/checkpoint keys. This restores correct REVISE blocking for `status="done"` and allows RETHINK rewinds to find the matching step checkpoint.