WOW-113 GitHub Usage Best Practices
Problem Statement

The team of "vibe coders" needs a standardized, easy-to-digest guide for using GitHub effectively. Currently, inconsistent workflows and lack of branching rules increase the risk of accidental merges, conflicts, and production instability.
Desired Outcome

A comprehensive yet accessible training guide and established repository rules that enable smooth collaboration, protect critical branches, and provide tools for error recovery and auditing.
Context & Background
Current State

Team members use Git with varying levels of proficiency. There are no formal rules protecting production or staging branches from direct AI-driven merges, leading to potential stability issues.
Why This Matters

As the team grows and AI agents become more active in the codebase, strict workflows are essential to prevent data loss and ensure that only human-reviewed (or strictly validated) code reaches production.
Requirements
Functional Requirements

    Basics & Workflow: Document core Git commands (add, commit, push, pull, fetch, status).
    Branching Strategy: Establish a "Feature Branch" workflow where all work starts in a separate branch.
    Staging & Production: Define the roles of main (production) and staging branches.
    Branch Protection: Document how to protect main and staging from direct pushes and accidental AI merges (requiring PRs and reviews).
    Error Recovery: Provide instructions for git reset, git revert, git stash, and git checkout to fix mistakes.
    Merge Conflict Resolution: A step-by-step guide on how to identify and resolve conflicts safely.
    Auditing: Instructions on using git blame and git diff to review coding sessions and track changes.

Out of Scope

    Setting up CI/CD pipelines (will be a separate ticket).
    Advanced Git internals (focus on "best practices for vibe coders").

AI Harness Requirement

    All coders must install and use the Way of Mono AI Harness: https://github.com/zerwiz/wayofmono
    The harness provides standardized agent configurations, skills, and workflows aligned with this codebase.

### Quick Install (for all agent frontends — one command)

Prerequisites: Deno (`curl -fsSL https://deno.land/install.sh | sh`) and GNU Stow (`sudo apt install stow` or `brew install stow`).

```bash
# One-time CLI setup
deno install -Agf -n ai-harness \
  https://raw.githubusercontent.com/zerwiz/wayofmono/main/packages/@aiengineeringharness/install.ts

# Install configs for all six agent frontends
ai-harness --tool=all --yes

# Or install individually:
ai-harness --tool=opencode        # OpenCode → ~/.config/opencode/
ai-harness --tool=claude          # Claude Code → ~/.claude/
ai-harness --tool=gemini          # Gemini CLI → ~/.gemini/
ai-harness --tool=pi              # Pi → ~/.pi/agent/
ai-harness --tool=wocoder         # Wo Coder → ~/.wocoder/
ai-harness --tool=antigravity     # Antigravity → ~/.antigravity/

# Check for updates
ai-harness --check
# → wocoder: UPDATE AVAILABLE v1.1.0 → v1.2.0
ai-harness --tool=all --yes       # Pull latest

# Alternative: Repo mode (GNU Stow) for symlink-based installation
git clone https://github.com/zerwiz/wayofmono.git ~/wayofmono
./packages/@aiengineeringharness/setup.sh all
```

### Project-Local Agent Setup

After harness install, initialize project-local agents in each repo:

```bash
# wocode (coding assistant) — dev dependency
pnpm add -D @wayofmono/wo-coding-agent
pnpm wocode --init
./wocode

# wouser (general assistant / SDK) — dependency
pnpm add @wayofmono/wo-agent
pnpm wouser --init
./wouser
```

This creates local `./wocode` or `./wouser` launchers, `models.json`, `settings.json`, and `.wo/` folder with zero global pollution.

Acceptance Criteria
Automated Verification

    Documentation is added to the repository in Markdown format (e.g., docs/GITHUB_BEST_PRACTICES.md).

Manual Verification

    The guide is reviewed and approved by the team.
    Branch protection rules are configured in the GitHub repository settings (documented as a task).

Technical Notes
Affected Components

    docs/ - New GITHUB_BEST_PRACTICES.md file.
    GitHub Repository Settings - Branch protection configuration.

Meta

Created: 2026-06-08 Priority: High Estimated Effort: M