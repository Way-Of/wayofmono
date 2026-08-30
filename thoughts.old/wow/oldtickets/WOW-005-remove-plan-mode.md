# WOW-005: Plan Mode — Construction Planning Feature

## Problem Statement
The "plan mode" feature was previously flagged for removal, but has since been recognized as a core capability for construction planning. Plan mode enables users to create structured construction plans with phases, tasks, materials, and AFS compliance built in. It aligns directly with the system's construction-focused capabilities (KMA, budgeting, time tracking, procurement) and should be enhanced rather than removed.

## Desired Outcome
A fully functional, production-ready Plan Mode that helps construction project managers create, execute, and follow up on detailed construction plans — from initial site assessment through handover. Plan mode should integrate with the existing ecosystem: KMA checklists, budget tracking, time reporting, material procurement, and the agent system.

## Current Status
- Plan mode exists in the codebase with construction-specific templates and artifacts
- `/plan` slash command registered in chat system
- Construction plan artifacts with sections for: project info, phases, materials, AFS compliance, KMA
- Plans are stored as markdown files under `plans/PLAN-YYYYMMDD-*.md`
- Integration with construction-planner agent for agent-assisted plan creation

## Relationship to WOW-060
**WOW-060 (Construction Plan Mode)** is the detailed implementation ticket for building the construction-specific plan mode. This ticket (WOW-005) serves as the guardrail: it ensures plan mode is preserved in the system and not removed, while WOW-060 handles the actual feature implementation. See WOW-060 for implementation details, requirements, acceptance criteria, and affected components.

## Requirements

### Core (Guardrails — Do Not Remove)
- [ ] Preserve `/plan` slash command in chat system — it activates plan mode for construction planning
- [ ] Keep `"plan"` in `ChatSessionMode` types — it's a valid session mode for structured plan creation
- [ ] Maintain plan mode routing in `server/index.ts` and `server/session-prompts.ts`
- [ ] Keep planner agent bodies and references (`applyLeadFromCache`, etc.)

### Enhancements (See WOW-060 for detailed implementation)
- [ ] **Construction-specific plan prompt** — Replace software-focused plan sections with construction phases (etapper, milestones, material, risks, arbetsmiljö)
- [ ] **Plan-to-tasks pipeline** — HITL flow: plan → pending_changes → kanban tasks (WOW-060 §5)
- [ ] **Integrate with KMA** — Allow plans to reference KMA checklists per phase
- [ ] **Integrate with Budget** — Phase-level budget estimates that feed into project budget
- [ ] **Integrate with Time Reporting** — Planned hours per phase/task synced to time tracking
- [ ] **Integrate with Procurement** — Material lists in plans that generate procurement entries
- [ ] **Plan Templates** — Pre-built templates for common construction types
- [ ] **Phase Gantt/Calendar** — Visual timeline for plan phases in kanban or calendar view
- [ ] **Plan Approval Workflow** — Review plan, approve in UI, tasks appear in project kanban

### Agent Integration
- [ ] `construction-planner` agent should have plan mode as its primary surface (defined in WOW-060)
- [ ] Agent can create, modify, and present plans via chat
- [ ] Plans auto-save as construction markdown artifacts

## Technical Notes
- Plan artifacts currently live in `plans/PLAN-YYYYMMDD-*.md`; WOW-060 proposes `construction/` directory
- Construction plan templates in `src/utils/constructionPlanArtifacts.ts`
- Plan-related prompts in `server/session-prompts.ts`
- Do NOT remove plan mode — enhance it for construction workflows
- Refer to WOW-060 for complete technical specification

---

**Priority**: High
**Estimated Effort**: L (see WOW-060 for breakdown)
**Status**: Re-scoped from "Remove Plan Mode" → "Construction Planning Feature"
