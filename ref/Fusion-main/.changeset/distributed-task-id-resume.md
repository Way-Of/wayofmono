---
"@runfusion/fusion": patch
---

Fix task ID counter resetting to `001` on first mesh-routed task creation.

When the dashboard's task-create route was migrated to the distributed task ID allocator, projects whose tasks had been allocated through the legacy counter (e.g. `FN-3700`) saw new tasks restart at `FN-001`, colliding with historical IDs. The allocator now seeds its sequence past any existing task for the prefix (live or archived) and past the legacy counter, so new task IDs always continue forward.

Internal: extracted a slim type-only module for plugin dashboard view contracts so external plugin builds no longer pull in dashboard runtime sources, and dropped unused scaffolding tables (added by a previous schema migration) via an idempotent migration.
