---
name: complete
description: "Complete a ticket, submit for review. Delegates to the ticket-manager skill."
allowed-tools: Read, Bash, Glob, Grep
disable-model-invocation: true
---

# /complete — Complete a ticket, submit for review

Activates the [ticket-manager](skills/ticket_manager/SKILL.md) skill to perform this operation.

## Usage
```
/complete
```

## Process
1. This command activates the `ticket-manager` skill
2. Follow that skill's workflow to complete the operation
3. Report results to the user
