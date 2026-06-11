# Way of Work Architectural Mandates Guide

This guide details the critical architectural mandates for all development within the Way of Work (WoW) platform. All skills and features must adhere to these principles.

## 1. Multi-Tenancy

- **Principle**: All data and resources must be strictly isolated per tenant.
- **Implementation**:
    - Every database query and file system operation must explicitly filter or scope by `tenant_id`.
    - `auth.tenantId` must be passed and used in all backend data access layers.
    - File storage should use tenant-specific subdirectories (e.g., `workspace/<tenant_id>/`).
- **Impact on Skills**: Skills interacting with data or files must always consider the active `tenant_id` from the session.

## 2. Access Control (RBAC & Economics Shield)

- **Principle**: Role-Based Access Control (RBAC) must be enforced for all operations, and sensitive financial/project data must be protected (Economics Shield).
- **Implementation**:
    - Frontend components should conditionally render UI elements based on user roles (`isAdmin`, `isLeader`, etc.).
    - Backend API endpoints must implement role-based guards (`adminGuard`, `leaderGuard`, etc.) to authorize access.
    - The Economics Shield ensures that data like `budget_allocated`, `hourly_rate` are stripped or obscured for roles without explicit permission (e.g., `WORKER`, `CLIENT`).
- **Impact on Skills**: Skills that expose or modify data must be aware of user roles and the Economics Shield to prevent unauthorized access or data leakage.

## 3. Human-in-the-Loop (HITL)

- **Principle**: AI agents must not directly modify production data without explicit human approval.
- **Implementation**:
    - Agents that propose changes to production data must use the `pending_changes` table (`POST /api/pending-changes`).
    - Proposed changes must be reviewed and approved/rejected by a human (e.g., via the "Godkännandekö" tab in the Admin Console).
    - Exceptions: Read-only operations, or interactive, real-time modifications where the user is directly and immediately confirming (e.g., a simple Kanban card update in a chat).
- **Impact on Skills**: Skills that involve agent-driven data modification must integrate with the HITL workflow.

## 4. Communication Channels

- **Principle**: All external communications (Telegram, WhatsApp, Email) must be auditable, multi-tenant, and integrate seamlessly with the agent ecosystem.
- **Implementation**:
    - Messages are routed through `channel-router.ts` and often dispatched via the Orchestrator.
    - All inbound and outbound messages are logged in `channel_message_logs`.
    - Skills interacting with communication channels must use the unified `notifyUser` utility or specific channel tools.
- **Impact on Skills**: Skills that send or receive messages must adhere to the logging, routing, and multi-tenant requirements of the communication architecture.

## 5. Technology Stack & Conventions

- **Frontend**: React + Vite, Tailwind CSS, `lucide-react` for icons, `useTranslation()` for i18n.
- **Backend**: Bun, SQLite, REST APIs.
- **Agent Ecosystem**: Skills in `.gemini/skills/` or `.wo/skills/`, agents in `.wo/agents/`.
- **Impact on Skills**: New skills should leverage these technologies and adhere to existing coding style and structural conventions.
