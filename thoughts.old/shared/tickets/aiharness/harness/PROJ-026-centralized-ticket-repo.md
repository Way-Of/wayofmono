---
title: "[PROJ-026] Centralized Ticket Repository — Extract thoughts/ to shared f-rr-d repo"
type: "Feature"
priority: "High"
status: "In Progress"
assignee: "@zerwiz"
reporter: "@zerwiz"
project: "PROJ"
namespace: "proj"
category: "system"
role_required: "lead"
parent_ticket: ""
shared_tickets: "[]"
pr_url: ""
github_issue: "https://github.com/Way-Of/f-rr-d"
created: "2026-06-09"
updated: "2026-06-09"
reviewed_by: ""
reviewed_at: ""
---

## Context

Currently `thoughts/` lives inside the wayofmono monorepo. Tickets, research, plans, and personal TODO hierarchies are all tied to a single project. We need to:

1. Extract `thoughts/` into a standalone shared repo (`github.com/Way-Of/f-rr-d`) that acts as the global ticket/thoughts hub for all projects.
2. When `init harness` runs in any project, it clones/downloads `thoughts/` from `f-rr-d` into the project.
3. The repo organizes tickets into subfolders per project (e.g., `wayofmono/`, `wo/`, etc.) so a single repo serves multiple codebases.

## Requirements & Scope

- [x] Create `github.com/Way-Of/f-rr-d` repo with the canonical `thoughts/` structure (already existed)
- [x] Create subfolder per project (e.g., `thoughts/wayofmono/`, `thoughts/wo/`, etc.)
- [x] Migrate existing tickets from `wayofmono/thoughts/shared/tickets/` into `f-rr-d/thoughts/wayofmono/tickets/`
- [x] Migrate existing personal thoughts (`thoughts/craig/`, `thoughts/josef/`, etc.) into `f-rr-d/thoughts/wayofmono/`
- [x] Update `harness init` (team-init.ts) to clone `f-rr-d` into project root on init
- [x] Ensure `.gitignore` excludes `thoughts/` in wayofmono (it's now a separate clone)
- [x] Update `TODO.md` to reference new ticket structure
- [x] Update ticket manager sync logic (sync.ts) — pull/push from f-rr-d, project-scoped paths
- [x] Add `f-rr-d` URL to harness config (.wo/config/harness.json) so repo location is configurable
- [x] Update monitor.ts — pull before scan, push after ticket creation
- [x] Update dashboard.ts — pull before load
- [x] Update help.ts — project-scoped path references
- [x] Copy updated files to all 7 platforms (claude, opencode, gemini, pi, wocoder, antigravity, codex)
- [ ] Write migration script to move existing tickets without losing history (git history already preserved)

## Technical Notes

- `thoughts/` becomes a git submodule pointing to `github.com/Way-Of/f-rr-d`, or is managed by the harness init script as an independent clone
- The harness config (`.wo/config/`) should store the `f-rr-d` repo URL so teams can use their own fork
- Ticket manager sync.ts needs to read project namespace from folder structure to route tickets correctly
- `init harness` should: `git clone <f-rr-d-url> thoughts/` and then symlink or copy into the project
- Personal thoughts should remain per-project but can optionally be synced to the shared repo under the project's folder

## Success Criteria

- [ ] `github.com/Way-Of/f-rr-d` exists with `thoughts/wayofmono/` containing all current tickets
- [ ] Running `init harness` in a fresh project clones f-rr-d into `thoughts/`
- [ ] Ticket manager can read/write tickets across multiple project folders in the shared repo
- [ ] `TODO.md` in f-rr-d shows tickets from all projects
- [ ] No ticket history lost during migration

## Review Notes (CTO/Lead only)
<!-- Filled during review -->
- Status: Pending | Approved | Changes Requested
- Comments:
- Reviewed by: @username
- Reviewed at: YYYY-MM-DD

## Personal Task Breakdown (Developer fills this)
<!-- Links to personal tickets in thoughts/<dev>/tickets/ -->
- [x] ZERWIZ-001: Create f-rr-d repo and push initial thoughts/ (repo existed, pushed wayofmono)
- [x] ZERWIZ-002: Update harness init to clone thoughts/ from f-rr-d (team-init.ts cmdInit)
- [x] ZERWIZ-003: Update ticket manager for multi-project routing (sync.ts project-scoped paths)
- [ ] ZERWIZ-004: Write migration script (git history preserved in push)
