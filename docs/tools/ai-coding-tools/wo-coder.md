# Wo Coder (wocode) — Comprehensive Reference

WayOfMono's own AI coding CLI. Native monorepo tool, synthesized from Pi codebase.

## Quick Facts

| Attribute | Value |
|-----------|-------|
| **Binary** | `wocode` |
| **Config dir** | `~/.wocoder/` |
| **Workspace dir** | `.wo/` |
| **Package** | `@wayofmono/wo-coding-agent` (binary `wocode`) |
| **Also** | `@wayofmono/wo-agent` (binary `wouser` — general-purpose agent) |
| **Runtime** | TypeScript/Node.js |
| **Core** | `@wayofmono/wo-agent-core` |
| **Install** | `npm install -D @wayofmono/wo-coding-agent` |
| **Init** | `pnpm wocode --init` (generates local `./wocode` launcher) |
| **Config** | `~/.wocoder/wocoder.json` |
| **Workspace config** | `.wo/config.yaml` |
| **Project memory** | `AGENTS.md` |
| **Auth** | API key (monorepo JWT) |
| **License** | MIT |
| **Surfaces** | Terminal, WoW Chat UI |

## In This Monorepo

### Architecture
Three-layer architecture shared between `wocode` (coding agent) and `wouser` (user agent):

| Layer | Package | Role |
|-------|---------|------|
| **wo-agent-core** | `@wayofmono/wo-agent-core` | Abstract, environment-generic primitives |
| **wo-agent** | `@wayofmono/wo-agent` | User agent — binary `wouser` |
| **wo-coding-agent** | `@wayofmono/wo-coding-agent` | Coding agent — binary `wocode` |

### Harness Integration
The AI Engineering Harness at `packages/@aiengineeringharness/wocoder/` deploys to `~/.wocoder/`:

| Component | Location | Description |
|-----------|----------|-------------|
| **Agents** | `agents/` | 6 agents (snake_case): codebase_analyzer, codebase_locator, codebase_pattern_finder, thoughts_analyzer, thoughts_locator, web_search_researcher |
| **Commands** | `commands/` | 11 Markdown slash commands (identical to OpenCode set) |
| **Skills** | `skills/` | 25+ auto-triggered skills (SKILL.md format) |
| **Extensions** | `extensions/` | TS/JS extensions (Pi-compatible API): includes `subagent` extension for multi-agent workflows |
| **Config** | `wocoder.json` | MCP configuration (OpenCode-compatible schema) |

### Skill Locations
Skills are loaded from three sources:
1. **Global**: `~/.wocoder/skills/` (via `getAgentDir()`)
2. **Project**: `<cwd>/.wo/skills/`
3. **Explicit**: From CLI `--skills` flag, extension events, or package manifests

### Naming Convention
- **Skill naming**: snake_case
- **Agent naming**: snake_case
- **Commands**: Markdown in `commands/` directory
- **Project memory**: `AGENTS.md`
- **Config location**: `~/.wocoder/` (global), `.wo/` (workspace)
- **MCP config**: OpenCode-compatible schema (`$schema: https://opencode.ai/config.json`)

### Key Differences from Antigravity / Gemini CLI
- **No built-in Sidecars** — Wo Coder does not manage background daemons
- **No Pre/Post Hooks** — Wo Coder does not support JSON event hooks
- Extensibility via: Pi-compatible TS/JS extensions, MCP servers, Markdown commands/skills

### Pi-to-Wo Synthesis Origin
Wo Coder is a **rebrand + tweak** of the Pi codebase:
- `@earendil-works/pi-ai` → `@wayofmono/wo-ai`
- `@earendil-works/pi-agent-core` → `@wayofmono/wo-agent-core`
- `@earendil-works/pi-coding-agent` → `@wayofmono/wo-coding-agent`

## Configuration

### `wocoder.json`
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "kubernetes": {
      "type": "local",
      "command": ["npx", "-y", "kubernetes-mcp-server@latest"],
      "enabled": true
    },
    "aspire-dashboard": {
      "type": "remote",
      "url": "http://localhost:18891",
      "enabled": false
    }
  }
}
```
Disable syntax: `"enabled": false` (same as OpenCode).

### `getAgentDir()` Resolution
Priority for finding agent directory:
1. Environment variable (e.g. `WOCODE_CODING_AGENT_DIR`)
2. Walk up from CWD looking for a `.wo/` directory containing `agent/` subdirectory
3. Fallback: `~/.wocoder/agent/`

## Resource Loading Pipeline

The runtime loading pipeline (`DefaultResourceLoader.reload()`) runs in this order:

1. **Reload settings**
2. **Resolve packages** — npm, git, local package sources
3. **Build extension list** from CLI + packages
4. **Load extensions** via jiti (JIT TypeScript importing)
5. **Detect conflicts** (tools, flags)
6. **Apply overrides** (extensionsOverride, skillsOverride)
7. **Load skills** from all sources
8. **Load prompt templates**
9. **Load themes**
10. **Load AGENTS.md** from project ancestors
11. **Resolve system prompt** from `SYSTEM.md` or `--system-prompt`

### Skill Loading Algorithm
1. If directory contains `SKILL.md` → treat as skill root (no recursion)
2. Otherwise → load direct `.md` children in root as skills
3. Recurse into subdirectories to find `SKILL.md` files
4. Hidden files (`.` prefix) and `node_modules` are skipped
5. All paths honor `.gitignore`, `.ignore`, `.fdignore`

### SKILL.md Validation
| Field | Required | Rules |
|-------|----------|-------|
| `name` | No (defaults to parent dir name) | lowercase a-z/0-9/hyphens, max 64 chars |
| `description` | Yes | max 1024 chars |
| `disable-model-invocation` | No | boolean |

### Skill Source Tagging
| Source | Scope | Location |
|--------|-------|----------|
| `"user"` | `local.user` | `~/.wocoder/agent/skills/` |
| `"project"` | `local.project` | `<cwd>/.wo/skills/` |
| `"path"` | `local` | Explicit path (CLI, extension) |
| `"package"` | `package` | From npm/git/local package |

### Extension Loading
- **Sources**: `.wo/extensions/` (project), `{agentDir}/extensions/` (global), CLI flags, packages
- **Type detection**: Direct `.ts`/`.js` files → load as extension; subdirectory with `index.ts`/`index.js` → load as extension; `package.json` with `pi.extensions` → load declared entries
- **No recursion beyond one level**
- **Module loading**: jiti (same as Pi)

### Extension API (`pi` object)
Same API as Pi:
- `registerTool(name, def)` — Register LLM-callable tool
- `registerCommand(def)` — Register slash command
- `registerShortcut(def)` — Register keyboard shortcut
- `registerFlag(def)` — Register CLI flag
- `registerProvider(def)` — Register model provider
- `on(event, handler)` — Subscribe to lifecycle events (same 24-event set as Pi)

## Skills

- Format: `SKILL.md` with YAML frontmatter
- Naming: snake_case directory names
- YAML frontmatter: name, description, allowed-tools, platforms
- Platforms array (from harness convention): `[claude, opencode, gemini, pi, wocoder, antigravity, codex]`
- Tool names: kebab-case (unlike Pi's Title Case)
- Auto-triggered or manual (via `disable-model-invocation`)
- Skills injected into system prompt as XML block per Agent Skills standard

### Harness Pre-built Skills
The AI Engineering Harness provides 25 pre-built skills deployed to `~/.wocoder/skills/`:
ticket-manager, team-setup, skill-auto-update, auto-ticket-creator, docs-sync-updater, cto-dashboard, skill-adapter, help-command, observability-driven-development, git-commit-helper, pr-description-generator, experimental-pr-workflow, interview, improve-codebase-architecture, prd-to-issues, tdd, write-a-prd, plus 10 Pi expert skills (build-pi-agent, pi-cli, pi-config, build-pi-extension, pi-keybindings, pi-orchestrate, pi-prompts, build-pi-skill, pi-themes, pi-tui)

## Features

- **Skill-driven**: Loads skills from `.wo/skills/SKILL.md`
- **Agent-aware**: Routes to correct agent based on task type (WOW-016)
- **Human-in-the-loop**: Writes to `thoughts/shared/pending-review/` (WOW-010)
- **Multi-surface**: Terminal and WoW Chat UI
- **Ticket-aware**: Integrates with backlog and tickets workflow
- **Zero global pollution**: All config via `~/.wocoder/` + local `.wo/`
- **OpenCode-compatible MCP schema**
- **Pi-compatible extension API**
- **OpenTelemetry instrumentation**

## Differences from Other Tools

| Aspect | Wo Coder (wocode) | OpenCode | Pi |
|--------|-------------------|----------|-----|
| Config schema | OpenCode-compatible | Native | Native |
| Extension API | Pi-compatible (TS/JS) | MCP/LSP only | Pi-native |
| Skill naming | snake_case | snake_case | kebab-case |
| Tool names in skills | kebab-case | lowercase | Title Case |
| MCP | Native | Native | Via extension only |
| Subagents | Pi subagent extension | Built-in @agent | Pi subagent extension |
