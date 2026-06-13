---
name: ticket_executor
description: >-
  Execute approved plans in phases, validating telemetry and committing changes
  after each phase completes successfully
allowed-tools: 'read, write, grep, glob, web, search'
---

# Ticket Executor Skill

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
