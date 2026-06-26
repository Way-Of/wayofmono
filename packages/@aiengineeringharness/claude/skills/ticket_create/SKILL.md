---
name: ticket_create
description: "Interactive ticket creation wizard. Delegates to the ticket-manager skill."
allowed-tools: Read, Bash, Glob, Grep
disable-model-invocation: true
---

# /ticket-create — Interactive ticket creation wizard

Activates the [ticket-manager](skills/ticket_manager/SKILL.md) skill to perform this operation.

## Usage
```
/ticket-create
```

## Process
1. This command activates the `ticket-manager` skill
2. Follow that skill's workflow to complete the operation
3. Report results to the user
