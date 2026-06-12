# AI Engineering Harness

A unified context engineering and capability harness for AI coding agents. The harness provides reusable prompts, specialized subagents, and automated workflows across all major coding agent frontends.

---

## 📖 Platform Integrations & Documentation

Each coding tool has its own dedicated directory in this harness containing specific configurations, system prompts, commands, and local documentation:

| Agent Frontend | Local Documentation Guide | Official Website / Reference | Config Target |
| :--- | :--- | :--- | :--- |
| **Antigravity** | [antigravity/README.md](./antigravity/README.md) | [antigravity.google/docs](https://antigravity.google/docs) | `~/.antigravity` |
| **Gemini CLI** | [gemini/README.md](./gemini/README.md) | [geminicli.com/docs](https://geminicli.com/docs) | `~/.gemini` |
| **Claude Code** | [claude/README.md](./claude/README.md) | [code.claude.com](https://code.claude.com) | `~/.claude` |
| **OpenCode** | [opencode/README.md](./opencode/README.md) | [opencode.ai/docs](https://opencode.ai/docs) | `~/.config/opencode` |
| **Pi** | [pi/README.md](./pi/README.md) | [pi.dev/docs/latest](https://pi.dev/docs/latest) | `~/.pi/agent` |
| **Wo Coder** | [wocoder/README.md](./wocoder/README.md) | [Monorepo Wo Guide](../../docs/wo/README.md) | `~/.wocoder` |
| **Codex** | [codex/README.md](./codex/README.md) | [openai.com/codex](https://openai.com/codex) | `~/.codex` |

---

## 🎛️ Comprehensive Comparison of Ecosystems

While the harness provides a shared logic layer, each agent platform operates differently under the hood. The table below outlines the core architectural similarities and differences:

| Feature Dimension | Antigravity | Gemini CLI | Claude Code | OpenCode | Pi | Wo Coder | Codex |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Target Directory** | `~/.antigravity/` | `~/.gemini/` | `~/.claude/` | `~/.config/opencode/` | `~/.pi/agent/` | `~/.wocoder/` | `~/.codex/` |
| **Workspace Target** | `.agents/` | `.agents/` | `.claude/rules/` | `.agents/` | `.agents/` | `.wo/` | `.codex/rules/` |
| **Naming Convention** | `snake_case` | `snake_case` | `snake_case` | `snake_case` | `kebab-case` | `snake_case` | `snake_case` |
| **Primary Config File**| `antigravity.json` | `config.json` | `settings.json`, `.mcp.json` | `opencode.json` | `config.json` | `wocoder.json` | `README.md` |
| **Memory / Rules File**| `ANTIGRAVITY.md` | `GEMINI.md` | `CLAUDE.md` | `AGENTS.md` | `AGENTS.md` | `AGENTS.md` | `RULES.md` |
| **Custom Commands** | Yes (TOML files) | Yes (TOML files) | Yes (Skills schema) | Yes (Markdown commands) | Yes (Prompts folder) | Yes (Markdown files) | No |
| **Command Format** | Slash commands | Slash commands | Slash commands | Slash commands | Slash / `@` context | Slash commands | N/A |
| **Modular Skills** | Yes (`skills/` fold) | Yes (`skills/` fold) | Yes (`skills/` fold) | Yes (`skills/` fold) | Yes (`skills/` fold) | Yes (`skills/` fold) | Yes (`skills/` fold) |
| **Extension Model** | Folder-based Plugins | Folder-based Plugins | Modular Rules | Direct MCP Servers | TS/JS Modules | TS/JS Modules | Rules-based |
| **Lifecycle Hooks** | Yes (`hooks.json`) | Yes (`hooks.json`) | No | No | No | No | No |
| **Background Sidecars**| Yes (`sidecar.json`)| Yes (`sidecar.json`)| No | No | No | No | No |

---

## 🤝 Key Similarities Between Platforms

Despite different configuration folder structures and syntax formats, all integrations in the harness are aligned around several core concepts:

1. **Unified Context Engine (`thoughts/` directory)**: 
   All agents leverage the exact same context engineering folder structure to pass state:
   - `thoughts/shared/tickets/` for capturing work items.
   - `thoughts/shared/plans/` for drafting implementation designs.
   - `thoughts/shared/research/` for notes, stack-traces, and code-flows.
   This ensures a unified handoff loop: **Ticket → Plan → Implementation → Validation → Commit**.

2. **Common Specialist Personas (Agents)**: 
   The harness defines six distinct subagents (e.g. `codebase_analyzer`, `codebase_locator`, `web_search_researcher`) across all seven platforms to distribute complex research and coding tasks.

3. **Aligned Capabilities (Skills)**:
   Shared logic structures like TDD (Red-Green-Refactor) and Observability-Driven Development (ODD) operate on the same functional instructions across all platforms.

---

## ⚡ Key Differences Between Platforms

1. **Antigravity & Gemini CLI (System Integrations)**:
   * **Sidecars**: Support managing background processes (like Playwright browser runners or OpenTelemetry collectors) dynamically via a `sidecar.json` schema.
   * **Hooks**: Intercept and block execution lifecycle events (like PreToolUse or PostInvocation) via `hooks.json` shell script mappings.
   * **Plugins**: Group MCP servers, hooks, skills, and rules into isolated namespace folders managed by a `plugin.json` manifest.

2. **Pi & Wo Coder (Programmable Integrations)**:
   * **TS/JS Extensions**: Run custom TypeScript/JavaScript modules within the Node runtime to programmatically register slash commands, tools, and custom multi-agent loops (e.g. the `subagent` extension).

3. **Claude Code (Anthropic Core CLI)**:
   * **Unified Skills**: Exposes slash commands as skills with model invocation disabled. Supports modular, scoped directives loaded dynamically from `.claude/rules/`.

4. **OpenCode (Open Source TUI)**:
   * **Lightweight TUI**: Model-agnostic terminal user interface focused strictly on standard MCP and LSP integration. Does not support background sidecars, lifecycle interceptors, or script extensions.

---

## 🚀 Quick Start

### Prerequisites
*   [Deno](https://deno.com/) — `curl -fsSL https://deno.land/install.sh | sh` (or `brew install deno`)
*   [GNU Stow](https://www.gnu.org/software/stow/) — `sudo apt install stow` (or `brew install stow`)

### Install via CLI (Deno installer)
Register the CLI globally:
```bash
deno install -Agf --no-lock --reload -n ai-harness \
  https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts
```

Then install the target platform configuration:
```bash
ai-harness --tool=all             # Install all seven
ai-harness --tool=claude          # Claude Code only
ai-harness --tool=opencode        # OpenCode only
ai-harness --tool=gemini          # Gemini CLI only
ai-harness --tool=pi              # Pi only
ai-harness --tool=wocoder         # Wo Coder only
ai-harness --tool=antigravity     # Antigravity only
ai-harness --tool=codex           # Codex only
```

### Update
```bash
ai-harness --update
```

> **First-time bootstrap**: If the update fails with a "Integrity check failed" error (Deno cache mismatch after a push), run once:
> ```bash
> deno run --reload -A https://raw.githubusercontent.com/zerwiz/wayofmono/main/packages/@aiengineeringharness/install.ts --update
> ```
> After that, the wrapper is patched to always reload — `ai-harness --update` works forever after.

### Repo Mode (GNU Stow symlinks)
For symlink-based installation directly from your cloned directory:
```bash
# Inside ~/wayofmono
./packages/@aiengineeringharness/setup.sh claude             # Claude Code -> ~/.claude/
./packages/@aiengineeringharness/setup.sh opencode           # OpenCode -> ~/.config/opencode/
./packages/@aiengineeringharness/setup.sh gemini             # Gemini CLI -> ~/.gemini/
./packages/@aiengineeringharness/setup.sh pi                 # Pi -> ~/.pi/agent/
./packages/@aiengineeringharness/setup.sh wocoder            # Wo Coder -> ~/.wocoder/
./packages/@aiengineeringharness/setup.sh antigravity        # Antigravity -> ~/.antigravity/
./packages/@aiengineeringharness/setup.sh codex             # Codex -> ~/.codex/
./packages/@aiengineeringharness/setup.sh all                # Symlink all seven
```
Use `--restow` to update links after checking out git changes:
```bash
./packages/@aiengineeringharness/setup.sh all --restow
```

---

## 🔄 Development & Customization

1. **Adding Personas**: Save Markdown files under `<tool>/agents/`.
2. **Adding Commands**: Save TOML configurations (Gemini/Antigravity), Markdown commands (OpenCode/Wo Coder), or templates (Pi) under `<tool>/commands/` (or `prompts/`).
3. **Adding Skills**: Create modular directories containing a `SKILL.md` file under `<tool>/skills/`.
