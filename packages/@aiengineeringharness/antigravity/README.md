# Antigravity Harness Integration

This directory houses the shared capability templates, subagents, commands, and skills for the **Antigravity / Gemini CLI** agent platform integration. 

Antigravity is Google's agent-first development platform that empowers autonomous AI agents to work within codebases, execute terminal tasks, orchestrate browser events, and coordinate multi-agent workflows.

---

## 📖 Integration Sub-Guides

Each core folder contains its own detailed specification and usage guide:

*   **[Agents & Subagents](./agents/README.md)**: Asynchronous subagent invocation, state cycles (`Running`, `Idle`, `Killed`), communication mechanisms, and `/teamwork-preview` guidelines.
*   **[Modular Skills](./skills/README.md)**: Skill discovery rules, instruction guides (`SKILL.md`), and global vs workspace-level storage.
*   **[Hooks & Interceptors](./hooks/README.md)**: Event triggers (`PreToolUse`, `PostInvocation`, etc.) and SDK hook definitions (`Inspect`, `Decide`, `Transform`).
*   **[Background Sidecars](./sidecars/README.md)**: Configuration schemas (`sidecar.json`), cron-built-in scheduling, runtime data outputs, and the `agentapi` CLI.
*   **[Namespaced Plugins](./plugins/README.md)**: Package bundles grouping rules, skills, MCP servers, and hooks under a single manifest (`plugin.json`).

---

## ⚙️ Core Configuration Files

*   **[`antigravity.json`](./antigravity.json)**: The plugin-registration configuration file used by the harness to register metadata.
*   **`config.json`**: Located at `~/.gemini/config/config.json`, this is the user's primary configuration file for enabling sidecars, declaring project scopes, and configuring model parameters.

---

## 🔗 Official Documentation Links

For further reference, check Google's official Antigravity documentation:

*   [Antigravity Documentation Hub](https://antigravity.google/docs)
*   [Asynchronous Subagents Guide](https://antigravity.google/docs/subagents)
*   [Customizing Skills](https://antigravity.google/docs/skills)
*   [Lifecycle Hooks Specification](https://antigravity.google/docs/hooks)
*   [Background Sidecars API](https://antigravity.google/docs/sidecars)
*   [Namespaced Plugins packaging](https://antigravity.google/docs/plugins)
