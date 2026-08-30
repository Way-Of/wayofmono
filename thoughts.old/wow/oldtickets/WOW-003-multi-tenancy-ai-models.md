# WOW-003 Implement Multi-Tenancy and AI Model Execution

## Problem Statement

To support multiple users or organizations securely on the same instance, the system requires multi-tenancy capabilities. Additionally, the system must be able to configure and execute AI models (both local and remote) to power its agentic features, with these models potentially scoped or isolated per tenant.

## Desired Outcome

A clearly documented architecture and implementation plan for adding robust multi-tenancy and a flexible AI model execution engine. This will allow different teams to share a hosted instance while maintaining data isolation and utilizing shared or dedicated AI resources.

## Context & Background

### Current State (Findings)
- **Database Schema:** `server/schema.sql` and `server/db.ts` already include a `tenants` table and `tenant_id` foreign keys on most tables (`users`, `projects`, `tasks`, `time_entries`, `workspace_files`, `whatsapp_sessions`, `audit_logs`).
- **Authentication:** `server/auth.ts` uses JWTs that already include `userId` and `tenantId`. `server/index.ts` extracts these via `verifyToken`.
- **API Isolation:** Some endpoints in `server/index.ts` (e.g., `/api/client/projects`, `/api/client/drawings`) are already filtering results using `auth.tenantId`.
- **AI Models:** `server/llm-models.ts` provides foundations for Ollama (local) and OpenRouter (remote) model selection via the Wo SDK.
- **Initial Setup:** `server/db.ts` automatically creates a `default` tenant and an `admin` user if none exist.
- **RBAC Roles (6-Tier System):**
    - `SUPER_ADMIN`: System-wide access, can see across all tenants, manage global settings.
    - `ADMIN`: Tenant-scoped administrator; manages users and projects within their organization.
    - `LEADER`: Work leader/Manager; can create projects and tasks.
    - `WORKER`: Standard field worker; logs time and views assigned tasks.
    - `CLIENT`: External stakeholder; limited access to view project progress and drawings.
    - `DEMO`: Prospective users/clients; restricted, read-only, or limited-duration access for demonstration purposes.

### Why This Matters
While the architecture is partially multi-tenant, it is not consistently applied across all endpoints (e.g., many `/api/fs/*` endpoints might lack tenant scoping). AI model execution needs to be solidified into a per-tenant or per-user configurable service.

## Requirements

### Multi-Tenancy Requirements
- [x] **Audit All Endpoints:** Ensure every API endpoint in `server/index.ts` that accesses data or files uses `auth.tenantId`.
- [x] **Filesystem Partitioning:** Update `server/paths.ts` and file operations to ensure files are stored in tenant-specific subdirectories (e.g., `data/tenants/<tenant_id>/...`).
- [ ] **Tenant Management UI:** Create a UI for System Admins to manage tenants (create, disable, update settings).
- [x] **Role Enforcement:** Ensure `SUPER_ADMIN` can see across tenants, while `ADMIN` is scoped to their own tenant.

### AI Model Execution Requirements
- [x] **Provider Configuration:** Formalize the configuration for OpenAI, Anthropic, and OpenRouter alongside existing Ollama support.
- [x] **Settings Storage:** Store AI provider settings (API keys, model names) in the `tenants` table (`settings_json`) or a new `tenant_configs` table.
- [x] **Agent Integration:** Ensure `server/agent-runtime.ts` pulls model configuration from the tenant's settings rather than environment variables only.

### Out of Scope for Phase 1
- Dynamic model fine-tuning or custom LoRAs per tenant.
- Complex credit-based billing systems.

## Acceptance Criteria

### Documentation
- [x] Updated schema diagram showing complete multi-tenant coverage.
- [x] API Audit Report: List of all endpoints and their current/required tenant isolation status.
- [x] Configuration guide for "Bring Your Own Key" (BYOK) per tenant.

### Future Implementation (Not for this ticket)
- [ ] Migration scripts for existing non-scoped data.
- [ ] Frontend UI for tenant/model configuration.

## Technical Notes

### Affected Components
- `server/index.ts` - Major audit of all routes.
- `server/paths.ts` - Critical for file isolation.
- `server/db.ts` - Ensure all future queries follow the `tenant_id` pattern.
- `server/agent-runtime.ts` - Dynamic model selection based on context.

---

## Meta

**Created**: 2026-05-19
**Updated**: 2026-05-19 (After Initial Research)
**Priority**: High
**Estimated Effort**: L (Documentation Phase)
