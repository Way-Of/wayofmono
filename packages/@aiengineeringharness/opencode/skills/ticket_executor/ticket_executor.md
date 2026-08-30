---
name: ticket-executor
description: "Processes tickets sequentially (one at a time) and verifies work completion in the codebase. Uses sequential processing with verification after each ticket. Do not use with batch processing."
---

> **Platform**: OpenCode | **Skill**: ticket-executor | **Version**: 1.0.0
>
> _Auto-generated from canonical format. Do not edit directly._

# Ticket Executor Guide

## Overview

This skill processes tickets **sequentially** (one at a time) and verifies that all work described in a ticket has been completed in the codebase according to acceptance criteria. After each verification step, it reports back before proceeding to the next ticket.

## Key Features

- **Sequential Processing**: Never processes multiple tickets simultaneously.
- **Verification Step**: After each ticket, verifies:
  - Code changes in git
  - Tests passing
  - Documentation updated
  - Acceptance criteria met
- **Blockers Reported**: Reports issues before moving to next ticket.
- **Manual Override**: Allows manual intervention between tickets.

## Workflow

1. **Activation**: Activate when processing ticket queue or individual tickets.
2. **Sequential Load**: Load one ticket at a time.
3. **Verify Codebase**: Check acceptance criteria against code:
   - Files changed in repository?
   - Tests passing?
   - PR merged?
   - Documentation updated?
4. **Block if Needed**: If verification fails, report and stop.
5. **Report Status**: After each ticket, report verification results.
6. **Proceed if Verified**: Only move to next ticket if all checks pass.

## Example Usage

### Process One Ticket

```bash
<work ticket_executor id=WOMONO-001>
```

### Process Queue

```bash
<work ticket_executor queue=wayofmon>
```

### Manual Mode

```bash
<work ticket_executor id=WOW-001 mode=manual>
```

## What Gets Verified

For each ticket, this skill checks:

- **Git Changes**: Code commits/PRs exist for ticket
- **Test Status**: All tests passing (or known failures documented)
- **Documentation**: Docs updated for new features
- **Acceptance Criteria**: Checklist from ticket marked complete
- **Production-Ready Standard**:
  - No mock data in prod code
  - Error handling in place
  - Observability (logging/tracing)
  - Security (RBAC, audit)

## Comparison: Sequential vs Batch

| Feature | Sequential | Batch |
|---------|-----------|-------|
| Processing | One ticket at a time | All tickets simultaneously |
| Verification | After each ticket | All tickets together |
| Failure Response | Block and report | May continue with others |
| Manual Intervention | Supported | Requires restart |

## Use Cases

- **Production Deploy**: Need to verify each ticket before next.
- **Critical Fixes**: One at a time until verified.
- **Manual Review**: Need human approval between tickets.
- **QA Testing**: Ensure each change passes tests.

## Do NOT Use

- When fast batch processing is needed
- When tickets don't need individual verification
- When all tickets can fail together
- For non-critical or test-tickets without AC

## Related Skills

- `ticket_manager`: Lifecycle management, ticket creation
- `ticket_context`: Initial ticket association
- `validate_plan`: Pre-work acceptance criteria validation
