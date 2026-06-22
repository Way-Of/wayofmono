---
name: github_branch
description: "Create and manage GitHub feature branches from tickets. Ensures proper branch naming, ticket linking, and base branch selection."
allowed-tools: read, write, edit, bash, git
---

# GitHub Branch Skill

Creates and manages feature branches for tickets with proper naming conventions and GitHub integration.

## Branch Naming Convention

```
<namespace>/<ticket-id>-<short-description>
```

Examples:
- `womono/WOMONO-084-github-skills`
- `wow/WOW-001-user-auth`
- `opticat/OPT-003-simulator-fix`

## Workflow

### 1. Create Branch from Ticket

```bash
# From ticket ID, auto-detect namespace and create branch
git checkout main
git pull origin main
git checkout -b womono/WOMONO-084-github-skills
```

### 2. Push Branch to Origin

```bash
git push -u origin womono/WOMONO-084-github-skills
```

### 3. Create PR (handled by github_pr skill)

Branch is now ready for PR creation.

## Available Tools

### `create_branch_from_ticket`
Create feature branch from ticket ID.
Parameters:
- `ticket_id` (required): Ticket ID (e.g., "WOMONO-084")
- `description` (optional): Short description for branch name
- `base_branch` (optional): Base branch (default: "main")

### `push_branch`
Push branch to origin with upstream tracking.
Parameters:
- `branch_name` (required): Branch name
- `force` (optional): Force push (default: false)

### `sync_branch`
Sync feature branch with base branch.
Parameters:
- `branch_name` (required): Branch name
- `base_branch` (optional): Base branch (default: "main")

### `delete_branch`
Delete local and remote branch after merge.
Parameters:
- `branch_name` (required): Branch name
- `remote` (optional): Also delete remote (default: true)

## Multi-Machine Awareness

- **Never push directly to main**: Always create a new feature branch for every change — pushing directly to main is forbidden
- **Pull before creating**: `git pull origin main` before branching to ensure you branch from the latest
- **Push upstream**: Always push with `-u` so other machines can see and check out the branch
- **Fetch before switch**: If branch was created on another machine, `git fetch origin && git checkout <branch>` to pull it locally
- **Never force-push shared branches**: If a branch is used by multiple machines, use merge instead of rebase + force-push

## Integration

- Uses `ticket-manager` to get ticket details
- Branch name includes ticket ID for traceability
- Auto-sets upstream tracking on push
- Respects branch protection rules