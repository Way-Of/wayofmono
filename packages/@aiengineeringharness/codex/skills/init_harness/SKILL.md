---
name: init_harness
description: Initialize the AI Engineering Harness in a repository by running the tool's project memory init, then cloning the shared f-rr-d thoughts repo and setting up the standard directory structure.
disable-model-invocation: true
allowed-tools: read_file, write_file, run_shell_command
argument-hint: "[project-slug]"
---

# Initialize Harness

Initialize the AI Engineering Harness in this repository.

## What This Command Does

1. **Runs the tool's project memory init** (e.g., `/init` for OpenCode/Claude) to generate the project memory file (`AGENTS.md`, `CLAUDE.md`, etc.)
2. **Clones the shared `f-rr-d` repo** into `thoughts/` — the centralized hub for tickets, plans, research, and personal TODOs across all projects
3. **Creates the project's subfolder** inside `thoughts/` with the standard structure
4. **Creates personal thoughts directories** for developers
5. **Provides guidance on next steps**

## Prerequisites

- Git installed and configured
- [Deno](https://deno.com/) installed (`curl -fsSL https://deno.land/install.sh | sh`)
- Access to `github.com/Way-Of/f-rr-d` (public repo — no auth required for clone)

## Instructions

### Step 1: Determine the Project Slug

- Use the repository name (from `git remote -v` or the directory name)
- Examples: `wayofmono`, `wo`, `opticat`, `healthoptimizing`
- If uncertain, ask the user for the project slug
- Store in a variable: `PROJECT_SLUG=<dirname>`

### Step 2: Generate Project Memory

Run the tool's built-in project memory command:

**OpenCode / Wo Coder:**
```
Run /init — generates AGENTS.md with codebase analysis
```

**Claude Code:**
```
Run /init — generates CLAUDE.md with codebase analysis
```

**Other tools (Pi, Gemini, Codex, Antigravity):**
```
Create the project memory file manually or via the tool's equivalent command.
Reference: docs/HARNESS_TUTORIAL.md for the specific format per tool.
```

If the project memory file already exists, ask the user whether to keep or regenerate it.

### Step 3: Clone the Shared f-rr-d Repo

If `thoughts/` does not already exist:

```bash
git clone https://github.com/Way-Of/f-rr-d.git thoughts/
```

If `thoughts/` already exists, verify it's a clone of f-rr-d by checking the remote origin. If it's a different repo, warn the user.

### Step 4: Create the Project Subfolder

```bash
mkdir -p thoughts/${PROJECT_SLUG}/shared/{tickets,plans,research}
mkdir -p thoughts/${PROJECT_SLUG}/global
mkdir -p thoughts/${PROJECT_SLUG}/docs/{architecture,decisions,guides,references}
```

### Step 5: Create Personal Thoughts Directories

For each developer working on the project:

```bash
mkdir -p thoughts/${PROJECT_SLUG}/$(whoami)/{tickets,plans,research}
```

Optionally, pre-create directories for known team members if applicable.

### Step 6: Add thoughts/ to .gitignore

```bash
# Check if thoughts/ is already in .gitignore
grep -q '^thoughts/' .gitignore 2>/dev/null || echo '# Centralized in Way-Of/f-rr-d' >> .gitignore
grep -q '^thoughts/' .gitignore 2>/dev/null || echo 'thoughts/' >> .gitignore
```

### Step 7: Verify the Structure

```
thoughts/
├── global/                          # Cross-project global thoughts
├── shared/                          # Cross-project templates only
│   └── tickets/ticket-template.md
├── ${PROJECT_SLUG}/                 # This project's thoughts
│   ├── global/
│   ├── docs/
│   │   ├── architecture/
│   │   ├── decisions/
│   │   ├── guides/
│   │   └── references/
│   ├── shared/
│   │   ├── tickets/
│   │   ├── plans/
│   │   └── research/
│   └── $(whoami)/
│       ├── tickets/
│       ├── plans/
│       └── research/
├── wow/                             # When applicable
└── opticat/                         # When applicable
```

### Step 8: Present Next Steps

```markdown
## Harness Initialized Successfully

### Created
- `<project-memory-file>` — Project memory for AI agents
- `thoughts/` — Centralized f-rr-d repository for tickets, plans, research
- `thoughts/${PROJECT_SLUG}/` — This project's workspace

### Next Steps

1. **Create your first ticket**:
   Copy the template: `cp thoughts/shared/tickets/ticket-template.md thoughts/${PROJECT_SLUG}/shared/tickets/PROJ-001-my-feature.md`

2. **Generate a plan**: `/create_plan thoughts/${PROJECT_SLUG}/shared/tickets/PROJ-001-my-feature.md`

3. **Implement**: `/implement_plan thoughts/${PROJECT_SLUG}/shared/plans/my-plan.md`

4. **Commit**: `/commit`

### Workflow
Ticket → /create_plan → /implement_plan → /validate_plan → /commit
```

## Edge Cases

### thoughts/ Already Exists (Not f-rr-d)

If `thoughts/` exists but is not the f-rr-d repo, warn the user:
```
thoughts/ already exists and is not the f-rr-d repository.
Options:
1. Back up existing thoughts/ and clone f-rr-d
2. Keep existing thoughts/ and skip cloning
3. Merge: clone f-rr-d elsewhere, manually merge content
```

### thoughts/ Already Exists (Is f-rr-d)

Run `git -C thoughts/ pull --ff-only` to update.

### No Git Repository

If the current directory is not a git repo, suggest `git init` first.

### Project Memory File Already Exists

Ask the user:
```
<project-memory-file> already exists. Options:
1. Keep existing (recommended if customized)
2. Regenerate with /init (will overwrite)
```
