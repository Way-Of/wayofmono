---
name: ticket_executor
description: Execute approved plans in phases, validating telemetry and committing changes after each phase completes successfully
allowed-tools: Read, Write, Grep, Glob, Web, Search
---

# Ticket Executor skill

Executes approved plans in phases, with validation and telemetry tracking after each phase.

## Enforcement Ticket Priority

**Enforcement tickets** override all other tickets. Before executing any plan, check for active enforcement tickets. If any exist with status != "Done", pause and resolve them first.

## Workflow

```
Ticket → /create_plan → /implement_plan → /validate_plan → /validate_telemetry → /commit
```

## Phase Execution

For each phase:
1. Read plan phase
2. Execute phase work
3. Knowledge capture — "Did this phase discover any non-obvious solutions?"
4. Validate phase output
5. Update ticket Work Log
6. Commit phase changes

## Completion Flow

When the last phase completes:
1. Run full validation
2. Knowledge capture — final check for learnings
3. CHANGELOG prompt — suggest entry
4. Move ticket to done/
5. Remove from personal folder
6. Regenerate TODO.md

## Archive Awareness

- Active work in `shared/tickets/`
- Reference `done/` for similar past work
- Never modify files in done/, deprecated/, or legacy/

## Commands

- `/implement_plan <ticket-id>` - Execute plan phase-by-phase
- `/execute_phase <ticket-id> <phase>` - Execute specific phase
- `/skip_phase <ticket-id> <phase>` - Skip phase with reason

## Telemetry

- Capture execution time
- Track error rates
- Compare against plan expectations

## CTO Dashboard UI Integration

Agents should respect the UI status as the current state:
- `update_ticket` with `status: "In Progress"` when starting
- `update_ticket` with `status: "In Review"` when submitting
- `update_ticket` with `status: "Done"` when complete

## Notification Integration

```bash
curl -X POST http://localhost:6969/api/notifications \
  -H "Content-Type: application/json" \
  -d '{"action": "mark-read", "notificationId": "review-<TICKET_ID>"}'
```
