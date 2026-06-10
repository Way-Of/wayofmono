# Ticket: [WOW-024] Private & Shared Access Control for Kanban, Docs, and Files

## Objective
Implement a mechanism for private vs. shared access control for Kanban boards, documents, and workspace files.

## Background
Currently, data visibility is primarily tenant-scoped. We need to introduce finer-grained permissions to allow users to create "private" boards/files that can be explicitly shared with other users or teams.

## Proposed Requirements
- [x] **Data Model Change**: Introduce a `visibility` attribute to Kanban boards, `tasks`, `documents`, and `workspace_files` (e.g., `private`, `shared`, `tenant_wide`).
- [x] **Sharing Mechanism**: Implement a `shares` table (or similar) to track explicit read/write access permissions per user/team.
- [x] **Access Control Layer**: Update backend route handlers (workspace files, kanban service, docs API) to evaluate these new visibility rules alongside the existing `tenant_id` check.
- [ ] **UI Integration**:
    - Add UI controls for "Make Private" / "Share" on Kanban boards and file/document panels.
    - Update dashboards to distinguish between private and shared content.

## Investigation Plan
- [x] Audit current `tenant_id` filtering in `server/routes/` for Kanban, files, and documents.
- [x] Propose schema changes for `visibility` and `shares` tables (Applied).
- [x] Implemented `server/auth-rbac.ts` utility.
- [ ] Map required UI changes for sharing permissions.

## Progress
- Schema updated with `resource_permissions` and `resource_shares`.
- RBAC utility `hasResourceAccess` implemented in `server/auth-rbac.ts`.

## Risks
- **High**: Modifying access control logic has a high risk of leaking sensitive data or breaking access to existing resources if not implemented carefully.
- **Mitigation**: Incremental rollout, extensive testing with multi-tenant tokens, and clear audit logging of all permission changes.
