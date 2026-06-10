---
name: cto-dashboard
description: "CTO dashboard with ticket overview, developer progress, review queue, and GitHub PR integration"
version: 1.0.0
namespace: core
tools: read,grep,glob,ls,write
platforms: [claude, opencode, gemini, pi, wocoder, antigravity, codex]
allowed-tools: [read, grep, glob, ls, write]
dependencies: [ticket-manager]
---

# CTO Dashboard & Developer Reporting (PROJ-019)

Provides a unified dashboard for CTO to review all tickets, track developer progress, and manage the review queue.

## Views

- `all-tickets` - Filter by project, namespace, status, assignee
- `developer-progress` - Per-developer: assigned, in-progress, done, blocked
- `project-health` - Per project: velocity, blockers, upcoming
- `review-queue` - Tickets awaiting CTO review

## Developer Workflow

1. Developer runs `/work <ticket-id>` to start
2. Developer runs `/complete <ticket-id>` when done → sets "Submitted for Review"
3. CTO reviews: approve, request-changes, or reject
4. Approved → auto-updates ticket status, merges PR if linked
5. Changes requested → ticket goes back to "In Progress"

## GitHub Integration

- Auto-create PRs from completed tickets
- Link PRs to tickets via `pr_url` frontmatter
- CTO reviews via GitHub PR review flow
- Sync PR status back to ticket status

## Commands

- `ai-harness cto dashboard` - Interactive TUI dashboard
- `ai-harness cto review-queue` - List pending reviews
- `ai-harness dev submit <ticket-id>` - Submit for review
- `ai-harness dev status` - My tickets status
