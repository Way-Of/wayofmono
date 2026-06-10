# WOW-060 Construction Plan Mode

## Problem Statement
The current plan mode is designed for software development planning (code structure, file-touch tables, implementation steps). Construction projects need a fundamentally different planning approach — Swedish bygglov/etappindelning, TA plans, material/resource scheduling, milestone tracking, and arbetsmiljö coordination. There's no dedicated construction planning capability in the system today.

## Desired Outcome
A standalone **construction plan mode** that lets users create structured construction plans via chat, outputs both a markdown plan document and kanban tasks (after approval), and understands Swedish construction regulation context.

## Context & Background

### Current State
- Plan mode exists but is software-development-focused (PLAN-YYYYMMDD-slug.md with file-touch tables and implementation steps)
- No construction-specific prompt, templates, or workflows
- Existing agents (projektledare, ta-planner, ata, maskinchef) are unrelated standalone agents, not coordinated
- No plan-to-task pipeline exists

### Why This Matters
Construction foremen, project managers, and site workers need to quickly plan projects on-site via mobile. A chat-driven construction planner is the killer feature for field workers — describe what needs to be done, get a structured plan, approve it, and have tasks appear in the kanban.

## Requirements

### Functional Requirements
- [ ] Construction plan prompt template (not software-focused) — sections: scope, etapper/milestones, material, risks, arbetsmiljö, approvals needed
- [ ] Output format: structured markdown plan doc (`construction/PLAN-*.md`)
- [ ] POST `/api/pending-changes` to convert approved plan into kanban tasks (HITL)
- [ ] Swedish/English bilingual support in prompts and output
- [ ] Chat mode toggle: "Build" / "Plan (Construction)"
- [ ] Plan file catalog under `construction/` directory (not `plans/`)
- [ ] Plan-to-tasks handoff UI — review plan, approve, tasks appear in project kanban
- [ ] Construction plan `.wo/agents/` definition (not reliant on orchestrator for planning)
- [ ] Mobile-friendly plan creation flow (via `/mobile/*` surface)
- [ ] Integration with existing agents as tools (read data from projektledare, ata, maskinchef — not dispatch to them)

### Out of Scope
- Full Gantt chart rendering (MVP = markdown plan + task list)
- Real-time collaboration on plans
- Expert agent coordination (plan mode is standalone)
- Integration with external planning tools (MS Project, etc.)

## Acceptance Criteria

### Manual Verification
- [ ] `/plan` in chat switches to construction plan mode with construction-specific prompt
- [ ] Chat response includes structured construction plan sections
- [ ] Plan saved as `construction/PLAN-YYYYMMDD-slug.md`
- [ ] "Approve & create tasks" submits pending_changes with task list
- [ ] Admin approves pending change in UI, tasks appear in kanban
- [ ] Swedish input produces Swedish plan output; English input works too
- [ ] Works on mobile (`/mobile/*`) — chat input, plan display, approve flow

## Technical Notes

### Affected Components
- `server/session-prompts.ts` — add `CONSTRUCTION_PLAN_SESSION_SYSTEM` fallback prompt
- `server/ws-handler.ts` — wire construction mode to prompt and `/plan` slash command routing
- `server/chat-slash-commands.ts` — differentiate `/plan` (construction) from current software plan mode
- `src/components/simple/SimpleChatView.tsx` — mode toggle options (Build / Plan / Construction Plan)
- `src/components/ChatPanel.tsx` — same mode toggle for technical shell
- `src/pages/mobile/MobileLayout.tsx` — plan mode link from mobile dashboard
- `src/utils/` — new `constructionPlanArtifacts.ts`, `constructionPlanTemplates.ts`
- `server/plans-catalog.ts` — extend to support `construction/` directory
- `.wo/agents/construction-planner.md` — agent definition
- `.wo/skills/construction-planning/` — skill with Swedish regulation context (PBL, BBR, AFS, AMA)

### Implementation Sketch
1. Create `.wo/agents/construction-planner.md` with construction planning agent
2. Create `.wo/skills/construction-planning/SKILL.md` with planning instructions and Swedish regulation references
3. Add `CONSTRUCTION_PLAN_SESSION_SYSTEM` prompt with construction-specific sections
4. Support `chatMode === "construction_plan"` alongside existing `"plan"` and `"build"`
5. Implement plan-to-tasks pipeline: plan doc → pending_changes → kanban tasks
6. Mobile chat integration — `/mobile/*` surfaces construction plan mode

---

## Meta

**Created**: 2026-06-06
**Priority**: High
**Estimated Effort**: L
