# WayOfMono (Wo) Documentation

Welcome to the comprehensive documentation for the **WayOfMono** consolidated monorepo. This system integrates the capabilities of Pi, Gemini CLI, and OpenCode into a unified framework for AI-native software engineering, with **Wo (Way of Coding)** as the flagship interaction layer.

## 📖 Table of Contents

- [Interface Architecture](#interface-architecture)
- [Agents](./agents/README.md)
- [Skills](./skills/README.md)
- [Tools](./tools/README.md)
- [Packages](./packages/README.md)
- [Wo (Way of Coding) Deep Dive](./wo/README.md)
- [Alignment & Standards](#alignment--standards)

---

## 🎛️ Interface Architecture

WayOfMono is built on a shared **Intelligence Backend** that supports four distinct frontends. This allows developers to use the interaction model that best fits their workflow while sharing common project context and tools.

### 1. WayOfMono (Primary Interfaces)
The **wocode** and **wouser** agents are our highly-customized synthesis of modern agent technology. They are optimized for "Vertical Slice" engineering and vertical-chain agent orchestration.
- **Commands:** `wocode --init`, `wouser --init`
- **Packages:** `@wayofmono/wo-coding-agent`, `@wayofmono/wo-agent`

### 2. Pi (Reference Interface)
Maintains 100% compatibility with the official [Pi Agent](https://github.com/earendil-works/pi) standards.
- **Location:** `pi/`

### 3. Gemini CLI (Multimodal Interface)
Leverages the high-velocity, automation-first patterns of the [Gemini CLI](https://geminicli.com).
- **Location:** `gemini/`

### 4. OpenCode (Privacy Interface)
Follows the privacy-first, TUI-driven [OpenCode](https://opencode.ai) standards.
- **Location:** `opencode/`

---

## 🛠️ The Common Backend

All interfaces leverage the same core assets:
- **Packages:** `@wayofmono/wo-*` (AI, Agent Core, TUI, Web UI, Skills).
- **Tools:** `Lens` (LSP & Safety), `Web-Access`, and `Markdown-Preview`.
- **Memory:** Shared context retention and session state management.
- **Thoughts:** Standardized `thoughts/` directory for tickets, plans, and research.
- **Legacy:** Previous configurations and prompts are preserved in `ref/wo`.

---

## 🔗 Alignment Links
- [Pi Standards & Repo](https://github.com/earendil-works/pi)
- [Gemini CLI Official Docs](https://geminicli.com/docs/)
- [OpenCode Official Docs](https://opencode.ai/docs)
- [WayOfMono Installation Guide](./INSTALL.md)
