# Wo Coder Harness Integration

This directory houses the shared capability templates, custom agent personas, slash commands, skills, and extensions for the flagship **Wo Coder (Way of Coding)** agent platform integration.

Wo Coder (`wocode`) is a high-performance terminal-based coding assistant native to the WayOfMono consolidated monorepo. It synthesizes agents, TUI elements, and multi-agent delegation frameworks.

---

## 📂 Naming & Location

Wo Coder stores its configurations in:
*   **Global level**: `~/.wocoder/`
*   **Workspace level**: `<workspace-root>/.wo/` (keeps configurations folder-contained to prevent global pollution).

---

## ⚙️ Core Configuration & Integration Patterns

### 1. `wocoder.json`
Configures Model Context Protocol (MCP) servers to extend Wo Coder with external tools.

### 2. Custom Commands & Skills
*   **`commands/`**: Modular slash commands defined in Markdown (e.g. `/create_plan`, `/implement_plan`, `/commit`).
*   **`skills/`**: Modular skill guides containing a `SKILL.md` instruction booklet (e.g. `tdd`, `git_commit_helper`).

### 3. Extensions (`extensions/`)
Programmable TS/JS extensions (using the same API standard as Earendil Works Pi) to register tools, commands, and multi-agent delegation flows (such as the `subagent` extension).

---

## 🚫 Key Differences from Antigravity / Gemini CLI

Unlike the Gemini CLI and Antigravity, Wo Coder **does not** natively support:
*   **Builtin Sidecars (`sidecar.json`)**: Wo Coder does not manage background sidecars or cron schedules.
*   **Pre/Post Hooks (`hooks.json`)**: Wo Coder does not support lifecycle hooks configured via json event maps.

---

## 🔗 Related References
*   [Monorepo Wo Documentation](../../../docs/wo/README.md)
*   [Harness Tutorial & Developer Guide](../../../docs/HARNESS_TUTORIAL.md)
