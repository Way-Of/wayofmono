# Agents Documentation

WayOfMono utilizes a sophisticated multi-agent orchestration system that synthesizes behaviors from **Pi**, **Gemini CLI**, and **OpenCode**.

## Operational Modes

Our agents operate in two distinct modes to ensure safety and precision:

- **Plan Mode:** Toggled via \`/plan\` (Gemini) or \`<TAB>\` (OpenCode). In this mode, agents are **read-only**. They analyze the codebase and design implementation strategies without making any file changes.
- **Build Mode:** The active implementation mode. Once a plan is approved, agents transition to Build Mode to apply surgical edits using tools like \`replace\` and \`write_file\`.

## The Agent Squad

### [Planner](../../pi/agents/planner.md)
**Role:** Architect & Strategist
The Planner is the primary user of **Plan Mode**. It takes high-level requirements and produces grounded, step-by-step technical plans. It respects the hierarchy of instructions found in \`GEMINI.md\` and \`AGENTS.md\`.

### [Reviewer](../../pi/agents/reviewer.md)
**Role:** Lead Auditor
The Reviewer is the final quality gate. It performs critical audits of both plans and code. It is responsible for ensuring security compliance (e.g., checking for hardcoded paths or leaked secrets).

### [Scout](../../pi/agents/scout.md)
**Role:** Reconnaissance & Recon
The Scout maps the codebase at high speed. It discovers file paths, identifies architectural patterns, and locates steering files (\`GEMINI.md\`, \`AGENTS.md\`). It provides the empirical data that grounds the Planner's designs.

### [Worker](../../pi/agents/coder.md)
**Role:** Precision Implementation
The Coder operates in **Build Mode**. It executes the approved steps of a plan with surgical precision, ensuring that all changes are accompanied by verification logic and pass project-specific linting/tests.

## Project Steering Files

Agents are steered by project-specific context files, which are treated as the ultimate source of truth:

- **\`GEMINI.md\`**: Defines project-wide architectural rules, conventions, and team-shared workflows. Agents look for these in the root and subdirectories to gain localized context.
- **\`AGENTS.md\`**: Maps project structure and coding patterns. Generated via \`/init_harness\`, this file should always be **committed to Git** to ensure all agents share a common understanding of the project.

## Agent Handoffs
Handoffs occur via shared state in the \`thoughts/\` directory:
1. **Scout → Planner:** Scout generates a report in \`shared/research/scout_reports/\`.
2. **Planner → Reviewer:** Planner drafts a plan in \`shared/plans/\`.
3. **Reviewer → Coder:** Reviewer approves the plan, signaling the transition to Build Mode.
4. **Coder → Reviewer:** Coder implements code; Reviewer performs the final audit.
