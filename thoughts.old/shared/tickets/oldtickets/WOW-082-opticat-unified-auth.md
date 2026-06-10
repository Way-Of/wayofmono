# WOW-082-opticat-unified-auth

## Problem Statement

Way of Work (WoW) and OptiCat have evolved separate, incompatible authentication and authorization systems. WoW uses a tenant-aware JWT system with a 16-role hierarchy (`WOW-052`), while OptiCat currently relies on internal, simplistic auth that lacks multi-tenant awareness and proper role mapping. This fragmentation creates significant security, auditability, and user experience friction, as OptiCat, now a plugin, cannot effectively enforce WoW's data isolation policies or leverage the unified role-based access control (RBAC).

## Desired Outcome

OptiCat must fully integrate with the Way of Work unified user and role schema. Users authenticate once via Way of Work and receive a token that authorizes them across both platforms. OptiCat enforces data isolation based on the WoW `tenant_id` and maps WoW's complex role hierarchy to appropriate OptiCat-specific permissions, ensuring a seamless, secure, and compliant experience.

## Context & Background

### Current State
Way of Work uses a robust JWT-based system, enforcing `tenant_id` at the database query level (Economics Shield) and checking fine-grained permissions via `hasPermission(role, capability)`. OptiCat, conversely, maintains its own authentication logic, which is incompatible with WoW's identity provider, role definitions, and data isolation requirements.

### Why This Matters
As OptiCat is integrated into the Way of Work ecosystem, the unified authentication and authorization system is **SUPER CRITICAL** for:
- **Security**: Preventing unauthorized access or data leakage between tenants in the OptiCat plugin.
- **Auditability**: Ensuring all OptiCat activities are linked to the correct WoW user and tenant for consistent audit logging.
- **UX**: Eliminating redundant logins and providing a seamless "all-in-one" experience.
- **Compliance**: Maintaining strict GDPR/compliance boundaries by extending WoW’s isolation controls to OptiCat assets.

## Requirements

### Functional Requirements
- [ ] **Auth Bridge:** Update OptiCat (Flutter) to accept the Way of Work JWT token and pass it to all OptiCat backend API calls.
- [ ] **Role Mapping:** Implement a mapping layer that translates the Way of Work unified role schema (e.g., `WORKER`, `MANAGER`, `OWNER`) into equivalent OptiCat-specific permissions or role assignments.
- [ ] **Data Isolation:** Enforce `tenant_id` isolation on all OptiCat data access operations, mirroring the "Economics Shield" pattern used in WoW.
- [ ] **Unified RBAC:** OptiCat's internal permission checks must be delegated to WoW's `hasPermission(role, capability)` service rather than using an internal `permissions.json` or similar logic.
- [ ] **Role-Based UI Gating:** OptiCat UI components (dashboards, menus, canvas controls) must be dynamically gated using the WoW `hasPermission(role, capability)` service, ensuring users only see UI elements they are authorized to interact with, consistently with Way of Work's UI surface gating.

### Non-Functional Requirements
- [ ] **Seamless Experience**: Users should not need to re-authenticate when switching from WoW UI to OptiCat UI.
- [ ] **Reliability**: Auth integration must be robust, handling token refreshing and potential auth failures gracefully.
- [ ] **UI Consistency**: OptiCat UI visibility must strictly mirror the role-based gating enforced in Way of Work, providing a coherent user experience.

...

## Acceptance Criteria

### Automated Verification
- [ ] Build completes successfully: `bun run build`.

### Manual Verification
- [ ] A user logged into WoW can access OptiCat without re-authenticating.
- [ ] User role-based permissions in OptiCat reflect their Way of Work role (e.g., a WORKER has field technician access, while a MANAGER has production oversight).
- [ ] Data access in OptiCat is strictly scoped to the user's `tenant_id`.
- [ ] **Verify UI component visibility in OptiCat correctly mirrors WoW role permissions (e.g., HVAC designer sees canvas tools, but a service technician sees checklist tools).**

## Technical Notes

### Affected Components
- `plugin/opticat/chat_server/lib/auth_service.dart` — OptiCat authentication logic.
- `plugin/opticat/chat_server/lib/permission_service.dart` — OptiCat permission delegation to WoW.
- `plugin/opticat/lib/services/chat_service.dart` — Update to handle WoW tokens.
- **`plugin/opticat/lib/ui/`** — **New/Updated UI components** gated by WoW permissions.
- WoW backend route handlers (all `api/opticat/*` endpoints) — Verify JWT and `tenant_id` context.
- `server/accessControl.ts` — Potential extension to support OptiCat resource access checks.
- `CHANGELOG.md` — Will be updated.

---

## Meta

**Created**: 2026-06-06
**Priority**: High
**Estimated Effort**: M
**Merged into**: WOW-095 — alla krav från denna ticket är inflyttade i WOW-095 multi-user concurrency audit. Arbeta inte på denna separat.
