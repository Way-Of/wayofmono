---
title: "[PROJ-015] Agent Namespacing: Separate Core, Project, and WOW Agents"
type: "Feature"
priority: "High"
status: "Backlog"
assignee: "@wo-team"
created: "2026-06-09"
---

## Context
Currently, agent definitions are not clearly separated by scope. We need a clear architecture that distinguishes:

1. **Core Agents** (`packages/@aiengineeringharness/agents/`): Generic, reusable agents that work across ANY project. Examples: `code-reviewer`, `test-generator`, `refactoring-agent`, `documentation-agent`, `security-auditor`. These are installed globally via the harness and available to all projects.

2. **Project-Specific Agents** (`.wo/agents/`): Agents customized for a specific codebase/domain. Examples: `wo-coding-agent` (WayOfMono specific), project-specific workflow agents. These live in the project's `.wo/` folder and are NOT shared across projects.

3. **WOW (Way of Work) Agents** (`packages/@aiengineeringharness/skills/wow_*/agents/`): Agents that implement Way of Work platform specifications (WOW-010 through WOW-016). These are platform-specific and tied to the WOW skills. Examples: `wow-backlog-groomer-agent`, `wow-access-control-agent`, `wow-human-in-the-loop-agent`.

4. **Opticat Agents** (`packages/@aiengineeringharness/skills/opticat_*/agents/`): Agents that implement Opticat platform specifications. Examples: `opticat-simulator-agent`, `opticat-backend-integrator-agent`, `opticat-ui-builder-agent`. Same structure as WOW agents.

This separation mirrors the skill architecture and ensures:
- Core agents are truly reusable across projects
- Project agents don't pollute the global namespace
- WOW agents are versioned with their skills
- Opticat agents are versioned with their skills
- Clear ownership and update paths for each category
- **All 7 frontends supported**: claude, opencode, gemini, pi, wocoder, antigravity, codex
- **Cross-Platform**: All installer scripts, hooks, and CLI commands work on Linux, macOS, Windows (.sh + .bat/.ps1)

## Requirements & Scope
- [ ] Define agent registry structure with namespaces: `core`, `project`, `wow`, `opticat`
- [ ] Create `packages/@aiengineeringharness/agents/` directory for core agents
- [ ] Migrate existing generic agents to core registry
- [ ] Create `.wo/agents/` template in project init (`wocode --init`, `wouser --init`)
- [ ] Update WOW skills to include their agents in `skills/wow_*/agents/`
- [ ] Update Opticat skills to include their agents in `skills/opticat_*/agents/`
- [ ] Implement agent loader that merges registries with priority: project > opticat > wow > core
- [ ] Add CLI commands:
  - [ ] `ai-harness agent list --namespace=core|project|wow|opticat`
  - [ ] `ai-harness agent install <name> --namespace=core|project`
  - [ ] `ai-harness agent create <name> --namespace=project` (scaffolds project agent)
- [ ] Update harness installer to install core agents globally, WOW/Opticat agents with skills
- [ ] Update `setup.sh` / `setup.bat` / `setup.ps1` stow logic to handle four agent directories for all 7 frontends
- [ ] Document agent namespacing in AI Engineering Harness Tutorial
- [ ] Add validation: project agents cannot override core agents (warn on conflict)

## Technical Notes
- Agent definition format: JSON/YAML with `name`, `namespace`, `description`, `tools`, `prompt`, `model-preferences`
- Loader precedence: `.wo/agents/` (project) > `skills/opticat_*/agents/` (opticat) > `skills/wow_*/agents/` (wow) > `packages/@aiengineeringharness/agents/` (core)
- Core agents installed via `ai-harness --tool=all` (global/shared)
- WOW agents installed automatically when their skill is installed (`ai-harness --skill=wow_backlog_groomer`)
- Opticat agents installed automatically when their skill is installed (`ai-harness --skill=opticat_simulator`)
- Project agents created via `wocode --init` or `wouser --init` (scaffolded in `.wo/agents/`)
- Registry merge strategy: deep merge on tools/prompt, project namespace wins on conflicts
- **Cross-Platform**: All scripts provide `.sh` (Linux/macOS) and `.bat`/.ps1 (Windows) variants. Use Deno's `std/path` for path handling.

## Success Criteria
- [ ] Three distinct agent directories exist and are recognized by harness
- [ ] `ai-harness agent list` shows namespace for each agent
- [ ] Core agents available in all projects after `ai-harness --tool=all`
- [ ] WOW agents installed only when their skill is installed
- [ ] Project agents scoped to `.wo/agents/` and not shared
- [ ] Agent loader correctly merges with project > wow > core precedence
- [ ] No naming conflicts between namespaces (validated on install)
- [ ] Documentation clearly explains when to create each type of agent