---
title: "[PROJ-021] Personal TODO Hierarchy: Link Personal → Shared → Global"
type: "Feature"
priority: "High"
status: "Backlog"
assignee: "@wo-team"
created: "2026-06-09"
---

## Context
Each developer has a personal workspace in `thoughts/<dev>/` with their own TODO.md. We need a hierarchical system:

```
Global/Shared (thoughts/shared/)
├── TODO.md                    # Master backlog: all WOW-XXX, PROJ-XXX, OPT-XXX tickets
├── tickets/
│   ├── WOW-001.md
│   ├── PROJ-013.md
│   └── OPT-001.md

Personal (thoughts/<dev>/)
├── TODO.md                    # My tasks: links to shared tickets + personal breakdown
├── tickets/
│   ├── CRAIG-001.md           # Personal ticket: "Review PROJ-013 PRD"
│   └── CRAIG-002.md           # Personal ticket: "Approve WOW-001 implementation"
└── plans/
```

**Linking Rules:**
- Personal TODO.md auto-generates from assigned shared tickets
- Personal tickets reference parent shared ticket via `parent_ticket` frontmatter
- Shared tickets track `sub_tasks` linking to personal tickets
- CTO sees all personal TODOs aggregated
- Developer sees only their personal TODO + assigned shared tickets

## Requirements & Scope
- [ ] Update `ticket-manager` skill (PROJ-013) to support hierarchy
- [ ] Create `personal-todo-generator.ts` - Generates personal TODO.md from shared tickets
- [ ] Implement `sync-personal-todos()` - Runs on ticket assignment/change:
  - [ ] Reads `thoughts/shared/tickets/` for tickets assigned to developer
  - [ ] Generates `thoughts/<dev>/TODO.md` with sections per shared ticket
  - [ ] Includes checkboxes linking to shared ticket status
  - [ ] Adds "Personal Breakdown" section for developer's sub-tasks
- [ ] Personal ticket template: `thoughts/shared/tickets/personal-ticket-template.md`
- [ ] CLI commands:
  - [ ] `ai-harness todo sync` - Regenerate all personal TODOs
  - [ ] `ai-harness todo show` - Show my personal TODO
  - [ ] `ai-harness todo add <shared-ticket-id> "sub-task"` - Add personal sub-task
- [ ] CTO command: `ai-harness cto todo-all` - Show all developers' TODOs
- [ ] Cross-platform: `.sh` + `.bat`/.ps1

## Technical Notes
- Personal TODO.md format:
  ```markdown
  # TODO - Craig (CTO)
  
  ## Assigned Shared Tickets
  ### WOW-001: Implement Ticket Manager
  - [ ] Review PRD (personal: CRAIG-001)
  - [ ] Approve architecture (personal: CRAIG-002)
  
  ### PROJ-013: Ticket Manager Skill
  - [x] Define tool schemas
  - [ ] Review implementation
  
  ## Personal Tickets (thoughts/craig/tickets/)
  - [ ] CRAIG-001: Review PROJ-013 PRD → links to PROJ-013
  - [ ] CRAIG-002: Approve WOW-001 arch → links to WOW-001
  
  ## Blocked / Waiting
  - Waiting on PROJ-014 (skill-auto-update) for WOW-001
  ```
- Sync triggered by: ticket assignment change, status change, `ai-harness todo sync`
- Developer checks off personal sub-tasks → updates personal ticket status
- Shared ticket status aggregates from personal sub-tasks (optional: all sub-tasks done → shared ready for review)
- Cross-platform Deno script with `.sh`/`.bat`/`.ps1` wrappers

## Success Criteria
- [ ] `thoughts/<dev>/TODO.md` auto-generated from shared ticket assignments
- [ ] Checkboxes in personal TODO link to shared ticket status
- [ ] Personal tickets in `thoughts/<dev>/tickets/` reference parent shared ticket
- [ ] CTO sees aggregated view via `ai-harness cto todo-all`
- [ ] Developer adds sub-tasks via `ai-harness todo add`
- [ ] Works on Linux, macOS, Windows
- [ ] Integrates with Ticket Manager (PROJ-013) and CTO Dashboard (PROJ-019)