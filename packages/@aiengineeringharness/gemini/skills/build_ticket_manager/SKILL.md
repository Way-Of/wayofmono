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
- /create_ticket <project> <ticket-type> <title> - Create new ticket
- /update_ticket <id> <fields> - Update ticket fields
- /merge_tickets <id1> <id2> - Merge two tickets
- /delete_ticket <id> --reason=... - Delete with reason
