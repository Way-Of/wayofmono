---
name: ticket_executor
description: "Processes tickets one at a time (non-batch) and verifies in the codebase that work mentioned in tickets has been completed according to acceptance criteria. Enforces sequential processing with verification after each ticket."
---

# Ticket Executor Skill

This skill processes tickets sequentially (one at a time) and verifies that all work described in a ticket has been completed in the codebase according to acceptance criteria.

## Overview

Unlike batch processing skills, this skill:
- Processes tickets **one-by-one** (not all at once)
- **Verifies completion** against the codebase after each ticket
- Reports progress after each individual ticket
- Supports manual intervention between tickets

## Workflow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Load Ticket │───>│ Process     │───>│ Verify      │
│ (Sequential)│    │ Ticket      │    │ Complete?   │
└─────────────┘    └─────────────┘    └─────────────┘
                              │
                     ┌────────┴────────┐
                     │                 │
                Yes (Done?)          No
                     │                 │
                     ▼                 ▼
              ┌──────────┐      ┌──────────┐
              │ Update   │      │ Block &  │
              │ Status   │      │ Report    │
              └──────────┘      └──────────┘
```

## Activation Commands

Use in `<CONTEXT>` or activate via:

```bash
<work ticket_executor start=<ticket-id>>
```

## Processing Flow

1. **Sequential Load**: Load one ticket at a time from `thoughts/<project>/shared/tickets/<ID>.md`
2. **Verify Codebase**: Check if acceptance criteria are met in code:
   - Files changed?
   - Tests passing?
   - PR merged?
   - Documentation updated?
3. **Block Next**: Do NOT proceed to next ticket until current is verified
4. **Report Status**: After each ticket, report:
   - What was verified
   - Missing items (if any)
   - Next ticket to process (if applicable)

## Ticket Status Mapping

| Ticket Status | Executor Action |
|--------------|-----------------|
| `In Progress` | Process and verify completion |
| `Submitted for Review` | Verify PR merged |
| `Approved` | Verify all AC met |
| `Done` | Confirm completion in code |

## Verification Checklist

After processing each ticket, verify:

- [ ] Code changes exist in git (commit/PR merged)
- [ ] Tests passing (`npm test` or repo tests)
- [ ] Documentation updated
- [ ] Acceptance criteria checklist complete
- [ ] No mock data in production code
- [ ] Error handling implemented
- [ ] Observability/logging in place
- [ ] Security (RBAC, audit) addressed

## Usage Examples

### Process Single Ticket

```bash
<work ticket_executor id=WOMONO-001>
```

### Process All Tickets in Queue

```bash
<work ticket_executor queue=wayofmono>
```

### Manual Approval Mode

```bash
<work ticket_executor id=WOW-001 mode=manual>
```

## Tools Required

- `read` (ticket files)
- `glob`/`find` (locate changes)
- `grep` (verify patterns)
- `ls`/`tree` (check structure)
- `git` operations (verify commits)
- `npm`/`make` (run tests)

## Platforms

- `claude` | `opencode` | `gemini` | `pi` | `wocoder` | `antigravity` | `codex`

## Examples

### Ticket Processing Report

```
=== TICKET: WOW-001 ===
Status: IN_PROGRESS

Verification Results:
✓ Code changes committed (commit: abc123)
✓ All tests passing (142 tests)
✓ Documentation updated
✗ Acceptance criteria: "Error handling" - NOT MET
  → Missing try/catch in /services/api/user.ts

Action: Block next ticket until error handling is added.
```

### Queue Processing

```
=== PROCESSING QUEUE: wayofmono ===
[1/7] WOMONO-005 ✓ Complete
[2/7] WOMONO-006 ✓ Complete
[3/7] WOMONO-007 ✓ Complete
...

Remaining: 7 tickets
Completed: 3 tickets
Blocked: 0 tickets (pending manual review)
```

## Rules

- **ONE-AT-A-TIME**: Never process multiple tickets simultaneously.
- **VERIFY BEFORE NEXT**: Do not proceed to next ticket until current is fully verified.
- **REPORT BLOCKERS**: If a ticket cannot be verified, report and block.
- **TRACK STATUS**: Update ticket status after verification.
- **MANUAL OVERLAY**: Always ask for manual intervention between tickets.
