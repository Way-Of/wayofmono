# WayOfMono Monorepo — AGENTS.md

This is the **AGENTS.md for the WayOfMono monorepo** (not the förråd thoughts repo).
The förråd AGENTS.md is at `thoughts/AGENTS.md`.

---

## AGENTS.md Architecture Standard

This file follows the **Agent Ecosystem Manifest** blueprint — a runtime manifest and single source of truth for multi-agent systems. It aligns human developers, system administrators, and models on boundaries, routing logic, and execution layers.

### Global Orchestration Rules

- All agents must output structured JSON when interacting with the execution layer
- If an agent encounters an unrecoverable validation error, it must route state back to the coordinator
- No agent may invoke an external tool without an explicit schema check
- Negative constraints are mandatory: every agent must define what it is *not* allowed to do

### Agent Directory

#### Agent: Harness Installer (ai-harness)
- **Identifier:** `harness_installer_v1`
- **Primary Runtime:** Deno (install.ts)
- **Target Model:** System (deterministic execution)
- **Context Window:** N/A (CLI binary)

**Core Responsibility:** Install, update, sync, and validate skills/agents/commands across 7 AI coding tool frontends

**Inputs & Outputs:**
- **Upstream:** User CLI commands (`--tool`, `--update`, `--sync-docs`, etc.)
- **Downstream:** Manifest.json, tool config directories (`~/.claude/`, `~/.config/opencode/`, etc.)

**Constraints:**
- Never modify user code outside target config directories
- Never delete files not in manifest (unless `--prune` explicitly confirmed)
- Must validate all paths exist before write operations

---

#### Agent: Skill Auto-Updater (skill_auto_update)
- **Identifier:** `skill_auto_updater_v1`
- **Primary Runtime:** Platform-native (each tool's agent runtime)
- **Target Model:** Host tool's configured model

**Core Responsibility:** Auto-discover, sync, and update skills across all 7 frontends

**Inputs & Outputs:**
- **Upstream:** Manifest changes, GitHub releases, skill registry updates
- **Downstream:** Per-tool skill directories

**Constraints:**
- Never overwrite user-modified skills without confirmation
- Must preserve per-tool naming conventions (snake_case vs kebab-case)
- Must validate frontmatter compliance before deployment

---

#### Agent: Ticket Manager (ticket_manager)
- **Identifier:** `ticket_manager_v1`
- **Primary Runtime:** Platform-native
- **Target Model:** Host tool's configured model

**Core Responsibility:** Manage tickets across WOMONO/WOW/OPT namespaces with full lifecycle

**Inputs & Outputs:**
- **Upstream:** User requests, auto-ticket-creator detections
- **Downstream:** `thoughts/<project>/shared/tickets/`

**Constraints:**
- Never create tickets without proper namespace prefix
- Must enforce production-ready standards (no mock data)
- Must update status on every work session

---

#### Agent: Codebase Analyzer (codebase_analyzer)
- **Identifier:** `codebase_analyzer_v1`
- **Primary Runtime:** Platform-native
- **Target Model:** Host tool's configured model

**Core Responsibility:** Analyze implementation details, trace data flow, identify architectural patterns

**Inputs & Outputs:**
- **Upstream:** User queries, other agents
- **Downstream:** Structured analysis reports

**Constraints:**
- Never modify code — read-only analysis
- Must cite file paths with line numbers (`file_path:line_number`)

---

#### Agent: CTO Dashboard (cto_dashboard)
- **Identifier:** `cto_dashboard_v1`
- **Primary Runtime:** Next.js 16 (ui/)
- **Target Model:** N/A (web dashboard)

**Core Responsibility:** Telemetry, standups, tickets, review queues, skills health visualization

**Inputs & Outputs:**
- **Upstream:** Skill reports, GitHub webhooks, ticket updates
- **Downstream:** Dashboard UI, API endpoints

**Constraints:**
- Must not expose secrets in UI
- Must validate all API inputs

### AGENTS.md Maintenance Protocol

**Automatic Sync Verification:** The harness includes `scripts/compliance-check.ts` and `scripts/docs-sync.ts` that verify AGENTS.md content matches active code.

**Prompt Metrics Tracking:** Version changes to agent definitions are tracked in `CHANGELOG.md` with triggering issues and outcome metrics.

**Context Budget Review:** Monthly review of agent system prompts — constraints not triggered in 30 days move to defensive code layers.

---

## Non-Orchestrated AGENTS.md Blueprint (Static Reference)

When the dynamic orchestration layer is stripped away, an `AGENTS.md` shifts from a **runtime configuration manifest** into a **static developer reference and architecture contract**. It guides human developers and ensures hardcoded prompts, isolated background workers, and direct LLM API calls do not diverge from system design.

### Integration Standards

- Every LLM interaction in code must be wrapped in deterministic error-handling blocks
- Raw prompts in code must remain identical to prompt signatures documented below
- Changes to token budgets or models require corresponding AGENTS.md updates
- Each component must specify exact code path (`file_path:line_number`) where LLM interaction occurs

### Component Directory (Code-Coupled)

#### Component: Harness Installer CLI
- **Code Reference:** `packages/@aiengineeringharness/install.ts:879`
- **Trigger Event:** Direct CLI execution (`deno run -A install.ts` or `ai-harness`)
- **Runtime:** Deno (deterministic, no LLM)
- **Purpose:** Install, update, sync, validate skills/agents/commands across 7 AI coding tool frontends

#### Component: Skill Auto-Updater
- **Code Reference:** `packages/@aiengineeringharness/opencode/skills/skill_auto_update/SKILL.md`
- **Trigger Event:** Auto-triggered on skill registry changes, GitHub releases
- **Runtime:** Platform-native (each tool's agent runtime)
- **Purpose:** Auto-discover, sync, update skills across 7 frontends

#### Component: Ticket Manager
- **Code Reference:** `packages/@aiengineeringharness/opencode/skills/ticket_manager/SKILL.md`
- **Trigger Event:** User requests, auto-ticket-creator detections
- **Runtime:** Platform-native
- **Purpose:** Manage tickets across WOMONO/WOW/OPT namespaces with full lifecycle

#### Component: Codebase Analyzer
- **Code Reference:** `packages/@aiengineeringharness/opencode/agents/codebase_analyzer.md`
- **Trigger Event:** User queries, other agents
- **Runtime:** Platform-native
- **Purpose:** Analyze implementation details, trace data flow, identify architectural patterns

#### Component: CTO Dashboard
- **Code Reference:** `ui/src/app/api/`
- **Trigger Event:** HTTP requests, GitHub webhooks, scheduled jobs
- **Runtime:** Next.js 16 (web server)
- **Purpose:** Telemetry, standups, tickets, review queues, skills health visualization

### Non-Orchestrated Maintenance Protocol

**Code-to-Markdown Mapping:** Every component block specifies exact code path. If directory structure changes or files are renamed, AGENTS.md must be updated in same commit.

**Pre-Commit Checksums:** A git hook can verify raw string literals in code match documented prompt signatures. If prompt changes without documentation update, commit fails.

**Manual Context Budget Review:** Since no orchestration manager monitors context exhaustion, developers must audit token sizes manually. Log maximum allowable input length for every hardcoded function call. If context window errors occur, adjust entry point rules in AGENTS.md alongside code-level trimming logic.

## Project Overview

**ALLWAYS USE CHANGELOG.md**

**WayOfMono (Wo)** — Ultimate monorepo consolidation for high-performance coding agents.
- **AI Engineering Harness**: 81 battle-tested skills, 6 subagents, workflows across 7 tools
- **CTO Dashboard**: Telemetry, standups, tickets, review queues, skills health
- **f-rr-d (förråd)**: Centralized thoughts storage at `github.com/Way-Of/f-rr-d`

## This Monorepo Contains

| Package | Purpose | Location |
|---------|---------|----------|
| **AI Engineering Harness** | Core installer, skills, agents, commands for 7 AI coding tools | `packages/@aiengineeringharness/` |
| **wo-coding-agent (wocode)** | Native CLI coding agent for WayOfMono | `packages/wo-coding-agent/` |
| **wo-agent (wouser)** | General-purpose user agent SDK + CLI | `packages/wo-agent/` |
| **CTO Dashboard** | Next.js 16 dashboard for telemetry, tickets, reviews | `ui/` |
| **Documentation** | Authoritative reference for all 7 AI coding tools | `docs/ai-coding-tools/` |
| **Thoughts (f-rr-d)** | Tickets, plans, research, context engineering | `thoughts/` |

## Key Projects in This Org

| Project | Prefix | Description |
|---------|--------|-------------|
| **WayOfMono** | WOMONO | This monorepo - harness, agents, tooling |
| **WayOfWork (WoW)** | WOW | Multi-tenant workspace platform with AI agents |
| **OptiCat** | OPT | HVAC optimization platform with simulation backend |

## Repository Structure

```
./
├── packages/@aiengineeringharness/   # AI Engineering Harness (core)
│   ├── install.ts                    # CLI installer (deno)
│   ├── setup.sh                      # GNU Stow installer
│   ├── manifest.json                 # Skill/component manifest
│   ├── opencode/        → ~/.config/opencode/
│   ├── claude/          → ~/.claude/
│   ├── gemini/          → ~/.gemini/
│   ├── pi/              → ~/.pi/agent/
│   ├── wocode/         → ~/.wocode/
│   ├── antigravity/     → ~/.antigravity/
│   ├── codex/           → ~/.codex/
│   └── scripts/         # Pipeline tools (docs-sync, compliance, migrate)
├── ui/                              # CTO Dashboard (Next.js 16)
├── docs/                            # Documentation
├── thoughts/                        # Context engineering (f-rr-d)
│   ├── global/                      # Cross-project
│   ├── wayofmono/                   # WOMONO-XXX tickets
│   ├── wow/                         # WOW-XXX tickets
│   └── opticat/                     # OPT-XXX tickets
└── .github/workflows/               # CI/CD
```

## Key Workflow: f-rr-d Context Engineering

```
Ticket → /create_plan → /implement_plan → /validate_plan → /validate_telemetry → /commit
```

### Built-in Slash Commands

| Command | Description |
|---------|-------------|
| `/init_harness` | Initialize harness (AGENTS.md + thoughts/) |
| `/create_plan` | Generate implementation plan from ticket |
| `/implement_plan` | Execute approved plan phase-by-phase |
| `/validate_plan` | Verify implementation against plan |
| `/commit` | Create well-structured git commits |
| `/debug` | Investigate issues during testing |
| `/validate_telemetry` | Validate telemetry against narrative spec |
| `/help` | Unified help system |
| `/sync skills` | Sync all skills to all frontends |

## Supported Tools & Install

```bash
# Install CLI (one-liner — works on macOS, Linux, Windows)
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --install-cli

# Per tool
ai-harness --tool=opencode
ai-harness --tool=claude
ai-harness --tool=gemini
ai-harness --tool=pi
ai-harness --tool=codex
ai-harness --tool=antigravity
ai-harness --tool=wocode
ai-harness --tool=all --yes

# Update all
ai-harness --update

# Report skills to CTO Dashboard
ai-harness --report-skills
```

## Naming Conventions

| Tool | Skill/Dir Naming | Config Dir |
|------|------------------|------------|
| OpenCode | snake_case | `~/.config/opencode/` |
| Claude Code | snake_case | `~/.claude/` |
| Gemini CLI | snake_case | `~/.gemini/` |
| Pi | kebab-case | `~/.pi/agent/` |
| Codex | snake_case | `~/.codex/` |
| Antigravity | snake_case | `~/.antigravity/` |
| Wo Coder | snake_case | `~/.wocode/` |

**OpenCode Critical**: Skill directory name MUST match frontmatter `name` exactly (regex `^[a-z0-9]+(-[a-z0-9]+)*$`)

## f-rr-d (förråd) Structure

```
thoughts/
├── global/                    # Cross-project global concerns
├── shared/                    # Cross-project templates only
│   ├── tickets/ticket-template.md
│   ├── plans/
│   └── research/
├── wayofmono/                 # WayOfMono (WOMONO-XXX)
│   ├── docs/                  # Architecture, decisions, guides, references
│   ├── shared/tickets/        # WOMONO tickets
│   ├── shared/plans/
│   ├── shared/research/
│   └── <developer>/
├── wow/                       # WayOfWork (WOW-XXX)
│   ├── docs/
│   ├── shared/tickets/
│   ├── shared/plans/
│   └── <developer>/
└── opticat/                   # Opticat (OPT-XXX)
    ├── docs/
    ├── shared/tickets/
    ├── shared/plans/
    └── <developer>/
```

## Ticket Format

```
<PREFIX>-<NNN>-<UPPERCASE-DASHED-DESC>.md
```

| Prefix | Project | Namespace |
|--------|---------|-----------|
| WOMONO | wayofmono | womono |
| WOW | wow | wow |
| OPT | opticat | opticat |

Template: `thoughts/shared/tickets/ticket-template.md`

## Agent Instructions

Any AI agent working with this repo:

1. **Pull before read**: `git -C thoughts/ pull --ff-only`
2. **Write to correct project folder**: `thoughts/<project>/shared/tickets/` for tickets
3. **Commit + push after write**: Use semantic branch names
4. **Never store skills/agents here** — wrong repo (they live in `packages/@aiengineeringharness/`)

## Critical Files

- `packages/@aiengineeringharness/manifest.json` — Source of truth for skills
- `packages/@aiengineeringharness/install.ts` — Installer logic
- `thoughts/wayofmono/shared/tickets/ticket-template.md` — Canonical ticket template
- `thoughts/wayofmono/docs/best-practices/` — Production-ready standards
- `docs/ai-coding-tools/` — **Authoritative reference for all 7 AI coding tools** (install, config, extensions, MCP, subagents, commands, capabilities). Each tool has a dedicated `.md` file verified against official docs (June 2026).
- `docs/guides/` — **Installation, commands, skills, troubleshooting, project structure** guides for the harness and tools (getting-started, installation, commands, skills, wocode, wouser, dashboard, project-structure, troubleshooting)
- `README.md` — Complete installation guide, CLI reference, package list, dashboard, CI/CD
- `CHANGELOG.md` — Full version history
- `docs/fixes/` — **Release notes and bug fixes for harness, wocode, wouser, CTO Dashboard** (`ai-engineering-harness-fixes.md`, `wocode-fixes.md`, `wouser-fixes.md`, `cto-dashboard-fixes.md`). Read the relevant fixes file before working on any component — it's the authoritative per-component changelog.
- `docs/extensions.md` — Extension system documentation
- `docs/packages.md` — NPM package details
- `docs/themes.md` — Theme system
- `docs/keybindings.md` — Keybinding reference
- `docs/sdk.md` — SDK documentation
- `docs/models.md` — Model configuration
- `docs/tui.md` — TUI components
- `docs/prompt-templates.md` — Prompt template reference

## Production-Ready Mandate

All code must be:
- No mock data in application code
- Enterprise-grade error handling
- Observable (logging, metrics, traces)
- Secure (input validation, auth, rate limiting)
- Edge cases handled (empty states, timeouts, duplicates)
- Tests for failure modes (not just happy path)

## Key Documentation URLs

| Document | Purpose |
|----------|---------|
| `README.md` | Complete installation guide, CLI reference, package list, dashboard, CI/CD |
| `CHANGELOG.md` | Full version history |
| `docs/fixes/` | Release notes and bug fixes for harness, wocode, wouser, CTO Dashboard (`ai-engineering-harness-fixes.md`, `wocode-fixes.md`, `wouser-fixes.md`, `cto-dashboard-fixes.md`). Read before working on any component. |
| `docs/extensions.md` | Extension system documentation |
| `docs/packages.md` | NPM package details |
| `docs/themes.md` | Theme system |
| `docs/keybindings.md` | Keybinding reference |
| `docs/sdk.md` | SDK documentation |
| `docs/models.md` | Model configuration |
| `docs/tui.md` | TUI components |
| `docs/prompt-templates.md` — Prompt template reference |
| `docs/ai-coding-tools/` | Authoritative reference for all 7 AI coding tools (verified June 2026) |
| `docs/guides/` | Installation, commands, skills, troubleshooting, project structure guides |
| `docs/best-practices/` | Production-ready standards |

## NPM Packages (13 packages under @wayofmono scope)

| Package | Description |
|---------|-------------|
| `@wayofmono/wo-ai` | Multi-Provider LLM API (OpenAI, Anthropic, Gemini) |
| `@wayofmono/wo-tui` | High-Performance Terminal UI Library |
| `@wayofmono/wo-agent-core` | Central Agent Runtime & Extension API |
| `@wayofmono/wo-agent` | General-Purpose Agent SDK & CLI (**wouser**) |
| `@wayofmono/wo-coding-agent` | CLI Coding Agent (**wocode**) |
| `@wayofmono/wo-skill-docs` | Multi-format Documentation Expert |
| `@wayofmono/wo-mermaid` | TUI Mermaid Renderer (ASCII art) |
| `@wayofmono/web-access` | Web search, URL fetching, GitHub cloning, PDF/YouTube extraction |
| `@wayofmono/lens` | Codebase Analysis & Safety Engine |
| `@wayofmono/wo-web-ui` | Web UI Components (React 19) |
| `@wayofmono/telemetry` | Telemetry and metrics |
| `@wayofmono/telegram` | Telegram bot integration |
| `@wayofmono/whatsapp` | WhatsApp bot integration |

## External Integrations

| Project | Description | Integration |
|---------|-------------|-------------|
| [Way of Pi](https://github.com/Way-Of/pi) | AI-augmented engineering platform (Electron/Web IDE) | Uses `@wayofmono/wo-agent` as backend SDK |
| [Way of Work](https://github.com/Way-Of/work) | AI-powered productivity platform | Uses `@wayofmono/wo-agent` as user agent SDK |

## CI/CD Commands

```bash
# Run tests
pnpm -r test

# Typecheck
pnpm -r --parallel typecheck

# Sync docs check
ai-harness --sync-docs --check

# Build
pnpm -r build

# Pre-deploy
curl https://cto.wayof.work/api/health
cd ui && pnpm build
```
