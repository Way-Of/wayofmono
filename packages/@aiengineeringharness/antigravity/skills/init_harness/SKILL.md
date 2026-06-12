---
name: init_harness
description: >-
  Initialize the AI Engineering Harness in a repository by running the tool'\''s
  project memory init, then cloning the shared f-rr-d thoughts repo and setting
  up the standard directory structure.
disable-model-invocation: true
allowed-tools: 'read, write, bash'
---


# Initialize Harness

Initialize the AI Engineering Harness in this repository.

## What This Command Does

1. Runs the tool's project memory init to generate project memory file
2. Clones the shared `f-rr-d` repo into `thoughts/`
3. Creates the project's subfolder inside `thoughts/` with standard structure
4. Creates personal thoughts directories for developers
5. Adds `thoughts/` to `.gitignore` to prevent accidental commits

## Prerequisites

- Git installed and configured
- Access to `github.com/Way-Of/f-rr-d` (public — no auth needed)

## Instructions

### Step 1: Determine the Project Slug

Run `git remote -v` or use the directory name to determine the project slug. Common values: `wayofmono`, `wo`, `opticat`. Set `PROJECT_SLUG` to this value.

### Step 2: Generate Project Memory

Check if the project memory file already exists. If it does, keep it and skip this step.
If not, run the tool's `/init` command. If this tool has no `/init`, create the project memory file manually with the standard format for this tool.

### Step 3: Clone the Shared f-rr-d Repo

Run these checks in order:

1. If `thoughts/` does not exist:
   ```bash
   git clone https://github.com/Way-Of/f-rr-d.git thoughts/
   ```
2. If `thoughts/` exists, check its remote origin:
   - If it points to `Way-Of/f-rr-d`: run `git -C thoughts/ pull --ff-only`
   - If it points to a different repo or is not a repo: ask the user whether to back up and clone, skip, or merge manually, then execute their choice

### Step 4: Create the Project Subfolder

```bash
mkdir -p thoughts/${PROJECT_SLUG}/shared/{tickets,plans,research}
mkdir -p thoughts/${PROJECT_SLUG}/global
mkdir -p thoughts/${PROJECT_SLUG}/docs/{architecture,decisions,guides,references}
```

### Step 5: Create Personal Thoughts Directories

```bash
mkdir -p thoughts/${PROJECT_SLUG}/$(whoami)/{tickets,plans,research}
```

Pre-create directories for any known team members if applicable.

### Step 6: Add thoughts/ to .gitignore

```bash
grep -q '^thoughts/' .gitignore 2>/dev/null || echo '# Centralized in Way-Of/f-rr-d' >> .gitignore
grep -q '^thoughts/' .gitignore 2>/dev/null || echo 'thoughts/' >> .gitignore
```

### Step 7: Output Success Message

Print the following summary:

```
## Harness Initialized Successfully

### Created
- <project-memory-file> — Project memory for AI agents
- thoughts/ — Centralized f-rr-d repository for tickets, plans, research
- thoughts/${PROJECT_SLUG}/ — This project's workspace

### Next Steps
1. Create your first ticket:
   cp thoughts/shared/tickets/ticket-template.md thoughts/${PROJECT_SLUG}/shared/tickets/PROJ-001-my-feature.md
2. Generate a plan: /create_plan ...
3. Implement: /implement_plan ...
4. Commit: /commit

### Workflow
Ticket → /create_plan → /implement_plan → /validate_plan → /commit
```

## Edge Cases

### Not a Git Repository

Check with `git rev-parse --git-dir`. If it fails, run `git init` first, then proceed.

### thoughts/ Already Exists (Wrong Repo)

If `thoughts/` exists and its remote origin is not `Way-Of/f-rr-d`, ask the user: back up and clone, skip, or merge manually. Execute their choice.

### Project Memory File Already Exists

Keep the existing file. Only regenerate if the user explicitly asks.
