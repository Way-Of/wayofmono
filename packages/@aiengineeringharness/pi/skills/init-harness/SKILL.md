---
name: init-harness
description: >-
  Initialize the AI Engineering Harness in a repository by running the tool's
  project memory init, then cloning the shared f-rr-d thoughts repo and setting
  up the standard directory structure. The f-rr-d repo is append-only — never
  delete, rename, or move anything inside thoughts/.
disable-model-invocation: true
allowed-tools: 'Read, Write, Bash'
---

# Initialize Harness

Initialize the AI Engineering Harness in this repository.

## What This Command Does

1. Runs the tool's project memory init to generate project memory file
2. Clones the shared `f-rr-d` repo into `thoughts/` with full branch tracking
3. Creates the project's subfolder inside `thoughts/` with standard structure
4. Creates personal thoughts directories for developers
5. Adds `thoughts/` to `.gitignore` to prevent accidental commits

## Critical Rules — f-rr-d is Append-Only

The `thoughts/` directory is a clone of `github.com/Way-Of/f-rr-d`. It must be treated as **append-only**:

- **NEVER delete** any file or directory inside `thoughts/`
- **NEVER rename** or **move** any file or directory inside `thoughts/`
- **NEVER modify** existing files — only create new ones
- Only **create new files** (tickets, plans, research docs) in the appropriate project subfolder
- Existing tickets, plans, research, and documentation must be left exactly as they are

This is the shared knowledge base across all projects. Deleting or renaming content in one project silently breaks references for all others.

## Prerequisites

- Git installed and configured
- Access to `github.com/Way-Of/f-rr-d` (public — no auth needed for clone; push requires auth)

## Instructions

### Step 1: Define the Project

Ask the user:
1. What is the project name? (e.g., "WayOfMono", "Opticat", "WayOfWork")
2. What slug should be used? (e.g., "wayofmono", "opticat", "wow")

Accept any value — multiple projects can have similar names. Do not validate uniqueness.

Set `PROJECT_NAME` to the project name and `PROJECT_SLUG` to the slug.

### Step 2: Generate Project Memory

Check if the project memory file already exists. If it does, keep it and skip this step.
If not, run the tool's `/init` command. If this tool has no `/init`, create the project memory file manually with the standard format for this tool.

### Step 3: Clone the Shared f-rr-d Repo

Run these checks in order:

1. If `thoughts/` does not exist:
   ```bash
   git clone https://github.com/Way-Of/f-rr-d.git thoughts/ || { rm -rf thoughts/; echo "ERROR: git clone failed — thoughts/ has been cleaned up."; exit 1; }
   ```
   After cloning, fetch all branches and set up tracking:
   ```bash
   git -C thoughts/ fetch --all
   git -C thoughts/ branch -a
   ```
2. If `thoughts/` exists, check its remote origin:
   - If it points to `Way-Of/f-rr-d`: run `git -C thoughts/ pull --ff-only`
   - If it points to a different repo or is not a repo: ask the user whether to back up and clone, skip, or merge manually, then execute their choice. If cloning, back up the existing directory first, then remove it and clone fresh.

If the clone fails at any point, remove the partially-created `thoughts/` directory and exit with an error message.

**Append-only reminder**: Once cloned, only create new files. Never delete, rename, move, or modify existing content inside `thoughts/`.

### Step 4: Create the Project Subfolder — Match Existing f-rr-d Structure

First, examine the existing f-rr-d structure to understand the pattern. Look at `thoughts/wayofmono/`, `thoughts/wow/`, and `thoughts/opticat/` for reference. The canonical structure is:

```
thoughts/${PROJECT_SLUG}/
├── shared/
│   ├── tickets/        # Tickets (copy template from thoughts/shared/tickets/ticket-template.md)
│   ├── plans/          # Implementation plans
│   └── research/       # Research documents
├── docs/
│   ├── architecture/   # Architecture docs
│   ├── decisions/      # ADRs
│   ├── guides/         # How-to guides
│   └── references/     # Reference docs
├── global/             # Project-level cross-cutting concerns
├── TODO.md             # If the user wants one
└── enforcement-ticket/ # If the project needs it
```

Create the core structure:

```bash
mkdir -p thoughts/${PROJECT_SLUG}/shared/{tickets,plans,research}
mkdir -p thoughts/${PROJECT_SLUG}/docs/{architecture,decisions,guides,references}
mkdir -p thoughts/${PROJECT_SLUG}/global
```

Copy the ticket template from the shared location:

```bash
cp thoughts/shared/tickets/ticket-template.md thoughts/${PROJECT_SLUG}/shared/tickets/
```

Additional subdirectories like `docs/best-practices/`, `docs/skills/`, `docs/tools/` can be added as needed — follow what existing projects have.

### Step 5: Create Personal Thoughts Directories

```bash
mkdir -p thoughts/${PROJECT_SLUG}/$(whoami)
```

Create directories for any known team members the user mentions. Personal dirs contain tickets, plans, and research files directly — no subfolder structure needed.

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

If `thoughts/` exists and its remote origin is not `Way-Of/f-rr-d`, ask the user: back up and clone, skip, or merge manually. Execute their choice. If cloning, back up the existing directory first, then remove it and clone fresh. Restore any user files from backup into the new clone's appropriate locations.

### Git Clone Failure

If `git clone` fails (network error, no access, etc.), remove the partially-created `thoughts/` directory immediately and report the error. The user can retry after resolving the issue.

### Project Memory File Already Exists

Keep the existing file. Only regenerate if the user explicitly asks.
