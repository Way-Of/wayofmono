---
name: submit_for_review
description: "Submit ticket for CTO review. Delegates to the ticket-manager skill."
allowed-tools: Read, Bash, Glob, Grep
disable-model-invocation: true
---

# /submit-for-review — Submit ticket for CTO review

Activates the [ticket-manager](skills/ticket_manager/SKILL.md) skill to perform this operation.

## Usage
```
/submit-for-review
```

## Process
1. This command activates the `ticket-manager` skill
2. Follow that skill's workflow to complete the operation
3. Report results to the user
