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

---

## 📂 Repository Structure

```
/home/zerwiz/wayofmono/
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

### 💻 Coding Assistant (`wocode`)
*For automated engineering and refactoring.*
```bash
pnpm add -D @wayofmono/wo-coding-agent # Install as dev-dependency
pnpm exec wocode --init
./wocode
```

### 🤖 User Assistant (`wouser`)
*For general use and SDK integration.*
```bash
pnpm add @wayofmono/wo-agent
pnpm exec wouser --init
./wouser
```

---

### 💡 Understanding Dev-Dependencies (`-D`)

When you run `pnpm add -D`, you are telling the package manager to treat the agent as a **Development Dependency**. Here is exactly what that means and what it does:

#### 1. Conceptual Meaning: "The Hammer vs. The House"
Think of your application as a house you are building.
*   **`dependencies`**: These are the **materials** (bricks, glass, wires). They stay in the house forever. Your app cannot "live" without them.
*   **`devDependencies` (-D)**: These are the **tools** (hammers, saws, blueprints). You need them to build the house, but you don't leave them inside the walls when the owner moves in.

#### 2. What it does in your project:
*   **`package.json`**: It places the package under the `"devDependencies"` key instead of `"dependencies"`.
*   **Production Deployment**: When you deploy your app to a server and run `pnpm install --prod`, none of the dev-dependencies are installed. This makes your deployment faster and keeps your production environment much smaller and more secure.
*   **Bundle Size**: If you are building a web application, tools like `wocode` will never be accidentally bundled into the code your users download.

#### 3. Why `wocode` must be a dev-dependency:
The **Coding Assistant (`wocode`)** is a tool for you, the engineer. It helps you write code, refactor files, and analyze the architecture. Your end-users never interact with it, and your application doesn't need it to function. Installing it with `-D` ensures it stays in your "toolbox" and out of your "finished product."

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

All Wo packages are published under the `@wayofmono` scope. Install any package with your preferred package manager.

### Publish (from monorepo root)

```bash
pnpm publish   # Publishes all packages to npm in dependency order
```

### Install in your project

| Package | Description | Install |
|---------|-------------|---------|
| `@wayofmono/wo-ai` | Multi-Provider LLM API (OpenAI, Anthropic, Gemini) | `npm install @wayofmono/wo-ai` |
| `@wayofmono/wo-tui` | High-Performance Terminal UI Library | `npm install @wayofmono/wo-tui` |
| `@wayofmono/wo-agent-core` | Central Agent Runtime & Extension API | `npm install @wayofmono/wo-agent-core` |
| `@wayofmono/wo-coding-agent` | Project-local CLI Coding Agent (`wocode` binary) | `pnpm add -D @wayofmono/wo-coding-agent` |
| `@wayofmono/wo-agent` | General-Purpose Agent SDK & CLI (`wouser` binary) | `pnpm add @wayofmono/wo-agent` |
| `@wayofmono/wo-skill-docs` | Multi-format Documentation Expert (Markdown, PDF, Word, TXT) | `pnpm add -D @wayofmono/wo-skill-docs` |
| `@wayofmono/wo-mermaid` | TUI Mermaid Diagram Renderer (ASCII art) | `pnpm add -D @wayofmono/wo-mermaid` |
| `@wayofmono/telemetry` | ODD Instrumentation SDK (OpenTelemetry) | `npm install @wayofmono/telemetry` |
| `@wayofmono/lens` | Codebase Analysis & Safety Engine | `npm install @wayofmono/lens` |

## 🎛️ AI Engineering Harness

Shared agents, commands, skills, and extensions for all agent frontends. Install once and instantly configure any agent with battle-tested prompts and workflows.

### Prerequisites

- [Deno](https://deno.com/) — `curl -fsSL https://deno.land/install.sh | sh`
- [GNU Stow](https://www.gnu.org/software/stow/) — `sudo apt install stow` (or `brew install stow`)

### Quick Install (for agents — one command)

```bash
deno run -A https://raw.githubusercontent.com/zerwiz/wayofmono/main/packages/@aiengineeringharness/install.ts --tool=all --yes
```

### CLI Install (one-time setup)

Register the CLI:

```bash
deno install -Agf -n ai-harness \
  https://raw.githubusercontent.com/zerwiz/wayofmono/main/packages/@aiengineeringharness/install.ts
```

Then install configs:

```bash
ai-harness --tool=claude          # Claude Code
ai-harness --tool=opencode        # OpenCode
ai-harness --tool=gemini          # Gemini CLI
ai-harness --tool=pi              # Pi
ai-harness --tool=wocoder         # Wo Coder
ai-harness --tool=all             # All five
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
./packages/@aiengineeringharness/setup.sh all                # All five

./packages/@aiengineeringharness/setup.sh <tool> --dry-run   # Preview
./packages/@aiengineeringharness/setup.sh <tool> --restow    # Update after git pull
./packages/@aiengineeringharness/setup.sh <tool> --delete    # Remove symlinks
```

### External Integrations
| Project | Description | Integration |
|---------|-------------|-------------|
| [Way of Pi](https://github.com/zerwiz/wayofpi) | AI-augmented engineering platform (Electron/Web IDE) | Uses `@wayofmono/wo-agent` as backend agent SDK |

---
*Built as a unified toolset for the next generation of AI engineering.*
