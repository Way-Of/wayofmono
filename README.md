# WayOfMono (Wo)

The ultimate monorepo consolidation for high-performance coding agents. WayOfMono provides a shared **Intelligence Backend** (Packages, Tools, Memory) that serves four distinct **Agent Frontends**, with **Wo (Way of Coding)** as our primary synthesized interface.

## 🎛️ Multi-Interface Architecture

WayOfMono is built on an **Interface-Agnostic Philosophy**. Our core logic and tools are shared across all major coding agent platforms, allowing you to work with your codebase using your preferred interaction model:

1.  **Wo (Way of Coding):** The primary, highly-tuned synthesized interface. Native to this monorepo.
2.  **Pi:** Full compatibility with the official Pi Agent standards from [earendil-works](https://github.com/earendil-works/pi).
3.  **OpenCode:** Privacy-first, TUI-driven interaction following the [OpenCode](https://opencode.ai/) standard.
4.  **Gemini CLI:** Multimodal, high-velocity automation using the [Gemini CLI](https://geminicli.com/) standard.

---

## 🏗️ Core Philosophies

- **Custom Synthesis:** We don't just collect tools; we synthesize them. Every agent, skill, and template is custom-crafted to leverage the best features of Pi, Gemini, and OpenCode.
- **Context Engineering:** We use the `thoughts/` directory as a structured project memory, ensuring agents have deep, durable context across sessions.
- **Agent Orchestration:** A specialized squad (Architect, Auditor, Recon, Coder) handles complex, vertical-slice engineering tasks with surgical precision.
- **Observability-Driven:** Telemetry, traces, and narrative specs are first-class design artifacts (ODD).

---

## 📂 Repository Structure

```
/home/zerwiz/wayofmono/
├── packages/          # Reusable npm packages (@wayofmono/wo-*)
├── tools/             # Shared tool integrations (Lens, Web Access, etc.)
├── shared/            # Universal templates (Tickets, Plans, Research)
├── wo/                # Wo Agent (Synthesized Primary Interface)
├── pi/                # Pi Agent (Reference-Aligned Interface)
├── gemini/            # Gemini CLI Interface (TOML)
├── opencode/          # OpenCode Interface (Markdown)
├── thoughts/          # Context engineering artifacts
└── docs/              # Comprehensive monorepo & "Wo" documentation
```

---

## 🚀 Getting Started with "Wo"

1.  **Install:** `pnpm add -D @wayofmono/wo-coding-agent` in your project.
2.  **Initialize:** `pnpm exec wocode /wom-init` to set up context engine and steering files.
3.  **Run:** `pnpm exec wocode "Describe this codebase"` to start your first session.
4.  **Explore:** Use specialized agents like `wom-recon` or `wom-architect` for deep engineering tasks.

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

### Simple Installation
```bash
# For coding tasks
pnpm add -D @wayofmono/wo-coding-agent

# For general use or SDK integration
pnpm add @wayofmono/wo-agent
```

---

## 🏗️ Core Philosophies

- **Folder Isolation:** Agents prioritize a local `.wo` directory for all state and configuration.
- **Custom Synthesis:** Every tool and template is custom-crafted for high-performance engineering.
- **Context Engineering:** Structured project memory via `thoughts/` and local `.wo/` state.
- **Observability-Driven:** Narrative-first telemetry and design (ODD).

---

## 📂 Repository Structure

```
/home/zerwiz/wayofmono/
├── packages/          # Reusable npm packages (@wayofmono/wo-*)
├── tools/             # Shared tool integrations (Lens, Web Access, etc.)
├── shared/            # Universal templates (Tickets, Plans, Research)
├── wo/                # Synthesized Agent Interaction Layer
├── pi/                # Pi Agent Standards Compatibility
├── gemini/            # Gemini CLI standards
├── opencode/          # OpenCode standards
├── thoughts/          # Structured Context Engineering artifacts
└── docs/              # Comprehensive Monorepo Documentation
```

## 📦 Wo Packages

All Wo packages are published under the `@wayofmono` scope.

| Package | Description | Install |
|---------|-------------|---------|
| `@wayofmono/wo-ai` | Multi-Provider LLM API (OpenAI, Anthropic, Gemini) | `npm install @wayofmono/wo-ai` |
| `@wayofmono/wo-tui` | High-Performance Terminal UI Library | `npm install @wayofmono/wo-tui` |
| `@wayofmono/wo-agent-core` | Central Agent Runtime & Extension API | `npm install @wayofmono/wo-agent-core` |
| `@wayofmono/wo-coding-agent` | Project-local CLI Coding Agent (`wocode` binary) | `npm install --save-dev @wayofmono/wo-coding-agent` |
| `@wayofmono/wo-agent` | General-Purpose Agent SDK & CLI (`wouser` binary) | `npm install @wayofmono/wo-agent` |
| `@wayofmono/wo-skill-docs` | Multi-format Documentation Expert (Markdown, PDF, Word, TXT) | `pnpm add -D @wayofmono/wo-skill-docs` |
| `@wayofmono/telemetry` | ODD Instrumentation SDK (OpenTelemetry) | `npm install @wayofmono/telemetry` |
| `@wayofmono/lens` | Codebase Analysis & Safety Engine | `npm install @wayofmono/lens` |

### External Integrations
| Project | Description | Integration |
|---------|-------------|-------------|
| [Way of Pi](https://github.com/zerwiz/wayofpi) | AI-augmented engineering platform (Electron/Web IDE) | Uses `@wayofmono/wo-agent` as backend agent SDK |

---
*Built as a unified toolset for the next generation of AI engineering.*
