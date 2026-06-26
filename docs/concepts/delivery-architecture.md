# Context Delivery Architecture

How skills, knowledge, and runtime capabilities are delivered to projects
via f-rr-d, the AI Engineering Harness, and WayOfMono packages.

## Overview

WayOfMono operates **4 interconnected delivery pipelines** that transform canonical sources into deployed instances. Every component flows through a **canonical source → adapt → deploy** pattern — skills, agents, commands, configs, runtime libraries, contextual knowledge, and engineering team observability.

The CTO Dashboard exists in two implementations: the original **Next.js** version (`ui/`) and the **WayOfTeams** Phoenix LiveView port (`thoughts/wayofteams/`), each consuming the same f-rr-d and harness pipelines.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DELIVERY PIPELINES                               │
│                                                                     │
│  Pipeline 1: Harness (skills/agents/configs)                        │
│  Pipeline 2: Packages (runtime/LLM/TUI capabilities)                │
│  Pipeline 3: f-rr-d (tickets/plans/research knowledge)              │
│  Pipeline 4: CTO Dashboard (telemetry/observability)                │
│     ├── Next.js (ui/)                                               │
│     └── WayOfTeams Phoenix (thoughts/wayofteams/)                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pipeline 1: AI Engineering Harness (Config Delivery)

Delivers **skills, agents, commands, extensions, and tool configs** to the 7 AI coding tools. This is the primary delivery mechanism for all agent-behavior artifacts.

### Canonical Source

```
packages/@aiengineeringharness/
├── manifest.json                 ← Compiled deployment map (auto-generated, do not edit)
├── config-manifest/              ← Modular YAML source of truth for manifest
│   ├── base_manifest.yaml        ← Global metadata, version, shared asset templates
│   ├── compile.py                ← YAML → manifest.json compiler
│   ├── validate.py               ← Per-tool format validator
│   ├── tools/                    ← Per-tool YAML definitions (7 files)
│   │   ├── opencode.yaml
│   │   ├── claude.yaml
│   │   ├── gemini.yaml
│   │   ├── pi.yaml
│   │   ├── codex.yaml
│   │   ├── wocode.yaml
│   │   └── antigravity.yaml
│   └── scripts/                  ← Test suite
│       ├── test-yamls.py         ← Per-tool YAML cross-contamination checks
│       ├── test-manifest.py      ← Compiled manifest structure checks
│       ├── test-skills.py        ← On-disk skill format compliance
│       └── run-all-tests.py      ← Orchestrator
├── opencode/skills/              ← Canonical skills (kebab-case)
├── opencode/agents/              ← Canonical agent definitions
└── scripts/
    ├── docs-sync.ts              ← Stale/legacy — use config-manifest instead
    └── compliance-check.ts       ← Stale/legacy — use config-manifest instead
```

### Flow

```
  config-manifest/tools/*.yaml
  (per-tool definitions with naming, casing, target dirs)
       │
       ├── compile.py ── validates + adapts ──→ manifest.json
       │   (TOOL_PATH_RULES enforce naming per tool)  (auto-generated)
       │
       ├── validate.py ── per-tool format spec check
       │   (naming: snake/kebab, allowed-tools case, targets)
       │
       └── test-skills.py ── on-disk validation per tool
           (frontmatter, dir naming, cross-tool alignment)
                │
                ▼
          install.ts ─── reads manifest ───→ ~/.claude/skills/
          (src→dest map)                      ~/.config/opencode/skills/
                                              ~/.gemini/skills/
                                              ~/.pi/agent/skills/
                                              ~/.antigravity/skills/
                                              ~/.codex/skills/
                                              ~/.wocode/skills/
```

### What Gets Deployed

| Component | Description | Per-Tool Adaptation |
|-----------|-------------|---------------------|
| **Skills** | 81 SKILL.md files with frontmatter + instructions | Dir naming: kebab/snake per tool. `allowed-tools` casing: PascalCase (Claude), lowercase (others). Field stripping per tool schema. |
| **Agents** | 6 core agents + tool-specific subagents | Agent def format per tool (snake_case dirs, kebab-case for Pi) |
| **Commands** | Slash commands (`/create_plan`, `/implement_plan`, etc.) | Command defs per tool format (TOML for Gemini, YAML for Codex, prompt templates for Pi) |
| **Settings** | `settings.json`, `.mcp.json`, `opencode.json` | Tool-native config schema |
| **Extensions** | Subagent multi-agent workflows (Pi, Wocode) | `package.json` with npm deps |
| **Hooks/Sidecars** | Antigravity-only lifecycle hooks | Tool-specific |

#### Manifest Compilation Pipeline

Instead of editing `manifest.json` directly (it is auto-generated and should not be hand-edited), contributors modify per-tool YAML files in `config-manifest/tools/`. The compilation pipeline enforces:

| Step | Script | Checks |
|------|--------|--------|
| **YAML validation** | `test-yamls.py` | Cross-contamination (no `claude/` paths in `opencode.yaml`), valid structure, correct tool prefix |
| **Compilation** | `compile.py` | Merges `base_manifest.yaml` + per-tool YAMLs → `manifest.json` |
| **Manifest validation** | `test-manifest.py` | All 7 tools present, correct JSON structure, path existence |
| **Skill format validation** | `test-skills.py` | Per-tool naming conventions, `allowed-tools` casing, frontmatter correctness |
| **Orchestrator** | `run-all-tests.py` | Runs all test suites, returns non-zero on failure |

Integration with skills: `skill-compliance-checker` invokes `validate.py`, `skill-adapter` consumes the compiled manifest, and `skill-auto-update` recompiles after sync.

##### Deep Dive: config-manifest Scripts

**`base_manifest.yaml`** — Global metadata (version, tool ordering, shared YAML anchors for asset templates like investor-ready docs). Each tool YAML inherits from this base.

**`tools/opencode.yaml`** (same pattern for all 7 tools) — Declares all `components` with `{src, dest}` file pairs. The cross-contamination rule is absolute: every `src` path must start with `opencode/` and must never reference paths from another tool's directory.

**`compile.py`** — Entry point for producing `manifest.json`. It:
1. Loads `base_manifest.yaml` for global metadata
2. Iterates all 7 `tools/*.yaml` files
3. Validates each tool's paths against `TOOL_PATH_RULES` (allowed prefixes, forbidden prefixes, naming convention)
4. Validates component naming (regex `^[a-z0-9]+([_-][a-z0-9]+)*$`)
5. Checks source file existence on disk (warning-level, not fatal)
6. Applies default targets (e.g., `~/.config/opencode`) when missing
7. Exits non-zero on any path/naming error — never writes an invalid manifest
8. Writes the merged `manifest.json` with `{version, tools}` structure

**`validate.py`** — Standalone format validator used by `skill-compliance-checker`. Validates per-tool YAMLs against `TOOL_SPECS` that include:
- `naming`: snake_case vs kebab-case per tool
- `allowed_tools_case`: PascalCase (Claude) vs lowercase (all others)
- `target`: expected install directory
- `skill_dir_regex`: format of skill directory names
- Cross-checks consistency with the compiled `manifest.json` (missing/extra components)

**`scripts/test-yamls.py`** — YAML-level structural validation. Checks every per-tool YAML for: valid YAML syntax, path prefix compliance (9 rules per tool — 1 allowed prefix, 6 forbidden), naming convention, source file existence, component structure (name/version/target/components).

**`scripts/test-manifest.py`** — Post-compilation validation of `manifest.json`. Checks: valid JSON, `version` + `tools` keys present, all 7 expected tools with no extras, per-tool structure (name/version/target/components), cross-contamination of paths, source file existence, component count matches YAML source.

**`scripts/test-skills.py`** — The most critical end-to-end test — validates what users actually download. Checks every on-disk SKILL.md across all 7 tools:
| Check | OpenCode | Claude | Gemini | Pi | WoCoder | Codex | Antigravity |
|-------|----------|--------|--------|----|---------|-------|-------------|
| Skill file | SKILL.md | SKILL.md | SKILL.md | SKILL.md | SKILL.md | skill.yaml+prompt.md | SKILL.md |
| Dir naming | kebab | kebab | kebab | kebab | snake | snake | snake |
| name field | kebab | snake | snake | kebab | snake | snake | snake |
| allowed-tools case | lowercase | PascalCase | lowercase | lowercase | lowercase | snake_case | lowercase |
| disable-model-invocation | commands only | commands only | unsupported | unsupported | commands only | unsupported | commands only |
Also validates cross-tool alignment — all 7 tools must have the same set of skills (only formatting differs).

**`scripts/run-all-tests.py`** — Orchestrator that runs all 3 test suites in sequence: YAML validation → manifest validation → skill format validation. Used in CI/CD. Exits non-zero on any failure.

### Idempotent Deployment

`install.ts` (line 1034-1058):
- Compares source content to existing destination
- Skips identical files (idempotent)
- Prompts on conflict (auto-confirm with `--yes`)
- Removes stale files not in manifest
- Writes `.harness-version` marker for update detection

### Atomic Transactions

The `transaction.ts` module provides write-ahead logging, rollback, and file locking for the installer:
- **`acquireLock()`** writes a `.lock` file with PID. If a stale lock is detected, it checks if the holding PID is alive (`/proc/<pid>` on Linux, `kill -0` on macOS) and automatically removes dead locks.
- **`transaction.ts::rollback()`** reverts partially-installed components on failure.
- Used by `install.ts` for all file operations — a failed install never leaves a half-deployed state.

### System Detection Layer

Before deploying, the installer profiles the system for platform-aware decisions:

```
detect/
├── os.ts           ─→ OS + distro detection
├── tools.ts        ─→ Already-installed AI tools
├── desktop.ts      ─→ Desktop env, XDG paths
├── arch.ts         ─→ CPU architecture
├── hardware.ts     ─→ RAM, CPU count
├── terminal.ts     ─→ Terminal capabilities
├── network.ts      ─→ Connectivity
├── security.ts     ─→ Security context
├── permissions.ts  ─→ Root/user status
└── runtime.ts      ─→ Deno version
```

---

## Pipeline 2: NPM Packages (Runtime Delivery)

Delivers **runtime library capabilities** — LLM clients, TUI rendering, agent orchestration, web access, telemetry — through the npm registry as `@wayofmono/*` packages.

### Package Landscape (13 packages)

```
packages/@wayofmono/
├── wo-ai              LLM provider abstraction (OpenAI, Anthropic, Gemini, Ollama...)
├── wo-tui             Terminal UI library (React Ink components)
├── wo-agent-core      Agent runtime, extension API, tool execution pipeline
├── wo-agent           General-purpose agent SDK + CLI (wouser)
├── wo-coding-agent    CLI coding agent (wocode)
├── wo-skill-docs      SKILL.md → multi-format doc generation
├── wo-mermaid         ASCII-art Mermaid renderer for TUI
├── web-access         Web search, URL fetch, GitHub clone, PDF/YouTube extraction
├── lens               Codebase analysis + safety engine
├── wo-web-ui          Web UI components (React 19)
├── telemetry          OpenTelemetry SDK (metrics, traces, logs)
├── telegram           Telegram bot integration
└── whatsapp           WhatsApp bot integration
```

### Dependency Graph

```
@wayofmono/wo-agent
  ├── @wayofmono/wo-agent-core
  │   ├── @wayofmono/wo-ai
  │   ├── @wayofmono/wo-tui
  │   └── @wayofmono/telemetry
  └── @wayofmono/web-access (optional)

@wayofmono/wo-coding-agent
  ├── @wayofmono/wo-agent
  └── @wayofmono/wo-mermaid
```

### Boundary: Packages vs Harness

| Delivered via Harness | Delivered via npm |
|-----------------------|-------------------|
| Skills (SKILL.md) | LLM clients (`wo-ai`) |
| Agent definitions | TUI components (`wo-tui`) |
| Slash commands | Agent runtime (`wo-agent-core`) |
| Tool configs | Web access layer (`web-access`) |
| Extension definitions | Codebase analysis (`lens`) |
| Extension npm deps | Telemetry SDK (`telemetry`) |

The harness deploys **configuration + prompts** that shape agent behavior. The packages deliver **runtime libraries** that those prompts invoke through tool calls.

### External Consumption

`@wayofmono/wo-agent` is used as a backend SDK by external platforms:
- **Way of Pi** (github.com/Way-Of/pi) — AI-augmented engineering platform (Electron/Web IDE)
- **Way of Work** (github.com/Way-Of/work) — AI productivity platform

---

## Pipeline 3: f-rr-d (Knowledge Delivery)

Delivers **contextual knowledge** — tickets, plans, research, decisions, personal TODOs — via a shared git repository cloned into the monorepo.

### Repository

- **URL**: `github.com/Way-Of/f-rr-d`
- **Location**: `thoughts/` (cloned by `/init_harness`)
- **Rule**: Append-only — never delete, rename, or move anything inside `thoughts/`

### Structure

```
thoughts/
├── shared/                    # Cross-project templates
│   └── tickets/ticket-template.md
├── global/                    # Cross-project concerns
├── wayofmono/                 # WOMONO-XXX namespace
│   ├── shared/tickets/        # Feature/bug tickets
│   ├── shared/plans/          # Implementation plans
│   ├── shared/research/       # Technical research
│   ├── docs/                  # Architecture docs, decisions
│   ├── enforcement-ticket/    # HIGHEST PRIORITY
│   └── zerwiz/, tomas/, ...   # Personal workspaces
├── wow/                       # WOW-XXX namespace
│   └── shared/tickets/ ...
├── opticat/                   # OPT-XXX namespace
│   └── shared/tickets/ ...
├── wayofteams/                # WOTEAMS-XXX namespace
│   ├── shared/tickets/
│   ├── docs/                  # Architecture, product docs, investor-ready materials
│   └── <developer>/
```

### Four Namespaces

| Prefix | Project | Path |
|--------|---------|------|
| WOMONO | WayOfMono (internal tooling) | `thoughts/wayofmono/shared/tickets/` |
| WOW | WayOfWork (multi-tenant platform) | `thoughts/wow/shared/tickets/` |
| OPT | OptiCat (HVAC simulation) | `thoughts/opticat/shared/tickets/` |
| WOTEAMS | WayOfTeams (CTO Dashboard) | `thoughts/wayofteams/shared/tickets/` |

### Ticket Format

```
<PREFIX>-<NNN>-<UPPERCASE-DASHED-DESC>.md
```

Example: `WOMONO-042-CONTEXT-DELIVERY-ARCH.md`

### Status Flow (10 states)

```
Backlog ─→ Planned ─→ Ready ─→ In Progress ─→ Submitted for Review ─→ In Review ─→ Approved ─→ Done
                                          ↘ Changes Requested ─→ In Progress
                                          ↘ Reject ─→ Blocked
```

### Enforcement Tickets

Located at `thoughts/<project-slug>/enforcement-ticket/` — **highest priority items** that override all other tickets when status ≠ "Done".

### Context Delivery Workflow

```
                            writes to
  Skills (from Harness) ────────────┐
                                    ▼
  /create_plan     ──→ thoughts/<project>/shared/plans/<plan>.md
  /implement_plan  ──→ executes phases, git commits after each
  /validate_plan   ──→ reads plan, verifies implementation
  /validate_telemetry ──→ validates OTel traces against narrative spec
  /commit          ──→ structured git commits via git-commit-helper
```

The skills that drive this workflow are delivered by **Pipeline 1** (the harness). The knowledge artifacts they create are stored in **Pipeline 3** (f-rr-d).

---

## Pipeline 4: CTO Dashboard (Observability Delivery)

Delivers **telemetry, ticket status, and team visibility** through two dashboard implementations that share the same f-rr-d and harness pipelines.

### Implementation: Next.js (ui/)

Original dashboard — Next.js 16 with SQLite (Prisma) backend. Runs via `wodev` (Electron desktop app) or `wodev --web` (web server on port 6969).

```
ui/
├── src/app/api/
│   ├── skills/report/route.ts    ← Receives skill telemetry from harness
│   ├── tickets/route.ts          ← CRUD tickets with SQLite + filesystem dual-write
│   ├── notifications/route.ts    ← Review/update notification management
│   ├── health/route.ts           ← Health check
│   └── auth/, standup/, news/ ...
└── prisma/schema.prisma          ← SkillReport, Ticket, User, Post models
```

### Implementation: WayOfTeams (thoughts/wayofteams/)

Phoenix LiveView port of the CTO Dashboard — reimplements the same feature set using Elixir's Phoenix framework with Ash Framework for resource management and Jido agents for AI workflow orchestration. The project's thoughts and investor-ready docs live in `thoughts/wayofteams/`.

| Aspect | Next.js (ui/) | WayOfTeams (phoenix) |
|--------|---------------|----------------------|
| **Stack** | Next.js 16, Prisma, SQLite | Phoenix LiveView, Ash, PostgreSQL 16 |
| **Agents** | N/A | Jido agents for signal processing, notifications, workflows |
| **Pages** | ~10 views | 14 LiveView pages |
| **State** | Zustand (client) + API (server) | Ash resources + LiveView |
| **Status** | Active development | Active port |
| **Deploy** | `wodev` CLI (Electron/web) | Elixir release |
| **Namespace** | N/A | WOTEAMS |

### Shared Data Flow

```
  AI Tool ──→ ai-harness --report-skills ──→ POST /api/skills/report
  works on                                     │
      │                                        ▼
      ▼                                   Dashboard SQLite
  f-rr-d ticket ──────────→ PATCH /api/tickets ──→ updates file in thoughts/
  (sketch)                       │
                                 ▼
                           Notifications generated
                           for review queue
```

Both implementations consume the same f-rr-d tickets and the same harness telemetry — they are interchangeable frontends on the same backend pipelines.

### Bi-Directional Sync

Tickets live in two places:
1. **Canonical**: `thoughts/<project>/shared/tickets/*.md` (f-rr-d git repo)
2. **Cache**: SQLite via dashboard API

`PATCH /api/tickets` writes to both — the SQLite cache and the filesystem (`writeTicketFile()`), ensuring the f-rr-d git repo stays the single source of truth.

---

## Interconnection Map

```
                    ┌─────────────────────────────────────────────────┐
                    │              CANONICAL SOURCE                    │
                    │  packages/@aiengineeringharness/                 │
                    │    ├── opencode/skills/  (81 canonical skills)   │
                    │    ├── opencode/agents/  (6 core agents)         │
                    │    ├── config-manifest/  (modular YAML source)   │
                    │    │   ├── tools/*.yaml  (per-tool definitions)  │
                    │    │   ├── compile.py    (YAML→json + adapt)     │
                    │    │   ├── validate.py   (format spec check)     │
                    │    │   └── test-skills.py(on-disk validation)    │
                    │    └── manifest.json     (deployment map v1.7.7) │
                    └────────────────────┬─────────────────────────────┘
                                         │
                            ┌────────────┴────────────┐
                            │  config-manifest/        │
                            │  compile.py + validate   │
                            │  + test-skills.py        │
                            │  (naming, casing, paths) │
                            └────────────┬────────────┘
                                         │
                                         ▼
                            ┌──────────────────────────┐
                            │  manifest.json           │
                            │  ← compiled + validated  │
                            │                          │
                            │  install.ts              │
                            │  (manifest consumer)     │
                            └───────────┬──────────────┘
                                                           │
                                                           ▼
                                               ┌──────────────────────────┐
                                               │  7 Tool Config Dirs:     │
                                               │  ~/.claude/              │
                                               │  ~/.config/opencode/     │
                                               │  ~/.gemini/              │
                                               │  ~/.pi/agent/            │
                                               │  ~/.antigravity/         │
                                               │  ~/.codex/               │
                                               │  ~/.wocode/              │
                                               └───────────┬──────────────┘
                                                           │
                               ┌───────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  AI Tools Load      │
                    │  Skills/Agents from │
                    │  config dirs at     │
                    │  runtime            │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐     ┌────────────────────────┐
                    │ Skills execute       │────▶│  Dashboard Reports     │
                    │ f-rr-d workflows:    │     │  POST /api/skills/report│
                    │ /create_plan         │     └────────────────────────┘
                    │ /implement_plan      │
                    │ /validate_plan       │
                    │ /commit              │
                    └──────────┬───────────┘
                               │ writes to
                               ▼
                     ┌──────────────────────┐     ┌──────────────────────────────┐
                     │  thoughts/ (f-rr-d)  │◀───▶│  CTO Dashboard               │
                     │  tickets/*.md        │     │  ├── Next.js (ui/)           │
                     │  plans/*.md          │     │  │   GET/PATCH /api/tickets   │
                     │  research/*.md       │     │  └── WayOfTeams (Phoenix)    │
                     │  (append-only git)   │     │      WOTEAMS namespace       │
                     │  wayofteams/docs/    │     └──────────────────────────────┘
                    └──────────────────────┘

                    ┌────────────────────────────────────────────────────┐
                    │  NPM Packages (@wayofmono/*)                       │
                    │  Deliver runtime: LLM, TUI, agents, web access     │
                    │  Installed via: npm install / pnpm                 │
                    │                                                   │
                    │  External consumers:                               │
                    │  ├── Way of Pi (Electron IDE)                      │
                    │  └── Way of Work (productivity platform)           │
                    └────────────────────────────────────────────────────┘
```

---

## Key Integration Points

| Gateway | What Connects | Mechanism |
|---------|--------------|-----------|
| `config-manifest/` → `manifest.json` | Per-tool YAML definitions → compiled deployment map | `compile.py` merges 7 YAMLs + validates naming/casing/paths |
| `install.ts` → `manifest.json` | Deployment orchestration | `loadManifest()` → `installTool()` iterates components |
| Harness ↔ Dashboard | Skill metadata → telemetry | `--report-skills` scans 7 tool dirs, POSTs to `/api/skills/report` |
| Skills ↔ f-rr-d | Workflow artifacts | `ticket-manager`, `create-plan` skills read/write `thoughts/` files |
| Dashboard ↔ f-rr-d | Bi-directional ticket sync | `PATCH /api/tickets` → SQLite + `writeTicketFile()` → thoughts/ |
| Skills ↔ Dashboard | Notification read-state from CI | `ticket-manager`/`ticket-executor` POST `mark-read` to `/api/notifications` |
| Packages ↔ Harness | Runtime dependencies | Harness deploys extension dirs → `npm install --prefix` for deps |
| Skills ↔ Packages | Tool invocation at runtime | Skills use tool calls backed by package capabilities |

## File Reference

| File | Role | Pipeline |
|------|------|----------|
| `packages/@aiengineeringharness/install.ts` | Orchestrator — CLI, manifest loader, file deployer | Harness |
| `packages/@aiengineeringharness/manifest.json` | Deployment map — all files for all 7 tools (auto-generated) | Harness |
| `packages/@aiengineeringharness/config-manifest/base_manifest.yaml` | Global metadata, version, shared YAML anchors | Harness (config-manifest) |
| `packages/@aiengineeringharness/config-manifest/tools/opencode.yaml` | Per-tool YAML component definitions (7 files) | Harness (config-manifest) |
| `packages/@aiengineeringharness/config-manifest/compile.py` | YAML → manifest.json compiler with path validation | Harness (config-manifest) |
| `packages/@aiengineeringharness/config-manifest/validate.py` | Per-tool format validator (naming, casing, targets) | Harness (config-manifest) |
| `packages/@aiengineeringharness/config-manifest/scripts/test-yamls.py` | YAML syntax, cross-contamination, structure checks | Harness (config-manifest) |
| `packages/@aiengineeringharness/config-manifest/scripts/test-manifest.py` | Compiled manifest structure and completeness | Harness (config-manifest) |
| `packages/@aiengineeringharness/config-manifest/scripts/test-skills.py` | On-disk skill format per tool (frontmatter, naming, casing) | Harness (config-manifest) |
| `packages/@aiengineeringharness/config-manifest/scripts/run-all-tests.py` | Orchestrator — runs all test suites in sequence | Harness (config-manifest) |
| `packages/@aiengineeringharness/scripts/docs-sync.ts` | Stale/legacy — use config-manifest instead | Harness |
| `packages/@aiengineeringharness/scripts/compliance-check.ts` | Stale/legacy — use config-manifest instead | Harness |
| `packages/@aiengineeringharness/transaction.ts` | Atomic installer — lock file, rollback | Harness |
| `packages/@aiengineeringharness/adapt/paths.ts` | Platform path resolver — XDG/Library/AppData | Harness |
| `packages/@aiengineeringharness/adapt/formats.ts` | Format definitions — naming, skill dirs per tool | Harness |
| `packages/@aiengineeringharness/detect/` | System detection (12 modules) | Harness |
| `packages/@aiengineeringharness/report.ts` | Telemetry reporter — pushes to dashboard | Harness |
| `packages/@wayofmono/wo-agent-core/` | Central agent runtime | Packages |
| `packages/@wayofmono/wo-agent/` | General agent CLI/SDK (wouser) | Packages |
| `packages/@wayofmono/wo-coding-agent/` | Coding agent CLI (wocode) | Packages |
| `packages/@wayofmono/wo-ai/` | Multi-LLM provider abstraction | Packages |
| `packages/@wayofmono/web-access/` | Web access tool layer | Packages |
| `packages/@wayofmono/telemetry/` | OTel telemetry SDK | Packages |
| `thoughts/<project>/shared/tickets/` | Ticket markdown files | f-rr-d |
| `thoughts/<project>/shared/plans/` | Implementation plans | f-rr-d |
| `thoughts/<project>/enforcement-ticket/` | Highest-priority override tickets | f-rr-d |
| `ui/src/app/api/skills/report/route.ts` | Skill telemetry endpoint | Dashboard (Next.js) |
| `ui/src/app/api/tickets/route.ts` | Ticket CRUD + dual-write | Dashboard (Next.js) |
| `ui/prisma/schema.prisma` | Dashboard data model | Dashboard (Next.js) |
| `thoughts/wayofteams/` | WayOfTeams project root (Phoenix LiveView dashboard) | Dashboard (WayOfTeams) |
| `thoughts/wayofteams/docs/Product docs/Investor Ready/` | Investor-ready documentation (pitch deck, financials, GTM) | Dashboard (WayOfTeams) |
| `thoughts/wayofteams/shared/tickets/` | WOTEAMS ticket markdown files | f-rr-d |

## Key Design Decisions

### Why 4 separate pipelines?

Each pipeline has different delivery characteristics:

| Pipeline | Update Cadence | Consumer | Failure Impact |
|----------|---------------|----------|----------------|
| Harness | On commit (sync) or on demand (install) | AI tool config dirs | Missing skills/agents |
| Packages | On npm publish (tag/release) | Application runtime | Broken imports |
| f-rr-d | On git push (per-session pull) | Agent context | Stale knowledge |
| Dashboard | Real-time HTTP | Human dashboard UI | Missing telemetry |

### Why canonical skills go through 7 per-tool copies?

Each AI coding tool has different conventions for naming, frontmatter fields, allowed-tools casing, and config file formats. Rather than forcing a single format, the harness maintains **one canonical copy** and **adapts at compile time** (`config-manifest/`). The per-tool YAML files in `tools/*.yaml` define the exact naming, casing, and target for each tool, and `compile.py` enforces these rules when building `manifest.json`. This keeps the authoring UX simple while supporting 7 divergent tools.

### Why two dashboard implementations?

The CTO Dashboard exists as both a **Next.js** app (`ui/`) and a **Phoenix LiveView** app (WayOfTeams, `thoughts/wayofteams/`). Both consume the same f-rr-d tickets and harness telemetry through the same API contracts. The Next.js version was built first as a rapid prototype; the WayOfTeams Phoenix port provides a more production-ready stack with Ash Framework resource management, Jido agent integration, and PostgreSQL persistence. Both are active — they represent an incremental migration rather than a rewrite.

### Why dual-write tickets (SQLite + filesystem)?

The filesystem (`thoughts/`) is the **canonical** store — it's in git, works offline, and is editable by any agent with file access. The SQLite cache provides fast queries, filtering, and dashboard rendering. The dashboard writes back to the filesystem on every mutation, keeping the two in sync.

### Why config-manifest instead of editing manifest.json directly?

The monolithic `manifest.json` (8868 lines) had cross-tool path contamination, no validation that per-tool skill formatting was correct, and was hard to maintain. The modular YAML system (`config-manifest/`) solved this by:
- **Enforcing path isolation** — `compile.py` rejects any `src` path that uses another tool's prefix (e.g., `claude/` in `opencode.yaml` — cross-contamination detected at compile time, not at deploy time)
- **Per-tool format specs** — each tool YAML is validated against its naming convention (snake/kebab), `allowed-tools` casing (PascalCase/lowercase), and target directory
- **Test suite gate** — `run-all-tests.py` runs YAML validation → manifest structure → on-disk skill format compliance before any deployment

See `docs/fixes/ai-engineering-harness-fixes.md` (v1.7.0 "Config-Manifest Modularization") for the full origin story.

### Why per-tool naming compliance is enforced at compile time?

Historical experience showed that naming errors cause real failures:
- **Pi rejects kebab-case** — Pi's skill loader errors when `name:` contains underscores; 72 Pi skill files had to be bulk-fixed from snake_case to kebab-case
- **OpenCode rejects snake_case** — OpenCode's naming regex `^[a-z0-9]+(-[a-z0-9]+)*$` rejects underscores; 74 OpenCode skill directories had to be renamed
- **Claude requires PascalCase tools** — Claude Code's `allowed-tools` must be PascalCase (`Read`, `Write`, `Bash`), not lowercase; 105 Claude skill files had to be fixed

The `test-skills.py` script validates all these rules across all 7 tools before any deployment reaches users. See `docs/fixes/ai-engineering-harness-fixes.md` (v1.7.6) and `docs/fixes/ai-engineering-harness-fixes.md` (v1.7.4 "OpenCode Skills Kebab-Case Naming") for details.

### Why notification integration between skills and dashboard?

The `ticket-manager`, `ticket-executor`, and `validate-plan` skills (delivered by Pipeline 1) interact with the CTO Dashboard's notification API (Pipeline 4) to mark review requests and status updates as read. When a skill completes a review action, it POSTs to `/api/notifications` with `action: "mark-read"` and the `notificationId` (e.g., `review-WOMONO-042`). This bridges the skill execution world and the dashboard UI — skills trigger the work, and the dashboard tracks which notifications remain.

Notification IDs follow a convention: `review-<TICKET_ID>` for review queue entries, `update-<TICKET_ID>` for status changes. The sidebar's review badge filters by `readNotificationIds.has(...)` — only showing unread items.

See `docs/fixes/ai-engineering-harness-fixes.md` (v1.7.3) and `docs/fixes/cto-dashboard-fixes.md` (v0.6.3) for full details.

### Why compile.py must validate paths?

Underscore/hyphen mismatches between manifest paths and actual filesystem directories caused real deployment failures — the installer fetched 404 URLs from GitHub because the manifest said `build-tool_agent` but the directory was `build-tool-agent`. The compile.py path validation (`TOOL_PATH_RULES`) catches these mismatches at build time rather than deploy time. See `docs/fixes/manifest-path-fix.md` for the full incident.

### Why command naming must avoid skill conflicts?

Gemini CLI and Antigravity CLI had naming conflicts where `/create_plan` (a command file) and `create_plan/` (a skill directory) collided, producing auto-renamed `/user.create_plan` and `/create_plan1` variants. The fix renamed all commands with a `run-` prefix (`/run-create_plan`, `/run-debug`, etc.), ensuring skill names and command names never collide. OpenCode and Claude were unaffected because they handle commands/skills in separate namespaces natively. See `docs/fixes/ai-engineering-harness-fixes.md` (v1.6.1) for details.

### Why platform-aware detection?

The installer originally deployed skills/agents/commands uniformly without detecting the user's platform — leading to broken integrations on different OS, missing system deps, wrong icon paths, and incompatible runtimes. The detection layer (`detect/`) now profiles 11 aspects of the system before deploying, allowing the installer to:
- Select correct XDG paths per OS (Linux/macOS/Windows)
- Auto-install missing system deps (e.g., `libwebkit2gtk-4.1-dev` on Debian)
- Generate proper `.desktop` files on Linux
- Detect which AI tools are already installed and install only those (`--tool=auto`)
- Warn about non-UTF-8 locales, root execution, or missing prerequisites

See `docs/fixes/ai-engineering-harness-fixes.md` (v1.7.2 "Platform-Aware Harness Installer") for full details.

---

## Related

- [f-rr-d Context Engineering](context-engineering/frrd.md)
- [Slash Commands](context-engineering/slash-commands.md)
- [Skills Guide](guides/skills.md)
- [Packages Reference](packages.md)
- [Dev vs Runtime Dependencies](concepts/dev-vs-runtime-deps.md)
- [AI Engineering Harness Guide](guides/ai-harness/)
- [WayOfTeams Investor-Ready Docs](../../thoughts/wayofteams/docs/Product%20docs/Investor%20Ready/)
