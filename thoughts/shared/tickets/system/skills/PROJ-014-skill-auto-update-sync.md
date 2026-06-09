---
title: "[PROJ-014] Skill Auto-Update & Sync for AI Engineering Harness"
type: "Feature"
priority: "High"
status: "Backlog"
assignee: "@wo-team"
created: "2026-06-09"
---

## Context
As we build more skills for the AI Engineering Harness (like `ticket-manager`, `wow_backlog_groomer`, `wow_agent_dev`, `opticat_simulator`, `opticat_backend_integrator`, `opticat_ui_builder`, etc.), and import 58+ skills from `ref/skills/` (PROJ-016), we need an automated way to keep all installed skills synchronized across all agent frontends. Currently, adding a new skill requires manual reinstallation or restowing. We need a skill that can detect new/updated skills in the harness and automatically propagate them to all configured frontends.

## Requirements & Scope
- [ ] Create skill at `packages/@aiengineeringharness/skills/skill-auto-update/`
- [ ] Create `SKILL.md` with system prompt for autonomous skill synchronization
- [ ] Create `sync-skills.ts` - Core synchronization logic (Deno, cross-platform)
- [ ] Create `skill-registry.json` - Registry of available skills with versions/hashes
- [ ] Implement `scan_available_skills()` - Discovers skills in `packages/@aiengineeringharness/skills/` (including wow_*, opticat_*)
- [ ] Implement `get_installed_skills()` - Reads currently installed skills per frontend
- [ ] Implement `diff_skills()` - Compares available vs installed, detects new/updated/removed
- [ ] Implement `sync_to_frontend(frontend)` - Propagates changes to specific frontend
- [ ] Add CLI commands (cross-platform):
  - [ ] `ai-harness --sync-skills` / `ai-harness.bat --sync-skills` (or `/sync skills` in agents)
  - [ ] `ai-harness --watch-skills` / `ai-harness.bat --watch-skills` for continuous sync
- [ ] Support all 7 frontends: claude, opencode, gemini, pi, wocoder, antigravity, codex
- [ ] Handle skill dependencies (some skills may require others)
- [ ] Preserve user customizations (don't overwrite modified skill configs)
- [ ] Add dry-run mode to preview changes before applying
- [ ] Cross-platform installers: `setup.sh` + `setup.bat` + `setup.ps1` for all frontends

## Technical Notes
- Uses Deno runtime (consistent with harness, cross-platform)
- Skill registry tracks: name, version, hash, dependencies, frontend-compatibility, namespaces (core, wow, opticat)
- Installation methods: Deno installer (`install.ts`) and GNU Stow (`setup.sh` / `setup.bat` / `setup.ps1`)
- Must integrate with existing `ai-harness` CLI
- Should reuse patterns from `install.ts` for frontend detection and installation
- File watching can use `Deno.watchFs()` for `--watch-skills` mode
- Skill directory structure: `skills/<skill-name>/SKILL.md`, `*.ts`, `*.json`
- **Cross-Platform**: All CLI entry points have `.sh` (Unix) and `.bat`/.ps1 (Windows) variants. Path handling via Deno `std/path`.

## Success Criteria
- [ ] Skill auto-discovers new skills added to `packages/@aiengineeringharness/skills/` (core, wow_*, opticat_*)
- [ ] `ai-harness --sync-skills` / `ai-harness.bat --sync-skills` updates all 7 frontends
- [ ] `/sync skills` command works inside wocode, wouser, and other agents
- [ ] Dry-run shows exactly what will be added/updated/removed per frontend
- [ ] Watch mode detects new skill directories within 2 seconds
- [ ] User customizations in `~/.config/opencode/`, `~/.claude/`, etc. are preserved
- [ ] Skill dependencies resolved and installed in correct order (core → wow → opticat)
- [ ] Integration test: add dummy skill, run sync, verify installed in all frontends on Linux, macOS, Windows
- [ ] Documentation updated in AI Engineering Harness Tutorial