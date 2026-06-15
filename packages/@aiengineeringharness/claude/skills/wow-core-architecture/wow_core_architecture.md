---
name: wow_core_architecture
description: Fundamental architectural principles and tech stack rules for the Way of Work (WoW) platform. Use as a starting point for understanding the system.
allowed-tools: 
---

> **Platform**: Claude Code | **Skill**: wow_core_architecture | **Version**: 1.0.0
>
> _Auto-generated from canonical format. Do not edit directly._


# wow_core_architecture

## Tech Stack
- **Backend:** Bun (v1.x), raw HTTP server (`Bun.serve`), TypeScript. NO Express, NO NestJS.
- **Database:** SQLite via `bun:sqlite`. NO ORMs (Prisma, Drizzle, etc.). Write raw, parameterized SQL queries.
- **Frontend:** React 19, Vite, Tailwind CSS, React Router v6.
- **Desktop:** Electron wrapper for the web app.

## Fundamental Rules
1. **Multi-Tenancy is Absolute:** The system serves multiple companies. **EVERY** database query that reads or writes tenant-specific data MUST include `tenant_id = ?`. Never assume the tenant context.
2. **Minimalist Routing:** Use the custom `server/router.ts`. Group routes by feature (e.g., `server/routes/projects.ts`) and register them in `server/index.ts`.
3. **Identifier Generation:** Use unique string prefixes for primary keys (e.g., `proj_${Date.now()}_${random}`). Avoid auto-incrementing integers for distributed safety.
4. **JSON Standard:** All API responses must use the `json()` utility from `server/utils.ts`. Return structured errors: `json({ error: "Message" }, 400)`.

## Workspace vs. System
- **System Data:** Lives in `data/wayofwork.sqlite` (Users, Projects, Tasks, etc.).
- **Workspace Data:** Lives on the filesystem in the directory defined by `WOP_WORKSPACE`.
- **AI Agent Data:** Application agents (not you, but the bots within the app) live in `.wo/agents/` and their sessions in `workspace/agent/sessions/`.
