# Pi — Comprehensive Reference

Data verified against official docs (June 2026). 61K GitHub stars, 220 contributors, 228 releases.

## Quick Facts

| Attribute | Value |
|-----------|-------|
| **Binary** | `pi` |
| **Runtime** | TypeScript/Node.js |
| **Install** | `npm i -g @earendil-works/pi-coding-agent` |
| **GitHub** | https://github.com/earendil-works/pi |
| **Docs** | https://pi.dev/ |
| **Extension API** | https://badlogic-pi-mono.mintlify.app/api/coding-agent/extension-api |
| **Config** | `~/.pi/agent/config.json` |
| **Project config** | `.agents/config.json` |
| **Auth** | API key or `/login` (OAuth) |
| **Stars** | 61,443 |
| **License** | MIT |

## In This Monorepo

### Harness Integration
The AI Engineering Harness at `packages/@aiengineeringharness/pi/` deploys to `~/.pi/agent/`:

| Component | Location | Description |
|-----------|----------|-------------|
| **Agents** | `agents/` | 6 agents (kebab-case): codebase-analyzer, codebase-locator, codebase-pattern-finder, thoughts-analyzer, thoughts-locator, web-search-researcher |
| **Prompts** | `prompts/` | 11 Markdown prompt templates (Pi's command system) |
| **Skills** | `skills/` | 31+ auto-triggered skills (SKILL.md format) |
| **Extensions** | `extensions/` | TS/JS modules: subagent extension for multi-agent workflows |

### Local Pi Config (this repo)
The repository itself has a `.pi/` directory with:
- **`.pi/config.json`** — Local Pi configuration
- **`.pi/skills/`** — 73 local skill directories (auto-ticket-creator through write-a-prd)
- **`.pi/templates/`** — Templates for skills, extensions, agents, themes, prompts

### Naming Convention
- **Skill naming**: kebab-case (unique — all other tools use snake_case)
- **Agent naming**: kebab-case
- **Tool names in `allowed-tools`**: Title Case (`Read`, `Write`, `Bash`, `Grep`, `Glob`)
- **Commands** implemented as prompt templates in `prompts/` directory
- **Config location**: `~/.pi/agent/`

### Key Differences from Antigravity / Gemini CLI
- **No built-in Sidecars** — Pi does not manage background sidecars
- **No Pre/Post Hooks** — Pi does not support JSON-configured hooks
- **No Plugin manifests** — Pi uses JS/TS extension lifecycle API instead
- **No native MCP** — MCP can be built via TypeScript extensions

### Pi-to-Wo Synthesis
Pi is the **origin codebase** for WayOfMono's own Wo Coder. The porting plan at `docs/PORTING-INVENTORY.md`:

| Original (Pi) | Target (Wo) | Status |
|---------------|-------------|--------|
| `@earendil-works/pi-ai` | `@wayofmono/wo-ai` | 🟡 In-Progress |
| `@earendil-works/pi-agent-core` | `@wayofmono/wo-agent-core` | 🟡 In-Progress |
| `@earendil-works/pi-coding-agent` | `@wayofmono/wo-coding-agent` (binary `wocode`) | 🟡 In-Progress |
| `@earendil-works/pi-tui` | `@wayofmono/wo-tui` | 🟡 In-Progress |
| `@earendil-works/pi-web-ui` | `@wayofmono/wo-web-ui` | 🟡 In-Progress |

Key packages in this repo that depend on Pi:
- `@wayofmono/wo-mermaid` (originally `pi-mermaid`)
- `@wayofmono/web-access` (originally `pi-web-access`)

## Built-in Tools

| Tool | Name | Description |
|------|------|-------------|
| `read` | `Read` | Read file contents |
| `write` | `Write` | Create or overwrite files |
| `edit` | `Edit` | Replace exact text matches in files |
| `bash` | `Bash` | Execute shell commands |
| `grep` | `Grep` | Search file contents with regex |
| `find` | `Find` | Find files by name (glob) |
| `ls` | `Ls` | List directory contents |

Additional tools can be registered via TypeScript extensions using `pi.registerTool()`.

## 4 Modes

Pi runs in four distinct modes:

| Mode | Command | Use Case |
|------|---------|----------|
| **Interactive** | `pi` (default) | Full TUI experience |
| **Print/JSON** | `pi -p "query"` or `pi --mode json "query"` | Scripting, one-shot queries |
| **RPC** | `pi --mode rpc` | Stdin/stdout JSONL process integration |
| **SDK** | `@earendil-works/pi-coding-agent` | Embedding in Node.js apps |

## Configuration

- **Settings file**: `~/.pi/agent/config.json` (global), `.agents/config.json` (project)
- **Format**: JSON
- **Key sections**: model, theme, keys (keybindings), extensions, providers, packages
- **Reload**: `/reload` command hot-reloads extensions, skills, prompts, themes

## Extension System

Extensions are TypeScript modules that extend Pi's behavior. Auto-discovered from:
- `~/.pi/agent/extensions/` (global)
- `.agents/extensions/` (project-local) — note: not `.pi/extensions/`

### Extension API Capabilities
| Method | Purpose |
|--------|---------|
| `registerTool(name, def)` | Register custom LLM-callable tool |
| `registerCommand(def)` | Register slash command |
| `registerShortcut(def)` | Register keyboard shortcut |
| `registerFlag(def)` | Register CLI flag |
| `registerMessageRenderer(def)` | Register message renderer |
| `registerProvider(def)` | Register custom model provider |
| `unregisterProvider(name)` | Unregister model provider |
| `on(event, handler)` | Subscribe to lifecycle events |
| `setActiveTools()` | Control which tools are active |
| `sendMessage(text)` | Send assistant message |
| `sendUserMessage(text)` | Send user message |

### Lifecycle Events
| Category | Events |
|----------|--------|
| **Resources** | `resources_discover` |
| **Session** | `session_start`, `session_before_switch`, `session_before_fork`, `session_before_compact`, `session_compact`, `session_shutdown`, `session_before_tree`, `session_tree` |
| **Agent** | `context`, `before_provider_request`, `after_provider_response`, `before_agent_start`, `agent_start`, `agent_end` |
| **Turn** | `turn_start`, `turn_end` |
| **Message** | `message_start`, `message_update`, `message_end` |
| **Tool** | `tool_call`, `tool_result`, `tool_execution_start`, `tool_execution_update`, `tool_execution_end` |
| **Model** | `model_select`, `thinking_level_select` |
| **Input** | `input` |
| **User Bash** | `user_bash` |

### Extension Example
```typescript
import { ExtensionContext } from "@earendil-works/pi-agent-core";

export function activate(context: ExtensionContext) {
  context.registerCommand("my-command", async (session, args) => {
    session.writeLine(`Command triggered with: ${args.join(", ")}`);
  });
  context.registerTool({
    name: "read_env_var",
    description: "Retrieve value of an environment variable.",
    parameters: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"]
    },
    execute: async ({ name }) => process.env[name] || "undefined"
  });
}
```

### Technical Details
- **Module loading**: Uses **jiti** (JIT TypeScript importing, no compilation needed)
- **Resolution strategies**: Bun binary (virtual modules) vs Node.js/dev (alias map)
- **Conflict detection**: First tool registration per name wins; flag conflicts reported as diagnostics
- **Custom TUI components**: Full Ink/React components supported
- **Packages**: `@earendil-works/pi-agent-core` (types), `@earendil-works/pi-ai` (utilities), `typebox` (schemas)
- **Pi Packages**: Bundle extensions/skills/prompts/themes via npm/git

## Subagent System (Via Extension)

**Not built-in.** Pi provides subagent capabilities via the `subagent` extension:
- Chain, parallel, or single subagent orchestration patterns
- SDK provides `createAgentSession()` for programmatic subagent spawning
- The harness `subagent` extension provides agents (`planner`, `reviewer`, `scout`, `worker`) and workflow prompts

## Skills System

### Storage Locations
1. **Global**: `~/.pi/agent/skills/<skill-folder>/`
2. **Workspace**: `<workspace-root>/.agents/skills/<skill-folder>/`

### SKILL.md Schema
```yaml
---
name: tdd
description: Test-driven development with red-green-refactor loop.
allowed-tools: read_file, write_file, run_command
---
```

### Supported Frontmatter Fields
- **`name`**: Kebab-case identifier matching folder name
- **`description`**: Summary explaining when agent should activate
- **`allowed-tools`**: (Optional) Tool list (Title Case names)

## Agent / Domain Expert System

- **Format**: Markdown files with YAML frontmatter
- **Naming**: kebab-case (e.g., `codebase-analyzer.md`)
- **Storage**: `~/.pi/agent/agents/` (global) or `.agents/agents/` (workspace)
- **Invocation**: `/agent <agent-name>` slash command
- **Context scope**: Clean context slice, parent context not polluted

### Agent File Example (`db-administrator.md`)
```markdown
---
name: db-administrator
description: Specialized database expert for designing schemas and migrations.
---
You are a Pi domain expert specialized in database administration...
```

## Prompt Templates (Commands)

- Location: `prompts/` directory
- Format: Single `.md` file per template
- Invocation: `/templatename`
- Arguments: `$1`, `$@`, `${@:N}` syntax

## Slash Commands

| Command | Description |
|---------|-------------|
| `/login`, `/logout` | Manage OAuth or API-key credentials |
| `/model` | Switch models |
| `/scoped-models` | Enable/disable models for Ctrl+P cycling |
| `/settings` | Thinking level, theme, message delivery, transport |
| `/resume` | Pick from previous sessions |
| `/new` | Start a new session |
| `/name <name>` | Set session display name |
| `/session` | Show session info (file, ID, messages, tokens, cost) |
| `/tree` | Jump to any point in the session and continue from there |
| `/fork` | Create a new session from a previous user message |
| `/clone` | Duplicate the current active branch into a new session |
| `/compact [prompt]` | Manually compact context, optional custom instructions |
| `/copy` | Copy last assistant message to clipboard |
| `/export [file]` | Export session to HTML file |
| `/share` | Upload as private GitHub gist with shareable HTML link |
| `/reload` | Reload keybindings, extensions, skills, prompts, and context files |
| `/hotkeys` | Show all keyboard shortcuts |
| `/changelog` | Display version history |
| `/quit` | Quit pi |

## MCP Support

**No native MCP support.** MCP can be built via TypeScript extensions. Pi does not ship with built-in MCP client.

Community containerization patterns:
- **OpenShell**: Run whole `pi` process in policy-controlled sandbox
- **Gondolin extension**: Keep Pi + auth on host, route tools into Linux micro-VM
- **Plain Docker**: Run Pi in container for isolation

## Providers

15+ providers: Anthropic, OpenAI, Google, Azure, Bedrock, Mistral, Groq, Cerebras, xAI, Hugging Face, Kimi For Coding, MiniMax, OpenRouter, Ollama, and more.
Custom providers via extensions (`registerProvider()`) or `models.json`.

## Unique Capabilities

| Capability | Supported |
|------------|-----------|
| RPC mode | ✅ `--mode rpc` |
| SDK embedding | ✅ `@earendil-works/pi-coding-agent` |
| Pi Packages | ✅ Bundle extensions/skills/prompts/themes via npm/git |
| JSON event stream | ✅ `--mode json` |
| Session branching | ✅ `/tree`, `/fork`, `/clone` |
| HTML export | ✅ `/export` |
| Context compaction | ✅ Auto + manual |
| Custom providers | ✅ `registerProvider()` (any API) |
| TUI components | ✅ Full Ink/React components |
| Vim keybindings | ✅ Built-in vim mode |
| Prompt caching | ✅ `PI_CACHE_RETENTION=long` |

## Research URLs for Agents

| Source | URL |
|--------|-----|
| Official website | https://pi.dev/ |
| GitHub source | https://github.com/earendil-works/pi |
| Usage docs | https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/usage.md |
| Extensions docs | https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md |
| SDK docs | https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sdk.md |
| Extension API | https://badlogic-pi-mono.mintlify.app/api/coding-agent/extension-api |
| Extension guide | https://badlogic-pi-mono.mintlify.app/guides/building-extensions |
