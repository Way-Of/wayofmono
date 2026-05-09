---
"@runfusion/fusion": patch
---

Tasks no longer strand in In Review when an in-merge verification fix only rebuilds gitignored artifacts. The merger now restores squash state and commits the original branch content when no commit exists yet, while still refusing real phantom merges with no task content.
