# WOW-098: Workspace File Operations & Tenant Workspace Template

## Status
🔴 Implementation in progress — backend + frontend

## Type
🛠 Feature

## Area
- Multi-tenancy (WOW-063, WOW-095)
- Workspace management
- Tenant provisioning
- File operations (upload, create, edit, rename, delete, browse)

## Önskat resultat (Desired Outcome)

### Tenant Provisioning
När en ny tenant skapas (via `POST /api/admin/tenants`) ska följande hända automatiskt:
1. **Workspace-katalog skapas** — Tenant-specifik katalog på `workspace/<tenant_id>/`
2. **Mappstruktur skapas från schema-definition** — Alla mappar som definieras i workspace-template-schemat skapas med `mkdirSync`. Inga filer kopieras från någon annan tenant.
3. **Workspace-index byggs** — Efter skapandet körs `syncWorkspaceIndex(tenantId)` för den nya tenantens workspace
4. **Audit log** — Audit-log entry för workspace-initieringen

### Complete File Operations (All Users)
All users (WOW users and regular users) MUST be able to:
1. **See files** — Browse both local filesystem tree AND tenant database workspace tree via a toggle
2. **Upload files** — Upload files from their local machine into the workspace via:
   - Upload button in the file tree header
   - Drag-and-drop files from OS file manager into the tree
3. **Create files and folders** — Right-click context menu → New File / New Folder (existing, verified working)
4. **Edit files** — Click to open in editor, save changes (existing, verified working)
5. **Rename files and folders** — Right-click → Rename (fix backend-frontend mismatch bug)
6. **Delete files and folders** — Right-click → Delete (existing, verified working)
7. **Switch trees** — Toggle button in "Project Files" header to switch between local and database workspace tree

### Production Requirements
- All operations MUST be tenant-isolated (multi-tenant safe)
- All operations MUST require authentication
- All operations MUST have path traversal protection
- All file mutations MUST be audited
- Zero TypeScript compilation errors

## Arkitektur

### Backend Routes

All file routes are in `server/routes/file-system.ts`.

| Method | Route | Purpose | Status |
|--------|-------|---------|--------|
| GET | `/api/tree` | Full workspace tree (local filesystem) | ✅ Existing |
| GET | `/api/tree/database` | Tenant database workspace tree | ❌ NEW |
| GET | `/api/file?path=` | Read file contents | ✅ Existing |
| PUT | `/api/file` | Write/create file (JSON body) | ✅ Existing |
| POST | `/api/fs/entry` | Create new file or directory | ✅ Existing |
| POST | `/api/fs/rename` | Rename file or directory (full paths) | ❌ NEW |
| POST | `/api/fs/move` | Move file to another directory | ✅ Existing |
| POST | `/api/fs/upload` | Multipart file upload from OS | ❌ NEW |
| POST | `/api/fs/delete` | Delete file or directory | ✅ Existing |

### Database Tree (`GET /api/tree/database`)

Returns the same format as `GET /api/tree` but always reads from `workspace/{tenantId}` regardless of what local folder the user has opened with "File > Open Folder".

### File Upload (`POST /api/fs/upload`)

- Multipart form-data: `file` (required) + `path` (optional target directory, defaults to workspace root)
- File written to `workspace/{tenantId}/{targetDir}/{filename}`
- Returns `{ ok: true, path: "relative/path", name, size, type }`
- Max file size: 50 MiB (same as other endpoints)
- Path traversal protection: `..` segments rejected
- Audit log entry created on success

### File Rename (`POST /api/fs/rename`)

- JSON body: `{ from: "old/relative/path", to: "new/relative/path" }` — both full relative paths
- Works for both files and directories
- Resolves under workspace, validates no `..`, no overwrite if dest exists
- Audit log entry on success

### Workspace Template (no file copying)

```typescript
const WORKSPACE_TEMPLATE = {
  version: 1,
  folders: [
    "dokument/Admin/Templates",
    "dokument/Admin/Meeting Agenda & Protocols & Documents",
    "dokument/Clients",
    "dokument/Projects",
    "dokument/Finance",
    "dokument/Sales",
    "dokument/Sales process",
    "dokument/HR",
    "dokument/Legal",
    "dokument/Marketing",
    "dokument/Partners",
    "dokument/Strategy",
    "dokument/Event",
    "dokument/Development Projects",
    "dokument/Training Business",
    "dokument/x Archiv/Projects",
    "dokument/Clients Projects",
    "agent/sessions",
    "plans",
  ]
};
```

### Frontend Components

| Component | Change | File |
|-----------|--------|------|
| `SimpleFileTree` | Add upload button (hidden `<input type="file">`) + OS drag-and-drop handler | `src/components/simple/SimpleFileTree.tsx` |
| `SimpleRightPanel` | Add `treeSource` state toggle + database tree fetch in `useEffect` | `src/components/simple/SimpleRightPanel.tsx` |
| `useWorkspaceActions` | Fix `handleExplorerRenameNode` to call `POST /api/fs/rename` | `src/hooks/useWorkspaceActions.ts` |
| `SimplePage` | Add `onUploadFile` passing to child components | `src/pages/SimplePage.tsx` |
| `SimpleApp` | Pass `onUploadFile` to `SimpleRightPanel` | `src/components/simple/SimpleApp.tsx` |

## Implementation Plan

### P0 — Backend: Add new endpoints to `file-system.ts`
- [x] Add `import { auditLog } from "../audit-logger"`
- [x] Add `POST /api/fs/rename` — dedicated rename endpoint with audit logging
- [x] Add `POST /api/fs/upload` — multipart file upload with size check, path traversal protection, audit log
- [x] Add `GET /api/tree/database` — tenant workspace tree using `buildWorkspaceTree(tenantId)`

### P1 — Frontend: Fix rename bug
- [x] Change `handleExplorerRenameNode` in `useWorkspaceActions.ts` to call `POST /api/fs/rename` instead of `POST /api/fs/move`

### P1 — Frontend: Add upload UI to SimpleFileTree
- [x] Add hidden `<input type="file" ref={fileInputRef}>` with `accept` (all files)
- [x] Add "Upload File…" button in search toolbar row
- [x] `onUploadFile` prop: `(file: File, targetDir?: string) => Promise<string | null>`
- [x] Handle file selection → POST FormData to `/api/fs/upload`
- [x] Add OS drag-and-drop: detect `e.dataTransfer.files` in `onTreeRootEmptyDragOver` / `onFolderDragOver`
- [x] Show upload progress indicator

### P1 — Frontend: Add tree source toggle to SimpleRightPanel
- [x] Add `treeSource: "workspace" | "database"` state, default `"workspace"`
- [x] When `treeSource === "database"`, fetch `GET /api/tree/database` in `useEffect`
- [x] When `treeSource === "database"`, pass DB nodes to SimpleFileTree instead of workspace nodes
- [x] Toggle button in "Project Files" header with Database icon and "Local" label

### P2 — Tenant workspace template service
- [ ] Create `server/services/workspace-template.ts` with schema + `initializeTenantWorkspace(tenantId)`
- [ ] Hook into `POST /api/admin/tenants`

### P2 — Upgrade endpoint
- [ ] `POST /api/admin/tenants/:id/upgrade-workspace` for existing tenants

## TODO

### P0 — Backend endpoints
- [x] Add rename endpoint (`POST /api/fs/rename`)
- [x] Add upload endpoint (`POST /api/fs/upload`)
- [x] Add database tree endpoint (`GET /api/tree/database`)

### P1 — Frontend
- [x] Fix rename in `useWorkspaceActions.ts`
- [x] Add upload button + drag-drop to `SimpleFileTree`
- [x] Add tree toggle to `SimpleRightPanel`

### P2 — Workspace template service
- [ ] Create `server/services/workspace-template.ts`
- [ ] Hook into tenant creation
- [ ] Upgrade endpoint for existing tenants

## Dependencies
- WOW-063: Tenant-isolerade workspace-paths via `getPrimaryWorkspacePath(tenantId)`
- WOW-095: Multi-tenant stabilitet
- WOW-071: Verify-dokument-folders (auktoritativa listan av dokumentmappar)

## Files Affected
- `server/routes/file-system.ts` — new endpoints: rename, upload, database tree
- `src/hooks/useWorkspaceActions.ts` — fix rename to use `/api/fs/rename`
- `src/components/simple/SimpleFileTree.tsx` — upload button + OS drag-drop
- `src/components/simple/SimpleRightPanel.tsx` — tree source toggle
- `src/components/simple/SimpleApp.tsx` — pass `onUploadFile` to SimpleRightPanel
- `src/pages/SimplePage.tsx` — handleUploadFile callback
- `thoughts/shared/tickets/WOW-098-workspace-template-for-tenants.md` — this file
