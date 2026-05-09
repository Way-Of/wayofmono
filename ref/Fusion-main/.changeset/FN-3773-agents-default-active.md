---
"@runfusion/fusion": minor
---

Newly created non-ephemeral agents now start in `state: "active"` so they immediately participate in heartbeat scheduling without requiring a manual Start action. Ephemeral/task-worker agents still start in `state: "idle"` and are activated by the engine when work is assigned. Existing agents are unaffected; operators who want a paused-from-birth durable agent can call `fn_agent_stop` (or click Stop in the dashboard) right after creation.

Audit note: heartbeat scheduler state handling and dashboard create-response consumption were reviewed and required no downstream code changes.
