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

1.  **Install:** `npm install --save-dev @wayofmono/wo-coding-agent` in your project.
2.  **Run:** `npx wo -p "describe this codebase"` to get a quick analysis.
3.  **Initialize:** `npx wo /wom-init` to set up context engine and steering files.
4.  **Explore:** Use `wom-recon` agent to map the codebase architecture.
5.  **Plan:** Use `wom-architect` via `npx wo /wom-plan` to design your implementation.
6.  **Execute:** Use `wom-coder` via `npx wo /wom-build` for surgical code modifications.
7.  **Audit:** Use `wom-auditor` via `npx wo /wom-audit` for production-readiness and security.

---

## 📦 Installation

`wo` is a **project-local agent** — install it per-project, not globally.

### Add to any project
```bash
npm install --save-dev @wayofmono/wo-coding-agent
npx wo -p "analyze this project"
```

All session data, config, and downloaded tools live in `<project-root>/.wo/`. This means:
- Each project gets its own isolated agent context
- `.wo/` can be gitignored or tracked
- No global `~/.wo/` state pollution
- Works with CI/CD, monorepos, and multi-project setups

### Monorepo (for development of wo itself)
```bash
git clone https://github.com/zerwiz/wayofmono.git
cd wayofmono
npm install
```

## 📦 Wo Packages

All Wo packages are published under the `@wayofmono` scope. Install individually in your project.

| Package | Description | Install |
|---------|-------------|---------|
| `@wayofmono/wo-ai` | Multi-Provider LLM API (OpenAI, Anthropic, Gemini) | `npm install @wayofmono/wo-ai` |
| `@wayofmono/wo-tui` | High-Performance Terminal UI Library | `npm install @wayofmono/wo-tui` |
| `@wayofmono/wo-agent-core` | Central Agent Runtime & ExtensionAPI | `npm install @wayofmono/wo-agent-core` |
| `@wayofmono/wo-web-ui` | Web UI Components (React) | `npm install @wayofmono/wo-web-ui` |
| `@wayofmono/telemetry` | ODD Instrumentation SDK (OpenTelemetry) | `npm install @wayofmono/telemetry` |
| `@wayofmono/lens` | Codebase Analysis & Safety Engine | `npm install @wayofmono/lens` |
| `@wayofmono/wo-coding-agent` | Project-local CLI Coding Agent (`wo` binary) | `npm install --save-dev @wayofmono/wo-coding-agent` |
| `@wayofmono/wo-agent` | Embeddable General-Purpose Agent SDK (for apps like wayofpi) | `npm install @wayofmono/wo-agent` |

### External Integrations
| Project | Description | Integration |
|---------|-------------|-------------|
| [Way of Pi](https://github.com/zerwiz/wayofpi) | AI-augmented engineering platform (Electron/Web IDE) | Uses `@wayofmono/wo-agent` as backend agent SDK |

---
*Built as a unified toolset for the next generation of AI engineering.*
