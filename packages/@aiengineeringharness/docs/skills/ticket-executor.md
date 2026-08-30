---
name: ticket-executor
description: "Execute approved plans in phases, validating telemetry and committing changes after each phase completes successfully"
version: 1.0.0
namespace: core
tools: read, write, grep, glob, WebSearch
platforms: [claude, opencode, gemini, pi, wocoder, antigravity, codex]
allowed-tools: [read, write, grep, glob, web_search]
dependencies: [ticket-manager]
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

After each phase completes:
- Capture execution time and result
- Track error rates and success metrics
- Compare against plan expectations
- Generate telemetry report

## Validations

- Code quality checks with `code_quality_check`
- Performance benchmarks
- Security scanning
- Dependency updates

## Commit Rules

Only commit after telemetry validation passes. Commits follow:
- CoC style guide
- Proper commit messages
- One logical change per commit