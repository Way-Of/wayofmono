# Thoughts & Ticket System

## Overview

The project uses **förråd** ("f-rr-d"), a centralized thoughts repository that serves as the single source of truth for all thoughts, tickets, plans, research, and personal TODOs across all Way-Of projects (wayofmono, wow, opticat).

The thoughts directory lives at `thoughts/` and is maintained as **a separate git repository** (cloned from the f-rr-d remote). It is NOT part of the main wayofmono git repo.

## Repository Location

| Aspect | Detail |
|--------|--------|
| Remote | Centralized f-rr-d repository (`github.com/Way-Of/f-rr-d`) |
| Local | `thoughts/` (separate git clone) |
| Config | `.wo/config/` (harness.json, team-config.json) |
| Legacy | `thoughts.old/` (previous structure, preserved for reference) |

## Directory Structure

```
thoughts/
├── AGENTS.md                       # Agent instructions for f-rr-d
├── README.md                       # Human-readable overview
├── global/                         # Cross-project global concerns (architecture, standards)
├── shared/                         # Cross-project templates ONLY
│   └── tickets/ticket-template.md
├── wayofmono/                      # WayOfMono monorepo (WOMONO-XXX tickets)
│   ├── global/
│   ├── docs/                       # Project documentation
│   │   ├── architecture/
│   │   ├── decisions/              # ADRs
│   │   ├── guides/
│   │   └── references/
│   ├── shared/
│   │   ├── tickets/                # Categorized by: frontend, backend, architecture,
│   │   │                           #   infrastructure, communications, ai-agents,
│   │   │                           #   testing, documentation, security, performance,
│   │   │                           #   system (harness/skills/agents/team/templates/commands/docs-sync)
│   │   ├── plans/
│   │   └── research/
│   ├── craig/                      # Personal directories per developer
│   │   ├── TODO.md                 # Auto-generated TODO from shared tickets
│   │   ├── tickets/                # Personal ticket breakdowns
│   │   ├── plans/
│   │   └── research/
│   ├── zerwiz/
│   ├── andre/
│   └── tomas/
├── wow/                            # Way of Work platform (WOW-XXX tickets)
│   ├── global/
│   ├── docs/
│   ├── shared/
│   │   ├── tickets/
│   │   ├── plans/
│   │   └── research/
│   ├── zerwiz/
│   ├── andre/
│   ├── tomas/
│   └── craig/
└── opticat/                        # Opticat platform (OPT-XXX tickets)
    ├── global/
    ├── docs/
    ├── shared/
    │   ├── tickets/
    │   ├── plans/
    │   └── research/
    ├── zerwiz/
    ├── andre/
    ├── tomas/
    └── craig/
```

## What the System Stores

| Stored Here | NOT Stored Here |
|-------------|----------------|
| Tickets (all namespaces) | Skills (in `packages/@aiengineeringharness/skills/`) |
| Implementation plans | Agents (in `packages/@aiengineeringharness/agents/`) |
| Technical research | Platform configs (in `packages/@aiengineeringharness/<platform>/`) |
| Documentation | Source code (in respective project repos) |
| Personal TODOs | |

## Ticket Namespaces

| Prefix | Namespace | Project | Example |
|--------|-----------|---------|---------|
| WOW-XXX | wow | Way of Work platform | WOW-001-implement-ticket-manager |
| OPT-XXX | opticat | Opticat platform | OPT-010-bootstrap-oculens |
| WOMONO-XXX | womono | WayOfMono monorepo | WOMONO-005-update-docs |
| TEAM-XXX | team | Team operations | TEAM-001-sync-configs |
| PERSONAL-XXX | personal | Individual sub-tasks | CRAIG-001-review-prd |

Personal tickets (PERSONAL-XXX or `<DEV>-XXX`) reference a parent shared ticket via `parent_ticket` frontmatter. Shared tickets list personal sub-tasks in a `sub_tasks` array.

## Ticket Lifecycle

```
                        ┌─────────────────────────────────────────┐
                        │         CTO Review Required?            │
                        │  (role_required = cto | lead)           │
                        └────────────┬────────────────────────────┘
                                     │
                    Yes              │               No
                     │               │               │
                     v               │               v
              ┌──────────────┐       │       ┌──────────────┐
              │ In Progress  │◄──────┘       │ In Progress  │
              └──────┬───────┘               └──────┬───────┘
                     │                              │
                     v                              v
        ┌──────────────────────┐           ┌──────────────┐
        │ Submitted for Review │           │     Done     │
        └──────────┬───────────┘           └──────────────┘
                   │
          ┌────────┴────────┐
          v                 v
  ┌──────────────┐  ┌──────────────┐
  │   Approved   │  │ Changes Req  │
  └──────┬───────┘  └──────┬───────┘
         │                 │
         v                 v
  ┌──────────────┐  ┌──────────────┐
  │     Done     │  │ In Progress  │
  └──────────────┘  └──────────────┘
```

### Statuses

| Status | Description |
|--------|-------------|
| Backlog | Idea captured, not yet planned |
| Planned | Requirements scoped, assigned |
| Ready | All prerequisites met, ready to start |
| In Progress | Developer actively working |
| Submitted for Review | Developer completed, awaiting CTO/Lead review |
| Changes Requested | Review identified issues, needs rework |
| Approved | Review passed, ready to close |
| Done | Completed |
| Blocked | Waiting on dependency |

## Ticket Templates

### Shared Ticket Template (`thoughts/shared/tickets/ticket-template.md`)

```markdown
---
title: "[PROJ-XXXX] Title"
type: "Feature | Bug | Chore"
priority: "Critical | High | Medium | Low"
status: "Backlog | Planned | Ready | In Progress | Submitted for Review | Changes Requested | Approved | Done | Blocked"
assignee: "@username"
reporter: "@username"
project: "WO | OPT | PROJ | TEAM"
namespace: "wow | opticat | proj | team"
category: "frontend | backend | architecture | infrastructure | communications | ai-agents | testing | documentation | security | performance | system"
role_required: "cto | lead | senior | junior"
parent_ticket: "WOW-XXX | OPT-XXX | PROJ-XXX | TEAM-XXX"
shared_tickets: "[]"
pr_url: ""
github_issue: ""
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
reviewed_by: ""
reviewed_at: ""
---

## Context
## Requirements & Scope
## Technical Notes
## Success Criteria
## Review Notes (CTO/Lead only)
## Personal Task Breakdown (Developer fills this)
```

### Personal Ticket Template (`thoughts/<project-slug>/shared/tickets/personal-ticket-template.md`)

```markdown
---
title: "[PERSONAL-XXX] Brief Description"
type: "Personal Task"
priority: "Medium"
status: "Backlog"
assignee: "@<dev-id>"
reporter: "@<dev-id>"
project: "wayofmono"
namespace: "PERSONAL"
category: "personal"
parent_ticket: "WOMONO-XXX"
blockers: []
unblocks: []
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
---

## Context
## Acceptance Criteria
## Notes
```

## Personal TODO Hierarchy

Each developer has a `TODO.md` in their personal directory:

```
thoughts/<project-slug>/<dev-id>/
├── TODO.md           # Auto-generated from assigned shared tickets
├── tickets/          # Personal ticket breakdowns (e.g., CRAIG-001-review-prd.md)
├── plans/            # Personal implementation plans
└── research/         # Personal research notes
```

The TODO.md is auto-generated by `sync_personal_todos()` from the ticket-manager skill. It reads shared ticket assignments and creates TODO checkboxes linked to each ticket.

## Team Configuration

Team configuration lives in `.wo/config/`:

| File | Purpose | Git Status |
|------|---------|------------|
| `team-config.json` | Actual config (developers, roles, projects) | Gitignored |
| `team-config.template.json` | Template for new setups | Committed |
| `harness.json` | Project slug, f-rr-d URL | Committed |

### Roles

| Role | Permissions |
|------|-------------|
| cto | Read-all, write-all, approve-reviews, assign-any, manage-team |
| lead | Read-project, write-project, approve-reviews, assign-project, manage-skills |
| senior | Read-project, write-assigned, request-review, create-tickets |
| junior | Read-assigned, write-assigned, request-review, create-personal-tickets |

### Current Team (wayofmono)

Developer folder names will be migrated to GitHub usernames.

| Developer | Role | Projects | Folder (GitHub username) |
|-----------|------|----------|--------------------------|
| Craig | CTO | WO, OPT, PROJ | `<craigs-github>/` |
| zerwiz | Lead | WO, OPT, PROJ | `zerwiz/` |
| Andre | Junior | WO | `<andres-github>/` |
| Tomas | Junior | WO | `<tomas-github>/` |

## Git Workflow (für f-rr-d)

Since `thoughts/` is its own git repo tracking the centralized f-rr-d repository:

1. **Branch naming**: `<project-slug>/<namespace>/<ticket-id>-<short-desc>`
2. **No direct commits to main** — use feature branches
3. **Auto-branches**: Skills create branches with `auto/`, `init/`, `dashboard/` prefixes
4. **Agent protocol**: Pull before reading (`git -C thoughts/ pull --ff-only`), write to correct project folder, commit + push after writing

## Tools & Scripts

All management tools live in `packages/@aiengineeringharness/skills/`:

| Skill | Location | Purpose |
|-------|----------|---------|
| ticket-manager | `skills/ticket-manager/` | Full ticket lifecycle, sync.ts for TODO generation |
| team-setup | `skills/team_setup/` | Init/list/add/assign team members, team-init.ts |
| cto-dashboard | `skills/cto-dashboard/` | Dashboard with review queue, developer progress |
| auto-ticket-creator | `skills/auto-ticket-creator/` | monitor.ts monitors git/npm/ref/codebase for changes |
| help-command | `skills/help-command/` | /help command exploring ticket system |
| skill-adapter | `skills/skill-adapter/` | Cross-platform compatibility for all 7 frontends |
| docs-sync-updater | `skills/docs-sync-updater/` | Keeps docs in sync across frontends |

## Active Development (WOMONO-030)

The CTO Dashboard & Developer Portal is being built incrementally across multiple phases:

| Phase | Scope | Status |
|-------|-------|--------|
| **1** | Add `docs/` directory structure to f-rr-d + update init_harness/team-init.ts | ✅ Done |
| **2** | Telegram bot — query-only (list tickets, get details, status) | 🔜 Next |
| **3** | Telegram bot — write operations (create/update tickets, subscribe) | ⏳ Planned |
| **4-6** | Web dashboard (read-only, auth, CTO review actions) | 🚫 Frontend — deferred |
| **7** | Remove josef/ folder + rename dev folders to GitHub usernames + auto-sync from GitHub API | ⏳ Planned |

### Telegram Agent (Phase 2-3)

A Telegram bot (`woagent-frrd-bot`) will be built to interact with f-rr-d via chat:
- `/tickets` — list/filter tickets
- `/ticket <id>` — get ticket details, create/update
- `/status <dev>` — developer status
- `/subscribe` — get notified on changes
- `/sync` — pull latest f-rr-d changes

### f-rr-d Docs Storage (Phase 1 — Complete)

Each project in f-rr-d now has a `docs/` directory:
```
thoughts/<project-slug>/
  ├── docs/
  │   ├── architecture/
  │   ├── decisions/   # ADRs
  │   ├── guides/
  │   └── references/
```

Created and initialized on `init_harness` / `team-init.ts`.

## Agent Integration

### Slash Commands

| Command | Action |
|---------|--------|
| `/work <ticket-id>` | Start working — sets status to "In Progress", creates session context |
| `/complete <ticket-id>` | Complete — sets "Submitted for Review" or "Done" |
| `/sync team` | Show team dashboard grouped by owner/status/blockers |
| `/sync skills` | Sync all skills to all configured frontends |
| `/help` | Explore available commands and skills |

### Ticket Category Organization

Tickets are stored in categorized subfolders under `thoughts/<project-slug>/shared/tickets/`:

```
tickets/
├── frontend/
├── backend/
├── architecture/
├── infrastructure/
├── communications/
├── ai-agents/
├── testing/
├── documentation/
├── security/
├── performance/
├── system/
│   ├── harness/
│   ├── skills/
│   ├── agents/
│   ├── team/
│   ├── templates/
│   ├── commands/
│   └── docs-sync/
```

## Ticket Creation Workflow

1. An idea or issue is identified (by developer, auto-monitor, or backlog grooming)
2. A shared ticket is created in the appropriate category folder using the template
3. The ticket is assigned a namespace prefix (WOMONO-XXX, WOW-XXX, etc.)
4. Status starts at "Backlog" or "Planned"
5. A CTO/Lead reviews and sets to "Ready"
6. Developer starts work with `/work <ticket-id>`
7. Developer creates personal tickets to break down the work
8. On completion, `/complete <ticket-id>` triggers review or marks done
9. CTO/Lead reviews submitted tickets and approves or requests changes
10. Approved tickets are marked "Done"

## Working with the System

### For Developers (AI Agents)

1. Pull before accessing: `git -C thoughts/ pull --ff-only`
2. Find tickets: look in `thoughts/<project-slug>/shared/tickets/<category>/`
3. Each ticket is a markdown file with YAML frontmatter
4. Start work with `/work <ticket-id>`
5. Create personal tickets in `thoughts/<project-slug>/<dev-id>/tickets/` linked to the parent
6. Complete and submit for review with `/complete <ticket-id>`

### For CTO/Lead

1. Use `/sync team` for visibility into all tickets
2. Dashboard shows review queue, developer progress, blockers
3. Review submitted tickets via CTO dashboard or GitHub PR flow
4. Approve or request changes on submitted work
