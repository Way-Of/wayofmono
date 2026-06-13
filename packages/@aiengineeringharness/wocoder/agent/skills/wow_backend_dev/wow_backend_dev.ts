// Auto-generated from canonical skill: wow_backend_dev
// Platform: WoCoder (Node/Deno)
// Description: Comprehensive guide for developing backend APIs, database interactions, and security protocols in the Way of Work (WoW) project. Use when working on server routes, database schemas, or API logic.

export const skill = {
  name: "wow_backend_dev",
  description: "Comprehensive guide for developing backend APIs, database interactions, and security protocols in the Way of Work (WoW) project. Use when working on server routes, database schemas, or API logic.",
  tools: [""],
  prompt: `> **Platform**: Wo Coder | **Skill**: wow_backend_dev | **Version**: 1.0.0
>
> _Auto-generated from canonical format. Do not edit directly._


# wow_backend_dev

## Architecture & Core Tech Stack
- **Runtime:** Bun (v1.x). Native APIs (\`Bun.serve\`, \`Bun.spawn\`, \`Bun.file\`) are preferred over Node.js polyfills where applicable.
- **Database:** SQLite via \`bun:sqlite\` (synchronous execution). **Strictly no ORMs.** Write raw, parameterized SQL.
- **Routing:** Custom minimalist router (\`server/router.ts\`). Routes are registered in separate modules under \`server/routes/\` and composed in \`server/index.ts\`.
- **Authentication:** JWT-based. The router extracts \`{ userId, tenantId, role }\` and passes it as the \`auth\` object to handlers.

## 1. Database & Schema Conventions
The primary database is \`data/wayofwork.sqlite\`.
### Key Tables:
- \`tenants\`: Multi-tenant boundary.
- \`users\`: Includes \`role\` (\`SUPER_ADMIN\`, \`ADMIN\`, \`LEADER\`, \`WORKER\`, \`CLIENT\`, \`DEMO\`).
- \`projects\` & \`project_members\`: For project-level isolation.
- \`tasks\`: Kanban cards.
- \`time_entries\` & \`time_blocks\`: Time tracking.
- \`tickets\`: Swedish "ÄTA" (change orders) and standard tickets.
- \`ta_plans\`: Traffic arrangement plans (TDOK 2024:0043).
- \`pending_changes\`: Human-in-the-Loop queue (WOW-010).
- \`audit_logs\`: Information access tracking (WOW-016).

### Query Patterns:
- **Execute:** \`db.run("INSERT INTO table (id) VALUES (?)", [id])\`
- **Fetch One:** \`db.query("SELECT * FROM table WHERE id = ?").get(id) as Type\`
- **Fetch Many:** \`db.query("SELECT * FROM table WHERE tenant_id = ?").all(tenantId) as Type[]\`
- **IDs:** Always use unique string identifiers (e.g., UUIDs or \`prefix_${Date.now()}_${random}\`).

## 2. Multi-Tenant & Access Control (WOW-016)
**CRITICAL:** Security and data isolation are paramount.
1. **Tenant Isolation:** EVERY query mapping to a tenant-specific resource MUST include \`tenant_id = ?\`.
2. **Worker Project Isolation:** \`WORKER\` roles must only see data related to projects they are explicitly members of via the \`project_members\` join table.
3. **Economics Shield:** \`WORKER\`, \`CLIENT\`, and \`LEADER\` roles MUST NOT see financial data. You must manually strip fields like \`budget\`, \`budget_allocated\`, \`cost_estimate\`, \`hourly_rate\`, and \`overtime_rate\` from objects before returning JSON.
4. **Audit Logging:** Use the \`auditLog()\` helper (\`server/audit-logger.ts\`) to log sensitive events:
   - \`action: "VIEW_ECONOMICS"\` (Admin views prices/budgets)
   - \`action: "ACCESS_DENIED"\` (Worker tries to view restricted project)
   - \`action: "SEARCH"\` or \`action: "READ"\` (Tracking user queries)

## 3. API Route Construction
1. Create new route groups in \`server/routes/<feature>.ts\`.
2. Export a register function: \`export function registerFeatureRoutes(router: Router) { ... }\`.
3. Handlers receive \`(req: Request, params: Record<string, string>, auth: AuthInfo | null)\`.
4. Validate \`auth\` early: \`if (!auth) return json({ error: "Unauthorized" }, 401);\`
5. Return JSON using the utility: \`import { json } from "../utils"; return json(data);\`
6. Always wrap database calls in \`try/catch\` and return \`500\` on failure.

## 4. Sub-Systems
- **Git/GitHub (WOW-013):** High-level wrappers exist in \`server/git.ts\` (\`gitCommit\`, \`gitPush\`, \`gitLog\`).
- **Channels (WOW-015):** Inbound messages route through \`server/channel-router.ts\`. Outbound messaging uses tools in \`server/orchestrator-channel-tools.ts\`.
`,
};
