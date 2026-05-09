# fusion-plugin-roadmap

`@fusion-plugin-examples/roadmap` is the workspace package for the bundled `fusion-plugin-roadmap` plugin.

## Plugin identity

- Manifest id: `roadmap-planner`
- Route namespace: `/api/plugins/roadmap-planner/*`
- Dashboard view id: `plugin:roadmap-planner:roadmaps`

## Package layout

- `manifest.json` — plugin metadata and dashboard view declaration
- `src/index.ts` — plugin definition (`onSchemaInit`, routes, dashboard view metadata)
- `src/roadmap-schema.ts` — canonical roadmap DDL used by `hooks.onSchemaInit`
- `src/server/index.ts` — backend server exports
- `src/dashboard-view.tsx` — dashboard view entry export for host registration
- `src/dashboard/RoadmapsView.tsx` — plugin-owned roadmap planner page
- `src/dashboard/useRoadmaps.ts` — plugin-owned roadmap CRUD/reorder/suggestions/handoff hook
- `src/dashboard/RoadmapsView.css` — plugin-owned roadmap styles
- `src/dashboard/api.ts` — plugin-local client for `/api/plugins/roadmap-planner/*`
- `src/roadmap-types.ts` + `src/store/*` — roadmap domain types/store

## Exported surfaces

- Root export: plugin default + roadmap domain helpers/types
- `./server`: roadmap route + AI suggestion service exports
- `./dashboard-view`: Roadmaps dashboard view export for host registry wiring

## Notes

Roadmap tables are plugin-owned and created via `hooks.onSchemaInit` in `src/index.ts`, which delegates to `src/roadmap-schema.ts`. Core database bootstrap no longer creates roadmap tables/indexes.

Roadmap AI suggestion generation is plugin-owned (`src/roadmap-suggestions.ts` / `src/roadmap-routes.ts`) and uses `PluginContext.createAiSession()` when available. The plugin must not import `@fusion/engine` directly for suggestion generation.

The plugin keeps a single canonical dashboard entrypoint (`./dashboard-view`) and accepts host-supplied dashboard context (`projectId`, optional `addToast`). Do not deep-import dashboard internals from this plugin.
