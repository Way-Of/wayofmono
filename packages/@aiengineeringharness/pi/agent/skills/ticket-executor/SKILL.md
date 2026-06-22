---
name: ticket-executor
description: Execute approved plans in phases, validating telemetry and committing changes after each phase completes successfully
allowed-tools: read, write, grep, glob, web, search
---

# Ticket Executor skill

Executes approved plans in phases, with validation and telemetry tracking after each phase.

## Workflow

```
Ticket → /create_plan → /implement_plan → /validate_plan → /validate_telemetry → /commit
```

## Commands

- `/implement_plan <ticket-id>` - Execute approved plan phase-by-phase
- `/execute_phase <ticket-id> <phase>` - Execute specific phase
- `/skip_phase <ticket-id> <phase>` - Skip phase with reason

## Telemetry

- Capture execution time
- Track error rates
- Compare against plan expectations

## Audit Utility

A ticket audit script is bundled at `assets/audit-tickets.js`. Run it after executing plan phases to verify ticket frontmatter integrity:

```bash
deno run -A assets/audit-tickets.js
```

## CTO Dashboard UI Integration

The CTO Dashboard status dropdown affects execution workflow:

- **Status Sync**: When `/implement_plan` runs, it reads the current ticket status from the dashboard/UI
- **Auto-transition**: Moving a ticket to "In Progress" in the UI signals the executor to begin work
- **Review Flow**: "In Review" and "Approved" statuses map to the validation phases
- **Completion**: Setting status to "Done" in UI marks ticket complete (or "Submitted for Review" if review required)

Agents should respect the UI status as the current state. Use `update_ticket` tool to programmatically change status:
- `update_ticket` with `status: "In Progress"` when starting work
- `update_ticket` with `status: "In Review"` when submitting for review
- `update_ticket` with `status: "Done"` when work is complete

## Notification Integration

When completing ticket phases or implementing plans, mark related CTO Dashboard notifications as read via the notification API:

```bash
# Mark review notification as read after phase completion
curl -X POST http://localhost:6969/api/notifications \
  -H "Content-Type: application/json" \
  -d '{"action": "mark-read", "notificationId": "review-<TICKET_ID>"}'

# Mark update notification as read after phase completion
curl -X POST http://localhost:6969/api/notifications \
  -H "Content-Type: application/json" \
  -d '{"action": "mark-read", "notificationId": "update-<TICKET_ID>"}'
```

The notification IDs follow the format:
- `review-<TICKET_ID>` — for tickets in review queue
- `update-<TICKET_ID>` — for ticket status updates

This ensures the CTO Dashboard bell badge reflects only genuinely unread notifications.
