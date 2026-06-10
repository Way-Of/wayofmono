---
name: ticket-context
description: "Guides agents and developers to associate work with a specific ticket ID before proceeding with tasks. Use this skill when initiating new work or making changes to ensure compliance with the ticketing system, following the WOW-XXX-description.md format."
allowed-tools: [""]
---

> **Platform**: Gemini CLI | **Skill**: ticket-context | **Version**: 1.0.0
>
> _Auto-generated from canonical format. Do not edit directly._


# Ticket Context Guide

## Overview

This skill helps ensure that all work performed is explicitly linked to an approved ticket within the project's ticketing system. By requiring a ticket association, it reinforces the mandatory project workflow and prevents the creation of untracked or "random" work.

## Workflow

1.  **Activation**: This skill should be activated by the agent when starting any new task, feature implementation, or bug fix.
2.  **Ticket ID Prompt**: Upon activation, the skill will prompt the user (or the agent itself, if in an autonomous context) to provide the relevant ticket ID in the `WOW-XXX-description.md` format.
3.  **Context Storage**: The provided ticket ID will be stored as a session-specific context. All subsequent actions within that session are implicitly associated with this ticket.
4.  **Compliance Reminder**: The agent is reminded that all work must align with the objectives and acceptance criteria defined in the referenced ticket.

## Usage

To use this skill:
*   When beginning a new task, activate this skill.
*   The skill will prompt you to enter the ticket ID.
*   Enter the ticket ID (e.g., `WOW-001-fix-routing-imports`) corresponding to the task you are working on.

## Rules

*   All code changes, feature implementations, and bug fixes **must** be associated with an existing ticket.
*   Refer to the `thoughts/shared/tickets/WOW-*.md` files for detailed ticket information and requirements.
*   The `backlog-groomer` skill is responsible for creating and maintaining these tickets. This skill helps ensure adherence to that process.

