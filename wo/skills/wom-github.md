---
name: wom-github
description: Real-time GitHub PR and Issue tracking.
trigger: auto
---

# Wom-Github Skill

This skill integrates our monorepo agents with the GitHub platform for real-time tracking of issues, pull requests, and collaborator activity.

## Capabilities
- **PR Tracking:** Monitor the status of pull requests related to active tickets.
- **Issue Querying:** Search for similar issues across the organization.
- **Auto-Update:** Link monorepo commits to GitHub issues automatically using the `wom-commit` command.

## Workflow
- **Activity:** Automatically surfaces new PR comments or review requests in the agent's context.
- **Synchronization:** Keeps `thoughts/shared/tickets/` in sync with GitHub Issue states.
