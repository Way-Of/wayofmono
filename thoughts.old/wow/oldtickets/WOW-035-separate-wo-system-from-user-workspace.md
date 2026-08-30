# WOW-035 Separate `.wo/` System Directory from User Workspace

## Problem Statement

The `.wo/` directory (containing AI engine configuration: agents, skills, tools, settings) lives at the project root `/home/zerwiz/CodeP/wayofwork/.wo`, but the server resolves it relative to the **workspace root** (`workspace/`). A symlink at `workspace/.wo -> ../.wo` was used to make this work, which pollutes the user's workspace with system files.

## Desired Outcome

- The workspace directory (`workspace/`) contains only the user's project files
- The `.wo/` directory at the project root is the single source of truth for AI engine configuration
- No symlinks inside the workspace
- Server code resolves `.wo/` paths relative to the server's own root, not the workspace root

## Context & Background

### Current State

- `WOP_WORKSPACE=./workspace` in `.env` — workspace root is `workspace/`
- `.wo/` directory at project root `/home/zerwiz/CodeP/wayofwork/.wo` (agents, skills, tools)
- Symlink at `workspace/.wo -> ../.wo` so `join(workspaceRoot, ".wo", "agents")` resolves correctly
- Server code in `server/agents.ts`, `server/teams-yaml-mutate.ts`, etc. joins `.wo` under workspace root

### Why This Matters

The workspace is for the user's project files. Having system AI engine files (or symlinks to them) inside the workspace is confusing and breaks the mental model of workspace = user project.

## Requirements

### Functional Requirements

- [ ] Add `getWoSystemRoot()` to `server/paths.ts` — returns the `.wo/` path at the server's own root (parent of workspace root)
- [ ] Update `server/agents.ts` — `agentScanRoots()` and teams.yaml lookup to use `getWoSystemRoot()`
- [ ] Update `server/teams-yaml-mutate.ts` — `primaryTeamsYamlAbs()` to use `getWoSystemRoot()`
- [ ] Remove the symlink at `workspace/.wo`
- [ ] Verify agent/skill/team scanning still works

### Out of Scope
- Moving `.wo/` to a different location
- Changing how Claw host repo root agents are scanned

## Acceptance Criteria

### Automated Verification
- [ ] Build completes: `bun run build`

### Manual Verification
- [ ] `ls -la workspace/.wo` shows "No such file or directory" (symlink removed)
- [ ] Server starts without errors
- [ ] Agent definitions from `.wo/agents/` are still discoverable
- [ ] Skills from `.wo/skills/` still resolve
- [ ] Teams from `.wo/agents/teams.yaml` still work

## Technical Notes

### Affected Components
- `server/paths.ts` — add `getWoSystemRoot()` function
- `server/agents.ts` — `agentScanRoots()` and `loadWorkspaceAgents()` teams.yaml path
- `server/teams-yaml-mutate.ts` — `primaryTeamsYamlAbs()` function

---

## Meta

**Created**: 2026-06-02
**Priority**: High
**Estimated Effort**: S
