# Resource Loading: Skills & Extensions

This document describes how **wo user** (`wouser`) and **wo coding agent** (`wocode`) discover, load, and wire in skills and extensions. Both agents share an identical architecture — only the `APP_NAME` differs (`wouser` vs `wocode`).

---

## Overview

Both agents use a three-layer architecture:

| Layer | Package | Role |
|-------|---------|------|
| **wo-agent-core** | `@wayofmono/wo-agent-core` | Abstract, environment-generic primitives |
| **wo-agent** | `@wayofmono/wo-agent` | User agent — binary `wouser` |
| **wo-coding-agent** | `@wayofmono/wo-coding-agent` | Coding agent — binary `wocode` |

The runtime loading pipeline is orchestrated by `DefaultResourceLoader.reload()` in `resource-loader.ts`, which runs at startup and on every `/reload`.

---

## Skill Loading

### Discovery Sources

Skills are loaded from three sources:

1. **Global (user)**: `~/.wo/agent/skills/` — resolved via `getAgentDir()`
2. **Project-local**: `<cwd>/.wo/skills/`
3. **Explicit paths**: From CLI `--skills` flag, extension `resources_discover` events, package manifests, or `settings.json` entries

### The `getAgentDir()` Resolution

Defined in `config.ts` at line 449. Priority:

1. Environment variable (e.g. `WOUSER_CODING_AGENT_DIR` or `WOCODE_CODING_AGENT_DIR`)
2. Walk up from CWD looking for a `.wo/` directory containing an `agent/` subdirectory
3. Fallback: `~/.wo/agent/`

The global skills directory is then `getAgentDir() + "/skills"`.

### Load Entry Point: `loadSkills()`

**File:** `core/skills.ts:405-504`

```typescript
export function loadSkills(options: LoadSkillsOptions): LoadSkillsResult {
  const { cwd, agentDir, skillPaths, includeDefaults } = options;
```

When `includeDefaults` is true:
- Loads from `{agentDir}/skills` tagged as `"user"` scope
- Loads from `{cwd}/.wo/skills` tagged as `"project"` scope

When called from the runtime `DefaultResourceLoader.reload()`, `includeDefaults` is `false` because the resource loader handles defaults through the package manager resolution system.

### Recursive Discovery: `loadSkillsFromDirInternal()`

**File:** `core/skills.ts:178-280`

**Discovery rules:**
1. If a directory contains a `SKILL.md` file → treat it as a skill root (do not recurse further)
2. Otherwise → load direct `.md` children in the root as skills
3. Recurse into subdirectories to find `SKILL.md` files

Hidden files (`.` prefix) and `node_modules` directories are skipped. All paths honor `.gitignore`, `.ignore`, and `.fdignore`.

### SKILL.md Parsing: `loadSkillFromFile()`

**File:** `core/skills.ts:282-330`

Reads the file and parses YAML frontmatter. Validated fields:

| Field | Required | Rules |
|-------|----------|-------|
| `name` | No (defaults to parent dir name) | lowercase a-z/0-9/hyphens, max 64 chars |
| `description` | Yes | max 1024 chars |
| `disable-model-invocation` | No | boolean |

### Skill Source Tagging

Skills are tagged with a `source` scope:

| Source | Scope | Location |
|--------|-------|----------|
| `"user"` | `local.user` | `~/.wo/agent/skills/` |
| `"project"` | `local.project` | `<cwd>/.wo/skills/` |
| `"path"` | `local` | Explicit path (CLI, extension) |
| `"package"` | `package` | From an npm/git/local package |

### Injection Into System Prompt

**File:** `core/agent-session.ts:938-951`

The agent session retrieves loaded skills and passes them to `buildSystemPrompt()`:

```typescript
const loadedSkills = this._resourceLoader.getSkills().skills;
this._baseSystemPromptOptions = { skills: loadedSkills, ... };
```

**File:** `core/system-prompt.ts:162-165`

Skills are formatted into an XML block per the [Agent Skills](https://agentskills.io/integrate-skills) standard:

```xml
<available_skills>
  <skill>
    <name>skill-name</name>
    <description>...</description>
    <location>/path/to/SKILL.md</location>
  </skill>
</available_skills>
```

Skills with `disableModelInvocation: true` are excluded from the prompt.

### Harness-Level Skill Loading (Generic)

**File:** `packages/@wayofmono/wo-agent-core/src/harness/skills.ts:40-54`

A separate, environment-agnostic variant exists for the `AgentHarness` class, using the `ExecutionEnv` abstraction for filesystem operations. It uses the same recursive `SKILL.md` discovery algorithm.

### Pre-built Skill Definitions

The AI Engineering Harness provides 25 pre-built skills in two variants:

| Tool | Location |
|------|----------|
| Wo Coder | `packages/@aiengineeringharness/wocoder/skills/*/SKILL.md` |
| OpenCode | `packages/@aiengineeringharness/opencode/skills/*/SKILL.md` |

These are definition files meant to be deployed to `~/.wocoder/skills/` or `~/.opencode/skills/`.

---

## Extension Loading

### Discovery Sources

Extensions are loaded from four sources (deduplicated by resolved path):

1. **Project-local**: `<cwd>/.wo/extensions/`
2. **Global (user)**: `{agentDir}/extensions/` (typically `~/.wo/agent/extensions/`)
3. **CLI flags**: `--extensions <paths>`
4. **Packages**: From `package.json` `pi.extensions` manifest entries or conventional directories

### Extension Type System

**File:** `core/extensions/types.ts`

Core types:

| Type | Purpose |
|------|---------|
| `ExtensionFactory` | `(pi: ExtensionAPI) => void \| Promise<void>` — the module default export |
| `Extension` | Loaded extension: stores handlers, tools, commands, flags, shortcuts, messageRenderers |
| `ExtensionRuntime` | Runtime state + actions (created by loader, completed by runner) |
| `ExtensionAPI` | The `pi` object: `on()`, `registerTool()`, `registerCommand()`, etc. |

### Extension Discovery Algorithm: `discoverExtensionsInDir()`

**File:** `core/extensions/loader.ts:538-570`

For a given directory:
1. Direct `.ts` or `.js` files → load each as an extension
2. Subdirectory with `index.ts` or `index.js` → load as an extension
3. Subdirectory with `package.json` containing `"pi": { "extensions": [...] }` → load declared entries
4. No recursion beyond one level

### Extension Manifest (`package.json` `pi` field)

**File:** `core/extensions/loader.ts:463-468`

```typescript
interface PiManifest {
  extensions?: string[];
  themes?: string[];
  skills?: string[];
  prompts?: string[];
}
```

### Module Loading: `loadExtensionModule()`

**File:** `core/extensions/loader.ts:356-368`

Uses **jiti** (JIT TypeScript importing) to load extension modules:

```typescript
const jiti = createJiti(import.meta.url, { moduleCache: false, ... });
const module = await jiti.import(extensionPath, { default: true });
```

Two resolution strategies:

| Mode | Strategy |
|------|----------|
| **Bun binary** | Virtual modules — bundled deps served from memory |
| **Node.js/dev** | Alias map — resolves to filesystem paths |

### Extension Loading: `loadExtension()`

**File:** `core/extensions/loader.ts:393-416`

Per-extension loading:
1. Resolve path (tilde, absolute, or relative)
2. Load module via jiti → get factory function
3. Create empty `Extension` object
4. Create `ExtensionAPI` (`pi`) object that writes registrations to the `Extension`
5. Call `factory(pi)` — extension registers handlers, tools, commands, flags

### The `ExtensionAPI` (`pi`) Object

**File:** `core/extensions/loader.ts:202-354`

The `pi` object exposes:

| Method | Purpose |
|--------|---------|
| `on(event, handler)` | Register event handler |
| `registerTool(name, def)` | Register LLM-callable tool |
| `registerCommand(def)` | Register slash command |
| `registerShortcut(def)` | Register keyboard shortcut |
| `registerFlag(def)` | Register CLI flag |
| `registerMessageRenderer(def)` | Register message renderer |
| `registerProvider(def)` | Register model provider (queued during load) |
| `unregisterProvider(name)` | Unregister model provider |
| `sendMessage(text)` | Send assistant message |
| `sendUserMessage(text)` | Send user message |
| `getFlag(name)` | Get flag value |

### Extension Runner: `ExtensionRunner`

**File:** `core/extensions/runner.ts`

The `ExtensionRunner` manages the extension lifecycle:

#### `bindCore()` (line 266)
- Replaces throwing stubs in the runtime with real action implementations
- **Flushes queued provider registrations** — processes pending `registerProvider` calls from loading phase

#### Event Emission (24 events)

Extensions can hook into lifecycle events via `pi.on()`:

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

#### `emitResourcesDiscover()` (line 990)
Extensions can provide additional `skillPaths`, `promptPaths`, and `themePaths` via the `resources_discover` event:

```typescript
export interface ResourcesDiscoverResult {
  skillPaths?: string[];
  promptPaths?: string[];
  themePaths?: string[];
}
```

### Conflict Detection

**File:** `core/extensions/runner.ts:374-384` (tools)
**File:** `core/resource-loader.ts:881-917` (general conflicts)

- **Tools**: First registration per name wins
- **Flags**: Conflicts reported as diagnostics

### Tool Wrapper

**File:** `core/extensions/wrapper.ts`

```typescript
export function wrapRegisteredTool(registeredTool, runner): AgentTool {
  return wrapToolDefinition(registeredTool.definition, () => runner.createContext());
}
```

Wraps extension-registered tools to receive the runner's `ExtensionContext` during execution.

---

## Package Manager Integration

**File:** `core/package-manager.ts`

The `DefaultPackageManager` resolves package sources (npm, git, local) and discovers their resources:

### `resolve()` (line 851)
1. Deduplicate packages (project scope wins over user)
2. Resolve package sources — install missing npm/git packages, collect manifests
3. Resolve local entries from settings: `extensions[]`, `skills[]`, `prompts[]`, `themes[]`
4. Auto-discover from `~/.wo/agent/` and `<cwd>/.wo/` directories + `.agents/skills/`

### Package Source Types

| Source | Syntax | User Install | Project Install |
|--------|--------|-------------|-----------------|
| npm | `npm:<package>` | global node_modules | `<cwd>/.wo/npm/node_modules/<pkg>` |
| git | Git URL | `~/.wo/agent/git/<host>/<path>` | `<cwd>/.wo/git/<host>/<path>` |
| local | Path | `~/.wo/agent/` relative | `<cwd>/.wo/` relative |

### Resource Collection from Packages (`collectPackageResources()`, line 1922)

1. If a filter is provided (from structured filter in settings): apply per resource type
2. If `package.json` has a `pi` manifest: read `pi.extensions`, `pi.skills`, `pi.prompts`, `pi.themes`
3. Otherwise: check conventional directories (`extensions/`, `skills/`, `prompts/`, `themes/`)

---

## Runtime Pipeline: `DefaultResourceLoader.reload()`

**File:** `core/resource-loader.ts:322-476`

The main reload pipeline runs in this order:

1. **Reload settings** (line 323)
2. **Resolve packages** via `packageManager.resolve()` (line 324)
3. **Resolve CLI extensions** via `packageManager.resolveExtensionSources()` (lines 325-327)
4. **Build extension list** from CLI + package extensions (noExtensions flag; lines 395-397)
5. **Load extensions** via `loadExtensions()` (line 399)
6. **Load inline extensions** from factories (line 400)
7. **Detect conflicts** (tools, flags; lines 406-409)
8. **Apply overrides** (extensionsOverride, skillsOverride; line 416)
9. **Load skills** from paths (lines 419-429)
10. **Load prompt templates** (lines 431-441)
11. **Load themes** (lines 443-453)
12. **Load AGENTS.md/CLAUDE.md** from project ancestors (lines 455-459)
13. **Resolve system prompt** from `SYSTEM.md` or `--system-prompt` (lines 461-465)
14. **Resolve append system prompt** from `APPEND_SYSTEM.md` or CLI (lines 467-475)

---

## Complete Call Chain

```
main.ts
  │
  ├─ parseArgs() → --extensions, --skills, --no-extensions, etc.
  │
  └─ createAgentSessionServices()
       │
       ├─ new DefaultResourceLoader({ cwd, agentDir, settings, additionalExtensionPaths, ... })
       │
       └─ resourceLoader.reload()
            │
            ├─ settingsManager.reload()
            │
            ├─ packageManager.resolve()
            │    ├─ Settings: global & project packages[]
            │    ├─ Settings: extensions[] / skills[] / prompts[] / themes[] entries
            │    ├─ Auto-discover: ~/.wo/agent/*/ and <cwd>/.wo/*/
            │    └─ Returns ResolvedPaths { extensions, skills, prompts, themes }
            │
            ├─ packageManager.resolveExtensionSources(additionalExtensionPaths)
            │    └─ CLI --extensions paths
            │
            ├─ Merge paths (CLI + package + auto-discover)
            │
            ├─ loadExtensions(allPaths, cwd, eventBus)
            │    └─ For each path:
            │         ├─ loadExtensionModule() via jiti
            │         ├─ createExtension() → empty Extension object
            │         ├─ createExtensionAPI() → pi object
            │         └─ factory(pi) → registers handlers/tools/commands/flags
            │
            ├─ loadExtensionFactories() → inline ExtensionFactory[]
            │
            ├─ detectExtensionConflicts() → tool/flag name collisions
            │
            ├─ loadSkills(skillPaths, ...) → loadSkills()
            │    ├─ loadSkillsFromDirInternal() → recursive SKILL.md discovery
            │    └─ loadSkillFromFile() → parse YAML frontmatter
            │
            ├─ loadPromptTemplates()
            ├─ loadThemes()
            ├─ loadProjectContextFiles() → AGENTS.md / CLAUDE.md
            ├─ resolveSystemPrompt()
            └─ resolveAppendSystemPrompt()
       │
       ├─ Flush pendingProviderRegistrations → modelRegistry.registerProvider()
       └─ Apply extension flag values
```

After services are created, `createAgentSession()` constructs an `AgentSession` with the `ResourceLoader` and creates an `Agent` that wires the `ExtensionRunner` into lifecycle hooks (`onPayload`, `onResponse`, `transformContext`).

---

## Key File Map

### wo-agent (wouser) — identical paths apply to wo-coding-agent (wocode)

| File | Role |
|------|------|
| `src/config.ts:421-470` | `APP_NAME`, `CONFIG_DIR_NAME`, `getAgentDir()` |
| `src/core/skills.ts:178-280` | Recursive SKILL.md discovery algorithm |
| `src/core/skills.ts:282-330` | SKILL.md parsing and validation |
| `src/core/skills.ts:340-366` | Skill formatting for system prompt |
| `src/core/skills.ts:405-504` | `loadSkills()` — main orchestrator |
| `src/core/extensions/types.ts` | All extension types, ExtensionAPI |
| `src/core/extensions/loader.ts:356-368` | `loadExtensionModule()` — jiti module loading |
| `src/core/extensions/loader.ts:393-416` | `loadExtension()` — per-extension loading |
| `src/core/extensions/loader.ts:437-461` | `loadExtensions()` — multi-extension orchestration |
| `src/core/extensions/loader.ts:538-570` | `discoverExtensionsInDir()` — directory discovery |
| `src/core/extensions/loader.ts:575-621` | `discoverAndLoadExtensions()` — full discovery |
| `src/core/extensions/runner.ts` | `ExtensionRunner` — lifecycle, event emission, tool management |
| `src/core/extensions/wrapper.ts` | Tool wrapper for extension-registered tools |
| `src/core/package-manager.ts:851-903` | `resolve()` — package resolution pipeline |
| `src/core/package-manager.ts:1922-1969` | `collectPackageResources()` — resource collection from packages |
| `src/core/resource-loader.ts:322-476` | `DefaultResourceLoader.reload()` — main pipeline |
| `src/core/system-prompt.ts:162-165` | Skill injection into system prompt |
| `src/core/agent-session.ts:938-951` | Skill retrieval from resource loader |

### wo-agent-core (generic)

| File | Role |
|------|------|
| `src/harness/skills.ts:40-54` | Environment-agnostic skill loading for AgentHarness |
| `src/harness/agent-harness.ts:477-489` | `skill()` method for explicit skill invocation |
