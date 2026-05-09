---
"@runfusion/fusion": patch
---

Fix mailbox composer Send button hanging when "Wake agent immediately" is checked. The /api/messages route now dispatches the wake heartbeat asynchronously so the UI returns immediately after the message is stored.
