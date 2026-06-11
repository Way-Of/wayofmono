# WayOfMono (Wo)

The ultimate monorepo consolidation for high-performance coding agents. WayOfMono provides a shared **AI Engineering Harness** — 79 battle-tested skills, 6 subagents, and workflows spanning 7 AI coding tools — plus a **CTO Dashboard** with telemetry, standups, tickets, and review queues.

## 🎛️ Supported Tools

| Tool | Install | Config Dir | Naming |
|------|---------|-----------|--------|
| **OpenCode** | `ai-harness --tool=opencode` | `~/.config/opencode/` | snake_case |
| **Claude Code** | `ai-harness --tool=claude` | `~/.claude/` | snake_case |
| **Pi** | `ai-harness --tool=pi` | `~/.pi/agent/` | kebab-case |
| **Gemini CLI** | `ai-harness --tool=gemini` | `~/.gemini/` | snake_case |
| **Codex** | `ai-harness --tool=codex` | `~/.codex/` | snake_case |
| **Antigravity** | `ai-harness --tool=antigravity` | `~/.antigravity/` | snake_case |
| **Wo Coder** | `ai-harness --tool=wocoder` | `~/.wocoder/` | snake_case |

---

## 📂 Repository Structure

```
./
├── packages/
│   ├── @aiengineeringharness/   # AI Engineering Harness
│   │   ├── scripts/             # Pipeline tools (docs-sync, compliance, migrate)
│   │   ├── opencode/            → ~/.config/opencode/
│   │   ├── claude/              → ~/.claude/
│   │   ├── gemini/              → ~/.gemini/
│   │   ├── pi/                  → ~/.pi/agent/
│   │   ├── wocoder/             → ~/.wocoder/
│   │   ├── antigravity/         → ~/.antigravity/
│   │   ├── codex/               → ~/.codex/
│   │   ├── install.ts           # CLI installer
│   │   └── setup.sh             # GNU Stow installer
│   └── @wayofmono/*             # Wo npm packages
├── ui/                   # CTO Dashboard (Next.js 16)
│   ├── src/app/api/       # API routes (tickets, skills, standup, ideas)
│   └── src/components/    # Dashboard views
├── docs/
│   ├── skills/            # 79 canonical SKILL.md files (source of truth)
│   └── tools/             # Tool reference docs for compliance checking
├── thoughts/              # Context engineering (f-rr-d)
└── .github/workflows/     # CI/CD (incl. canonical sync check)
```

---

## 🚀 Quick Start

### 1. Install the Harness CLI

```bash
deno install -Agf -n ai-harness \
  https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts
```

### 2. Install Per Tool (pick what you use)

```bash
ai-harness --tool=opencode        # OpenCode
ai-harness --tool=claude          # Claude Code
ai-harness --tool=pi              # Pi
ai-harness --tool=gemini          # Gemini CLI
ai-harness --tool=codex           # Codex
ai-harness --tool=antigravity     # Antigravity
ai-harness --tool=wocoder         # Wo Coder
ai-harness --tool=all --yes       # All seven
```

### 3. Report Skills to Dashboard

```bash
ai-harness --report-skills
```

This scans your installed skills and POSTs to the CTO Dashboard at `https://cto.wayof.work`.

### 4. Sync Canonical Skills (after upstream updates)

```bash
ai-harness --sync-docs            # Sync canonical → tool copies
ai-harness --sync-docs --check    # Preview changes first
```

---

## 🧠 Key Workflow: f-rr-d Context Engineering

```
Ticket → /create_plan → /implement_plan → /validate_plan → /validate_telemetry → /commit
```

The **f-rr-d** (förråd) system at `github.com/Way-Of/f-rr-d` stores tickets, plans, research, and personal TODOs across all projects:

```
thoughts/
├── global/                    # Cross-project concerns
├── wayofmono/                 # WayOfMono (WOMONO-XXX)
│   ├── shared/tickets/        # WOMONO-XXX tickets
│   ├── shared/plans/
│   ├── shared/research/
│   └── <developer>/
├── wow/                       # WayOfWork (WOW-XXX)
└── opticat/                   # Opticat (OPT-XXX)
```

### Built-in Slash Commands

| Command | Description |
|---------|-------------|
| `/init_harness` | Initialize harness (creates project memory + thoughts/) |
| `/create_plan` | Generate implementation plan from ticket |
| `/implement_plan` | Execute approved plan phase-by-phase |
| `/validate_plan` | Verify implementation against plan |
| `/commit` | Create well-structured git commits |
| `/debug` | Investigate issues during testing |
| `/validate_telemetry` | Validate local telemetry against narrative spec |
| `/help` | Unified help system |
| `/sync skills` | Sync all skills to all frontends |

---

## 📊 CTO Dashboard

The dashboard at `https://cto.wayof.work` provides:

- **Overview** — Ticket stats, velocity, blockers
- **Tickets** — Full ticket management with filters and review queue
- **Standup** — Daily team standup check-ins (yesterday/today/blockers)
- **Skills** — Real-time skill health across all reported machines
- **Ideas** — Prioritized idea board with voting
- **Developers** — Developer workflow and assignment tracking
- **Docs** — Architecture docs and decision records

Run locally:
```bash
cd ui && pnpm dev
```

---

## 🔧 Pipeline Tools

| Tool | Location | Purpose |
|------|----------|---------|
| `docs-sync.ts` | `packages/@aiengineeringharness/scripts/` | Sync canonical skills → per-tool copies with naming/tool-name translation |
| `compliance-check.ts` | `packages/@aiengineeringharness/scripts/` | Validate frontmatter, tool name casing, naming conventions across 553 files |
| `migrate-tickets.ts` | `packages/@aiengineeringharness/scripts/` | Migrate ticket namespaces (PROJ → WOMONO) |
| `import-ref-skills.ts` | `packages/@aiengineeringharness/scripts/` | Import reference skills from docs/ |

---

## 📦 Wo Packages

Published at [npmjs.com/settings/wayofmono/packages](https://www.npmjs.com/settings/wayofmono/packages):

| Package | Description |
|---------|-------------|
| `@wayofmono/wo-ai` | Multi-Provider LLM API (OpenAI, Anthropic, Gemini) |
| `@wayofmono/wo-tui` | High-Performance Terminal UI Library |
| `@wayofmono/wo-agent-core` | Central Agent Runtime & Extension API |
| `@wayofmono/wo-agent` | General-Purpose Agent SDK & CLI (`wouser`) |
| `@wayofmono/wo-coding-agent` | CLI Coding Agent (`wocode`) |
| `@wayofmono/wo-skill-docs` | Multi-format Documentation Expert |
| `@wayofmono/wo-mermaid` | TUI Mermaid Renderer (ASCII art) |
| `@wayofmono/web-access` | Web search, URL fetching, GitHub cloning |
| `@wayofmono/lens` | Codebase Analysis & Safety Engine |
| `@wayofmono/wo-web-ui` | Web UI Components (React 19) |

---

## 🚢 Deployment

The CTO Dashboard runs on a local server behind Cloudflare Tunnel.

### Stack

```
Internet → Cloudflare Tunnel (cloudflared) [host]
              → Podman:
                  → Caddy container (:81)
                      → Next.js container (:3000, production)
```

### Prerequisites

- Podman + podman-compose on the server
- Devbox (for the reproducible shell environment)
- cloudflared tunnel authenticated for `cto.wayof.work`

### Deploy

```bash
# First time: start the stack
cd ui
podman-compose up --build -d

# Optionally register as a systemd service
sudo cp docker/wayofmono-dashboard.service /etc/systemd/system/
sudo systemctl enable --now wayofmono-dashboard
```

### Update

```bash
# Pull latest code and redeploy
./scripts/deploy-dashboard.sh
```

### Health

The dashboard exposes `GET /api/health` — returns `{"status":"ok"}` when the app and database are responding.

### Logs

```bash
podman-compose logs -f
```

---

## 🔄 CI/CD

| Workflow | Trigger | Checks |
|----------|---------|--------|
| **CI** | Push/PR to main | Build, typecheck, test, **canonical skill sync check** |
| **CD** | Tag push `v*` | Publish npm packages |

The CI verifies that all 553 SKILL.md files (79 canonical × 7 tools) are in sync. If not, run:
```bash
ai-harness --sync-docs
```

---

## 🔗 External Integrations

| Project | Description | Integration |
|---------|-------------|-------------|
| [Way of Pi](https://github.com/Way-Of/wayofpi) | AI-augmented engineering platform | Uses `@wayofmono/wo-agent` as backend SDK |
| [Way of Work](https://github.com/Way-Of/wayofwork) | AI-powered productivity platform | Uses `@wayofmono/wo-agent` as user agent SDK |
