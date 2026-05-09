---
"@runfusion/fusion": patch
---

Treat task working branch (`branch`) and merge-target base branch (`baseBranch`) as distinct user-controlled fields across task create/edit flows, board display and filtering (including no-branch filters), and merge behavior that defaults the target branch to `main` when `baseBranch` is unset.
