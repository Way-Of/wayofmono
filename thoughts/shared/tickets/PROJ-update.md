# Wo Agent — Gap Analysis & Porting Plan

## References (downloaded to /home/zerwiz/wayofmono/ref/pi/)
- https://github.com/earendil-works/pi → `ref/pi/` (ai/, agent/, coding-agent/, tui/)
- https://github.com/earendil-works/pi/tree/main/packages/coding-agent → `ref/pi/coding-agent/`
- https://github.com/earendil-works/pi/tree/main/packages/agent → `ref/pi/agent/`
- https://github.com/earendil-works/pi/tree/main/packages/ai → `ref/pi/ai/`

## Wo Package Mapping

| Pi Package | Wo Package | Status |
|------------|-----------|--------|
| `@earendil-works/pi-ai` (48 files) | `@wayofmono/wo-ai` (13 files) | 3 new modules added (tokens, overflow, retry) |
| `@earendil-works/pi-agent-core` (25 files) | `@wayofmono/wo-agent-core` (13 files) | Different architecture (extension-focused vs agent loop) |
| `@earendil-works/pi-tui` (25 files) | `@wayofmono/wo-tui` (unknown) | Most components missing |
| `@earendil-works/pi-coding-agent` (93 files) | `@wayofmono/wo-coding-agent` (13 files) | **NEW** — scaffolding done, ~75 files missing |
| `@earendil-works/pi-web-ui` | `@wayofmono/wo-web-ui` | Existing |
| — | `@wayofmono/telemetry` | Existing (Wo-native, no pi equivalent) |
| — | `@wayofmono/lens` | Existing (Wo-native, no pi equivalent) |

## Key Architecture Decisions
1. **wo-coding-agent** is dual CJS/ESM (unlike other wo-* packages which are ESM-only)
2. **wo-agent-core** already has ExtensionAPI, ToolEngine, EventEmitter, ModelRegistry, CommandRegistry — wo-coding-agent builds on top
3. **Session persistence** goes in wo-agent-core, not wo-coding-agent (pi separates agent-core from coding-agent, but session is fundamental)
4. **Compaction** lives in wo-agent-core alongside session (same rationale)
5. **Token counting** goes in wo-ai (pi bundles retry/timeout there too)
6. **Retry logic** goes in wo-ai alongside provider implementations

## Detailed File-by-File Gap: pi/ai vs wo-ai

### What wo-ai has (13 files):
8 original: `complete.ts`, `cost.ts`, `index.ts`, `model.ts`, `oauth.ts`, `string-enum.ts`, `types.ts`, + 3 providers (`openai.ts`, `anthropic.ts`, `gemini.ts`)
3 new: `tokens.ts`, `overflow.ts`, `retry.ts`

### What pi/ai has that wo-ai is missing (35+ files):

**Provider implementations (18 in pi, 3 in wo):**
- `providers/amazon-bedrock.ts` — AWS Bedrock (Anthropic via AWS)
- `providers/azure-openai-responses.ts` — Azure OpenAI
- `providers/cloudflare.ts` — Cloudflare AI Gateway + Workers AI
- `providers/faux.ts` — Test/mock provider (499 lines, used for testing)
- `providers/github-copilot-headers.ts` — GitHub Copilot auth
- `providers/google-shared.ts` — Shared Gemini/Vertex utilities
- `providers/google-vertex.ts` — Google Vertex AI
- `providers/mistral.ts` — Mistral AI
- `providers/openai-codex-responses.ts` — OpenAI Codex (1351 lines, WebSocket + SSE)
- `providers/openai-completions.ts` — OpenAI completions (cover additional providers)
- `providers/openai-responses.ts` — OpenAI Responses API
- `providers/openai-responses-shared.ts` — Shared Responses logic
- `providers/register-builtins.ts` — Built-in provider registration
- `providers/simple-options.ts` — Shared simple options builder
- `providers/transform-messages.ts` — Message transformation
- `providers/images/openrouter.ts` — Image generation via OpenRouter
- `providers/images/register-builtins.ts` — Built-in image provider registration
- `env-api-keys.ts` — Env var key resolution per provider

**OAuth (pi has full flow, wo has basic factory):**
- `utils/oauth/anthropic.ts` — Anthropic OAuth
- `utils/oauth/github-copilot.ts` — GitHub Copilot OAuth
- `utils/oauth/index.ts` — OAuth barrel
- `utils/oauth/oauth-page.ts` — OAuth redirect page
- `utils/oauth/openai-codex.ts` — OpenAI Codex OAuth
- `utils/oauth/pkce.ts` — PKCE challenge/verifier

**Streaming infrastructure:**
- `utils/event-stream.ts` — `AssistantMessageEventStream` class (typed event protocol with start/text_delta/thinking_delta/toolcall_delta/done/error)
- `stream.ts` — `streamSimple()` / `completeSimple()` entry points

**Utilities:**
- `api-registry.ts` — API provider registry (register/unregister providers dynamically)
- `bedrock-provider.ts` — Bedrock provider registration
- `cli.ts` — pi-ai CLI
- `image-models.ts`, `image-models.generated.ts` — Image model definitions
- `images-api-registry.ts` — Image API provider registry
- `images.ts` — Image generation functions
- `models.ts`, `models.generated.ts` — Model definitions with 30+ default models
- `session-resources.ts` — Session-bound resource cleanup registry
- `utils/diagnostics.ts` — Structured diagnostics attached to assistant messages
- `utils/hash.ts` — Hashing utilities
- `utils/headers.ts` — Header utilities
- `utils/json-parse.ts` — Safe JSON parsing
- `utils/sanitize-unicode.ts` — Unicode sanitization
- `utils/typebox-helpers.ts` — TypeBox utility helpers
- `utils/validation.ts` — Input validation

## Detailed File-by-File Gap: pi/agent vs wo-agent-core

### What wo-agent-core has (13 files):
`command-registry.ts`, `dynamic-border.ts`, `event-emitter.ts`, `extension-api.ts`, `flag-manager.ts`, `index.ts`, `models.ts`, `runtime.ts`, `skill-loader.ts`, `tool-engine.ts`, `types.ts`, `ui-context.ts`, `utils.ts`

### What pi/agent has that wo-agent-core is missing (15+ files):

**Core agent loop (wo has nothing equivalent):**
- `agent.ts` — Stateful Agent class with lifecycle events, queues, abort
- `agent-loop.ts` — Pure agent loop (LLM request/response, tool calling, steering, follow-up)
- `proxy.ts` — Remote proxy streaming via SSE

**Harness (wo has none of this):**
- `harness/agent-harness.ts` — High-level orchestrator (session + skills + compaction + tools)
- `harness/types.ts` — Harness types (Skill, PromptTemplate, ExecutionEnv, Session)
- `harness/messages.ts` — Custom message types
- `harness/prompt-templates.ts` — Prompt template loading + substitution
- `harness/skills.ts` — Skill loading from SKILL.md files
- `harness/system-prompt.ts` — System prompt builder
- `harness/execution-env.ts` — Execution environment interface
- `harness/env/nodejs.ts` — Node.js execution environment

**Session system:**
- `harness/session/session.ts` — Session class with tree-based branching
- `harness/session/uuid.ts` — UUIDv7 generation
- `harness/session/storage/memory.ts` — In-memory session storage
- `harness/session/storage/jsonl.ts` — JSONL file session storage
- `harness/session/repo/memory.ts` — In-memory session repo
- `harness/session/repo/jsonl.ts` — JSONL file session repo
- `harness/session/repo/shared.ts` — Shared session helpers

**Compaction system:**
- `harness/compaction/compaction.ts` — Core compaction (cut-point, estimation, summarization)
- `harness/compaction/branch-summarization.ts` — Branch summarization for tree nav
- `harness/compaction/utils.ts` — File ops, conversation serialization

**Utilities:**
- `harness/utils/shell-output.ts` — Shell command execution with capture/truncation
- `harness/utils/truncate.ts` — Line/byte-based output truncation

## Detailed File-by-File Gap: pi/tui vs wo-tui

### What pi/tui has that wo-tui needs:

**Core framework:**
- `tui.ts` — TUI framework (Container hierarchy, Component lifecycle, render tree, process management)
- `terminal.ts` — Terminal backends: `NodeTTY`, `ProcessTerminal` with raw mode, resize, focus tracking
- `index.ts` — Barrel exports

**Components (12 in pi, wo needs them all):**
- `components/box.ts` — Bordered container with title
- `components/text.ts` — Styled text with truncation
- `components/input.ts` — Single-line input
- `components/editor.ts` — Multi-line editor (used in interactive mode)
- `components/select-list.ts` — Interactive selection list with keyboard nav
- `components/settings-list.ts` — Settings-style list
- `components/loader.ts` — Loading spinner
- `components/cancellable-loader.ts` — Cancelable loading spinner
- `components/markdown.ts` — Markdown rendering
- `components/image.ts` — Image rendering (kitty, sixel, etc.)
- `components/spacer.ts` — Flexible spacing
- `components/truncated-text.ts` — Text with visual truncation

**Editor infrastructure:**
- `editor-component.ts` — Editor component (Emacs-like keybindings, autocomplete, selection)
- `autocomplete.ts` — Autocomplete engine
- `fuzzy.ts` — Fuzzy string matching
- `kill-ring.ts` — Emacs kill ring for cut/copy/paste
- `undo-stack.ts` — Undo/redo stack
- `stdin-buffer.ts` — Raw stdin buffering for paste detection

**Terminal utilities:**
- `terminal-image.ts` — Terminal image display protocol
- `keys.ts` — Key event types and parsing
- `keybindings.ts` — Keybinding system and default bindings
- `utils.ts` — Terminal utilities

## Detailed File-by-File Gap: pi/coding-agent vs wo-coding-agent

### What wo-coding-agent has (13 files):
`index.ts`, `types.ts`, `cli.ts`, `main.ts`, `cli/args.ts`, `modes/print-mode.ts`, `core/agent-session.ts`, `core/settings-manager.ts`, `core/auth-storage.ts`, `core/model-registry.ts`, `core/session-manager.ts`, `core/message-converter.ts`, `tools/index.ts`

### What pi/coding-agent has that wo-coding-agent is missing (~80 files):

**Real interactive mode (wo has nothing):**
- `modes/interactive/interactive-mode.ts` (~5000 lines) — Full TUI agent interface
- `modes/interactive/theme/theme.ts` — Theme system
- `modes/interactive/components/` — 35+ TUI components:
  - `assistant-message.ts`, `user-message.ts`, `bash-execution.ts`, `tool-execution.ts`
  - `custom-editor.ts` — Multi-line editor with autocomplete, history, paste
  - `footer.ts` — Status bar (tokens, cost, model, session, git)
  - `model-selector.ts`, `scoped-models-selector.ts`, `thinking-selector.ts`, `settings-selector.ts`
  - `session-selector.ts`, `session-selector-search.ts`, `tree-selector.ts`, `user-message-selector.ts`
  - `extension-editor.ts`, `extension-input.ts`, `extension-selector.ts`
  - `login-dialog.ts`, `oauth-selector.ts`, `theme-selector.ts`
  - `bordered-loader.ts`, `dynamic-border.ts`, `countdown-timer.ts`
  - `diff.ts`, `visual-truncate.ts`
  - `keybinding-hints.ts`, `config-selector.ts`, `show-images-selector.ts`
  - `skill-invocation-message.ts`, `custom-message.ts`
  - `branch-summary-message.ts`, `compaction-summary-message.ts`
  - `earendil-announcement.ts`, `armin.ts`, `daxnuts.ts`

**RPC mode:**
- `modes/rpc/rpc-mode.ts`, `rpc-client.ts`, `rpc-types.ts`, `jsonl.ts`

**AgentSession (3110 lines vs wo's ~50 line stub):**
- `core/agent-session.ts` — Full session with: model switching, compact, tree navigation, bash execution, extension binding, HTML export, auto-retry, compaction overflow recovery, message queuing
- `core/agent-session-runtime.ts` — Runtime lifecycle (session replacement, forking)
- `core/agent-session-services.ts` — Cwd-bound service creation + diagnostics
- `core/sdk.ts` — `createAgentSession()` factory (220 lines)

**Real tool implementations:**
- `core/tools/bash.ts` (440 lines) — Shell execution with streaming, cancellation, env config
- `core/tools/read.ts` (363 lines) — File reading + images with line range support
- `core/tools/edit.ts` — Find/replace editing
- `core/tools/edit-diff.ts` — Diff-based editing
- `core/tools/write.ts` — File creation/overwrite
- `core/tools/grep.ts` — Content search
- `core/tools/find.ts` — Glob pattern finding
- `core/tools/ls.ts` — Directory listing
- `core/tools/file-mutation-queue.ts` — Sequential file mutations
- `core/tools/output-accumulator.ts` — Streaming output buffer
- `core/tools/path-utils.ts` — Path resolution
- `core/tools/render-utils.ts` — Tool call rendering
- `core/tools/tool-definition-wrapper.ts` — AgentTool → ToolDefinition wrapper
- `core/tools/truncate.ts` — Output truncation

**Full settings manager (107 methods vs wo's 8):**
- `core/settings-manager.ts` — Two-tier (global + project) file-based settings with `proper-lockfile`, merge semantics, per-field tracking

**Full model registry (953 lines vs wo's ~60 lines):**
- `core/model-registry.ts` — Built-in + custom models, OAuth, command-backed values, schema validation
- `core/model-resolver.ts` — Pattern matching, CLI model resolution

**Real auth storage:**
- `core/auth-storage.ts` — File-locked with `proper-lockfile`, OAuth token refresh, 3-tier priority chain
- `core/auth-guidance.ts` — User-facing auth error messages

**Extension system:**
- `core/extensions/runner.ts` — Extension runtime + typed dispatch
- `core/extensions/loader.ts` — File-based extension loading
- `core/extensions/types.ts` — Extension API types
- `core/extensions/wrapper.ts` — Tool wrapping

**Compaction:**
- `core/compaction/compaction.ts` (845 lines) — Cut-point algorithm, LLM summarization, overflow recovery
- `core/compaction/branch-summarization.ts` — Branch summarization for tree nav
- `core/compaction/utils.ts` — File ops, conversation serialization

**Other core modules:**
- `core/bash-executor.ts` — Bash execution with streaming + truncation
- `core/event-bus.ts` — Simple pub/sub
- `core/exec.ts` — Low-level command execution
- `core/footer-data-provider.ts` — Git branch + extension status
- `core/keybindings.ts` — Keybinding management
- `core/messages.ts` — Custom message types + convertToLlm
- `core/output-guard.ts` — stdout takeover/restore
- `core/prompt-templates.ts` — Prompt template expansion
- `core/provider-display-names.ts` — Human-readable provider names
- `core/resolve-config-value.ts` — Shell command config values
- `core/resource-loader.ts` — Loads extensions, skills, prompts, themes, context files
- `core/session-cwd.ts` — Working directory validation
- `core/session-manager.ts` — Session file I/O, branching, migration
- `core/skills.ts` — Skill loading + formatting
- `core/slash-commands.ts` — Built-in slash commands
- `core/source-info.ts` — Loaded resource metadata
- `core/system-prompt.ts` — System prompt builder
- `core/telemetry.ts` — Install telemetry
- `core/timings.ts` — Performance timing
- `core/defaults.ts` — Default constants
- `core/diagnostics.ts` — Resource diagnostic types
- `core/export-html/` — Full HTML export (ansi-to-html, tool-renderer, templates, highlight.js)

**CLI infrastructure:**
- `cli/file-processor.ts` — `@file` argument processing
- `cli/initial-message.ts` — First prompt builder
- `cli/list-models.ts` — `--list-models` implementation
- `cli/config-selector.ts` — TUI config selector
- `cli/session-picker.ts` — Interactive session picker

**Utilities (22 files):**
- `utils/ansi.ts` — ANSI escape code utilities
- `utils/changelog.ts` — Changelog display
- `utils/child-process.ts` — Child process helpers
- `utils/clipboard.ts`, `clipboard-native.ts`, `clipboard-image.ts` — Clipboard support
- `utils/exif-orientation.ts` — Image EXIF orientation
- `utils/frontmatter.ts` — YAML frontmatter parsing
- `utils/fs-watch.ts` — File system watching
- `utils/git.ts` — Git integration
- `utils/html.ts` — HTML utilities
- `utils/image-convert.ts`, `image-resize.ts` — Image processing
- `utils/mime.ts` — MIME type detection
- `utils/paths.ts` — Path utilities
- `utils/photon.ts` — Image processing (libphoton)
- `utils/pi-user-agent.ts` — User agent string
- `utils/shell.ts` — Shell detection
- `utils/sleep.ts` — Sleep/delay
- `utils/syntax-highlight.ts` — Syntax highlighting
- `utils/tools-manager.ts` — Tool lifecycle
- `utils/version-check.ts` — Version checking

**Other:**
- `config.ts` — Path resolution, constants
- `migrations.ts` — Data migration runner
- `package-manager-cli.ts` — Package CLI commands
- `bun/` — Bun-specific support
