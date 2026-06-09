---
title: "[PROJ-023] Ticket Folder Organization: Categorized Subfolders"
type: "Feature"
priority: "High"
status: "Backlog"
assignee: "@wo-team"
created: "2026-06-09"
---

## Context
Tickets in `thoughts/shared/tickets/` are currently flat. We need a categorized folder structure for better organization and discoverability. Tickets should be organized by technical domain AND system needs.

## Requirements & Scope
- [ ] Reorganize `thoughts/shared/tickets/` into subfolders:
  - [ ] `thoughts/shared/tickets/frontend/` - UI, React, TUI, components, styling
  - [ ] `thoughts/shared/tickets/backend/` - API, database, server, auth, RBAC
  - [ ] `thoughts/shared/tickets/architecture/` - Core architecture, monorepo, harness, plugins
  - [ ] `thoughts/shared/tickets/infrastructure/` - CI/CD, deployment, hosting, monitoring
  - [ ] `thoughts/shared/tickets/communications/` - Telegram, WhatsApp, channels, bots
  - [ ] `thoughts/shared/tickets/ai-agents/` - Agent development, skills, prompts, routing
  - [ ] `thoughts/shared/tickets/testing/` - Test strategies, TDD, integration, E2E
  - [ ] `thoughts/shared/tickets/documentation/` - Docs, tutorials, API references
  - [ ] `thoughts/shared/tickets/security/` - Access control, audit, compliance
  - [ ] `thoughts/shared/tickets/performance/` - Optimization, benchmarks, profiling
  - [ ] `thoughts/shared/tickets/system/` - **System needs** (harness updates, tool sync, team setup, templates)
    - [ ] `system/harness/` - Harness installer, setup, CLI
    - [ ] `system/skills/` - Skill loading, adapters, sync, updates
    - [ ] `system/agents/` - Agent namespacing, registry, loading
    - [ ] `system/team/` - Team config, roles, CTO dashboard
    - [ ] `system/templates/` - Ticket templates, PRD templates
    - [ ] `system/docs-sync/` - Documentation auto-fetch, tool updates
- [ ] Update ticket template to include `category` field (frontend|backend|architecture|infrastructure|communications|ai-agents|testing|documentation|security|performance|system)
- [ ] Update `ticket-manager` skill (PROJ-013) to support categorized storage and querying
- [ ] Create migration script to move existing tickets to correct folders
- [ ] Update `TODO.md` to reflect new structure
- [ ] Cross-platform migration script (Deno + .sh/.bat/.ps1)

## Technical Notes
- Folder structure mirrors technical domains + system needs
- Tickets keep their IDs (WOW-XXX, PROJ-XXX, OPT-XXX) but live in category folders
- `list_tickets` tool adds `category` filter
- Migration preserves git history (use `git mv`)
- System folder for harness/tool/team meta-tickets
- All documentation in English

## Success Criteria
- [ ] All existing tickets migrated to correct category folders
- [ ] New tickets created in correct folder via `ai-harness ticket create --category=frontend`
- [ ] `list_tickets --category=frontend` works
- [ ] `thoughts/shared/tickets/TODO.md` updated with categorized view
- [ ] Cross-platform migration script works on Linux, macOS, Windows