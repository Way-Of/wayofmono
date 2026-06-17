---
name: ticket_manager
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

## Ticket Status Flow

```
Backlog → Planned → Ready → In Progress → Submitted for Review → Approved → Done
                                          ↘ Changes Requested → In Progress
```

## CTO Dashboard UI Integration

The CTO Dashboard (Next.js 16) provides a visual ticket management interface with interactive status selection:

- **Ticket List View**: Each ticket row has a dropdown `Select` component for status changes
- **Ticket Detail View**: Status dropdown in the header with color-coded options
- **Status Options**: Backlog, In Progress, In Review, Done, Blocked
- **Colors**: Backlog=gray, In Progress=blue, In Review=yellow, Done=green, Blocked=red
- **Integration**: Uses `updateTicketStatus` action from dashboard store to update tickets locally and persist to `thoughts/` filesystem

When ticket status is changed via the UI:
1. Status updates immediately in the dashboard state
2. `updated` timestamp is set to current date
3. Changes sync to the f-rr-d repository via GitHub API or local filesystem
4. The ticket file frontmatter `status` field is updated

Agents can also change ticket status programmatically using the `update_ticket` tool with `status` parameter.

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

```bash
ls thoughts/<project-slug>/shared/tickets/<PREFIX>-*.md
```

Take the highest number, increment by 1. If no tickets exist, start at `001`.

### Storage Location

- Shared tickets: `thoughts/<project-slug>/shared/tickets/<FILE>.md`
- Personal tickets: `thoughts/<project-slug>/<dev>/tickets/<DEV>-<XXX>-<description>.md`

### Frontmatter

```yaml
---
title: "[<PREFIX>-<NNN>] <Descriptive Title>"
type: "Feature" | "Bug" | "TechDebt" | "Epic" | "Improvement"
priority: "Critical" | "High" | "Medium" | "Low"
status: "Backlog" | "Planned" | "Ready" | "In Progress" | "Submitted for Review" | "Approved" | "Done"
assignee: ""
reporter: "@username"
project: "WOMONO" | "WOW" | "OPT"
namespace: "womono" | "wow" | "opticat"
category: "feature" | "bug" | "infrastructure" | "compliance" | "system"
parent_ticket: ""
shared_tickets: "[]"
pr_url: ""
github_issue: ""
---
```

### Template

Use `thoughts/shared/tickets/ticket-template.md`.

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
Mark a ticket as done. If review is required (CTO/Lead), moves to "Submitted for Review" instead.
Checks off linked TODO checkboxes in `thoughts/<project-slug>/shared/tickets/TODO.md`.

### `/sync team`
Show team dashboard: all tickets grouped by owner, status, blockers, dependencies.

### `/sync skills`
Sync all available skills to all configured frontends.

### `/ticket create`
Interactive ticket creation wizard. Prompts for:
- Title, type, priority, namespace
- Assignee, project, category
- Context, requirements, technical notes, success criteria

## Available Tools

### `list_tickets`
List tickets with filtering.
Parameters:
- `namespace` (optional): Filter by "wow" | "opticat" | "womono" | "team"
- `status` (optional): Filter by status
- `assignee` (optional): Filter by assignee
- `project` (optional): Filter by project
- `category` (optional): Filter by category
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

## Ticket Storage (per project, from harness.json project_slug)

Tickets are stored as markdown files in:
- `thoughts/<project-slug>/shared/tickets/<category>/<ID>-<description>.md` (shared tickets)
- `thoughts/<project-slug>/<dev>/tickets/<DEV>-<XXX>-<description>.md` (personal tickets)

Each ticket follows the template in `thoughts/shared/tickets/ticket-template.md` (cross-project template at f-rr-d root).

## Hierarchical Linking

- Personal tickets reference parent shared ticket via `parent_ticket` frontmatter
- Shared tickets reference personal sub-tasks via `sub_tasks` array
- Personal TODO.md auto-generates from assigned shared tickets

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
