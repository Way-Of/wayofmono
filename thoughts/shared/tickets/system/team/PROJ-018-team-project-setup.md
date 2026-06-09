---
title: "[PROJ-018] Team & Project Setup: Developer Roles, Projects, and Hierarchy"
type: "Feature"
priority: "High"
status: "Backlog"
assignee: "@wo-team"
created: "2026-06-09"
---

## Context
We need a system to manage team members (Craig, Josef, Andre, Tomas, Zrewiz, etc.) across different projects. Each developer has a role (CTO, Lead, Senior, Junior) and belongs to one or more projects. The system must support:

- **Global/Shared tickets**: Cross-project, high-level tickets in `thoughts/shared/tickets/`
- **Personal tickets**: Per-developer tickets in `thoughts/<developer>/tickets/` linking to shared tickets
- **Project-specific tickets**: In `thoughts/shared/tickets/` with project prefix (e.g., `WO-XXX`, `OPT-XXX`, `PROJ-XXX`)
- **Role-based access**: CTO sees all, developers see their assigned + shared

Current structure:
```
thoughts/
├── shared/           # Global tickets, TODOs, plans
│   ├── tickets/      # WOW-XXX, PROJ-XXX, OPT-XXX tickets
│   ├── plans/
│   └── research/
├── global/           # Cross-cutting concerns
├── craig/            # CTO - personal tickets, plans, research
│   ├── tickets/
│   ├── plans/
│   └── research/
├── andre/            # Developer - personal tickets
├── tomas/            # Developer - personal tickets
└── zerwiz/           # Developer - personal tickets
```

## Requirements & Scope
- [ ] Create `team-config.json` at repo root or `.wo/config/team-config.json`:
  - [ ] Developer list with: id, name, role (cto|lead|senior|junior), email, github, projects[]
  - [ ] Project list with: id, name, prefix (WO|OPT|PROJ|TEAM), members[], default-assignee
  - [ ] Role permissions: cto=read-all/write-all, lead=read-project/write-project, dev=read-assigned/write-assigned
- [ ] Create `setup-team.ts` script (Deno, cross-platform) to initialize team config
- [ ] Create CLI commands:
  - [ ] `ai-harness team init` - Interactive team setup wizard
  - [ ] `ai-harness team add <name> --role=cto|lead|senior|junior --projects=wo,opt`
  - [ ] `ai-harness team list` - Show all members with roles/projects
  - [ ] `ai-harness team assign <ticket-id> <developer-id>`
- [ ] Update ticket template to include: `assignee`, `reporter`, `project`, `role-required`
- [ ] Personal TODO.md in each `thoughts/<dev>/TODO.md` auto-links to assigned shared tickets
- [ ] Cross-platform: `.sh` + `.bat`/.ps1 for all scripts

## Technical Notes
- Team config stored in `.wo/config/team-config.json` (gitignored for privacy) + `team-config.template.json` (committed)
- Developer IDs match folder names in `thoughts/<id>/`
- Ticket namespace prefixes: `WOW` (Way of Work), `OPT` (Opticat), `PROJ` (WayOfMono), `TEAM` (team-specific)
- Personal tickets use format: `<DEV>-<XXX>-<desc>.md` (e.g., `CRAIG-001-review-prd.md`)
- Linking: Personal ticket frontmatter has `parent_ticket: "WOW-001"` or `shared_tickets: ["WOW-001", "PROJ-013"]`

## Success Criteria
- [ ] `ai-harness team init` creates team config with roles/projects
- [ ] Each developer has `thoughts/<dev>/TODO.md` showing assigned shared tickets
- [ ] CTO can run `ai-harness team dashboard` to see all tickets across projects
- [ ] Ticket template updated with assignee, reporter, project, role-required
- [ ] Personal tickets link to shared tickets via frontmatter
- [ ] Cross-platform scripts work on Linux, macOS, Windows