---
name: init_harness
description: Initialize the AI Engineering Harness in a repository by cloning the shared f-rr-d ticket/thoughts repo and setting up the project's directory structure.
docs-url: 
disable-model-invocation: true
allowed-tools: read_file, write_file, run_shell_command
---

# Initialize Harness

Initialize the AI Engineering Harness in this repository.

## What This Command Does

1. Clones the shared `f-rr-d` repo (`github.com/Way-Of/f-rr-d`) into `thoughts/` — the centralized hub for tickets, plans, research, and personal TODOs across all projects.
2. Creates the project's subfolder inside `thoughts/` (e.g., `thoughts/<project-slug>/`) with the standard structure.
3. Creates a personal thoughts directory for the current developer.
4. Provides guidance on next steps.

## Instructions

Follow these steps to initialize the harness:

1. **Determine the project slug**
    - Use the repository name (from `git remote -v` or the directory name)
    - Examples: `wayofmono`, `wo`, `opticat`, `healthoptimizing`
    - If uncertain, ask the user for the project slug.
    - Store in a variable: `PROJECT_SLUG=<dirname>`

2. **Clone the shared f-rr-d repo** (if thoughts/ does not already exist):
    ```bash
    # Clone the centralized ticket/thoughts repository
    git clone https://github.com/Way-Of/f-rr-d.git thoughts/
    ```
    - If `thoughts/` already exists, verify it is a clone of f-rr-d by checking the remote origin. If not, warn the user.

3. **Create the project subfolder** inside the shared repo:
    ```bash
    mkdir -p thoughts/${PROJECT_SLUG}/shared/{tickets,plans,research}
    mkdir -p thoughts/${PROJECT_SLUG}/global
    mkdir -p thoughts/${PROJECT_SLUG}/docs/{architecture,decisions,guides,references}
    ```

4. **Create a personal thoughts directory** for the current developer:
    ```bash
    mkdir -p thoughts/${PROJECT_SLUG}/$(whoami)/{tickets,plans,research}
    ```

5. **Ensure the project's TODO.md exists** at `thoughts/${PROJECT_SLUG}/shared/tickets/TODO.md`

6. **Verify the structure** (per WOMONO-001):
    ```
    thoughts/
    ├── global/                          # Cross-project global thoughts (architecture, standards, conventions)
    ├── shared/                          # Cross-project templates ONLY (ticket-template.md)
    │   ├── tickets/ticket-template.md
    │   ├── plans/
    │   └── research/
    ├── ${PROJECT_SLUG}/                 # This project's thoughts
    │   ├── global/                      # Project-specific global thoughts
    │   ├── docs/                        # Project documentation
    │   │   ├── architecture/
    │   │   ├── decisions/               # ADRs
    │   │   ├── guides/
    │   │   └── references/
    │   ├── shared/                      # SHARED RESPONSIBILITY tickets (all devs in this project)
    │   │   ├── tickets/                 # Tickets for this project (WOMONO-XXX, WOW-XXX, OPT-XXX)
    │   │   │   └── TODO.md
    │   │   ├── plans/
    │   │   └── research/
    │   ├── craig/                       # Personal dirs (all developers)
    │   ├── josef/
    │   ├── andre/
    │   ├── tomas/
    │   └── zerwiz/
    ├── wow/                             # When cloned for WoW work
    └── opticat/                         # When cloned for Opticat work
    ```

7. **Add `thoughts/` to `.gitignore`** (if not already present):
    ```
    # Centralized in Way-Of/f-rr-d
    thoughts/
    ```

8. **Delete local `thoughts/shared/` if it exists** — WRONG location for global thoughts. Global thoughts go in `thoughts/global/`.

9. **Present next steps to the user**

## Quick Reference

After initialization, tickets live in the shared f-rr-d repo:
- `thoughts/shared/tickets/ticket-template.md` — cross-project template
- `thoughts/${PROJECT_SLUG}/shared/tickets/` — this project's tickets
- All skills sync via `git pull` from `github.com/Way-Of/f-rr-d`

## Workflow After Initialization

```
Ticket → /create_plan → /implement_plan → /validate_plan → /commit
```
