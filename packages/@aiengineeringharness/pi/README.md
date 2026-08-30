# Pi Agent Harness Integration

This directory houses the shared capability templates, domain-expert agents, slash prompt commands, skills, and extensions for the **Pi Coding Agent** (from Earendil Works) integration. 

Pi is an open-source, minimalist terminal-based AI coding harness designed for maximum flexibility and developer customization. It utilizes a small core runtime and scales functionality via packages, skills, and programmable extensions.

---

## 📖 Integration Sub-Guides

Each core folder contains its own detailed specification and usage guide:

*   **[Domain Experts (Agents)](./agents/README.md)**: YAML-steered assistant personas (using Pi's kebab-case convention, e.g. `codebase-analyzer.md`) used for domain delegation.
*   **[Modular Skills](./skills/README.md)**: Skill configuration folders containing `SKILL.md` instruction files (e.g. `tdd.md`, `git-commit-helper.md`).
*   **[Programmable Extensions](./extensions/README.md)**: Custom JS/TS modules (e.g. `open-editor.ts`, `subagent/`) that leverage the Pi API to register new tools, listen to events, and set up custom workflows.

---

## ⚙️ Core Configuration & Integration Patterns

### 1. Configuration File
The global configuration file for Pi is located at `~/.pi/agent/config.json`. Project-specific settings are configured in `<workspace-root>/.agents/config.json`.

### 2. Prompt templates (Commands)
Pi implements slash commands as prompt templates in the `prompts/` directory. For example, typing `/create_plan` triggers the `create_plan.md` prompt template.

### 3. Extensions (`extensions/`)
Programmable plugins (such as the `subagent` extension) are registered directly in the extensions folder and executed within the node runtime on startup.

---

## 🚫 Key Differences from Antigravity / Gemini CLI

Unlike the Gemini CLI / Antigravity SDK platforms, Pi is a minimalist framework and **does not** natively support:
*   **Builtin Sidecars (`sidecar.json`)**: Pi does not manage background sidecars or scheduling.
*   **Pre/Post Hooks (`hooks.json`)**: Pi does not intercept commands or filesystem actions via JSON event triggers.
*   **Plugin manifests (`plugin.json`)**: Pi utilizes its own JS/TS extension lifecycle API rather than grouping files inside namespaced directories.

---

## 🔗 Official Reference Links
*   [Pi Official Website](https://pi.dev)
*   [Pi Latest Documentation Hub](https://pi.dev/docs/latest)
*   [Pi GitHub Repository](https://github.com/earendil-works/pi)
