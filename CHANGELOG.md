# Changelog

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
