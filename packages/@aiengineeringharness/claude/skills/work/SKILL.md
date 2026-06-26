---
name: work
description: "Start working on a ticket, update status to In Progress. Delegates to the ticket-manager skill."
allowed-tools: Read, Bash, Glob, Grep
disable-model-invocation: true
---

# /work — Start working on a ticket, update status to In Progress

Activates the [ticket-manager](skills/ticket_manager/SKILL.md) skill to perform this operation.

## Usage
```
/work
```

## Process
1. This command activates the `ticket-manager` skill
2. Follow that skill's workflow to complete the operation
3. Report results to the user
