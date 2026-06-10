# WayOfMono (Wo)

The ultimate monorepo consolidation for high-performance coding agents. WayOfMono provides a shared **Intelligence Backend** (Packages, Tools, Memory) that serves five distinct **Agent Frontends**, with **Wo (Way of Coding)** as our primary synthesized interface.

## 🎛️ Multi-Interface Architecture

WayOfMono is built on an **Interface-Agnostic Philosophy**. Our core logic and tools are shared across all major coding agent platforms, allowing you to work with your codebase using your preferred interaction model:

1.  **wocode:** High-performance coding assistant for automated engineering and refactoring (`@wayofmono/wo-coding-agent`). Native to this monorepo.
2.  **wouser:** General-purpose user agent SDK and CLI (`@wayofmono/wo-agent`). Native to this monorepo.
3.  **Claude Code:** Agentic AI coding from [Anthropic](https://code.claude.com) in your terminal.
4.  **Pi:** Full compatibility with the official Pi Agent standards from [earendil-works](https://github.com/earendil-works/pi).
5.  **OpenCode:** Open-source, TUI-driven coding agent following the [OpenCode](https://opencode.ai/) standard.
6.  **Gemini CLI:** Multimodal, high-velocity automation using the [Gemini CLI](https://geminicli.com/) standard.
7.  **Antigravity:** Agent-first development platform for autonomous execution and web tasks.

---

## 📂 Repository Structure

```
./
├── packages/
│   ├── @aiengineeringharness/   # Agent harness (agents, commands, skills, extensions)
│   │   ├── opencode/           → ~/.config/opencode/
│   │   ├── claude/             → ~/.claude/
│   │   ├── gemini/             → ~/.gemini/
│   │   ├── pi/                 → ~/.pi/agent/
│   │   └── wocoder/            → ~/.wocoder/
│   └── @wayofmono/*            # Wo npm packages
├── thoughts/          # Context engineering artifacts
├── docs/              # Monorepo documentation
├── scripts/           # Utility scripts
├── test/              # Integration tests
├── ref/               # Historical reference & legacy artifacts
├── planning/          # Planning documents
└── pnpm-workspace.yaml
```

---

## 🦙 Prerequisites: Ollama

WayOfMono defaults to using **Ollama** for local-first AI. Ensure it is installed and running:

1.  **Install:** `curl -fsSL https://ollama.com/install.sh | sh` (or download from [ollama.com](https://ollama.com)).
2.  **Pull Model:** `ollama pull qwen3.5:9b`

---

## 🚀 Getting Started

Packages install to `node_modules/` in your project (not globally). Binaries land in `node_modules/.bin/` and are accessed via `npx`/`pnpm` without any global setup.

### 💻 Coding Assistant (`wocode`)
*For automated engineering and refactoring.*

**npm (Node's default package manager):**
```bash
npm install --save-dev @wayofmono/wo-coding-agent
npx wocode --init
./wocode
```

**pnpm (faster, disk-efficient alternative):**
```bash
pnpm add -D @wayofmono/wo-coding-agent
pnpm wocode --init
./wocode
```

### 🤖 User Assistant (`wouser`)
*For general use and SDK integration.*

**npm (Node's default package manager):**
```bash
npm install @wayofmono/wo-agent
npx wouser --init
./wouser
```

**pnpm (faster, disk-efficient alternative):**
```bash
pnpm add @wayofmono/wo-agent
pnpm wouser --init
./wouser
```

---

### 💡 Understanding Dev-Dependencies (`--save-dev` / `-D`)

When you run `npm install --save-dev` or `pnpm add -D`, you are telling the package manager to treat the package as a **Development Dependency**. Here is exactly what that means and what it does:

#### 1. Conceptual Meaning: "The Hammer vs. The House"
Think of your application as a house you are building.
*   **`dependencies`**: These are the **materials** (bricks, glass, wires). They stay in the house forever. Your app cannot "live" without them.
*   **`devDependencies` (`--save-dev` / `-D`)**: These are the **tools** (hammers, saws, blueprints). You need them to build the house, but you don't leave them inside the walls when the owner moves in.

#### 2. What it does in your project:
*   **`package.json`**: It places the package under the `"devDependencies"` key instead of `"dependencies"`.
*   **Production Deployment**: When you deploy your app to a server and run `pnpm install --prod`, none of the dev-dependencies are installed. This makes your deployment faster and keeps your production environment much smaller and more secure.
*   **Bundle Size**: If you are building a web application, tools like `wocode` will never be accidentally bundled into the code your users download.

#### 3. Why `wocode` must be a dev-dependency:
The **Coding Assistant (`wocode`)** is a tool for you, the engineer. It helps you write code, refactor files, and analyze the architecture. Your end-users never interact with it, and your application doesn't need it to function. Installing it with `--save-dev` or `-D` ensures it stays in your "toolbox" and out of your "finished product."

#### 4. Why `wouser` is different:
The **User Assistant (`wouser`)** is an SDK. If you are building an AI chatbot or a feature that uses the agent's logic inside your app, your app needs that code to run in the real world. Therefore, it is installed as a standard dependency so it's always available, even in production.

---

## 📦 Zero-Pollution Installation

WayOfMono agents are **project-local** and **folder-contained**. We believe your coding assistant should live where your code lives.

### Project-Local Agents
- **`wocode`**: High-performance coding assistant for engineering tasks.
- **`wouser`**: General-purpose agent CLI and SDK for app integration.

### Contained Environment (.wo/)
Everything the agent needs is stored in a project-local `.wo/` folder:
- **Zero Global Pollution**: No messy files in your home directory or global PATH.
- **Isolated Context**: Each project gets its own sessions, tools, and configurations.
- **Portable Setup**: Your agent configuration stays with the project.
- **Flawless Resolution**: Internal dependencies are resolved locally within the package `dist/` folders.

The `--init` command sets up the following local files:
- **`models.json`**: Configure your LLM providers (Ollama, OpenAI, Gemini, etc.). Defaults to Ollama with `qwen3.5:9b`. **Customize this file to add your own API keys and local models.**
- **`settings.json`**: Customize agent behavior and set your default provider/model. **Edit this to change themes, quiet mode, or default model cycling.**
- **Launcher Script**: A local `./wouser` or `./wocode` script for one-tap agent startup.

### 🎭 Custom Personas (AGENTS.md)
To change the agent's persona, instructions, or behavior for a project, simply create an **`AGENTS.md`** file in your project root. 
- The agent automatically discovers this file on startup.
- You can use it to tell the agent it is a "Senior React Developer," a "Security Auditor," or any other specialized role.

## 📦 Wo Packages

All Wo packages are under the `@wayofmono` scope. Two install methods:

### Install from npm (works now)

```bash
npm install @wayofmono/wo-agent          # wouser (SDK)
npm install @wayofmono/wo-coding-agent   # wocode (CLI)
```

### Install from cloned repo (alternative — no npm needed)

```bash
git clone https://github.com/Way-Of/wayofmono.git ~/wayofmono
pnpm add ~/wayofmono/packages/@wayofmono/wo-agent
```

### Packages

All published at https://www.npmjs.com/settings/wayofmono/packages

| Package | Description | npm |
|---------|-------------|-----|
| `@wayofmono/wo-ai` | Multi-Provider LLM API (OpenAI, Anthropic, Gemini) | `npm install @wayofmono/wo-ai` |
| `@wayofmono/wo-tui` | High-Performance Terminal UI Library | `npm install @wayofmono/wo-tui` |
| `@wayofmono/wo-agent-core` | Central Agent Runtime & Extension API | `npm install @wayofmono/wo-agent-core` |
| `@wayofmono/wo-agent` | General-Purpose Agent SDK & CLI (`wouser`) | `npm install @wayofmono/wo-agent` |
| `@wayofmono/wo-coding-agent` | CLI Coding Agent (`wocode`) | `npm install @wayofmono/wo-coding-agent` |
| `@wayofmono/wo-skill-docs` | Multi-format Documentation Expert | `npm install @wayofmono/wo-skill-docs` |
| `@wayofmono/wo-mermaid` | TUI Mermaid Renderer (ASCII art) | `npm install @wayofmono/wo-mermaid` |
| `@wayofmono/web-access` | Web search, URL fetching, GitHub cloning, PDF/YouTube/video extraction | `npm install @wayofmono/web-access` |
| `@wayofmono/lens` | Codebase Analysis & Safety Engine | `npm install @wayofmono/lens` |
| `@wayofmono/wo-web-ui` | Web UI Components (React 19) | `npm install @wayofmono/wo-web-ui` |

## 🎛️ AI Engineering Harness

Shared agents, commands, skills, and extensions for all agent frontends. Install once and instantly configure any agent with battle-tested prompts and workflows. See the comprehensive [AI Engineering Harness Tutorial](docs/HARNESS_TUTORIAL.md) for step-by-step instructions on utilizing the agents, commands, and skills.

### 📚 Context Engineering with f-rr-d (förråd)

WayOfMono uses **f-rr-d** (förråd) — a centralized thoughts repository at `github.com/Way-Of/f-rr-d` — for tickets, plans, research, and personal TODOs across all Way-Of projects.

**How it works:**
1. **Clone on init**: `ai-harness --init` clones f-rr-d into `thoughts/`
2. **Project-scoped**: WayOfMono tickets live in `thoughts/wayofmono/shared/tickets/` (WOMONO-XXX namespace)
3. **Multi-project**: WoW (`thoughts/wow/`, WOW-XXX) and Opticat (`thoughts/opticat/`, OPT-XXX) share the same repo
4. **Pull before read, push after write**: All harness skills auto-sync with f-rr-d
5. **Branch naming**: `<project-slug>/<namespace>/<ticket-id>-<short-desc>` (e.g., `wayofmono/womono/WOMONO-001-centralized-repo`)

**Local structure after clone:**
```
thoughts/
├── global/                    # Cross-project concerns
├── wayofmono/                 # WayOfMono (WOMONO-XXX)
│   ├── global/
│   ├── shared/tickets/        # WOMONO-XXX tickets
│   ├── shared/plans/
│   ├── shared/research/
│   └── <developer>/
├── wow/                       # WayOfWork (WOW-XXX)
└── opticat/                   # Opticat (OPT-XXX)
```

**Config:** `.wo/config/harness.json` stores `f_rrd_url` and `project_slug` for the harness.


### Prerequisites

- [Deno](https://deno.com/) — `curl -fsSL https://deno.land/install.sh | sh`
- [GNU Stow](https://www.gnu.org/software/stow/) — `sudo apt install stow` (or `brew install stow`)

### Quick Install (for agents — one command)

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --tool=all --yes
```

### CLI Install (one-time setup)

Register the CLI:

```bash
deno install -Agf -n ai-harness \
  https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts
```

Then install configs:

```bash
ai-harness --tool=claude          # Claude Code
ai-harness --tool=opencode        # OpenCode
ai-harness --tool=gemini          # Gemini CLI
ai-harness --tool=pi              # Pi
ai-harness --tool=wocoder         # Wo Coder
ai-harness --tool=antigravity     # Antigravity
ai-harness --tool=all             # All six
```

Check for updates:

```bash
ai-harness --check                         # Compare vs installed version
# → wocoder: UPDATE AVAILABLE v1.1.0 → v1.2.0
ai-harness --tool=all --yes                # Pull latest
```

Advanced options:

```bash
ai-harness --tool=claude --dry-run        # Preview
ai-harness --tool=claude --interactive    # Pick components
ai-harness --tool=claude --skill=agents   # Specific component
ai-harness --help                         # Full usage
```

### Repo Mode (GNU Stow)

For symlink-based installation (easier `git pull` updates):

```bash
./packages/@aiengineeringharness/setup.sh claude             # Claude Code → ~/.claude/
./packages/@aiengineeringharness/setup.sh opencode           # OpenCode → ~/.config/opencode/
./packages/@aiengineeringharness/setup.sh gemini             # Gemini CLI → ~/.gemini/
./packages/@aiengineeringharness/setup.sh pi                 # Pi → ~/.pi/agent/
./packages/@aiengineeringharness/setup.sh wocoder            # Wo Coder → ~/.wocoder/
./packages/@aiengineeringharness/setup.sh antigravity        # Antigravity → ~/.antigravity/
./packages/@aiengineeringharness/setup.sh all                # All six

./packages/@aiengineeringharness/setup.sh <tool> --dry-run   # Preview
./packages/@aiengineeringharness/setup.sh <tool> --restow    # Update after git pull
./packages/@aiengineeringharness/setup.sh <tool> --delete    # Remove symlinks
```

### External Integrations
| Project | Description | Integration |
|---------|-------------|-------------|
| [Way of Pi](https://github.com/Way-Of/wayofpi) | AI-augmented engineering platform (Electron/Web IDE) | Uses `@wayofmono/wo-agent` as backend agent SDK |
| [Way of Work](https://github.com/Way-Of/wayofwork) | AI-powered productivity platform | Uses `@wayofmono/wo-agent` as user agent SDK |

---
*Built as a unified toolset for the next generation of AI engineering.*
