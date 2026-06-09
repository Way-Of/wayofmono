---
title: "[PROJ-016] Import & Adapt Ref Skills/Agents for All Agent Frontends"
type: "Feature"
priority: "High"
status: "Backlog"
assignee: "@wo-team"
created: "2026-06-09"
---

## Context
We have a rich collection of reference skills and agents in `ref/skills/` (58 skills) and `ref/agents/` (6 agents) that need to be imported, adapted, and made available across ALL agent frontends:
- **Claude Code** (~/.claude/)
- **Gemini CLI** (~/.gemini/)
- **Pi** (~/.pi/agent/)
- **OpenCode** (~/.config/opencode/)
- **Antigravity** (~/.antigravity/)
- **Codex** (~/.codex/)
- **Cross-Platform**: All installers, scripts, and hooks work on Linux, macOS, Windows (.sh + .bat/.ps1)

Current ref skills include: `wow_access_control`, `wow_agent_dev`, `wow_backend_dev`, `wow_communications`, `wow_core_architecture`, `wow_frontend_dev`, `wow_human_in_the_loop`, `wow_tickets`, `wow_ui_surfaces`, `ticket-context`, `backlog-groomer`, `git_commit_helper`, `improve_codebase_architecture`, `init_harness`, `interview`, `observability_driven_development`, `pr_description_generator`, `prd_to_issues`, `tdd`, `write_a_prd`, `experimental_pr_workflow`, `validate_plan`, `worktree`, `research_codebase`, `document-generation`, `debug`, `debug_k8s`, `create_plan`, `implement_plan`, `commit`, `codebase_investigator`, `codebase_locator`, `codebase_pattern_finder`, `thoughts_analyzer`, `thoughts_locator`, `web_search_researcher`, `otel_*`, `pi_*`, `claude_*`, `optic_*` skills (Opticat: `opticat-backend-integrator`, `opticat-simulator`, `opticat-ui-builder`), and more.

Current ref agents include: `codebase_investigator`, `codebase_locator`, `codebase_pattern_finder`, `thoughts_analyzer`, `thoughts_locator`, `web_search_researcher`.

## Requirements & Scope
- [ ] Create import script: `packages/@aiengineeringharness/scripts/import-ref-skills.ts` (cross-platform Deno)
- [ ] Map each ref skill to harness skill structure (`packages/@aiengineeringharness/skills/<skill-name>/`)
- [ ] Each skill must have:
  - [ ] `SKILL.md` with proper frontmatter (name, description, allowed-tools)
  - [ ] Tool definitions compatible with JSON-RPC (for OpenCode, Codex, Claude)
  - [ ] System prompt injections for each frontend
  - [ ] Hook/entry scripts for each frontend (Deno for harness, Node for wocode/wouser) - `.sh` + `.bat`/.ps1 variants
- [ ] Map each ref agent to harness agent structure with namespacing (PROJ-015):
  - [ ] Core agents → `packages/@aiengineeringharness/agents/`
  - [ ] WOW agents → `packages/@aiengineeringharness/skills/wow_*/agents/`
  - [ ] Opticat agents → `packages/@aiengineeringharness/skills/opticat_*/agents/`
- [ ] Implement frontend-specific adapters:
  - [ ] **Claude Code**: `.claude/commands/`, `.claude/agents/`, hook.ts executables
  - [ ] **Gemini CLI**: `~/.gemini/config/skills/` with SKILL.md format
  - [ ] **Pi**: `~/.pi/agent/skills/` and `~/.pi/agent/agents/`
  - [ ] **OpenCode**: `~/.config/opencode/skill/` with tool definitions
  - [ ] **Antigravity**: Native skill format (compatible with Gemini)
  - [ ] **Codex**: `~/.codex/skills/` and `~/.codex/agents/`
- [ ] Create unified installer (cross-platform):
  - [ ] `ai-harness --import-ref --tool=all` (Deno)
  - [ ] `ai-harness.bat --import-ref --tool=all` (Windows batch)
  - [ ] `ai-harness.ps1 --import-ref --tool=all` (PowerShell)
- [ ] Add validation that all skills work across all 7 frontends on Linux, macOS, Windows
- [ ] Document migration guide for each skill

## Technical Notes
- Source: `ref/skills/` and `ref/agents/`
- Destination: `packages/@aiengineeringharness/skills/` and `packages/@aiengineeringharness/agents/`
- Harness installer (`install.ts`) and stow (`setup.sh` / `setup.bat` / `setup.ps1`) handle distribution
- Skills must follow Gemini SKILL.md schema (name, description, allowed-tools) + harness extensions
- Agents must follow namespacing from PROJ-015 (core, project, wow, opticat)
- Tool definitions use JSON-RPC schema (compatible with OpenCode, Codex, Claude)
- System prompts injected via AGENTS.md or frontend-specific config
- WOW skills (wow_*) are platform-specific and go in `skills/wow_*/`
- Opticat skills (opticat_*) are platform-specific and go in `skills/opticat_*/`
- **Cross-Platform**: All scripts use Deno (cross-platform). Installers provide `.sh` (Unix) and `.bat`/.ps1 (Windows) variants. Path handling via Deno `std/path`.

## Success Criteria
- [ ] All 58 ref skills imported to `packages/@aiengineeringharness/skills/` (core, wow_*, opticat_*)
- [ ] All 6 ref agents imported to appropriate namespaced directories (core, wow, opticat)
- [ ] `ai-harness --import-ref --tool=all` / `ai-harness.bat --import-ref --tool=all` installs to all 7 frontends
- [ ] Each skill has SKILL.md, tool definitions, and frontend adapters (`.sh` + `.bat`/.ps1)
- [ ] Skills discoverable and executable in Claude Code, Gemini, Pi, OpenCode, Antigravity, Codex on Linux, macOS, Windows
- [ ] Agent loader respects namespacing (project > opticat > wow > core)
- [ ] Integration tests pass for at least 5 critical skills across all frontends on all 3 OSes
- [ ] Documentation updated with skill catalog and usage examples