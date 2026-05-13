# Wo Packages — Remaining Work

Unfinished tasks across all 7 wo-* packages, compiled from PROJ-002 through PROJ-007.

---

## @wayofmono/wo-ai — Multi-Provider LLM API

- [x] Token counting / context window validation (`src/tokens.ts`)
- [x] Retry logic with exponential backoff in fetch wrappers (`src/retry.ts`, all 3 providers updated)
- [x] Context overflow detection from error messages (`src/overflow.ts`)
- [x] Fix onStream callback to emit per-chunk (currently used as boolean flag)
- [ ] Provider auto-detection from model name
- [ ] Error normalization across providers
- [ ] Vertex AI provider
- [ ] Streaming response iterator (`AsyncIterable<StreamChunk>`)
- [x] Add Gemini streaming support (currently non-streaming only)

### Verification (blocking)
- [ ] `npm run test` passes
- [ ] `npm run build` produces valid ESM output
- [x] Token counting heuristic (`chars/4`) implemented
- [x] Retry fires on 429/5xx with exponential backoff (via `fetchWithRetry`)
- [x] `onStream` receives per-chunk `StreamChunk` events
- [ ] Tool calling works end-to-end with at least one provider

---

## @wayofmono/wo-agent-core — Central Agent Runtime

- [ ] Session state persistence (JSONL file-based, stored in `<project-root>/.wo/sessions/`)
- [ ] Context compaction (cut-point algorithm, LLM summarization, overflow recovery)
  - [ ] Copy pi/agent/src/harness/compaction/* → wo-agent-core, adapt to wo types
- [ ] Event cancellation support (handlers prevent default behavior)
- [ ] Config persistence (read/write `<project-root>/.wo/config.json`)
- [ ] Pi-extension compatibility bridge (shim for `@earendil-works/pi-*` extensions)
- [ ] Session branching (branch/rollback for experiment workflow)
- [ ] Concurrent tool execution (run multiple tools in parallel)
- [ ] `renderCall` / `renderResult` on tools (optional TUI rendering)

### Verification (blocking)
- [ ] `npm run test` passes
- [ ] `npm run build` produces valid ESM output
- [ ] Session state persists and recovers across restarts
- [ ] Compaction fires at threshold and recovers from overflow
- [ ] Lifecycle event order: agent_start → turn_start → message_* → turn_end → agent_end

---

> See **PROJ-008** for detailed pi-to-wo copy plan (utilities, tools, compaction, agent loop, TUI)

> **Architecture: Project-Local only.** `wo` stores everything in `<project-root>/.wo/`. No global `~/.wo/` fallback. The monorepo IS the dependency — other systems install `@wayofmono/wo-coding-agent` from npm.

## @wayofmono/wo-coding-agent — CLI Coding Agent (NEW)

- [x] Package scaffold (package.json dual CJS/ESM, tsconfigs, dirs)
- [x] Project-local config module (`src/config.ts` — project root detection, `.wo/` paths)
- [x] Utility modules (14 of 22 copied: sleep, paths, ansi, html, mime, fs-watch, child-process, frontmatter, changelog, shell, git, syntax-highlight, tools-manager, user-agent)
- [x] AgentSession core (stub with config/subscribe/prompt/abort/dispose)
- [x] Tool system stubs (bash, read, write, edit, grep, find, ls)
- [x] Settings manager (in-memory, needs file persistence)
- [x] Auth storage (in-memory + env var fallback)
- [x] Model registry (built-in defaults: GPT-4o, Claude Sonnet 4, Gemini 2.5, etc.)
- [x] CLI entry point + arg parsing (`src/cli.ts` shebang, `src/cli/args.ts` full parser)
- [x] Print mode (basic `wo -p "prompt"` echo response)
- [ ] Interactive mode (TUI with editor, chat, footer, commands)
- [ ] RPC mode (JSON-RPC over stdin/stdout)
- [ ] Session picker (interactive `--resume` browser)
- [ ] Extension discovery (load `.ts`/`.js` extensions from dirs)
- [ ] Skill loading (`.md` skill file discovery + frontmatter parsing)
- [ ] Context files (AGENTS.md/CLAUDE.md discovery from cwd up)
- [ ] Message queue (steering + follow-up during streaming)
- [x] Real tool execution (bash/read/write/edit/grep/find/ls as actual operations)
  - [x] Copied 13 files from pi: bash, read, write, edit, edit-diff, grep, find, ls
  - [x] Supporting: truncate, path-utils, file-mutation-queue, output-accumulator, index
  - [x] Added deps: `diff`, `@types/diff`
- [x] Utility modules (14 of 22 copied)
  - [x] sleep, paths, ansi, html, mime, fs-watch, child-process
  - [x] frontmatter, changelog, shell, git, syntax-highlight, tools-manager, user-agent
  - [ ] clipboard*, photon, exif-orientation, image-* — SKIP (native deps not required for MVP)
- [ ] Package manager (`wo install/remove/update/list`)
- [ ] Context compaction integration (wire wo-agent-core compaction into CLI)
- [ ] HTML export (export session to HTML file)
- [ ] Custom message types (bashExecution, branchSummary, compactionSummary)

### Verification (blocking)
- [ ] `npm run build` produces dual CJS/ESM output
- [ ] `npm run test` passes
- [x] Package scaffold created
- [x] `wo` binary entry point exists
- [x] Print mode stub prints echo response
- [ ] Interactive mode renders UI and accepts input

---

## @wayofmono/wo-tui — Terminal UI Library

- [ ] `Inline` component for rich text composition
- [ ] Widget overlay system (rpiv-todo overlay pattern)
- [ ] ProcessTerminal backend (raw terminal I/O)
- [ ] Footer/status bar widget (diagnostics, tokens, model)
- [ ] Status spinner / progress indicator (animated)
- [ ] `ui.input()` interactive prompt (multi-line input with editing)
- [ ] `SelectItem` picker as standalone component (keyboard nav)
- [ ] CustomEditor component (multi-line with autocomplete, history)

### Verification (blocking)
- [ ] `npm run test` passes
- [ ] `npm run build` produces valid ESM output
- [ ] Widget system renders and updates lifecycle
- [ ] `ui.input()` captures input interactively
- [ ] ProcessTerminal captures raw keypresses

---

## @wayofmono/telemetry — ODD Instrumentation SDK

- [ ] TracerProvider registration (register actual provider)
- [ ] Tracer hierarchy (separate tracers per subsystem)
- [ ] AsyncLocalStorage context propagation (auto-propagation across async calls)
- [ ] Console exporter for dev (pretty-print spans)
- [ ] Parent-child span relationships (automatic parent linking)
- [ ] Narrative validation hooks (`/validate_telemetry` support)
- [ ] Rich dashboard span attributes (structured for Aspire)

### Verification (blocking)
- [ ] `npm run test` passes
- [ ] `npm run build` produces valid ESM output
- [ ] Spans export via OTLP to Aspire dashboard
- [ ] Console exporter works for development
- [ ] Trace ID accessible from agent context

---

## @wayofmono/wo-web-ui — Web UI Components

- [ ] Markdown rendering in message bubbles (bold, code, links)
- [ ] Code block syntax highlighting (language-aware + copy button)
- [ ] WebSocket/SSE client (connect to agent backend)
- [ ] Event stream parsing (tool calls, diagnostics from stream)
- [ ] Slash-command autocomplete (suggest as user types `/`)
- [ ] File attachment / drag-and-drop (upload to agent context)
- [ ] Session branch visualization (branch tree in sidebar)
- [ ] Wom-Lens diagnostic display (inline file links with badges)
- [ ] Responsive mobile layout (collapse sidebar on small screens)

### Verification (blocking)
- [ ] `npm run test` passes
- [ ] `npm run build` produces valid ESM output
- [ ] Chat interface renders and streams responses
- [ ] Markdown rendering works with code blocks
- [ ] WebSocket/SSE connects to agent backend
- [ ] Light/dark theme toggle works

---

## Cross-Cutting

- [ ] `npm run test` across all packages
- [ ] `npm run build` across all packages
- [ ] CI pipeline (GitHub Actions)
- [ ] Package publishing (npm publish for all 7 packages)
