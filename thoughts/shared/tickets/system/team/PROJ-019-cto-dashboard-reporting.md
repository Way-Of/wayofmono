---
title: "[PROJ-019] CTO Dashboard & Developer Reporting System"
type: "Feature"
priority: "High"
status: "Backlog"
assignee: "@wo-team"
created: "2026-06-09"
---

## Context
The CTO (Craig) needs a unified dashboard to:
- View ALL tickets across all projects (WOW, OPT, PROJ, TEAM)
- See progress per developer, per project, per ticket namespace
- Review completed work submitted by developers
- Approve/reject work, request changes

Developers need a way to:
- Submit completed work for CTO review
- Link their personal tickets to shared tickets
- Notify CTO when work is ready for review
- Track review status (pending, approved, changes-requested)

Integration with GitHub:
- Auto-create PRs from completed tickets
- Link PRs to tickets
- CTO reviews via GitHub PR review flow
- Sync PR status back to ticket status

## Requirements & Scope
- [ ] Create `cto-dashboard` skill at `packages/@aiengineeringharness/skills/cto-dashboard/`
- [ ] Create `SKILL.md` with system prompt for CTO dashboard agent
- [ ] Create `dashboard.ts` - Core dashboard logic (Deno, cross-platform)
- [ ] Implement views:
  - [ ] `all-tickets` - Filter by project, namespace, status, assignee
  - [ ] `developer-progress` - Per-developer: assigned, in-progress, done, blocked
  - [ ] `project-health` - Per project: velocity, blockers, upcoming
  - [ ] `review-queue` - Tickets awaiting CTO review (submitted by developers)
- [ ] Implement developer reporting:
  - [ ] `submit-for-review <ticket-id>` - Developer marks ticket ready, notifies CTO
  - [ ] `review-action <ticket-id> approve|request-changes|reject` - CTO action
  - [ ] Auto-link to GitHub PR if repo connected
- [ ] GitHub integration:
  - [ ] `github-integration.ts` - Creates PRs, reads reviews, syncs status
  - [ ] Config: `.wo/config/github.json` (repo, token, auto-pr settings)
  - [ ] Webhook handler for PR events → ticket updates
- [ ] CLI commands:
  - [ ] `ai-harness cto dashboard` - Interactive TUI dashboard
  - [ ] `ai-harness cto review-queue` - List pending reviews
  - [ ] `ai-harness dev submit <ticket-id>` - Submit for review
  - [ ] `ai-harness dev status` - My tickets status
- [ ] Cross-platform: `.sh` + `.bat`/.ps1

## Technical Notes
- Dashboard reads from `thoughts/shared/tickets/` + all `thoughts/<dev>/tickets/`
- Uses team config (PROJ-018) for permissions and developer list
- Ticket status flow: `backlog` → `ready` → `in-progress` → `submitted-for-review` → `approved` → `done` / `changes-requested` → `in-progress`
- GitHub PR created on `submitted-for-review`, linked via `pr_url` in ticket frontmatter
- CTO review via GitHub PR review → updates ticket status
- Notifications: GitHub mentions, or local file `.wo/state/notifications.json`
- Cross-platform Deno scripts with `.sh`/`.bat`/`.ps1` wrappers

## Success Criteria
- [ ] `ai-harness cto dashboard` shows all tickets with filters
- [ ] `ai-harness dev submit WOW-001` creates GitHub PR, notifies CTO
- [ ] CTO approves in GitHub → ticket auto-updates to `approved`
- [ ] Developer sees review status in `ai-harness dev status`
- [ ] Dashboard shows per-developer velocity and blockers
- [ ] Works on Linux, macOS, Windows
- [ ] Integrates with Ticket Manager (PROJ-013) tools