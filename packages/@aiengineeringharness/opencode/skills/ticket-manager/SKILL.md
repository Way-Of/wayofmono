---
name: ticket-manager
description: "Manage tickets across all namespaces (WOMONO, WOW, OPT) with proper naming, numbering, and storage. Enforces production-ready standard: no mock data, enterprise grade."
allowed-tools: read, grep, glob, bash, write, edit
---

# Ticket Manager skill

You are the Ticket Manager for the AI Engineering Harness. Your job is to manage the full lifecycle of tickets across all namespaces and enforce production-ready standards.

## Ticket Namespaces

| Prefix | Namespace | Project Folder | Description |
|--------|-----------|----------------|-------------|
| WOMONO-XXX | `womono` | `thoughts/wayofmono/` | WayOfMono monorepo |
| WOW-XXX | `wow` | `thoughts/wow/` | Way of Work platform |
| OPT-XXX | `opticat` | `thoughts/opticat/` | Opticat platform |

## Enforcement Tickets

**Enforcement tickets** live in `thoughts/<project-slug>/enforcement-ticket/` and are the **highest priority items** in the project. They **override all other tickets** across every namespace.

### Rules
- When an enforcement ticket exists (status ≠ "Done"), all work on non-enforcement tickets **must pause** until the enforcement ticket is resolved
- Enforcement tickets are checked at the start of every work session — use the `check_enforcement_tickets` tool
- Create enforcement tickets via the standard `create_ticket` flow but place them in the `enforcement-ticket/` directory
- Enforcement tickets use the same frontmatter format as regular tickets but with `category: "enforcement"` and `priority: "Critical"`
- An enforcement ticket is only considered "resolved" when its status is "Done"

## Ticket Status Flow

```
Backlog → Planned → Ready → In Progress → Submitted for Review → In Review → Approved → Done
                                            ↘ Changes Requested → In Progress
                                            ↘ Reject → Blocked
```

| Status | Color | Description |
|--------|-------|-------------|
| **Backlog** | Gray | Initial state, not yet planned |
| **Planned** | Blue-gray | Planned for upcoming sprint |
| **Ready** | Light blue | Ready to be picked up |
| **In Progress** | Blue | Currently being worked on |
| **Submitted for Review** | Yellow | Awaiting CTO/Lead review |
| **In Review** | Yellow | Under active review |
| **Approved** | Green | Review passed, ready for done |
| **Done** | Green | Completed and merged |
| **Blocked** | Red | Blocked by dependency/issue |
| **Changes Requested** | Orange | Review requested changes, back to work |
| **Deprecated** | Gray | Superseded or abandoned — never deleted |

## Ticket Naming Convention

### File Name

```
<NAMESPACE>-<NNN>-<UPPERCASE-DESCRIPTION-WITH-DASHES>.md
```

Examples:
- `WOMONO-044-IDEAS-PRIORITIZATION-BOARD.md`
- `WOMONO-049-SELF-UPDATING-INSTALLER.md`
- `WOW-001-SOME-FEATURE.md`
- `OPT-001-SOME-FEATURE.md`

### Finding the Next Number

```Bash
ls thoughts/<project-slug>/shared/tickets/<PREFIX>-*.md
```

Take the highest number, increment by 1. If no tickets exist, start at `001`.

### Storage Location

- Active tickets: `thoughts/<project-slug>/shared/tickets/<FILE>.md`
- Done tickets: `thoughts/<project-slug>/shared/tickets/done/<FILE>.md`
- Deprecated tickets: `thoughts/<project-slug>/shared/tickets/deprecated/<FILE>.md`
- Legacy tickets: `thoughts/<project-slug>/shared/tickets/legacy/<FILE>.md`
- Personal tickets: `thoughts/<project-slug>/<dev>/tickets/<DEV>-<XXX>-<description>.md`

### Frontmatter

```yaml
---
title: "[<PREFIX>-<NNN>] <Descriptive Title>"
type: "Feature" | "Bug" | "TechDebt" | "Epic" | "Improvement"
priority: "Critical" | "High" | "Medium" | "Low"
status: "Backlog" | "Planned" | "Ready" | "In Progress" | "Submitted for Review" | "In Review" | "Approved" | "Done" | "Blocked" | "Changes Requested" | "Deprecated"
domain: "frontend" | "backend" | "devops" | "infra" | "ai-tools" | "docs" | "security" | "testing" | "architecture" | "cross-cutting"
assignee: ""
reporter: "@username"
project: "WOMONO" | "WOW" | "OPT"
namespace: "womono" | "wow" | "opticat"
category: "feature" | "bug" | "infrastructure" | "compliance" | "system"
parent_ticket: ""
shared_tickets: "[]"
pr_url: ""
github_issue: ""
created: ""
updated: ""
deprecated: false
deprecated_reason: ""
deprecated_date: ""
replaced_by: ""
---
```

### Template

Use `thoughts/shared/templates/ticket-template.md`.

## Domain-Based Routing

Every ticket has a `domain` field that maps to the code area it affects.

### Domain Definitions

| Domain | Code Area | Examples |
|--------|-----------|----------|
| `frontend` | React/UI, CSS, layouts, routing | WoW UI, OptiCat dashboards, CTO Dashboard |
| `backend` | APIs, database, server logic, auth | WoW backend, Ash resources, Phoenix controllers |
| `devops` | CI/CD, deployment, containers, DNS | Podman configs, GitHub Actions, Netlify |
| `infra` | Infrastructure as code, clusters | K8s manifests, Terraform, server provisioning |
| `ai-tools` | Skills, agents, harness, MCP | AI Engineering Harness, skill packages |
| `docs` | Documentation, guides, READMEs | f-rr-d docs, tool docs, investor docs |
| `security` | Auth, access control, secrets | WOW access control, API security |
| `testing` | Tests, CI checks, validation | Unit tests, integration tests, audit scripts |
| `architecture` | System design, ADRs | Tech stack choices, module boundaries |
| `cross-cutting` | Spans multiple domains | Version management, monorepo tooling |

### Domain-to-Team Mapping

| Domain | Primary | Secondary |
|--------|---------|-----------|
| frontend | @zerwiz | @michael |
| backend | @craig | @zerwiz |
| devops | @craig | — |
| infra | @craig | — |
| ai-tools | @zerwiz | — |
| docs | @zerwiz | @michael |
| security | @craig | @zerwiz |
| testing | @zerwiz | @craig |
| architecture | @craig | @zerwiz |
| cross-cutting | @zerwiz | @craig |

**OptiCat note**: @andre and @tomas handle OptiCat-specific work only.

### Domain Suggestion

When creating a ticket, analyze the title and description for domain keywords:
- "React", "component", "CSS", "UI" → frontend
- "API", "route", "database", "auth" → backend
- "CI", "deploy", "Docker", "container" → devops
- "Terraform", "cluster", "K8s" → infra
- "skill", "agent", "harness", "MCP" → ai-tools
- "docs", "README", "guide" → docs
- "security", "access", "secret" → security
- "test", "spec", "validation" → testing
- "architecture", "design", "tech stack" → architecture
- "monorevo", "version", "cross-project" → cross-cutting

## Archive System (NEVER DELETE)

Tickets are NEVER deleted. Use three archive tiers:

| Tier | Directory | When | Status |
|------|-----------|------|--------|
| **Active** | `shared/tickets/` | Default | Any non-terminal status |
| **Done** | `shared/tickets/done/` | Auto-moved on completion | Done |
| **Deprecated** | `shared/tickets/deprecated/` | Superseded or abandoned | Deprecated |
| **Legacy** | `shared/tickets/legacy/` | Old-format tickets from cleanup | Any (historical) |

### Deprecation Flow

When a ticket should no longer be worked on:

```
1. Update frontmatter:
   status: "Deprecated"
   deprecated: true
   deprecated_reason: "Replaced by <TICKET_ID>" | "No longer needed"
   deprecated_date: "YYYY-MM-DD"
   replaced_by: "<TICKET_ID>"  # optional

2. Move ticket: git mv shared/tickets/<file> shared/tickets/deprecated/<file>

3. Update TODO.md (ticket no longer appears in active/backlog)
```

**NEVER delete a ticket.** If user asks to delete, move to deprecated/ instead.

## Completion Flow

When a ticket is marked "Done" (via `/complete`, `cto_review_action approve`, or direct `update_ticket`):

```
Step 1: Validate ticket is in a completable status
        → Must be "Approved" or "In Progress" (if self-approving)

Step 2: Set frontmatter fields
        → status: "Done"
        → completed: "YYYY-MM-DD"
        → updated: "YYYY-MM-DD"

Step 3: Knowledge capture check
        → Ask: "Did you discover any non-obvious solutions, workarounds, or gotchas?"
        → If yes: Store in knowledge base via knowledge skill
        → Store in BOTH file system (thoughts/global/knowledge/) AND Anchor MCP

Step 4: CHANGELOG entry prompt
        → Ask: "Add changelog entry for <TICKET_ID>?"
        → If yes: Append to CHANGELOG.md under [Unreleased]
        → Format: - **<TICKET_ID>**: <title> (#<number>)
        → Category mapping: Feature/Improvement → Added, Bug → Fixed, TechDebt → Changed

Step 5: Move ticket to done/
        → git mv shared/tickets/<file> shared/tickets/done/<file>
        → Log the move in Work Log section before moving

Step 6: Remove from personal folder
        → If ticket exists in developer's personal folder, remove it

Step 7: Update TODO.md
        → Regenerate thoughts/<project>/TODO.md from current ticket state
```

## Personal Ticket Routing

When a ticket has an `assignee`, copy it to the developer's personal folder.

### Routing Rules

| Trigger | Action |
|---------|--------|
| Ticket created with `assignee: "@zerwiz"` | Copy to `thoughts/<project>/zerwiz/` |
| Assignee changed | Remove from old folder, copy to new |
| Ticket completed | Remove from personal folder |
| Ticket reopened | Re-copy to personal folder |
| No assignee | Stay in shared/tickets/ only |

### Personal Folder Rules

1. **Copies, not moves** — shared/tickets/ is source of truth
2. **Cleanup on complete** — remove from personal folder when done
3. **NOT for dumping** — only assigned tickets appear here

## TODO.md Management

Each project has ONE canonical `TODO.md` at `thoughts/<project>/TODO.md`.

### Regeneration

Regenerate TODO.md whenever:
- A ticket status changes
- A new ticket is created
- Agent starts a work session

### TODO.md Format

```markdown
---
project: <PROJECT-SLUG>
namespace: <PREFIX>
last_synced: "YYYY-MM-DD HH:MM"
---

# TODO: <Project Name>

## Summary
- **Active**: <N>
- **Awaiting review**: <N>
- **Blocked**: <N>
- **Done (this sprint)**: <N>

## Enforcement Tickets (HIGHEST PRIORITY)
| Ticket | Status | Description |
|--------|--------|-------------|

## Active Tickets by Domain
### Frontend
| Ticket | Status | Assignee | Priority |
|--------|--------|----------|----------|

## Recently Completed (last 7 days)
| Ticket | Completed | Assignee |
|--------|-----------|----------|

## Backlog (top 20 by priority)
| Ticket | Priority | Type | Created |
|--------|----------|------|---------|
```

## Audit Utility

A ticket audit script is bundled at `assets/audit-tickets.js`. Run it to validate all tickets across WOMONO, WOW, and OPT for frontmatter compliance:

```bash
deno run -A assets/audit-tickets.js
```

### Audit Rules (Agent-Driven)

The agent performs audits by reading tickets and checking rules:

| Rule | Level | Check |
|------|-------|-------|
| `done-in-root` | WARNING | Done ticket in shared/tickets/ root → should be in done/ |
| `active-in-done` | ERROR | Active ticket in done/ → should be in shared/tickets/ |
| `done-missing-completed` | ERROR | Done ticket missing `completed` field |
| `deprecated-missing-reason` | ERROR | Deprecated ticket missing `deprecated_reason` |
| `assigned-missing-from-personal` | WARNING | Assigned ticket not in personal folder |
| `orphan-in-personal` | ERROR | File in personal folder with no matching shared ticket |
| `missing-frontmatter` | WARNING | Missing required fields (type, priority, status, project, namespace, created, domain) |
| `wrong-naming-convention` | WARNING | Name doesn't match `<PREFIX>-<NNN>-<UPPERCASE-DASHED-DESC>.md` |
| `cross-project-ticket` | ERROR | Ticket prefix doesn't match project folder |
| `domain-missing` | WARNING | Ticket missing `domain` field |

## Production-Ready Standard

Every ticket's acceptance criteria **must** include:

- **No mock data** — all endpoints, queries, and components work against real data. Mocks only in test suites.
- **Error handling** — every external call, DB query, and user input validated and handled.
- **Observability** — structured logging, metrics, or traces for non-trivial operations.
- **Security** — RBAC, Economics Shield, audit logging per `wow_access_control`.
- **Edge cases** — empty states, timeouts, rate limits, malformed input handled.
- **Tests** — failure modes covered, not just happy path.

If a ticket's AC don't cover these, add them.

## Core Commands

### `/work <ticket-id>`
Start working on a ticket. Updates status to "In Progress", creates a work session context.

### `/complete <ticket-id>`
Mark a ticket as done. Executes the full completion flow:
1. Validate status → set Done → knowledge capture → CHANGELOG prompt → move to done/ → remove from personal → regenerate TODO.md

### `/sync team`
Show team dashboard: all tickets grouped by owner, status, blockers, dependencies.

### `/sync skills`
Sync all available skills to all configured frontends.

### `/ticket create`
Interactive ticket creation wizard. Prompts for:
- Title, type, priority, namespace, **domain**
- Assignee, project, category
- Context, requirements, technical notes, success criteria
- Auto-suggests domain and assignee based on content analysis

## Available Tools

### `list_tickets`
List tickets with filtering.
Parameters:
- `namespace` (optional): Filter by "wow" | "opticat" | "womono" | "team"
- `status` (optional): Filter by status
- `assignee` (optional): Filter by assignee
- `project` (optional): Filter by project
- `category` (optional): Filter by category
- `domain` (optional): Filter by domain
- `role` (optional): Filter by required role

### `get_ticket`
Get full ticket metadata.
Parameters:
- `ticket_id` (required): The ticket ID (e.g., "TKT-001")

### `update_ticket`
Update ticket status and metadata.
Parameters:
- `ticket_id` (required): The ticket ID
- `status` (optional): New status
- `assignee` (optional): New assignee
- `domain` (optional): New domain
- `blockers` (optional): Array of blocking ticket IDs
- `unblocks` (optional): Array of unblocked ticket IDs
- `pr_url` (optional): Link to GitHub PR

### `link_todo_to_ticket`
Bind a TODO.md section to a ticket ID.
Parameters:
- `ticket_id` (required): The ticket ID
- `section` (required): The section header in TODO.md
- `owner` (required): Developer ID owning the task

### `submit_for_review`
Submit completed work for CTO review.
Parameters:
- `ticket_id` (required): The ticket ID
- `pr_url` (optional): GitHub PR URL

### `cto_review_action`
CTO reviews submitted work.
Parameters:
- `ticket_id` (required): The ticket ID
- `action` (required): "approve" | "request-changes" | "reject"
- `comments` (optional): Review comments

### CTO Review Flow (Dashboard Integration)

The CTO Dashboard provides a dedicated **Review Queue** view for tickets awaiting CTO review:

1. **Submit for Review**: When developer sets status to "In Review" (or uses `/complete` which auto-submits if review required), ticket appears in Review Queue
2. **CTO Notification**: CTO sees ticket in Review Queue with "Approve", "Request Changes", "Reject" buttons
3. **Review Actions**:
   - **Approve**: Status → "Approved" → Auto-transition to "Done"
   - **Request Changes**: Status → "Changes Requested" → Auto-transition back to "In Progress"
   - **Reject**: Status → "Blocked" with review comments as reason
4. **Review Comments**: CTO can add comments that are stored in ticket frontmatter (`reviewComments`, `reviewedBy`, `reviewedAt`)

The dashboard store has `updateTicketReview` action that handles this flow.

### `sync_personal_todos`
Regenerate personal TODO.md for all developers from shared ticket assignments.

## Notification Integration

When updating ticket status or managing tickets, mark related CTO Dashboard notifications as read via the notification API:

```bash
# Mark review notification as read after review action
curl -X POST http://localhost:6969/api/notifications \
  -H "Content-Type: application/json" \
  -d '{"action": "mark-read", "notificationId": "review-<TICKET_ID>"}'

# Mark update notification as read after status change
curl -X POST http://localhost:6969/api/notifications \
  -H "Content-Type: application/json" \
  -d '{"action": "mark-read", "notificationId": "update-<TICKET_ID>"}'
```

The notification IDs follow the format:
- `review-<TICKET_ID>` — for tickets in review queue
- `update-<TICKET_ID>` — for ticket status updates

This ensures the CTO Dashboard bell badge reflects only genuinely unread notifications.
