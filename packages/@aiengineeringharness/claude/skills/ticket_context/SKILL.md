---
name: ticket-context
description: Associates work with a specific ticket ID across all WoM projects (WOMONO, WOW, OPT). Use when initiating new work to ensure compliance and production-ready standards.
---

# Ticket Context Guide

## Overview

This skill ensures all work is linked to an approved ticket from the correct namespace, following WoM naming conventions and production-ready standards.

## Ticket Namespaces

| Prefix | Project | Storage |
|--------|---------|---------|
| WOMONO-XXX | WayOfMono | `thoughts/wayofmono/shared/tickets/` |
| WOW-XXX | WayOfWork | `thoughts/wow/shared/tickets/` |
| OPT-XXX | Opticat | `thoughts/opticat/shared/tickets/` |

## Workflow

1. **Activation**: Activate when starting any new task, feature, or bug fix.
2. **Ticket ID Prompt**: Ask the user for the ticket ID in `<PREFIX>-<NNN>` format (e.g., `WOMONO-051`, `WOW-001`, `OPT-003`).
3. **Load Context**: Read the ticket from `thoughts/<project>/shared/tickets/<PREFIX>-<NNN>-*.md`.
4. **Production-Ready Standard**: Every ticket's acceptance criteria must include no mock data in application code, proper error handling, observability, security, edge case coverage, and tests for failure modes. If missing, flag it.
5. **Compliance Reminder**: All work must align with the ticket's AC and WoM best practices. If any AC would be violated, stop and clarify.

## Usage

*   When beginning a new task, activate this skill.
*   Provide a ticket ID like `WOMONO-051`, `WOW-001`, or `OPT-003`.
*   The skill loads the full ticket context from `thoughts/<project>/shared/tickets/`.

## Rules

*   All code changes, feature implementations, and bug fixes **must** be associated with an existing ticket.
*   Tickets are stored at `thoughts/<project-slug>/shared/tickets/<PREFIX>-<NNN>-<DESCRIPTION>.md`.
*   New tickets follow the naming convention and template in `thoughts/shared/tickets/ticket-template.md`.
*   The `ticket_manager` skill has full lifecycle management. This skill ensures adherence to the process.

