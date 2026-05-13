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

1.  **Initialize:** Run `wo /wom-init` to set up the context engine and steering files (`AGENTS.md`, `GEMINI.md`).
2.  **Explore:** Use the `wom-recon` agent to map the codebase architecture.
3.  **Plan:** Use `wom-architect` via `wo /wom-plan` to design your implementation vertical slice.
4.  **Execute:** Use `wom-coder` via `wo /wom-build` to apply surgical code modifications.
5.  **Audit:** Use `wom-auditor` via `wo /wom-audit` to ensure production-readiness and security.

---

## 📦 Installation

WayOfMono uses a unified harness for rapid deployment.

### Automated Setup (Deno)
```bash
deno install -Agf -n wo-harness \
  https://raw.githubusercontent.com/zerwiz/wayofmono/main/wo/install.ts
```

## 📦 Wo Packages

All Wo packages are published under the `@wayofmono` scope. Install individually or via the monorepo.

| Package | Description | Install |
|---------|-------------|---------|
| `@wayofmono/wo-ai` | Multi-Provider LLM API (OpenAI, Anthropic, Gemini) | `npm install @wayofmono/wo-ai` |
| `@wayofmono/wo-tui` | High-Performance Terminal UI Library | `npm install @wayofmono/wo-tui` |
| `@wayofmono/wo-agent-core` | Central Agent Runtime & ExtensionAPI | `npm install @wayofmono/wo-agent-core` |
| `@wayofmono/wo-web-ui` | Web UI Components (React) | `npm install @wayofmono/wo-web-ui` |
| `@wayofmono/telemetry` | ODD Instrumentation SDK (OpenTelemetry) | `npm install @wayofmono/telemetry` |
| `@wayofmono/lens` | Codebase Analysis & Safety Engine | `npm install @wayofmono/lens` |

### Monorepo Install
```bash
git clone https://github.com/earendil-works/wayofmono.git
cd wayofmono
npm install  # installs all packages via workspaces
```

### Manual Package Installation (Wo CLI)
```bash
# Install the Wo CLI
npm install -g @wayofmono/wo-coding-agent

# Install specific monorepo capabilities
wo install npm:@wayofmono/wo-lens
wo install git:https://github.com/zerwiz/wayofmono.git
```

---
*Built as a unified toolset for the next generation of AI engineering.*
