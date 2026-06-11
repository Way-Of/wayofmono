# WayOfMono (Wo)

The ultimate monorepo consolidation for high-performance coding agents. WayOfMono provides a shared **AI Engineering Harness** — 88 battle-tested skills (81 canonical + 7 new skills), 6 subagents, and workflows spanning 7 AI coding tools — plus a **CTO Dashboard** with telemetry, standups, tickets, and review queues.

---

## 🎛️ Supported Tools

| Tool | Install | Config Dir | Naming | Location |
|------|---------|------------|--------|----------|
| **OpenCode** | `ai-harness --tool=opencode` | `~/.config/opencode/` | snake_case | `packages/@aiengineeringharness/opencode/` |
| **Claude Code** | `ai-harness --tool=claude` | `~/.claude/` | snake_case | `packages/@aiengineeringharness/claude/` |
| **Pi** | `ai-harness --tool=pi` | `~/.pi/agent/` | kebab-case | `packages/@aiengineeringharness/pi/` |
| **Gemini CLI** | `ai-harness --tool=gemini` | `~/.gemini/` | snake_case | `packages/@aiengineeringharness/gemini/` |
| **Codex** | `ai-harness --tool=codex` | `~/.codex/` | snake_case | `packages/@aiengineeringharness/codex/` |
| **Antigravity** | `ai-harness --tool=antigravity` | `~/.antigravity/` | snake_case | `packages/@aiengineeringharness/antigravity/` |
| **Wo Coder** | `ai-harness --tool=wocoder` | `~/.wocoder/` | snake_case | `packages/@aiengineeringharness/wocoder/` |

---

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
│   │   ├── @wayofmono/skills/    # 88 skills package (canonical library)
│   │   ├── @wayofmono/docs/      # Documentation bundle (88 docs + README)
│   │   ├── @wayofmono/tickets/   # Ticket templates (WOW, OPT, WYOFMONO, GLOBAL)
│   │   ├── @wayofmono/workflows/ # Workflow packages (CI/CD, review)
│   │   ├── @wayofmono/subagents/ # Subagent configs (10 skills + 6 subagents)
│   │   ├── @wayofmono/telemetry/ # Telemetry and metrics
│   │   └── @wayofmono/dashboard/ # Dashboard components
│   ├── ui/                      # CTO Dashboard (Next.js 16)
│   │   ├── src/app/             # API routes and components
│   │   ├── src/components/      # Dashboard views
│   │   ├── package.json         # Dashboard dependencies
│   │   └── docker/              # Deployment containers
│   └── thoughts/                # Context engineering (f-rr-d)
├── docs/
│   ├── skills/                  # 88 canonical SKILL.md files (source of truth)
│   ├── tools/                   # Tool reference docs
│   ├── packages/                # Package documentation
│   └── workflows/               # CI/CD pipeline docs
├── CHANGELOG.md                 # Version history
├── SECURITY.md                  # Security policies
├── CONTRIBUTING.md              # Contribution guidelines
└── README.md                    # This file
```

---

## 🚀 Installation

### ⚠️ Platform-Specific Instructions

#### 🪟 Windows Users

```powershell
# Step 1: Install Deno
irm https://deno.land/install.ps1 | iex

# Step 2: Verify Deno
deno --version

# Step 3: Install ai-harness
deno install -Agf -n ai-harness \
  https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts

# Step 4: Install all tools
ai-harness --tool=all --yes
```

#### 🐧 Linux/Mac Users

```bash
# Step 1: Install ai-harness
deno install -Agf -n ai-harness \
  https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts

# Step 2: Install all tools
ai-harness --tool=all --yes

# Step 3: Update skills
ai-harness --update

# Step 4: Verify installation
ai-harness --report-skills
```

### 📋 Installation Commands Reference

| Command | Description |
|---------|-------------|
| `ai-harness` | Initialize harness on current machine |
| `--tool=<tool>` | Install specific tool (opencode, claude, gemini, pi, codex, antigravity, wocoder) |
| `--tool=all` | Install all tools |
| `--tool=all --yes` | Install all tools non-interactively |
| `--uninstall=<tool>` | Remove a tool |
| `--uninstall=all` | Remove all tools |
| `--update` | Update all installed skills |
| `--sync-docs` | Sync canonical skills → tool copies |
| `--sync-docs --check` | Preview changes before syncing |
| `--report-skills` | Scan and POST skills to dashboard |
| `--help` | Show all available commands |

---

## 📦 @wayofmono NPM Packages (Complete List)

### Published at npmjs.com

#### 1. @wayofmono/wo-ai

**Multi-Provider LLM API**

- **Description**: Unified interface for OpenAI, Anthropic (Claude), and Google Gemini APIs
- **Features**:
  - Multi-provider switching
  - Context management
  - Token counting
  - Rate limiting
  - Error handling
- **Usage**:
  ```bash
  npm install @wayofmono/wo-ai
  
  // Use in code
  const ai = require('@wayofmono/wo-ai');
  const response = await ai.ask('Explain this code', { model: 'gpt-4' });
  ```

#### 2. @wayofmono/wo-tui

**High-Performance Terminal UI Library**

- **Description**: TUI components for command-line applications
- **Features**:
  - ASCII art rendering
  - Real-time updates
  - Keyboard navigation
  - Color themes
- **Usage**:
  ```bash
  npm install @wayofmono/wo-tui
  ```

#### 3. @wayofmono/wo-agent-core

**Central Agent Runtime & Extension API**

- **Description**: Core runtime for WayOfMono agents
- **Features**:
  - Agent state machine
  - Extension points
  - Plugin API
  - Configuration management
- **Architecture**:
  ```typescript
  @wayofmono/wo-agent-core/
  ├── runtime/
  ├── agent/
  ├── extension/
  └── config/
  ```

#### 4. @wayofmono/wo-agent

**General-Purpose Agent SDK & CLI**

- **Description**: Universal agent SDK for multi-provider AI
- **Features**:
  - CLI tool `wouser`
  - SDK for embedding in projects
  - Skill loading
  - Telemetry reporting
- **Usage**:
  ```bash
  npm install -g @wayofmono/wo-agent
  
  // Use wouser CLI
  wouser --help
  wouser run --skill=backlog-groomer
  ```

#### 5. @wayofmono/wo-coding-agent

**CLI Coding Agent**

- **Description**: Specialized coding agent CLI
- **Features**:
  - Code understanding
  - File operations
  - Git integration
  - Context loading
- **Usage**:
  ```bash
  npm install -g @wayofmono/wo-coding-agent
  wocode --help
  ```

#### 6. @wayofmono/wo-skill-docs

**Multi-format Documentation Expert**

- **Description**: Documentation across multiple formats
- **Features**:
  - MDX export
  - HTML generation
  - PDF export
  - JSON API
- **Formats Supported**: MDX, HTML, PDF, JSON, Markdown

#### 7. @wayofmono/wo-mermaid

**TUI Mermaid Renderer**

- **Description**: Ascii art diagrams from Mermaid syntax
- **Features**:
  - Graph rendering
  - Sequence diagrams
  - Gantt charts
  - Class diagrams
- **Output**: ASCII art / SVG / PNG

#### 8. @wayofmono/web-access

**Web Search & URL Fetching**

- **Description**: Web access utilities
- **Features**:
  - Search API integration
  - URL fetching
  - GitHub cloning
  - Markdown preview
- **Capabilities**:
  - Google/Bing search
  - GitHub/GitLab APIs
  - URL scraping
  - Markdown rendering

#### 9. @wayofmono/lens

**Codebase Analysis & Safety Engine**

- **Description**: Comprehensive codebase analysis
- **Features**:
  - Dependency scanning
  - Vulnerability detection
  - Code quality metrics
  - Security audits
- **Integration**: CI/CD pipelines

#### 10. @wayofmono/wo-web-ui

**Web UI Components (React 19)**

- **Description**: React 19 components for web interfaces
- **Features**:
  - Dashboard widgets
  - Ticket cards
  - Skill metrics
  - Phase trackers
- **Usage**:
  ```jsx
  import { TicketCard } from '@wayofmono/wo-web-ui';
  <TicketCard ticket={ticket} />
  ```

---

## 🧠 Key Workflow: f-rr-d Context Engineering

The **f-rr-d (förråd)** system stores tickets, plans, research, and personal TODOs across all projects.

### Workflow Pattern

```
Ticket → /create_plan → /implement_plan → /validate_plan → /validate_telemetry → /commit
```

### Directory Structure

```
thoughts/
├── global/                    # Cross-project concerns
│   ├── tickets/
│   ├── plans/
│   ├── research/
│   └── todos/
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
| `/init_harness` | Initialize harness (creates project memory + `thoughts/`) |
| `/create_plan` | Generate implementation plan from ticket |
| `/implement_plan` | Execute approved plan phase-by-phase |
| `/validate_plan` | Verify implementation against plan |
| `/validate_telemetry` | Validate local telemetry against narrative spec |
| `/commit` | Create well-structured git commits |
| `/debug` | Investigate issues during testing |
| `/help` | Unified help system |
| `/sync skills` | Sync all skills to all frontends |

---

## 📊 CTO Dashboard

**URL**: https://cto.wayof.work

### Features

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

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/tickets` | GET | List all tickets |
| `/api/tickets/:id` | GET | Get ticket by ID |
| `/api/tickets` | POST | Create new ticket |
| `/api/skills` | GET | List installed skills |
| `/api/standup` | POST | Generate standup |
| `/api/ideas` | POST | Generate ideas |
| `/api/assign` | POST | Assign ticket to developer |
| `/api/prioritize` | POST | Vote on ideas |

---

## 🔧 Pipeline Tools

| Tool | Location | Purpose |
|------|----------|---------|
| `docs-sync.ts` | `packages/@aiengineeringharness/scripts/` | Sync canonical skills → per-tool copies with naming/tool-name translation |
| `compliance-check.ts` | `packages/@aiengineeringharness/scripts/` | Validate frontmatter, tool name casing, naming conventions across 553+ files |
| `migrate-tickets.ts` | `packages/@aiengineeringharness/scripts/` | Migrate ticket namespaces (PROJ → WOMONO) |
| `import-ref-skills.ts` | `packages/@aiengineeringharness/scripts/` | Import reference skills from `docs/` |

### Script Usage

```bash
# Sync canonical skills to all tools
ai-harness --sync-docs

# Preview changes first
ai-harness --sync-docs --check

# Run compliance check
/packages/@aiengineeringharness/scripts/compliance-check.ts
```

---

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
- **Devbox** (for reproducible shell environment)
- **cloudflared** tunnel authenticated for `cto.wayof.work`
- **Caddy** reverse proxy
- **Next.js** application server

### Prerequisites

```yaml
- Podman
- podman-compose
- Devbox
- Cloudflare Tunnel (cloudflared)
- Caddy
```

### Deploy Commands

```bash
# First time: start the stack
cd ui
podman-compose up --build -d

# Optionally register as systemd service
sudo cp docker/wayofmono-dashboard.service /etc/systemd/system/
sudo systemctl enable --now wayofmono-dashboard

# Update dashboard
./scripts/deploy-dashboard.sh
```

### Health Check

```bash
curl https://cto.wayof.work/api/health
# Returns: {"status":"ok"}
```

### Logs

```bash
podman-compose logs -f
```

---

## 🔄 CI/CD Pipeline

### Workflows

| Workflow | Trigger | Checks |
|----------|---------|--------|
| **CI** | Push/PR to main | Build, typecheck, test, canonical skill sync check |
| **CD** | Tag push `v*` | Publish npm packages |

### Canonical Sync

The CI verifies that all 567 SKILL.md files (81 canonical × 7 tools) are in sync. If not:

```bash
ai-harness --sync-docs
```

### Pre-deploy Checklist

- [ ] All tests passing
- [ ] Canonical skills synced
- [ ] No linting errors
- [ ] Security scan passed
- [ ] Dashboard health check OK

---

## 🔗 External Integrations

| Project | Description | Integration |
|---------|-------------|-------------|
| **Way of Pi** | AI-augmented engineering platform | Uses `@wayofmono/wo-agent` as backend SDK |
| **Way of Work** | AI-powered productivity platform | Uses `@wayofmono/wo-agent` as user agent SDK |

---

## 📋 Best Practices

### Naming Conventions

- **Files**: camelCase for code, kebab-case for config, snake_case for scripts
- **Projects**: kebab-case (wo-xxx)
- **Skills**: SKILL.md (uppercase extension)
- **Tickets**: `XXX-XXXX` format (e.g., `WOMONO-150`)

### File Structure

Each harness directory should contain:

```
<tool>/
├── skills/          # Skill directories
├── tools/           # Tool-specific scripts
│   ├── init
│   ├── sync
│   └── validate
├── settings.json    # User configuration
└── .mcp.json        # MCP configuration
```

### Git Commit Messages

Use Conventional Commits:

```
feat: Add feature description
fix: Fix bug description
docs: Add/update documentation
chore: Update dependencies
refactor: Refactor code
test: Add/update tests
perf: Improve performance
```

---

## 🛡️ Security

### Security Headers

All deployments include:

- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy

### Scanning

Regular scanning with:

- Dependency check
- Vulnerability scanner
- Code quality tools

---

## 🎯 Quick Reference

### Common Commands

```bash
# Initialize a new project
ai-harness --init my-project

# Install a specific tool
ai-harness --tool=claude

# Install all tools
ai-harness --tool=all --yes

# Update all skills
ai-harness --update

# Sync documentation
ai-harness --sync-docs

# Report skills to dashboard
ai-harness --report-skills

# Uninstall a tool
ai-harness --uninstall=claude

# Check health
curl https://cto.wayof.work/api/health
```

### Debugging

```bash
# View podman logs
podman-compose logs -f

# Debug dashboard
cd ui && pnpm dev

# View skill health
ai-harness --report-skills

# Validate skills against canonical
ai-harness --sync-docs --check
```

---

## 🌐 Multi-Platform Support

| Platform | Deno Required | Install Command | Support Level |
|----------|--------------|-----------------|---------------|
| **Windows** | Yes (`irm` + `iex`) | `deno install -Agf -n ai-harness ...` | Full |
| **Linux** | Yes | `deno install -Agf -n ai-harness ...` | Full |
| **macOS** | Yes | `deno install -Agf -n ai-harness ...` | Full |
| **Git Bash/WSL** | Yes | `apt install deno` + `deno install ...` | Full |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details.

---

## 📞 Support

- **GitHub Issues**: https://github.com/Way-Of/wayofmono/issues
- **Dashboard**: https://cto.wayof.work
- **Documentation**: [/docs/](./docs/)

---

## 📈 Stats

- **88** battle-tested skills
- **81** canonical + **7** new skills
- **7** AI coding tools supported
- **6** subagents
- **553+** files validated
- **10** NPM packages published

---
🚀 Getting Started

Packages install to node_modules/ in your project (not globally). Binaries land in node_modules/.bin/ and are accessed via npx/pnpm without any global setup.
💻 Coding Assistant (wocode)

For automated engineering and refactoring.

npm (Node's default package manager):

npm install --save-dev @wayofmono/wo-coding-agent
npx wocode --init
./wocode

pnpm (faster, disk-efficient alternative):

pnpm add -D @wayofmono/wo-coding-agent
pnpm wocode --init
./wocode

🤖 User Assistant (wouser)

For general use and SDK integration.

npm (Node's default package manager):

npm install @wayofmono/wo-agent
npx wouser --init
./wouser

pnpm (faster, disk-efficient alternative):

pnpm add @wayofmono/wo-agent
pnpm wouser --init
./wouser

💡 Understanding Dev-Dependencies (--save-dev / -D)

When you run npm install --save-dev or pnpm add -D, you are telling the package manager to treat the package as a Development Dependency. Here is exactly what that means and what it does:
1. Conceptual Meaning: "The Hammer vs. The House"

Think of your application as a house you are building.

    dependencies: These are the materials (bricks, glass, wires). They stay in the house forever. Your app cannot "live" without them.
    devDependencies (--save-dev / -D): These are the tools (hammers, saws, blueprints). You need them to build the house, but you don't leave them inside the walls when the owner moves in.

2. What it does in your project:

    package.json: It places the package under the "devDependencies" key instead of "dependencies".
    Production Deployment: When you deploy your app to a server and run pnpm install --prod, none of the dev-dependencies are installed. This makes your deployment faster and keeps your production environment much smaller and more secure.
    Bundle Size: If you are building a web application, tools like wocode will never be accidentally bundled into the code your users download.

3. Why wocode must be a dev-dependency:

The Coding Assistant (wocode) is a tool for you, the engineer. It helps you write code, refactor files, and analyze the architecture. Your end-users never interact with it, and your application doesn't need it to function. Installing it with --save-dev or -D ensures it stays in your "toolbox" and out of your "finished product."
4. Why wouser is different:

The User Assistant (wouser) is an SDK. If you are building an AI chatbot or a feature that uses the agent's logic inside your app, your app needs that code to run in the real world. Therefore, it is installed as a standard dependency so it's always available, even in production.
📦 Zero-Pollution Installation

WayOfMono agents are project-local and folder-contained. We believe your coding assistant should live where your code lives.
Project-Local Agents

    wocode: High-performance coding assistant for engineering tasks.
    wouser: General-purpose agent CLI and SDK for app integration.

Contained Environment (.wo/)

Everything the agent needs is stored in a project-local .wo/ folder:

    Zero Global Pollution: No messy files in your home directory or global PATH.
    Isolated Context: Each project gets its own sessions, tools, and configurations.
    Portable Setup: Your agent configuration stays with the project.
    Flawless Resolution: Internal dependencies are resolved locally within the package dist/ folders.

The --init command sets up the following local files:

    models.json: Configure your LLM providers (Ollama, OpenAI, Gemini, etc.). Defaults to Ollama with qwen3.5:9b. Customize this file to add your own API keys and local models.
    settings.json: Customize agent behavior and set your default provider/model. Edit this to change themes, quiet mode, or default model cycling.
    Launcher Script: A local ./wouser or ./wocode script for one-tap agent startup.

🎭 Custom Personas (AGENTS.md)

To change the agent's persona, instructions, or behavior for a project, simply create an AGENTS.md file in your project root.

    The agent automatically discovers this file on startup.
    You can use it to tell the agent it is a "Senior React Developer," a "Security Auditor," or any other specialized role.

📦 Wo Packages

All Wo packages are under the @wayofmono scope. Two install methods:
Install from npm (works now)

npm install @wayofmono/wo-agent          # wouser (SDK)
npm install @wayofmono/wo-coding-agent   # wocode (CLI)

Install from cloned repo (alternative — no npm needed)

git clone https://github.com/Way-Of/wayofmono.git ~/wayofmono
pnpm add ~/wayofmono/packages/@wayofmono/wo-agent

Packages

All published at https://www.npmjs.com/settings/wayofmono/packages
Package 	Description 	npm
@wayofmono/wo-ai 	Multi-Provider LLM API (OpenAI, Anthropic, Gemini) 	npm install @wayofmono/wo-ai
@wayofmono/wo-tui 	High-Performance Terminal UI Library 	npm install @wayofmono/wo-tui
@wayofmono/wo-agent-core 	Central Agent Runtime & Extension API 	npm install @wayofmono/wo-agent-core
@wayofmono/wo-agent 	General-Purpose Agent SDK & CLI (wouser) 	npm install @wayofmono/wo-agent
@wayofmono/wo-coding-agent 	CLI Coding Agent (wocode) 	npm install @wayofmono/wo-coding-agent
@wayofmono/wo-skill-docs 	Multi-format Documentation Expert 	npm install @wayofmono/wo-skill-docs
@wayofmono/wo-mermaid 	TUI Mermaid Renderer (ASCII art) 	npm install @wayofmono/wo-mermaid
@wayofmono/web-access 	Web search, URL fetching, GitHub cloning, PDF/YouTube/video extraction 	npm install @wayofmono/web-access
@wayofmono/lens 	Codebase Analysis & Safety Engine 	npm install @wayofmono/lens
@wayofmono/wo-web-ui 	Web UI Components (React 19) 	npm install @wayofmono/wo-web-ui

---

**WayOfMono - High-Performance AI Coding Agents** 🚀
