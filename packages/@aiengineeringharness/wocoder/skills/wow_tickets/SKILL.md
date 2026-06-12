---
name: wow_tickets
description: >-
  Manage understanding tickets (WOW- prefixed tickets) for tracking system
  knowledge and refinement requests
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags:
      - tickets
      - backlog
      - understanding
      - knowledge-management
---

# Understanding Tickets Management

Skills for managing, reviewing, and tracking understanding tickets (WOW- prefixed tickets in Way of Work system). These tickets capture requests to improve system understanding, documentation needs, feature enhancements, and knowledge gaps.

## Quick Start

```bash
# View pending understanding tickets
ls thoughts/shared/tickets/WOW-*.md | grep "status: Backlog"

# Review ticket details
think thoughts/shared/tickets/WOW-107-vnc-database-authentication.md

# Check ticket list
ls thoughts/shared/tickets/WOW-*.md > tickets-pending.txt
```

## Ticket Structure

Each understanding ticket should follow this structure:

```markdown
---
title: Brief, descriptive title
priority: High | Medium | Low | Triage | Block
status: Backlog | In Progress | Needs Discussion | Awaiting Implementation
tags: [relevant, tags, here]
related: []
---

## Önskat resultat (Desired Outcome)
[What the system should do/be/become]

## Nuvarande beteende/problem
[Current behavior or issues]

## Underskökning
[Current understanding, investigation findings, what's known]

## Möjliga lösningar
[Multiple approaches, trade-offs, research references]

## Teknikal krav
[System requirements, constraints, dependencies]

## Steps för att åtgärda
[Concrete action items]

## Notes
[Additional context, background information]

## Checklist
- [ ] Action item 1
- [ ] Action item 2
```

## Ticket Priorities

| Priority | Use Case | Response Time |
|----------|----------|---------------|
| **High** | Critical functionality broken, security issues | Immediate attention |
| **Medium** | Important features, UX improvements | Within 24 hours |
| **Low** | Nice-to-have enhancements, documentation | As time permits |
| **Triage** | Needs analysis before action | Review and categorize |
| **Block** | Road-blocking dependencies, blockers | Address ASAP |
