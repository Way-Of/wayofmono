---
title: "[PROJ-013] Implement Ticket Manager Skill for AI Engineering Harness"
type: "Feature"
priority: "High"
status: "Backlog"
assignee: "@wo-team"
created: "2026-06-09"
---

## Context
We need to transition from disconnected, manual todo checklists to a synchronized, agent-supported ticket workflow. The Ticket Manager Skill will be a core component of the `@aiengineeringharness` package, providing cross-agent commands, tool definitions, and system prompts to enable fully synchronized, ticket-driven autonomous software engineering across all supported agent frontends (wocode, wouser, Claude Code, OpenCode, Gemini CLI, Pi, Antigravity, and Codex).

**Critical Architecture Decision:** 
- **Core Agents** (in `@aiengineeringharness/agents/`): Generic, reusable agents that work across any project (e.g., code-reviewer, test-generator, refactoring-agent)
- **Project-Specific Agents** (in `.wo/agents/` or project-level): Agents customized for a specific codebase/domain (e.g., wo-coding-agent, wow-specific agents)
- **WOW (Way of Work) Agents**: Way of Work platform-specific (WOW-010 through WOW-016 specs). Live in `packages/@aiengineeringharness/skills/wow_*/agents/` and `thoughts/shared/tickets/WOW-*.md`.
- **Opticat Agents**: Opticat platform-specific agents (simulator, backend-integrator, ui-builder). Live in `packages/@aiengineeringharness/skills/opticat_*/agents/` and `thoughts/shared/tickets/OPT-*.md`. Same structure as WOW agents.
- **Cross-Platform Compatibility**: All scripts, installers, and hooks must work on Linux, macOS, and Windows. Provide both `.sh` (Unix) and `.bat`/.ps1 (Windows) variants.

Key requirements:
- Centralized Task Tracking: TODO lists must reference and link directly to distinct ticket IDs
- Gemini Skill Integration: Autonomous agent capable of reading/writing tickets, transitioning statuses, understanding team progress
- Context-Aware Tools: Development/deployment skills must understand active ticket, owner, blockers, dependencies
- Automated Status Propagation: When task completes, agent auto-updates ticket state, checks off TODO checkboxes, updates dashboard, unblocks dependent tasks
- **Ticket Namespacing**: Support `WOW-XXX` (Way of Work platform), `OPT-XXX` (Opticat), `PROJ-XXX` (project-level), `TEAM-XXX` (team-specific) prefixes
- **Agent Namespacing**: Core agents vs project agents vs WOW agents vs Opticat agents clearly separated
- **Team & Hierarchy**: Developer roles (CTO, Lead, Senior, Junior), project membership, personal TODO hierarchy (PROJ-018, PROJ-021)
- **CTO Dashboard**: Review queue, progress tracking, GitHub PR integration (PROJ-019)
- **Platform Adapters**: Single canonical skill → 7 platform formats (PROJ-020)

## Requirements & Scope
- [ ] Create skill directory structure at `packages/@aiengineeringharness/skills/ticket-manager/`
- [ ] Create `SKILL.md` - Specification & Prompt Blueprint with system prompt injector
- [ ] Create `ticket-schema.json` - Validation contract for ticket data (supports namespaced IDs: WOW-XXX, PROJ-XXX, TEAM-XXX)
- [ ] Create `link-todo-endpoint.ts` - API link automation for TODO-to-ticket binding
- [ ] Create `sync.ts` (hook.ts) - Local file parser for auto-checking TODO markdown checkboxes on `/complete`
- [ ] Define JSON-RPC tool schemas: `list_tickets`, `get_ticket`, `update_ticket`, `link_todo_to_ticket`
- [ ] Implement ticket namespace filtering in tools (filter by `namespace: "wow" | "opticat" | "proj" | "team"`)
- [ ] Implement team-aware filtering (filter by `assignee`, `role`, `project`)
- [ ] Implement agent registry separation:
  - [ ] Core agents registry: `packages/@aiengineeringharness/agents/`
  - [ ] WOW agents registry: `packages/@aiengineeringharness/skills/wow_*/agents/`
  - [ ] Opticat agents registry: `packages/@aiengineeringharness/skills/opticat_*/agents/`
  - [ ] Project agents registry: `.wo/agents/` (project-local)
- [ ] Implement interface mappings for all frontends:
  - [ ] wocode & wouser (Node/Deno middleware hooks: `/sync team`, `/work <id>`, `/complete <id>`)
  - [ ] Claude Code (~/.claude/ via hook.ts executable)
  - [ ] Gemini CLI / Ollama Context Engine (dynamic repo state injection)
  - [ ] OpenCode (~/.config/opencode/ via skill definitions)
  - [ ] Pi (~/.pi/agent/ via skills/agents)
  - [ ] Antigravity (native skill format)
  - [ ] Codex (~/.codex/ via skills/agents)
- [ ] Add installation scripts (cross-platform):
  - [ ] Deno harness installer: `ai-harness --tool=all --skill=ticket-manager`
  - [ ] Unix symlink setup: `./packages/@aiengineeringharness/setup.sh all --restow`
  - [ ] Windows symlink setup: `.\packages\@aiengineeringharness\setup.bat all --restow`
  - [ ] PowerShell setup: `.\packages\@aiengineeringharness\setup.ps1 all --restow`
  - [ ] Cross-platform hooks: `.sh` + `.bat`/.ps1 variants for all hook scripts
- [ ] Add ticket storage backend (file-based in `thoughts/shared/tickets/` with namespace subdirs)
- [ ] Add personal ticket storage (`thoughts/<dev>/tickets/`) with parent_ticket linking
- [ ] Implement `sync_personal_todos()` - generates `thoughts/<dev>/TODO.md` from assignments (PROJ-021)
- [ ] Implement `submit_for_review()` - moves ticket to "Submitted for Review", creates GitHub PR (PROJ-019)
- [ ] Implement `cto_review_action()` - approve/request-changes, updates ticket status (PROJ-019)
- [ ] Write integration tests for skill loading and tool execution
- [ ] Document usage in AI Engineering Harness Tutorial

## Technical Notes
- Uses Deno as default runtime for harness scripts (consistent with `install.ts` and `setup.sh`)
- Skill follows existing pattern in `@aiengineeringharness/skills/` (reference `wow_backlog_groomer`, `wow_agent_dev` skills)
- Ticket IDs follow `WOW-XXX` format (consistent with existing WOW-010, WOW-012, WOW-015, WOW-016 references)
- Opticat tickets follow `OPT-XXX` format (consistent with Opticat platform specs)
- Local TODO files live in project root (e.g., `CRAIG-CTO-TODO.md`, `JOSEF-ENG-TODO.md`)
- The `sync.ts` script must parse markdown headers and toggle `- [ ]` to `- [x]` checkboxes
- Tool definitions use JSON-RPC schema compatible with OpenCode, Claude Code, and Gemini tool calling
- **Cross-Platform**: All CLI commands, hooks, and installers must provide `.sh` (Linux/macOS) and `.bat`/.ps1 (Windows) variants. Use Deno's cross-platform APIs where possible. Path handling must use `std/path` (not hardcoded separators).

## Success Criteria
- [ ] Skill directory created with all 4 core files
- [ ] `ai-harness --tool=all --skill=ticket-manager` installs skill to all 7 frontends
- [ ] `/work WOW-001` starts work on ticket, updates status to "in-progress"
- [ ] `/complete WOW-001` marks ticket "done", checks off linked TODO checkboxes
- [ ] `/sync team` shows dashboard with owner, status, blockers, dependencies
- [ ] `list_tickets` tool returns filtered results by owner/status/project/namespace/role
- [ ] `get_ticket` returns full metadata including upstream blockers and downstream unblocks
- [ ] `update_ticket` transitions status and manages blocker/unblock arrays
- [ ] `link_todo_to_ticket` binds markdown section to ticket ID with owner
- [ ] `submit_for_review` creates GitHub PR, notifies CTO, sets status "Submitted for Review"
- [ ] `cto_review_action` approves/requests changes, updates ticket status
- [ ] `sync_personal_todos` generates `thoughts/<dev>/TODO.md` with assigned tickets + sub-tasks
- [ ] All 7 agent frontends can invoke tools via their native interfaces
- [ ] Integration tests pass for skill loading and tool execution