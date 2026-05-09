---
"@runfusion/fusion": patch
---

Fix permanent-agent tool gating so `fn_heartbeat_done`, `fn_send_message`, and `fn_read_messages` are treated as readonly/exempt and no longer require approval under permission-policy gating.
