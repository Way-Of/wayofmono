# Ticket 1: WOW-063 Design Tool: Google Stitch Learning

## Problem Statement
We need to evaluate how Google Stitch, an AI-powered UI design tool, can be utilized within the Way of Work development workflow to accelerate prototyping and design system management.

## Desired Outcome
A documented evaluation and learning summary of Google Stitch, including its potential integration points with our existing design and development processes.

## Context & Background

### Current State
We currently rely on traditional design methods or direct coding. Google Stitch offers generative UI capabilities that could bridge the gap between ideation and functional prototypes.

### Why This Matters
Integrating generative UI tools can significantly reduce the time spent on UI iteration and help maintain a consistent design system across the platform.

## Requirements

### Functional Requirements
- [ ] Research core features of Google Stitch (Generative UI, Image-to-UI, interactive prototyping).
- [ ] Test the tool by creating a prototype for a new or existing Way of Work feature.
- [ ] Document the "Learning" findings: strengths, weaknesses, and handoff capabilities (React/Tailwind/Figma).
- [ ] Propose a workflow for how Google Stitch fits into the WoW development lifecycle.

### Out of Scope
- Full-scale implementation of a new feature based solely on Stitch outputs.
- Migrating all existing designs to Stitch.

## Acceptance Criteria

### Automated Verification
- [ ] Documentation is added to the repository in Markdown format.

### Manual Verification
- [ ] A sample prototype created in Google Stitch is shared or documented.
- [ ] A "Learning Report" or section in `docs/` explains how to use the tool for WoW purposes.

## Technical Notes

### Affected Components
- `docs/` - Learning report and workflow documentation.

---

## Meta

**Created**: 2026-06-08

**Priority**: Medium

**Estimated Effort**: M

---

# Ticket 2: WOW-064 GitHub Usage Best Practices

## Problem Statement
The team of "vibe coders" needs a standardized, easy-to-digest guide for using GitHub effectively. Currently, inconsistent workflows and lack of branching rules increase the risk of accidental merges, conflicts, and production instability.

## Desired Outcome
A comprehensive yet accessible training guide and established repository rules that enable smooth collaboration, protect critical branches, and provide tools for error recovery and auditing.

## Context & Background

### Current State
Team members use Git with varying levels of proficiency. There are no formal rules protecting production or staging branches from direct AI-driven merges, leading to potential stability issues.

### Why This Matters
As the team grows and AI agents become more active in the codebase, strict workflows are essential to prevent data loss and ensure that only human-reviewed (or strictly validated) code reaches production.

## Requirements

### Functional Requirements
- [ ] **Basics & Workflow**: Document core Git commands (`add`, `commit`, `push`, `pull`, `fetch`, `status`).
- [ ] **Branching Strategy**: Establish a "Feature Branch" workflow where all work starts in a separate branch.
- [ ] **Staging & Production**: Define the roles of `main` (production) and `staging` branches.
- [ ] **Branch Protection**: Document how to protect `main` and `staging` from direct pushes and accidental AI merges (requiring PRs and reviews).
- [ ] **Error Recovery**: Provide instructions for `git reset`, `git revert`, `git stash`, and `git checkout` to fix mistakes.
- [ ] **Merge Conflict Resolution**: A step-by-step guide on how to identify and resolve conflicts safely.
- [ ] **Auditing**: Instructions on using `git blame` and `git diff` to review coding sessions and track changes.

### Out of Scope
- Setting up CI/CD pipelines (will be a separate ticket).
- Advanced Git internals (focus on "best practices for vibe coders").

## Acceptance Criteria

### Automated Verification
- [ ] Documentation is added to the repository in Markdown format (e.g., `docs/GITHUB_BEST_PRACTICES.md`).

### Manual Verification
- [ ] The guide is reviewed and approved by the team.
- [ ] Branch protection rules are configured in the GitHub repository settings (documented as a task).

## Technical Notes

### Affected Components
- `docs/` - New GITHUB_BEST_PRACTICES.md file.
- GitHub Repository Settings - Branch protection configuration.

---

## Meta

**Created**: 2026-06-08

**Priority**: High

**Estimated Effort**: M
