---
"@runfusion/fusion": minor
---

Fusion now includes a plugin-first Dependency Graph top-level dashboard view that lets teams explore active task relationships visually, with host support for plugin-registered dashboard destinations and bundled graph rendering for dependency-aware planning.

- Adds a new Graph destination in dashboard navigation (including desktop overflow/mobile surfaces) via plugin dashboard view registration.
- Visualizes task dependencies as connected task cards with directed edges, including in-progress and in-review work while excluding done/archived tasks.
- Adds interactive graph controls including pan, zoom, fit-to-screen, and manual node dragging for layout refinement.
- Highlights upstream/downstream dependency chains on hover/selection and opens task details from graph cards for quick drill-in.
- Persists per-project custom node positions using plugin-managed project-scoped storage.
- Introduces and documents the host contract for plugin-provided top-level `dashboardViews` (`PluginDashboardViewDefinition` + loader aggregation + registry-host rendering).
