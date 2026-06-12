# WayOfMono (Wo)

> Built as a unified toolset for the next generation of AI engineering.

The ultimate monorepo consolidation for high-performance coding agents. WayOfMono provides a shared Intelligence Backend (Packages, Tools, Memory) that serves five distinct Agent Frontends, with Wo (Way of Coding) as our primary synthesized interface.

## 🎛️ Multi-Interface Architecture

WayOfMono is built on an **Interface-Agnostic Philosophy**. Our core logic and tools are shared across all major coding agent platforms, allowing you to work with your codebase using your preferred interaction model:

- **wocode**: High-performance coding assistant for automated engineering and refactoring ([@wayofmono/wo-coding-agent](https://www.npmjs.com/package/@wayofmono/wo-coding-agent)). Native to this monorepo.
- **wouser**: General-purpose user agent SDK and CLI ([@wayofmono/wo-agent](https://www.npmjs.com/package/@wayofmono/wo-agent)). Native to this monorepo.
- **Claude Code**: Agentic AI coding from Anthropic in your terminal.
- **Pi**: Full compatibility with the official [Pi Agent](https://github.com/earendil-works/pi) standards from earendil-works.
- **OpenCode**: Open-source, TUI-driven coding agent following the [OpenCode](https://github.com/opencode-ai/opencode) standard.
- **Gemini CLI**: Multimodal, high-velocity automation using the [Gemini CLI](https://github.com/google-gemini/gemini-cli) standard.
- **Antigravity**: Agent-first development platform for autonomous execution and web tasks.

## 🎛️ AI Engineering Harness

The **AI Engineering Harness** is a shared backend that serves all agent frontends. It provides:

- Shared agents, commands, skills, and extensions for all agent frontends
- Install once, configure anywhere – deploy to Claude Code, Pi, OpenCode, Gemini CLI, Antigravity, or Wo Coder with the same prompt library
- Battle-tested prompts and workflows ready to use from day one
- Telemetry and reporting to the [CTO Dashboard](https://cto.wayof.work)

### Shared Resources

The harness bundles:

- **88 skills** (81 canonical + 7 new) shared across all tools
- **6 subagents** for specialized tasks
- Workflow packages (CI/CD, review, quality checks)
- Ticket templates (WOW, OPT, WOMONO, GLOBAL)
- TUI dashboard components for terminal UI
- Multi-format documentation (MDX, HTML, PDF, JSON)
- Mermaid TUI renderer (ASCII art diagrams)

### Why Use the Harness

- **Interface-agnostic**: Core logic works everywhere
- **Zero duplication**: One codebase, infinite frontends
- **Easy updates**: `ai-harness --update` pulls the latest from upstream
- **GNU Stow ready**: Symlink-based installation for clean git updates

## 🏆 Stats

- **88** battle-tested skills
- **81** canonical + **7** new skills
- **7** AI coding tools supported
- **6** subagents
- **553+** files validated
- **10** NPM packages published

## 📦 Zero-Pollution Installation

WayOfMono agents are **project-local and folder-contained**. Packages install to `node_modules/` in your project (not globally). Binaries land in `node_modules/.bin/` and are accessed via `npx`/`pnpm` without any global setup.

### 🎭 Custom Personas (AGENTS.md)

Create an `AGENTS.md` file in your project root to customize the agent's persona:

```markdown
# AGENTS.md
You are a Senior React Developer specializing in Next.js and TypeScript.
Prefer server components, use Tailwind for styling, and write tests first.
```

The agent automatically discovers this file on startup — no configuration needed.

### Contained Environment (.wo/)

The `--init` command creates a `.wo/` folder in your project:

```
.wo/
├── models.json       # LLM providers (default: Ollama + qwen3.5:9b)
├── settings.json     # Agent behavior & themes
└── launcher          # ./wouser or ./wocode startup script
```

### 🦙 Ollama (Local AI)

WayOfMono defaults to Ollama for local-first AI inference:

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen3.5:9b
```

## 🎒 Prerequisites: Deno

WayOfMono uses [Deno](https://deno.com) as the runtime for agent tools. Install it first before running `ai-harness`:

**Windows (PowerShell):**
```powershell
irm https://deno.land/install.ps1 | iex
deno --version
```

**macOS (Homebrew):**
```bash
brew install deno
deno --version
```

**Linux/Unix (curl):**
```bash
curl -fsSL https://deno.land/install.sh | sh
deno --version
```

## 🚀 Quick Start

### Option 1: Global CLI (Recommended for repeated use)

```bash
deno install -Agf -n ai-harness \
  https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts

# Now you can run ai-harness anywhere:
ai-harness --tool=opencode
ai-harness --tool=all --yes
```

### Option 2: Run-on-run (for CI, scripts, or one-time use)

```bash
# Install all tools directly, no CLI needed:
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --tool=all --yes

# Update all installed tools:
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --update

# Sync canonical skills:
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --sync-docs
```

### Option 3: GNU Stow (Symlink-based)

```bash
./packages/@aiengineeringharness/setup.sh all       # Install all tools
./packages/@aiengineeringharness/setup.sh claude     # Single tool
./packages/@aiengineeringharness/setup.sh --restow   # Update after git pull
```

### Usage

```bash
ai-harness --tool=opencode        # OpenCode
ai-harness --tool=claude          # Claude Code
ai-harness --tool=pi              # Pi
ai-harness --tool=gemini          # Gemini CLI
ai-harness --tool=codex           # Codex
ai-harness --tool=antigravity     # Antigravity
ai-harness --tool=wocoder         # Wo Coder
ai-harness --tool=all --yes       # All seven
ai-harness --update               # Update all installed skills
ai-harness --uninstall=claude     # Remove a single tool
ai-harness --report-skills        # Scan and POST skills to dashboard
ai-harness --sync-docs            # Sync canonical → tool copies
ai-harness --sync-docs --check    # Preview changes first
ai-harness --check                # Check for updates vs installed
ai-harness --tool=claude --dry-run      # Preview without installing
ai-harness --tool=claude --interactive  # Pick components interactively
ai-harness --tool=claude --skill=agents # Install specific component
ai-harness --help                 # Show all commands
```

## 📦 Wo Packages

All packages are published at [npmjs.com/settings/wayofmono](https://www.npmjs.com/settings/wayofmono/packages).

| Package | Description | Install |
|---------|-------------|---------|
| [@wayofmono/wo-ai](https://www.npmjs.com/package/@wayofmono/wo-ai) | Multi-Provider LLM API (OpenAI, Anthropic, Gemini) | `npm install @wayofmono/wo-ai` |
| [@wayofmono/wo-tui](https://www.npmjs.com/package/@wayofmono/wo-tui) | High-Performance Terminal UI Library | `npm install @wayofmono/wo-tui` |
| [@wayofmono/wo-agent-core](https://www.npmjs.com/package/@wayofmono/wo-agent-core) | Central Agent Runtime & Extension API | `npm install @wayofmono/wo-agent-core` |
| [@wayofmono/wo-agent](https://www.npmjs.com/package/@wayofmono/wo-agent) | General-Purpose Agent SDK & CLI (**wouser**) | `npm install @wayofmono/wo-agent` |
| [@wayofmono/wo-coding-agent](https://www.npmjs.com/package/@wayofmono/wo-coding-agent) | CLI Coding Agent (**wocode**) | `npm install @wayofmono/wo-coding-agent` |
| [@wayofmono/wo-skill-docs](https://www.npmjs.com/package/@wayofmono/wo-skill-docs) | Multi-format Documentation Expert | `npm install @wayofmono/wo-skill-docs` |
| [@wayofmono/wo-mermaid](https://www.npmjs.com/package/@wayofmono/wo-mermaid) | TUI Mermaid Renderer (ASCII art) | `npm install @wayofmono/wo-mermaid` |
| [@wayofmono/web-access](https://www.npmjs.com/package/@wayofmono/web-access) | Web search, URL fetching, GitHub cloning | `npm install @wayofmono/web-access` |
| [@wayofmono/lens](https://www.npmjs.com/package/@wayofmono/lens) | Codebase Analysis & Safety Engine | `npm install @wayofmono/lens` |
| [@wayofmono/wo-web-ui](https://www.npmjs.com/package/@wayofmono/wo-web-ui) | Web UI Components (React 19) | `npm install @wayofmono/wo-web-ui` |

## 💻 Coding Assistant (wocode)

For automated engineering and refactoring.

```bash
# npm
npm install --save-dev @wayofmono/wo-coding-agent
npx wocode --init
./wocode

# pnpm
pnpm add -D @wayofmono/wo-coding-agent
pnpm wocode --init
./wocode
```

`wocode` is a **dev-dependency** — a tool for engineers, not your end-users. See the [dev-dependency guide](#-understanding-dev-dependencies---save-dev---d) below.

## 🤖 User Assistant (wouser)

For general use and SDK integration.

```bash
# npm
npm install @wayofmono/wo-agent
npx wouser --init
./wouser

# pnpm
pnpm add @wayofmono/wo-agent
pnpm wouser --init
./wouser
```

`wouser` is a standard **dependency** since your application needs the agent code at runtime.

## 📊 CTO Dashboard

The dashboard at [https://cto.wayof.work](https://cto.wayof.work) provides:

- **Overview** — Ticket stats, velocity, blockers
- **Tickets** — Full ticket management with filters and review queue
- **Standup** — Daily team standup check-ins (yesterday/today/blockers)
- **Skills** — Real-time skill health across all reported machines
- **Ideas** — Prioritized idea board with voting
- **Developers** — Developer workflow and assignment tracking
- **Docs** — Architecture docs and decision records

### Run Locally

```bash
cd ui
pnpm dev
```

## 🎛️ Supported Tools

| Tool | Install | Config Dir | Naming | Source |
|------|---------|------------|--------|--------|
| **OpenCode** | `ai-harness --tool=opencode` | `~/.config/opencode/` | snake_case | `packages/@aiengineeringharness/opencode/` |
| **Claude Code** | `ai-harness --tool=claude` | `~/.claude/` | snake_case | `packages/@aiengineeringharness/claude/` |
| **Pi** | `ai-harness --tool=pi` | `~/.pi/agent/` | kebab-case | `packages/@aiengineeringharness/pi/` |
| **Gemini CLI** | `ai-harness --tool=gemini` | `~/.gemini/` | snake_case | `packages/@aiengineeringharness/gemini/` |
| **Codex** | `ai-harness --tool=codex` | `~/.codex/` | snake_case | `packages/@aiengineeringharness/codex/` |
| **Antigravity** | `ai-harness --tool=antigravity` | `~/.antigravity/` | snake_case | `packages/@aiengineeringharness/antigravity/` |
| **Wo Coder** | `ai-harness --tool=wocoder` | `~/.wocoder/` | snake_case | `packages/@aiengineeringharness/wocoder/` |

## 📂 Repository Structure

```
./
├── packages/
│   ├── @aiengineeringharness/   # AI Engineering Harness (Core Package)
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
│   ├── @wayofmono/              # Wo npm packages (Shared Resources)
│   │   ├── @wayofmono/skills/   # 88 skills package (canonical library)
│   │   ├── @wayofmono/docs/     # Documentation bundle
│   │   ├── @wayofmono/tickets/  # Ticket templates (WOW, OPT, WOMONO, GLOBAL)
│   │   ├── @wayofmono/workflows/# Workflow packages (CI/CD, review)
│   │   ├── @wayofmono/subagents/# Subagent configs (10 skills + 6 subagents)
│   │   ├── @wayofmono/telemetry/# Telemetry and metrics
│   │   └── @wayofmono/dashboard/# Dashboard components
│   └── ui/                      # CTO Dashboard (Next.js 16)
│       ├── src/app/             # API routes and components
│       ├── src/components/      # Dashboard views
│       ├── prisma/              # Database schema
│       └── docker/              # Deployment containers
├── thoughts/                    # Context engineering (f-rr-d)
├── docs/                        # Architecture & reference docs
├── scripts/                     # Utility scripts (deploy, dev)
├── test/                        # Integration tests
├── .github/workflows/           # CI/CD (ci.yml, cd.yml)
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
└── README.md                    # This file
```

## 🧠 Key Workflow: f-rr-d Context Engineering

The **f-rr-d (förråd)** system stores tickets, plans, research, and personal TODOs across all projects. It's a centralized thoughts repository at [github.com/Way-Of/f-r-r-d](https://github.com/Way-Of/f-r-r-d).

### Workflow Pattern

```
Ticket → /create_plan → /implement_plan → /validate_plan → /validate_telemetry → /commit
```

### Directory Structure

```
thoughts/
├── global/                    # Cross-project concerns
├── wayofmono/                 # WayOfMono (WOMONO-XXX)
│   ├── shared/tickets/        # WOMONO-XXX tickets
│   ├── shared/plans/
│   ├── shared/research/
│   └── <developer>/           # Per-developer workspace
├── wow/                       # WayOfWork (WOW-XXX)
└── opticat/                   # Opticat (OPT-XXX)
```

### Built-in Slash Commands

| Command | Description |
|---------|-------------|
| `/init_harness` | Initialize harness (project memory + thoughts/) |
| `/create_plan` | Generate implementation plan from ticket |
| `/implement_plan` | Execute approved plan phase-by-phase |
| `/validate_plan` | Verify implementation against plan |
| `/validate_telemetry` | Validate local telemetry against narrative spec |
| `/commit` | Create well-structured git commits |
| `/debug` | Investigate issues during testing |
| `/help` | Unified help system |
| `/sync skills` | Sync all skills to all frontends |

## 🔧 Pipeline Tools

| Tool | Location | Purpose |
|------|----------|---------|
| `docs-sync.ts` | `packages/@aiengineeringharness/scripts/` | Sync canonical skills → per-tool copies |
| `compliance-check.ts` | `packages/@aiengineeringharness/scripts/` | Validate frontmatter & naming conventions |
| `migrate-tickets.ts` | `packages/@aiengineeringharness/scripts/` | Migrate ticket namespaces (PROJ → WOMONO) |
| `import-ref-skills.ts` | `packages/@aiengineeringharness/scripts/` | Import reference skills from docs/ |

## 🚢 Deployment

### Architecture

```
Internet → Cloudflare Tunnel [host]
              → Podman:
                  → Caddy container (:81)
                      → Next.js container (:3000, production)
```

### Stack

- **Podman** + `podman-compose` on the server
- **Devbox** (reproducible shell environment)
- **cloudflared** tunnel authenticated for `cto.wayof.work`
- **Caddy** reverse proxy
- **Next.js** application server

### Deploy

```bash
cd ui
podman-compose up --build -d
./scripts/deploy-dashboard.sh    # Update dashboard
curl https://cto.wayof.work/api/health  # Verify
```

## 🔄 CI/CD Pipeline

| Workflow | Trigger | Checks |
|----------|---------|--------|
| **CI** | Push/PR to main | Build, typecheck, test, canonical skill sync |
| **CD** | Tag push `v*` | Publish npm packages |

The CI verifies all SKILL.md files (81 canonical × 7 tools) are in sync. If not:

```bash
ai-harness --sync-docs
```

## 🔗 External Integrations

| Project | Description | Integration |
|---------|-------------|-------------|
| [Way of Pi](https://github.com/Way-Of/pi) | AI-augmented engineering platform | Uses `@wayofmono/wo-agent` as backend SDK |
| [Way of Work](https://github.com/Way-Of/work) | AI-powered productivity platform | Uses `@wayofmono/wo-agent` as user agent SDK |

## 💡 Understanding Dev-Dependencies (`--save-dev` / `-D`)

### 1. "The Hammer vs. The House"

Think of your application as a house you are building.

- **dependencies**: Materials (bricks, glass, wires). Your app cannot live without them.
- **devDependencies** (`--save-dev` / `-D`): Tools (hammers, saws, blueprints). Needed to build, but not shipped inside the walls.

### 2. What it does

```bash
npm install --save-dev @wayofmono/wo-coding-agent   # → devDependencies in package.json
npm install @wayofmono/wo-agent                      # → dependencies in package.json
```

- **package.json**: Places under `"devDependencies"` key instead of `"dependencies"`
- **Production**: `pnpm install --prod` skips devDeps — smaller, faster, more secure
- **Bundle size**: wocode never bundled into user-facing code

### 3. Why wocode is dev-dependency

The Coding Assistant (wocode) is a tool for **you, the engineer**. It helps write code, refactor files, analyze architecture. Your end-users never interact with it.

### 4. Why wouser is different

The User Assistant (wouser) is an **SDK**. If you're building an AI chatbot or feature that uses agent logic inside your app, your app needs that code at runtime — so it's a standard dependency.

## 📋 Best Practices

- **Files**: camelCase for code, kebab-case for config, snake_case for scripts
- **Projects**: kebab-case (wo-xxx)
- **Skills**: `SKILL.md` (uppercase extension)
- **Tickets**: `XXX-NNNN` format (e.g., `WOMONO-150`)
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, etc.)

## 🛡️ Security

All deployments include: Content Security Policy, X-Frame-Options, X-Content-Type-Options, Referrer Policy. Regular scanning with dependency check and vulnerability scanner.

## 🌐 Multi-Platform Support

| Platform | Support |
|----------|---------|
| **Windows** | Full (`irm` + `iex` then `deno install`) |
| **Linux** | Full |
| **macOS** | Full |
| **Git Bash/WSL** | Full |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 📄 License

MIT License — See [LICENSE](./LICENSE) for details.

## 📞 Support

- **GitHub Issues**: https://github.com/Way-Of/wayofmono/issues
- **Dashboard**: https://cto.wayof.work
- **Documentation**: [./docs/](./docs/)

---

> Built as a unified toolset for the next generation of AI engineering.

**WayOfMono — High-Performance AI Coding Agents** 🚀
