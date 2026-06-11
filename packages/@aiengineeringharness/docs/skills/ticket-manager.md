---
name: ticket-manager
description: "Create, update, merge, and delete tickets with proper namespace validation and compliance checking"
version: 1.0.0
namespace: core
tools: read, write, grep, glob
platforms: [claude, opencode, gemini, pi, wocoder, antigravity, codex]
allowed-tools: [read, write, grep, glob]
dependencies: []
---

# Ticket Manager Skill

Core ticket management for creating, updating, merging, and deleting tickets with proper namespace validation.

## Commands

- `/create_ticket <project> <ticket-type> <title>` - Create new ticket
- `/update_ticket <id> <fields>` - Update ticket fields
- `/merge_tickets <id1> <id2>` - Merge two tickets
- `/delete_ticket <id> --reason=...` - Delete with reason

## Namespace Validation

Validates tickets against namespace rules before allowing actions:
- `PROJ-XXX` - Project tickets
- `WOMONO-XXX` - WayOfMono tickets
- `WOW-XXX` - WayOfWork tickets
- `OPT-XXX` - Opticat tickets
- `TEAM-XXX` - Team tickets

## Compliance Checking

Before any action:
- Check frontmatter completeness
- Validate namespace format
- Ensure allowed-tools are set
- Verify dependencies are valid

## Lifecycle

1. **Created** - `status: open`, `priority: low`
2. **In Progress** - `status: in-progress`, assigned to developer
3. **Review** - `status: review`, pending approve
4. **Completed** - `status: completed`, moved to backlog
5. **Archived** - `status: archived`, >30 days old
