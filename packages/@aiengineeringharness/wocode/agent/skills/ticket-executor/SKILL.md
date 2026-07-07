---
name: ticket-executor
description: Execute approved plans in phases, validating telemetry and committing changes after each phase completes successfully
allowed-tools: read, write, grep, glob, web, search
---

# Ticket Executor skill

Executes approved plans in phases, with validation and telemetry tracking after each phase.

## Enforcement Ticket Priority

**Enforcement tickets** (in `thoughts/<project-slug>/enforcement-ticket/`) **override all other tickets**. Before executing any plan:

1. Check for active enforcement tickets: `ls thoughts/<project-slug>/enforcement-ticket/*.md 2>/dev/null`
2. If any enforcement ticket has status != "Done", **pause non-enforcement work immediately**
3. Switch to resolving the enforcement ticket first
4. Only resume non-enforcement tickets after all enforcement tickets are "Done"

## Workflow

```
Ticket → /create_plan → /implement_plan → /validate_plan → /validate_telemetry → /commit
```

## Phase Execution

For each phase of the plan:

```
Step 1: Read plan phase
Step 2: Execute phase work
Step 3: Knowledge capture check
        → "Did this phase discover any non-obvious solutions or workarounds?"
        → If yes: Store in knowledge base (thoughts/global/knowledge/ + Anchor MCP)
Step 4: Validate phase output
Step 5: Update ticket Work Log with phase completion
Step 6: Commit phase changes
Step 7: Report phase completion to user
```

## Completion Flow

When the last phase completes:

```
Step 1: Run full validation
Step 2: Knowledge capture — final check for learnings
Step 3: CHANGELOG prompt — suggest entry for completed ticket
Step 4: Move ticket to done/ via git mv
Step 5: Remove from personal folder (if present)
Step 6: Regenerate TODO.md
Step 7: Report: "Ticket <ID> complete. <N> knowledge entries stored."
```

## Archive Awareness

- Active work happens in `shared/tickets/`
- Completed phases reference `done/` for similar past work
- Never modify files in `done/`, `deprecated/`, or `legacy/`

## Personal Folder Sync

After each phase, verify the ticket copy in the developer's personal folder is up to date. If the agent is working from the personal folder, sync changes back to shared/tickets/.

## Domain Awareness

Respect the ticket's `domain` field. If the work crosses domains (e.g., backend ticket requires frontend changes), note the cross-domain work in the ticket's Work Log.

## Commands

- `/implement_plan <ticket-id>` - Execute approved plan phase-by-phase
- `/execute_phase <ticket-id> <phase>` - Execute specific phase
- `/skip_phase <ticket-id> <phase>` - Skip phase with reason

## Telemetry

- Capture execution time
- Track error rates
- Compare against plan expectations

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
curl -X POST http://localhost:6969/api/notifications \
  -H "Content-Type: application/json" \
  -d '{"action": "mark-read", "notificationId": "review-<TICKET_ID>"}'
```
