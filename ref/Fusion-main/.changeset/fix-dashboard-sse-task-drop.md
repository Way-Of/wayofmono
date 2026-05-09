---
"@runfusion/fusion": patch
---

Fix: dashboard board silently dropped tasks when an SSE `task:created` event was missed (e.g., during reconnect or sleep/wake). The `task:moved`, `task:updated`, and `task:merged` handlers in `useTasks` used `prev.map(...)` and skipped tasks not already in local state, so subsequent updates were no-ops. Handlers now upsert, matching `task:created`, so out-of-order or post-reconnect events make the task visible instead of dropping it.
