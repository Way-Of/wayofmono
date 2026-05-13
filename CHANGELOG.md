# Changelog

## [Unreleased]

### Added

#### `@wayofmono/wo-agent` — Embeddable Agent SDK (NEW)
- `createAgent()` factory with `prompt()`, `task()`, `runLoop()`, `registerTool()`, lifecycle events
- ReAct tool loop (`runReActLoop`): send → stream → accumulate tool calls → execute → loop (max 18 steps, nudge logic)
- Pi-compatible JSONL session store (`createSessionStore` with `loadMessages`, `syncMessages`, `appendMessage`, `appendToolCalls`)
- Agent discovery scanner (`discoverAgents`, `parseAgentMarkdown`) — scans `.md` with YAML frontmatter across `agents/`, `.claude/agents/`, `.wo/agents/`, `.cursor/agents/`
- Multi-block system prompt composer (`composeSystemPrompt`, `applySystemPrompt`) — env → agent body → mode notes → planner → index blocks
- Workspace jail (`createWorkspace`) — jailed path resolution with escape prevention, max file size limits
- Built-in skills: documentation, file-operations, search, summarization
- Source-only package (no build step), designed for embedding

#### `@wayofmono/wo-agent-core` — Infrastructure Additions
- Context compaction module (`src/compaction/`): cut-point algorithm, LLM summarization (`generateSummary`), token estimation, overflow recovery, branch summarization, file operation tracking — adapted from pi
- JSONL storage (`src/storage/jsonl-storage.ts`): append, readAll, writeAll, exists with max file size guards
- Session tree management (`src/session/`): `SessionStore` interface with `create`, `getMetadata`, `appendEntry`, `getEntries`, `getBranch`, `estimateTokens` — JSONL-backed
- Config store (`src/config.ts`): `createConfigStore` with `load`, `get`, `set`, `update`, `clear` backed by JSON file
- Event cancellation: `emit()` stops propagation when handlers return `{ cancelled: true }`; new `emitCancellable()` returns `{ cancelled, results }`
- Concurrent tool execution: `ToolEngine.executeConcurrent()` using `Promise.allSettled` with `ConcurrentExecuteOptions` (AbortSignal + ExtensionContext)

#### `@wayofmono/wo-coding-agent` — Real AgentSession + Tool Execution
- **Real AgentSession** (`src/core/agent-session.ts`): wired with `runReActLoop` from wo-agent for LLM calls with full tool execution, session persistence via `wo-agent-core` SessionStore, auto-compaction via compaction module, event streaming, abort signal propagation, manual `compact()` method
- **7 real tool implementations** copied from pi: bash, read, write, edit, edit-diff, grep, find, ls — each with TypeBox schemas, pluggable operations, output truncation, AbortSignal support
- Supporting infrastructure: truncation, path-utils (workspace-bound), file-mutation-queue, output-accumulator
- **14 utility modules** from pi: sleep, paths, ansi, html, mime, fs-watch, child-process, frontmatter, changelog, shell, git, syntax-highlight, tools-manager, user-agent
- Project-local config (`src/config.ts`): `findProjectRoot`, `getWoDir`, `getSessionsDir`, `getBinDir`, `getConfigPath`, `isInsideProject`

#### Monorepo Infrastructure
- Root `package.json` with workspace scripts (`build`, `test`, `typecheck`)
- `pnpm-workspace.yaml` for pnpm workspace resolution
- `scripts/` directory with `sync-versions.js` (lockstep version sync) and `stats.ts` (package statistics)
- `tsconfig.base.json` at monorepo root with ES2024, NodeNext, strict mode
- Fixed `@opentelemetry/*` dependency versions in telemetry package (0.55→0.26 for grpc exporter)
- `@wayofmono/wo-agent` added as dependency of `wo-coding-agent`

#### Pi-to-Wo Bulk Import (382 files adapted)
- All 50 files from pi/ai/src/ → wo-ai, pi-ai import paths → wo-ai
- All 25 files from pi/tui/src/ → wo-tui, pi-tui import paths → wo-tui
- All 25 files from pi/agent/src/ → wo-agent-core, pi-agent-core → wo-agent-core
- All 141 files from pi/coding-agent/src/ → wo-agent (SDK, stripped CLI entry)
- All 141 files from pi/coding-agent/src/ → wo-coding-agent (CLI binary, keeps all)
- Package.json files created for all 5 packages with renamed deps
- tsconfig.json files created for all 5 packages
- Config dir `.pi` → `.wo`, APP_NAME `"pi"` → `"wo"`, env vars `PI_*` → `WO_*`
- Log paths `pi-debug.log`/`pi-crash.log` → `wo-debug.log`/`wo-crash.log`
- Missing deps added: `@smithy/types`, `@smithy/node-http-handler` (wo-ai), `@types/node` (wo-tui)
- tsconfig.base.json: ES2022 → ES2024 (for `/v` regex), added `types: ["node"]`
- All 5 packages pass `tsc --noEmit` with zero errors
- tsconfigs created for telemetry and lens (pre-existing non-pi packages)
- copy-assets scripts: theme `*.json`, `assets/*.png`, `export-html/template.*` + vendor JS copied to `dist/` post-tsc
- `./bedrock-provider` subpath export added to wo-ai
- `cli.ts` and `bun/` directory removed from wo-agent (SDK has no CLI entry)
- `@types/node` added to wo-tui and telemetry devDeps
- Missing deps: `@smithy/types`, `@smithy/node-http-handler` (wo-ai); `@silvia-odwyer/photon-node`, `shx` (wo-agent + wo-coding-agent)

### Fixed
- Build errors across all packages: duplicate `JsonlStorage`/`SessionEntry` exports in `wo-agent-core`, `Api` type mismatches in compaction, `StopReason` type in gemini provider, `AbortSignal` type in retry, `SelectItem` generic in `ExtensionUIContext`
- Added `types: ["node"]` to `wo-coding-agent` tsconfigs for `node:*` module resolution
- Added `getShellEnv()` to `wo-coding-agent/src/utils/shell.ts` (was missing from pi copy)
- Added module declarations for `hosted-git-info` and `highlight.js/lib/index.js`
- Added `KeyEvent` type re-export to `wo-agent-core` types (needed by `DynamicBorder`)
- Repository URLs fixed from `earendil-works` → `zerwiz` across all package.json files
- Telemetry type errors: `BasicTracerProvider` cast to `InstanceType`, `setAttribute` type widened
- Lens fixed: created 9 missing source modules (`ast-grep-parser`, `ast-grep-rule-manager`, `ast-grep-types`, `sg-runner`, `package-root`, `file-utils`, `tree-sitter-cache`, `tree-sitter-navigator`, `tree-sitter-query-loader`) + index.ts + 4 type error fixes
- Lens now builds successfully
- Wo-web-ui restored: package.json, tsconfig, 6 React components (ChatContainer, MessageBubble, ChatInput, SessionList, ToolCallCard), types, theme
- Tests: no test files exist in any pi-copied package (pi source didn't include them in `src/`)

### Tickets
- PROJ-007: `@wayofmono/wo-coding-agent` — Phase 2 (Real AgentSession) ✅, Phase 3 (Real Tools) ✅, Phase 5 (Session Persistence) ✅, Phase 6 (Compaction) ✅
- PROJ-008: Pi-to-wo copy plan — Section 1 (utilities) ✅, Section 2 (tools) ✅, Section 3 (compaction) ✅, Section 4a (AgentSession) ✅
- PROJ-009: `@wayofmono/wo-agent` — Agent Class ✅, Skills ✅, Embeddable API ✅, ReAct Loop ✅, Session Persistence ✅, Agent Discovery ✅, System Prompt ✅, Workspace Jail ✅

## [1.0.0] - 2024-05-13

### Added

#### `@wayofmono/wo-ai` — Unified Multi-Provider LLM API
- Core `complete()`, `completeSimple()`, `completeWithConfig()` functions for multi-provider LLM calls
- Provider implementations: OpenAI-compatible, Anthropic Claude, Google Gemini
- Streaming support for OpenAI and Anthropic providers
- Tool calling/functions support across all providers
- Type exports: `Message`, `UserMessage`, `AssistantMessage`, `SystemMessage`, `ToolMessage`, `StopReason`, `Usage`, `Model`, `Api`, `ThinkingLevel`, `ModelConfig`, `ToolDefinition`, `CompletionParams`, `CompletionResult`, `StreamChunk`
- `StringEnum()` helper for TypeBox string union schemas
- `registerModel()`, `getModel()`, `getModels()`, `getModelsByApi()`, `getSupportedThinkingLevels()`, `resolveModelConfig()` — model registry
- `calculateCost()` — token-based cost calculation from model pricing
- OAuth subpath export (`/oauth`) with `getOAuthProvider()`, `registerOAuthProvider()`, `createOAuthProvider()`
- Built-in default model registry (GPT-4o, GPT-4o-mini, o3-mini, Claude Sonnet 4, Haiku 3.5, Opus 4, Gemini 2.5 Flash/Pro)
- Self-contained ESM package with `exports`, `types`, `files`, `publishConfig` fields

#### `@wayofmono/wo-tui` — Terminal UI Library
- Render components: `Text`, `Box`, `Container`, `Spacer`, `SelectList`, `Markdown`, `Image`
- Text utilities: `truncateToWidth()`, `visibleWidth()`, `wrapTextWithAnsi()`, `stripAnsi()`
- Theme system: `createDefaultTheme()`, `getMarkdownTheme()` with ANSI color/bold/dim/italic/link formatting
- Keyboard handling: `Key` constants, `matchesKey()`, `getKeybindings()`
- Kitty protocol image support: `allocateImageId()`, `deleteKittyImage()`, `getCapabilities()`
- Type exports: `Component`, `KeyEvent`, `SelectItem`, `AutocompleteItem`, `Theme`, `MarkdownTheme`, `TUI`, `Input`, `OverlayOptions`, `Severity`
- Self-contained ESM package with full export map

#### `@wayofmono/telemetry` — ODD Instrumentation SDK
- OpenTelemetry-based tracing: `startSpan()`, `runInSpan()`, `recordEvent()`, `setAttribute()`, `getTracer()`
- Activity recorders: `recordToolCall()`, `recordLlmCall()`, `recordCommand()`, `recordDiagnostic()`
- Telemetry lifecycle: `initTelemetry()`, `shutdownTelemetry()`, `setupOtlpExporter()`
- Context propagation: `getCurrentTraceId()` for injecting trace context into agent prompts
- Exports: `TelemetryConfig`, `ToolCallRecord`, `LlmCallRecord`, `CommandRecord`, `DiagnosticRecord`
- Full OTel SDK deps declared for one-install setup

#### `@wayofmono/wo-agent-core` — Central Agent Runtime & ExtensionAPI
- `ExtensionAPI` interface: `registerCommand()`, `registerTool()`, `registerFlag()`, `registerShortcut()`, `on()`, `getFlag()`, `getActiveTools()`, `setActiveTools()`, `getAllTools()`, `exec()`, `sendMessage()`, `sendUserMessage()`, `appendEntry()`, `registerProvider()`
- `WoExtensionAPI` — full implementation of the ExtensionAPI with event emitter, tool engine, command registry, flag manager, UI context
- Event system: `EventEmitter` with priority-ordered handlers, `emit()`, `emitFirst()`, `removeAll()`
- Tool engine: `ToolEngine` with `register()`, `get()`, `getAll()`, `execute()`, `setActiveTools()`
- Command registry: `CommandRegistry` with `register()`, `get()`, `execute()`, `getNames()`
- Flag manager: `FlagManager` with `register()`, `set()`, `get()`, `getAll()`
- Skill loader: `loadSkills()`, `parseFrontmatter()`, `stripFrontmatter()`, `getAgentDir()`
- Utility functions: `truncateHead()`, `formatSize()`, `convertToLlm()`, `isToolCallEventType()`, `getMarkdownTheme()`, `withFileMutationQueue()`
- UI context: `ExtensionUIContextImpl` with `notify()`, `confirm()`, `input()`, `select()`, `setWidget()`, `setStatus()`, `setWorkingMessage()`, `setHiddenThinkingLabel()`, `onTerminalInput()`, `pasteToEditor()`
- Model registry: `ModelRegistryImpl` with built-in model list
- Dynamic border components: `DynamicBorder` (spinner), `BorderedLoader`, `keyHint()`
- Extension runtime: `discoverAndLoadExtensions()`, `createExtensionRuntime()`
- All 16 lifecycle events: `session_start`, `session_shutdown`, `session_compact`, `session_tree`, `before_agent_start`, `agent_start`, `agent_end`, `turn_start`, `turn_end`, `tool_call`, `tool_execution_start`, `tool_execution_end`, `tool_result`, `user_bash`, `model_select`, `input`, `context`, `resources_discover`
- Self-contained with all wo-* transitive deps declared

#### `@wayofmono/wo-web-ui` — Web UI Components
- `ChatContainer` — full chat interface with message list, streaming support, and input
- `MessageBubble` — role-styled message bubbles with streaming indicator
- `ChatInput` — multi-line textarea with Enter-to-send, Shift+Enter for newline, slash-command support
- `SessionList` — session sidebar with timestamps and create-new button
- `ToolCallCard` — collapsible tool call cards with status dot, args display, result preview
- Dark/light theme support across all components
- Type exports: `ChatMessage`, `ToolCall`, `ToolResult`, `SessionInfo`, `DiagnosticInfo`, `ThemeConfig`, `WebSocketMessage`
- React 19 with peer compatibility for React 18
- Self-contained ESM package with React as direct dependency

### Tickets
- PROJ-002: `@wayofmono/wo-ai` — In Progress (all source implemented)
- PROJ-003: `@wayofmono/wo-tui` — In Progress (all source implemented)
- PROJ-004: `@wayofmono/telemetry` — In Progress (all source implemented)
- PROJ-005: `@wayofmono/wo-agent-core` — In Progress (all source implemented)
- PROJ-006: `@wayofmono/wo-web-ui` — In Progress (all source implemented)

### Dependency Fixes
- Added `@wayofmono/wo-tui` as direct dependency of `@wayofmono/wo-agent-core` (was missing despite being imported)
- Added proper `exports`, `types`, `files`, `publishConfig`, `repository` fields to all package.json files for external consumption
- Added `@types/react` and `@types/react-dom` as devDependencies in wo-web-ui
- Moved workspace deps from devDependencies to dependencies in wo-agent-core for transitive resolution
