---
name: wow-tickets
description: Manage WOW tickets for tracking system knowledge, documentation needs, and refinement requests within the Way of Work system.
---

# Understanding Tickets Management

## Overview

This skill handles WOW-prefixed tickets that capture requests to improve system understanding, documentation needs, feature enhancements, and knowledge gaps.

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

## Desired Outcome
[What the system should do/be/become]

## Current Behavior/Problem
[Current behavior or issues]

## Current Understanding
[Current understanding, investigation findings, what's known]

## Possible Solutions
[Multiple approaches, trade-offs, research references]

## Technical Requirements
[System requirements, constraints, dependencies]

## Steps to Resolve
[Concrete action items]

## Notes
[Additional context, background information]
```

## Ticket Priorities

| Priority | Use Case | Response Time |
|---|---|---|
| **High** | Critical functionality broken, security issues | Immediate attention |
| **Medium** | Important features, UX improvements | Within 24 hours |
| **Low** | Nice-to-have enhancements, documentation | As time permits |
| **Triage** | Needs analysis before action | Review and categorize |
| **Block** | Road-blocking dependencies, blockers | Address ASAP |
