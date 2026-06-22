---
name: github-sync
description: "Sync feature branches with base branch, resolve conflicts, and manage branch lifecycle."
allowed-tools: read, write, edit, bash, git
---

# GitHub Sync Skill

Manages branch synchronization with base branch, conflict resolution, and branch lifecycle.

## Sync Strategies

### 1. Rebase (Recommended for Feature Branches)

```bash
# Rebase feature branch onto latest main
git checkout womono/WOMONO-084-github-skills
git fetch origin
git rebase origin/main

# Resolve conflicts if any
# git add .
# git rebase --continue

# Force push (only if branch not shared)
git push -f origin womono/WOMONO-084-github-skills
```

### 2. Merge (For Shared Branches)

```bash
# Merge main into feature branch
git checkout womono/WOMONO-084-github-skills
git fetch origin
git merge origin/main

# Resolve conflicts
# git add .
# git commit -m "merge: sync with main"

git push origin womono/WOMONO-084-github-skills
```

## Conflict Resolution

```bash
# Check conflicted files
git status

# For each conflicted file:
# 1. Open file, resolve conflicts (<<<<<<< ======= >>>>>>>)
# 2. Stage resolved file
git add path/to/resolved/file.ts

# 3. Continue rebase/merge
git rebase --continue
# OR
git commit -m "merge: resolve conflicts with main"
```

## Workflow

### Before Creating PR

```bash
# Ensure branch is up to date
github_sync sync_branch --branch_name womono/WOMONO-084-github-skills

# Run tests
npm test
```

### After Review Changes Requested

```bash
# Make changes
git add .
git commit -m "fix: address review comments"

# Sync with latest main before pushing
github_sync sync_branch --branch_name womono/WOMONO-084-github-skills

# Push
git push
```

## Available Tools

### `sync_branch`
Sync feature branch with base branch.
Parameters:
- `branch_name` (required): Feature branch name
- `base_branch` (optional): Base branch (default: "main")
- `strategy` (optional): "rebase" | "merge" (default: "rebase")
- `auto_resolve` (optional): Auto-resolve simple conflicts (default: false)

### `check_branch_status`
Check if branch is behind/ahead of base.
Parameters:
- `branch_name` (required): Branch name
- `base_branch` (optional): Base branch (default: "main")

### `resolve_conflicts`
Interactive conflict resolution helper.
Parameters:
- `branch_name` (required): Branch name
- `files` (optional): Specific files to resolve

### `cleanup_merged_branches`
Delete local branches that have been merged.
Parameters:
- `base_branch` (optional): Base branch (default: "main")
- `dry_run` (optional): Show what would be deleted (default: true)

### `update_base_branch`
Update local base branch from remote.
Parameters:
- `base_branch` (optional): Base branch (default: "main")

## Integration

- Called automatically before PR creation
- Used when review requests changes
- Cleans up branches after merge
- Respects branch protection rules (no force push to protected)