# WOW-036 Agent Surface Mapping — Only Simple Should Use Orchestrator

## Problem Statement

Only the **Simple** view should use the **Orchestrator** agent. Other surfaces (Docs, Claw, Kanban, ATA, Billing, etc.) each have their own dedicated agent. There is concern that the Orchestrator might be incorrectly serving other surfaces, or that the agent-to-surface mapping is not clearly enforced.

## Desired Outcome

- Only `surface="simple"` maps to agent `"orchestrator"`
- Every other surface has its own dedicated agent with a proper `.md` definition file in `.wo/agents/`
- The mapping is clear, auditable, and enforced both server-side and client-side

## Context & Background

### Current State

Current surface-to-agent mapping at `server/ws-handler.ts:373-385`:

| Surface | Agent |
|---|---|
| `simple` | `orchestrator` |
| `docs` | `docs` |
| `claw` | `claw` |
| `kanban` | `kanban` |
| `ata` | `ata` |
| `billing` | `fakturering` |
| `planning` | `schemaplanerare` |
| `taplanner` | `tma-planner` |
| `project` | `projektledare` |

Each surface has a dedicated agent except `simple` which intentionally uses the orchestrator.

### Why This Matters

If the orchestrator handles docs or other surface queries, those surfaces lose their specialized behavior (document generation, kanban management, etc.). Clear mapping ensures each surface gets the right expert agent.

## Requirements

### Functional Requirements
- [ ] Verify `surface="docs"` always maps to agent `"docs"` (never falls back to orchestrator)
- [ ] Ensure each non-simple surface has a valid `.md` agent definition in `.wo/agents/`
- [ ] Add a log/warning when a surface has no valid agent definition file
- [ ] Document the rule: only `simple` → orchestrator, all others → dedicated agent

### Out of Scope
- Creating new agent definitions for surfaces that lack them

## Acceptance Criteria

### Automated Verification
- [ ] Build completes: `bun run build`

### Manual Verification
- [ ] Docs view shows `docs` agent in chat header, not `orchestrator`
- [ ] All other surfaces show their assigned agent

## Technical Notes

### Affected Components
- `server/ws-handler.ts:373-385` — surface-to-agent mapping
- `.wo/agents/*.md` — agent definition files for each surface

---

## Meta

**Created**: 2026-06-02
**Priority**: Medium
**Estimated Effort**: S
