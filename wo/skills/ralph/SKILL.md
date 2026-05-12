---
name: ralph
description: Ralph Wiggum queue worker for file-based task processing (todo→inprogress→done) with HTML output generation and agent team escalation for complex tasks requiring scout/planner/builder/reviewer/code-documenter/documenter assistance.
license: MIT
metadata:
  buddybot:
    emoji: 🧺
    requires:
      bins: []
    os: ["linux", "darwin", "win32"]
allowed-tools: Bash(ralph:*)
---

# Ralph Queue Worker

## Setup

```bash
cd ~/.pi/agent/skills/ralph && npm install
```

## Usage

```bash
# Process todo queue
ralph todo

# Move to in-progress
ralph progress "task-id"

# Update task status
ralph update "task-id" "status"

# Escalate complex tasks
ralph escalate "task-id" "reasons"
```

## Workflow

1. **Todo** — Tasks in queue
2. **In Progress** — Being worked on
3. **Done** — Completed tasks
4. **Escalate** — Complex tasks needing team help

## Integration

- Works with scout (research)
- Planning (task breakdown)
- Builder (execution)
- Reviewer (quality check)
- Code-documenter (docs)

## Notes

- HTML output generation
- File-based task tracking
- Agent team coordination
