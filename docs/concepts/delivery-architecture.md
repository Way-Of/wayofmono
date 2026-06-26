# Context Delivery Architecture

How skills, knowledge, and runtime capabilities are delivered to projects
via f-rr-d, the AI Engineering Harness, and WayOfMono packages.

## Overview

WayOfMono operates **4 interconnected delivery pipelines** that transform canonical sources into deployed instances. Every component flows through a **canonical source → adapt → deploy** pattern — skills, agents, commands, configs, runtime libraries, and contextual knowledge.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DELIVERY PIPELINES                               │
│                                                                     │
│  Pipeline 1: Harness (skills/agents/configs)                        │
│  Pipeline 2: Packages (runtime/LLM/TUI capabilities)                │
│  Pipeline 3: f-rr-d (tickets/plans/research knowledge)              │
│  Pipeline 4: CTO Dashboard (telemetry/observability)                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pipeline 1: AI Engineering Harness (Config Delivery)

Delivers **skills, agents, commands, extensions, and tool configs** to the 7 AI coding tools. This is the primary delivery mechanism for all agent-behavior artifacts.

### Canonical Source

```
packages/@aiengineeringharness/
├── opencode/skills/        ← CANONICAL skills (kebab-case)
├── opencode/agents/        ← CANONICAL agent definitions
├── manifest.json           ← Deployment map (src→dest for all 7 tools)
└── scripts/
    ├── docs-sync.ts        ← Canonical→per-tool sync + adaptation
    └── compliance-check.ts ← Naming/tool-case/frontmatter validation
```

### Flow

```
  SKILL.md (canonical)
       │
       ▼
  docs-sync.ts ─── adapts per-tool ───→ claude/skills/ (snake_case)
                                        pi/skills/ (kebab-case)
                                        gemini/skills/ (snake_case)
                                        codex/skills/ (snake_case)
       │                                 antigravity/skills/ (snake_case)
       │                                 wocode/skills/ (kebab-case)
       ▼
  manifest.json ─── install.ts ───→ ~/.claude/skills/
  (src→dest map)                    ~/.config/opencode/skills/
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

### Idempotent Deployment

`install.ts` (line 1034-1058):
- Compares source content to existing destination
- Skips identical files (idempotent)
- Prompts on conflict (auto-confirm with `--yes`)
- Removes stale files not in manifest
- Writes `.harness-version` marker for update detection

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
└── opticat/                   # OPT-XXX namespace
    └── shared/tickets/ ...
```

### Three Namespaces

| Prefix | Project | Path |
|--------|---------|------|
| WOMONO | WayOfMono (internal tooling) | `thoughts/wayofmono/shared/tickets/` |
| WOW | WayOfWork (multi-tenant platform) | `thoughts/wow/shared/tickets/` |
| OPT | OptiCat (HVAC simulation) | `thoughts/opticat/shared/tickets/` |

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

Delivers **telemetry, ticket status, and team visibility** through a Next.js 16 dashboard with SQLite backend.

### Structure

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

### Data Flow

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
                    │    └── manifest.json     (deployment map v1.7.7) │
                    └──────────────┬──────────────────────────┬────────┘
                                   │                          │
                   ┌───────────────┴──────┐     ┌─────────────┴──────────┐
                   │   docs-sync.ts       │     │   install.ts           │
                   │   (skill adaptation)  │     │   (manifest deploy)    │
                   └───────┬──────────────┘     └───────────┬────────────┘
                           │                                │
                           ▼                                ▼
              ┌─────────────────────┐          ┌──────────────────────────┐
              │  Per-Tool Skill     │          │  7 Tool Config Dirs:     │
              │  Directories:       │          │  ~/.claude/              │
              │  claude/skills/     │          │  ~/.config/opencode/     │
              │  pi/skills/         │          │  ~/.gemini/              │
              │  (naming adapted)   │          │  ~/.pi/agent/            │
              └─────────────────────┘          │  ~/.antigravity/         │
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
                    ┌──────────────────────┐     ┌────────────────────────┐
                    │  thoughts/ (f-rr-d)  │◀───▶│  CTO Dashboard         │
                    │  tickets/*.md        │     │  GET /api/tickets      │
                    │  plans/*.md          │     │  PATCH /api/tickets    │
                    │  research/*.md       │     │  POST /api/tickets     │
                    │  (append-only git)   │     └────────────────────────┘
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
| `install.ts` ↔ `docs-sync.ts` | Canonical skills → per-tool adaptation | `--sync-docs` flag calls `deno run -A scripts/docs-sync.ts` |
| `install.ts` → manifest | Deployment orchestration | `loadManifest()` → `installTool()` iterates components |
| Harness ↔ Dashboard | Skill metadata → telemetry | `--report-skills` scans 7 tool dirs, POSTs to `/api/skills/report` |
| Skills ↔ f-rr-d | Workflow artifacts | `ticket-manager`, `create-plan` skills read/write `thoughts/` files |
| Dashboard ↔ f-rr-d | Bi-directional ticket sync | `PATCH /api/tickets` → SQLite + `writeTicketFile()` → thoughts/ |
| Packages ↔ Harness | Runtime dependencies | Harness deploys extension dirs → `npm install --prefix` for deps |
| Skills ↔ Packages | Tool invocation at runtime | Skills use tool calls backed by package capabilities |

## File Reference

| File | Role | Pipeline |
|------|------|----------|
| `packages/@aiengineeringharness/install.ts` | Orchestrator — CLI, manifest loader, file deployer | Harness |
| `packages/@aiengineeringharness/manifest.json` | Deployment map — all files for all 7 tools | Harness |
| `packages/@aiengineeringharness/scripts/docs-sync.ts` | Skill sync — canonical→per-tool with adaptation | Harness |
| `packages/@aiengineeringharness/scripts/compliance-check.ts` | Validation — naming, tool-case, frontmatter | Harness |
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
| `ui/src/app/api/skills/report/route.ts` | Skill telemetry endpoint | Dashboard |
| `ui/src/app/api/tickets/route.ts` | Ticket CRUD + dual-write | Dashboard |
| `ui/prisma/schema.prisma` | Dashboard data model | Dashboard |

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

Each AI coding tool has different conventions for naming, frontmatter fields, allowed-tools casing, and config file formats. Rather than forcing a single format, the harness maintains **one canonical copy** and **adapts on sync** (`docs-sync.ts`). This keeps the authoring UX simple while supporting 7 divergent tools.

### Why dual-write tickets (SQLite + filesystem)?

The filesystem (`thoughts/`) is the **canonical** store — it's in git, works offline, and is editable by any agent with file access. The SQLite cache provides fast queries, filtering, and dashboard rendering. The dashboard writes back to the filesystem on every mutation, keeping the two in sync.

---

## Related

- [f-rr-d Context Engineering](context-engineering/frrd.md)
- [Slash Commands](context-engineering/slash-commands.md)
- [Skills Guide](guides/skills.md)
- [Packages Reference](packages.md)
- [Dev vs Runtime Dependencies](concepts/dev-vs-runtime-deps.md)
- [AI Engineering Harness Guide](guides/ai-harness/)
