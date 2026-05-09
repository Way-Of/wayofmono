---
"@runfusion/fusion": patch
---

Fix first chat message send hanging on "Connecting…" — the initial SSE stream now completes reliably on cold-start.
