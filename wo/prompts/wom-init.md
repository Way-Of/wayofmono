---
description: Initialize the WayOfMono AI Engineering Harness.
---
# /wom-init

Initialize the WayOfMono (Wom) AI Engineering Harness in this repository to establish a structured development environment.

## Overview
This command sets up the foundational directory structure and templates required for our AI-native development lifecycle. It ensures consistency across projects and provides the necessary context for Wom agents to operate effectively.

## Actions
1. **Directory Setup:** Creates the core `thoughts/` hierarchy:
   - `thoughts/shared/tickets/`
   - `thoughts/shared/plans/`
   - `thoughts/shared/research/`
   - `thoughts/global/`
2. **Template Deployment:** Deploys unified Wom templates from `shared/` to the project's `thoughts/` directory.
3. **Context Generation:** Triggers an initial codebase scan to generate or update project-level instructions in `GEMINI.md` or `AGENTS.md`.

## Instructions
1. **Analyze:** Check if a harness already exists.
2. **Structure:** Create missing directories in `thoughts/`.
3. **Templates:** Copy `shared/tickets/ticket-template.md` and `shared/plans/implementation.md` to the project's shared folders.
4. **Baseline:** Run a `wom-recon` operation to map the initial codebase state.
5. **Report:** Inform the user of the successful setup and ready state.

## Next Steps
- Create your first ticket: `Ticket → /wom-plan → /wom-build → /wom-audit`
