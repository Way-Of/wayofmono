# Fix System After Extraction

The system was extracted from the Way of Work monorepo to `~/wayofwork/`. Several things are broken or missing. This plan lists what agents need to fix.

## 1. Install Wo Agent

`@wayofmono/wo-agent` and `@wayofmono/wo-agent-core` are not installed. The package.json has them listed as `"TODO"` — they were removed to get `bun install` working.

**What to do**: Install from the official wo-agent repo when available. Update package.json with the correct registry URL. Re-add to `dependencies` and run `bun install`.

**Files**: `package.json`, `bun.lock`

## 2. Pre-existing TypeScript Errors

These errors existed before extraction and need fixing:

| Error | File | Cause |
|---|---|---|
| `class-variance-authority` module not found | `src/components/ui/Badge.tsx`, `Input.tsx`, `Label.tsx`, `Textarea.tsx`, `PlanReview.tsx`, `CodeArea.tsx` | Missing dependency in package.json |
| `Property 'variant' does not exist on type 'BadgeProps'` | Same files | Badge component type mismatch |
| `Property 'role' does not exist on type 'User'` | `src/components/kanban/CardView.tsx:1802` | Type mismatch in User type |
| `Cannot find name 'setSimpleProviderNonce'` | `src/pages/SimplePage.tsx:223` | Function not defined in scope |
| Missing `labels`, `createdAt` in mock data | `src/services/mockKanbanService.ts` | Mock objects missing required fields |

## 3. Dead Code Blocking TypeScript

Files that import from `@earendil-works/pi-tui/menu` are excluded from tsconfig but still in the source tree:

- `src/components/menus/FileMenu.tsx`
- `src/components/terminal/TerminalMenu.tsx`
- `src/components/menus/EditMenu.tsx`
- `src/components/menus/GoMenu.tsx`
- `src/components/menus/HelpMenu.tsx`
- `src/components/menus/RunMenu.tsx`
- `src/components/menus/ViewMenu.tsx`
- `src/components/menus/MenuBar.tsx`

**What to do**: Either delete or keep excluded. If keeping, maintain the exclusion in `tsconfig.app.json`.

## 4. Runtime Paths

The server code references the Way of Work monorepo in a few places:

- `server/diagnostics.ts` — references `@earendil-works/pi-coding-agent` in diagnostic labels
- `server/agent-runtime.ts` — comments reference Pi paths
- `server/paths.ts` — might reference Pi repo paths

**What to do**: Audit `server/paths.ts` and `server/index.ts` for any absolute or relative paths that point to the old Pi monorepo. Update or remove them.

## 5. Database

The SQLite database was copied from the Pi repo (`server/wayofpi.sqlite`). It may reference Pi-specific data.

**What to do**: Start fresh — delete `server/wayofpi.sqlite` (and `server/db_data/`) and let the server recreate it on first run via `server/init-db.ts`. Or keep the existing data if migration is needed.

## 6. Electron Config

`package.json` has `"desktopName": "wayofwork.desktop"` (already updated from `wayofpi.desktop`). Verify Electron config still works:

- `electron/electron-main.mjs` — check for any references to the old Pi repo paths
- `electron-builder` config — verify build settings

**What to do**: Test `bun run electron:dev` and fix any path issues.

## Priority Order

1. Install wo-agent (system won't chat without it)
2. Fix pre-existing TS errors (build is blocked)
3. Audit runtime paths (unexpected runtime crashes)
4. Handle database (fresh start or migrate)
5. Clean up dead code (optional, low priority)
