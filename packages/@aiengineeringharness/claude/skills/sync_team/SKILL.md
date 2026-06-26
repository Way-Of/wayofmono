---
name: sync_team
description: "Show team ticket dashboard. Delegates to the ticket-manager skill."
allowed-tools: Read, Bash, Glob, Grep
disable-model-invocation: true
---

# /sync-team — Show team ticket dashboard

Activates the [ticket-manager](skills/ticket_manager/SKILL.md) skill to perform this operation.

## Usage
```
/sync-team
```

## Process
1. This command activates the `ticket-manager` skill
2. Follow that skill's workflow to complete the operation
3. Report results to the user
