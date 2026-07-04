---
name: init-harness
description: Initialize the AI Engineering Harness in a repository by running the tool's project memory init, then cloning the shared f-rr-d thoughts repo and setting up the standard directory structure. The f-rr-d repo is append-only — never delete, rename, or move anything inside thoughts/.
disable-model-invocation: true
allowed-tools: read, write, bash
---
# Initialize Harness

Initialize the AI Engineering Harness in this repository.

## What This Command Does

1. Runs the tool's project memory init to generate project memory file
2. Discovers all installed skills, commands, and agents and writes them into the project memory file
3. Clones the shared `f-rr-d` repo into `thoughts/` with full branch tracking
4. Creates the project's subfolder inside `thoughts/` with standard structure
5. Creates personal thoughts directories for developers
6. Adds `thoughts/` to `.gitignore` to prevent accidental commits

## Critical Rules — f-rr-d is Append-Only

The `thoughts/` directory is a clone of `github.com/Way-Of/f-rr-d`. It must be treated as **append-only**:

- **NEVER delete** any file or directory inside `thoughts/`
- **NEVER rename** or **move** any file or directory inside `thoughts/`
- **NEVER modify** existing files — only create new ones
- Only **create new files** (tickets, plans, research docs) in the appropriate project subfolder
- Existing tickets, plans, research, and documentation must be left exactly as they are

This is the shared knowledge base across all projects. Deleting or renaming content in one project silently breaks references for all others.

### thoughts/ is Exclusively Managed by f-rr-d

The `thoughts/` folder is **not** part of your project's git history. It is a standalone clone of `github.com/Way-Of/f-rr-d`:

- **Never commit** `thoughts/` to your project's repository
- **Only push/pull** `thoughts/` to/from `github.com/Way-Of/f-rr-d`
- The `.gitignore` entry is **critical** — without it, CI/CD and GitHub Actions workflows may break by pushing f-rr-d content to the wrong remote
- All ticket, plan, and research operations happen inside `thoughts/` and sync exclusively with f-rr-d

### Multi-Machine Sync (f-rr-d)

The f-rr-d repo is shared across multiple machines (developer laptops, CI, agent environments). Always follow this workflow to avoid conflicts:

**Pull before every session:**
```bash
git -C thoughts/ pull --ff-only
```
If this fails (branch diverged):
```bash
git -C thoughts/ pull --rebase
```

**Push after every write:**
```bash
git -C thoughts/ add <file>
git -C thoughts/ commit -m "<PREFIX>-<NNN>: <description>"
git -C thoughts/ push origin main
```

**If push is rejected (remote has new commits from another machine):**
```bash
git -C thoughts/ pull --rebase    # replay local commits on top of remote
git -C thoughts/ push origin main
```
Never force-push.

**Avoid conflicts by:**
- Working on different files per machine
- Appending-only for existing files (create new, never modify existing tickets)
- Committing often to keep divergence small

## Prerequisites

- Git installed and configured
- **GitHub authentication configured for push access**:
  - `gh auth login` (GitHub CLI) or
  - `git config --global credential.helper store` with a personal access token
- `thoughts/` must **never** be committed to the project repo — it is `.gitignore`d and managed by f-rr-d exclusively

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

#### Step 2a: Discover and Append AI Engineering Harness Skills, Commands & Agents Reference

After the project memory file is created (or if it already exists), append a reference section listing all skills, commands, and agents installed by the AI Engineering Harness.

Determine the tool's config directory installed by the harness (e.g., `~/.config/opencode/`, `~/.claude/`, `~/.gemini/`, `~/.pi/agent/`, `~/.wocode/`, `~/.antigravity/`, `~/.codex/`). Then discover skills, commands, and agents:

```bash
# List all installed skill names from the AI Engineering Harness
ls -d <TOOL_CONFIG_DIR>/skills/*/ 2>/dev/null | xargs -n1 basename | sort

# List all installed command names (if tool has a commands/ dir from the harness)
ls <TOOL_CONFIG_DIR>/commands/ 2>/dev/null | sed 's/\.md$//' | sort

# List all installed agent names from the AI Engineering Harness
ls <TOOL_CONFIG_DIR>/agents/ 2>/dev/null | sed 's/\.md$//' | grep -vi readme | sort
```

Append the following section to the project memory file:

```markdown
## Available Skills & Commands

### Skills (auto-triggered by the AI Engineering Harness)
<list each skill name from the discovery above, one per line>

### Commands (slash commands from the AI Engineering Harness)
<list each command name from the discovery above, one per line>

### Agents (available from the AI Engineering Harness)
<list each agent name from the discovery above, one per line>
```

If the tool does not have a `commands/` directory (e.g., Claude, Codex), omit the Commands section.

After listing skills and commands, also add structured agent definitions for the 6 GitHub skills so that agents know exactly when and how to use them:

```markdown
## GitHub Skills Agent Directory

Use these skills for all GitHub operations. Never use raw `gh` or `git` commands for operations covered by these skills.

#### Agent: GitHub Branch (github-branch)
- **Identifier:** `github_branch_v1`
- **Primary Runtime:** Platform-native
- **Core Responsibility:** Create and manage feature branches from tickets with proper naming, ticket linking, and base branch selection
- **Inputs:** Ticket ID, branch name, namespace
- **Outputs:** Feature branch created, pushed to origin
- **Constraints:** Never push directly to `main`; always create feature branches; never force-push

#### Agent: GitHub Issue (github-issue)
- **Identifier:** `github_issue_v1`
- **Primary Runtime:** Platform-native
- **Core Responsibility:** Create, manage, and link GitHub Issues with f-rr-d tickets; bi-directional sync
- **Inputs:** Ticket details, namespace, labels
- **Outputs:** GitHub Issue created/updated, synced with f-rr-d
- **Constraints:** Must maintain bi-directional link between GitHub Issue and f-rr-d ticket; never close tickets without verification

#### Agent: GitHub PR (github-pr)
- **Identifier:** `github_pr_v1`
- **Primary Runtime:** Platform-native
- **Core Responsibility:** Create, manage, and review Pull Requests with ticket linking, templates, and review workflow
- **Inputs:** Branch name, ticket reference, PR template
- **Outputs:** PR created, linked to ticket, ready for review
- **Constraints:** Never merge own PRs; always use PR templates; must reference the ticket in the PR body

#### Agent: GitHub Release (github-release)
- **Identifier:** `github_release_v1`
- **Primary Runtime:** Platform-native
- **Core Responsibility:** Create releases with changelog generation, version tagging, and automated publishing
- **Inputs:** Version number, changelog entries, target branch
- **Outputs:** GitHub Release created, tag pushed
- **Constraints:** Must validate version is bumped in all required files; never delete existing releases

#### Agent: GitHub Review (github-review)
- **Identifier:** `github_review_v1`
- **Primary Runtime:** Platform-native
- **Core Responsibility:** Review Pull Requests with structured feedback, approval workflow, and CTO Dashboard integration
- **Inputs:** PR URL, review criteria
- **Outputs:** Review submitted (approve/changes-requested/reject), CTO Dashboard notified
- **Constraints:** Never self-review; must verify against ticket acceptance criteria; only CTO can dismiss reviews

#### Agent: GitHub Sync (github-sync)
- **Identifier:** `github_sync_v1`
- **Primary Runtime:** Platform-native
- **Core Responsibility:** Sync feature branches with base branch, resolve conflicts, and manage branch lifecycle
- **Inputs:** Feature branch name, base branch name
- **Outputs:** Branch synced, conflicts resolved, CI re-triggered
- **Constraints:** Never force-push; always pull --rebase before syncing; must run CI after conflict resolution
```

### GitHub Workflow Pattern

After adding the GitHub skill agent definitions, also append this workflow to the project memory file:

```markdown
## GitHub Workflow

All GitHub operations follow this sequence:
1. `github-branch` — Create a feature branch from a ticket
2. `github-pr` — Create a Pull Request from the branch
3. `github-review` — Request review, address feedback
4. `github-sync` — Keep branch up-to-date with base
5. `github-release` — Tag and release when merged
6. `github-issue` — Link issues to PRs throughout
```

This ensures agents always use the correct skill for each step and never resort to raw commands.

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
├── enforcement-ticket/ # HIGHEST PRIORITY — overrides all other tickets
├── zerwiz/             # Developer workspace
├── tomas/              # Developer workspace
├── craig/              # Developer workspace
├── andre/              # Developer workspace
├── TODO.md             # If the user wants one
```

> **Enforcement tickets** are the highest priority items in the project. They **override all other tickets** — when an enforcement ticket exists, all work on non-enforcement tickets must pause until the enforcement ticket is resolved. This includes tickets across all namespaces (WOMONO, WOW, OPT).

Create the core structure:

```bash
mkdir -p thoughts/${PROJECT_SLUG}/shared/{tickets,plans,research}
mkdir -p thoughts/${PROJECT_SLUG}/docs/{architecture,decisions,guides,references}
mkdir -p thoughts/${PROJECT_SLUG}/{global,enforcement-ticket,zerwiz,tomas,craig,andre}
```

Copy the ticket template from the shared location:

```bash
cp thoughts/shared/tickets/ticket-template.md thoughts/${PROJECT_SLUG}/shared/tickets/
```

Additional subdirectories like `docs/best-practices/`, `docs/skills/`, `docs/tools/` can be added as needed — follow what existing projects have.

### Step 5: Create Personal Thoughts Directories

Developer directories (`zerwiz/`, `tomas/`, `craig/`, `andre/`) were already created in Step 4. These are **always** created for every project — no user input needed. If additional developers join later, create their directories manually:

```bash
mkdir -p thoughts/${PROJECT_SLUG}/<developer-name>
```

Personal dirs contain tickets, plans, and research files directly — no subfolder structure needed.

### Step 6: Add thoughts/ to .gitignore (Critical)

This step is **critical** — without it, GitHub Actions and CI/CD pipelines may push f-rr-d content to the wrong remote. The `thoughts/` directory must **never** be committed to the project repo.

```bash
# CRITICAL: ensure thoughts/ is gitignored — prevents f-rr-d content from polluting project repo
grep -q '^thoughts/' .gitignore 2>/dev/null || echo '# Centralized in Way-Of/f-rr-d' >> .gitignore
grep -q '^thoughts/' .gitignore 2>/dev/null || echo 'thoughts/' >> .gitignore
```

**Verify the entry exists** — if `.gitignore` did not exist before, create it and add the entry. After adding, confirm with `grep '^thoughts/' .gitignore`.

### Step 7: Output Success Message

Print the following summary:

```
## Harness Initialized Successfully

### Created
- <project-memory-file> — Project memory for AI agents (includes skills, commands & agents reference)
- thoughts/ — Centralized f-rr-d repository for tickets, plans, research
- thoughts/${PROJECT_SLUG}/ — This project's workspace

### Available Agents
The following agents are available via the AI Engineering Harness:
- **codebase_analyzer** — Analyze implementation details, trace data flow
- **codebase_locator** — Find files/directories by feature or task
- **codebase_pattern_finder** — Discover similar implementations and patterns
- **thoughts_analyzer** — Extract insights from research documents
- **thoughts_locator** — Discover documents in thoughts/ directory
- **web_search_researcher** — Research information from web sources
- **coder** — Implementation and code generation
- **planner** — Architecture and implementation planning
- **reviewer** — Code review and quality checks
- **scout** — Fast codebase reconnaissance
- **netlify_troubleshooter** — Netlify CI/CD diagnostics and build pipeline

Use `/help` to learn more about each agent.

### Next Steps
1. **Set up GitHub auth for f-rr-d** (if not done):
   - `gh auth login` or configure a personal access token
   - Required for pushing tickets, plans, and research to f-rr-d
2. Create your first ticket:
   cp thoughts/shared/tickets/ticket-template.md thoughts/${PROJECT_SLUG}/shared/tickets/PROJ-001-my-feature.md
3. Generate a plan: /create_plan ...
4. Implement: /implement_plan ...
5. Commit: /commit

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

### Missing GitHub Auth for f-rr-d Push

If the user tries to push to f-rr-d and gets an authentication error, guide them to set up auth:
- `gh auth login` — interactive GitHub CLI login
- Or create a personal access token and store it: `git config --global credential.helper store`

Without auth, cloning works (public repo) but pushing tickets/plans/research will fail.
