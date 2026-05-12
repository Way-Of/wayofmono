---
name: wom-worktree
description: Manage git worktrees for parallel WayOfMono development.
---
# /wom-worktree

Enable high-velocity, parallel engineering by managing isolated git worktrees. This allows you to implement multiple vertical slices simultaneously without context pollution.

## Goal
Automate the setup and teardown of worktrees for specific tickets or implementation plans.

## Workflow
1. **Initialize:** `/wom-worktree create [ticket-id]` - Creates a fresh directory and branch for the task.
2. **Switch:** `/wom-worktree list` - Displays active worktrees and their current status.
3. **Cleanup:** `/wom-worktree remove [ticket-id]` - Merges (if approved) and safely removes the worktree.

## Integration
- **Wom-Architect:** Automatically suggests a new worktree upon plan approval.
- **Wom-Coder:** Operates exclusively within the created worktree to ensure isolation.
