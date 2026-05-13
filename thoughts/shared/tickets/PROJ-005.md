---
title: "[PROJ-005] Implement @wayofmono/wo-agent-core — Central Agent Runtime"
type: "Feature"
priority: "Critical"
status: "In Progress"
assignee: "@zerwiz"
created: "2024-05-09"
---

## Context
The `@wayofmono/wo-agent-core` package provides the central agent runtime: ExtensionAPI, tool engine, command registry, event system, skill loader, model registry, UI context, and runtime bootstrap. Reference: `@earendil-works/pi-agent-core` (25 source files).

## Current State (13 files)
wo-agent-core already has:
- `extension-api.ts` — WoExtensionAPI (15 methods: registerCommand, registerTool, registerFlag, on, exec, sendMessage, etc.)
- `event-emitter.ts` — Priority-sorted event system with emit/emitFirst
- `tool-engine.ts` — Tool registry and executor
- `command-registry.ts` — Slash command registration and dispatch
- `flag-manager.ts` — Key-value flag store
- `models.ts` — Model registry with 8 built-in models
- `ui-context.ts` — Extension UI context (notify, confirm, input, select, setWidget, setStatus)
- `skill-loader.ts` — Skill discovery and frontmatter parsing
- `runtime.ts` — Extension discovery and loading from directories
- `dynamic-border.ts` — Spinner (DynamicBorder) and bordered loader (BorderedLoader) components
- `utils.ts` — truncateHead, formatSize, convertToLlm, isToolCallEventType, getMarkdownTheme, withFileMutationQueue
- `types.ts` — All type definitions
- `index.ts` — Barrel exports

## Missing vs pi/agent (15+ files)

### Agent Loop (wo has nothing equivalent)
- [ ] **Agent class** — Stateful `Agent` with lifecycle events (agent_start/end, turn_start/end, message_*), steering/follow-up queues, abort, subscription
- [ ] **Agent loop** — Low-level `agentLoop()` / `runAgentLoop()`: LLM request/response, streaming assistant message assembly, tool call execution (parallel + sequential), follow-up loop
- [ ] **Proxy streaming** — `streamProxy()` for remote LLM execution via SSE

### Session Persistence
- [ ] **Session class** — Tree-based session with branching (entries linked by parentId)
- [ ] **Session storage** — InMemorySessionStorage + JsonlSessionStorage (JSONL file format)
- [ ] **Session repo** — InMemorySessionRepo + JsonlSessionRepo (CRUD over storage)
- [ ] **UUIDv7** — Monotonic timestamp-based UUID generation

### Context Compaction
- [ ] **Compaction core** — `compact()`: cut-point algorithm, token estimation, LLM summarization, overflow recovery
- [ ] **Branch summarization** — `generateBranchSummary()` for tree navigation between branches
- [ ] **Compaction utils** — File operation extraction, conversation serialization, summarization prompts

### Harness
- [ ] **AgentHarness** — High-level orchestrator: system prompt building, skill integration, prompt templates, tool management, session binding, compaction triggering
- [ ] **Harness types** — Skill, PromptTemplate, ExecutionEnv, Session, harness events
- [ ] **Message types** — Custom message types (bashExecution, custom, branchSummary, compactionSummary)
- [ ] **Prompt templates** — Template loading from .md files with argument substitution
- [ ] **Skills system** — Skill loading from SKILL.md with ignore-file support
- [ ] **System prompt** — Skills formatting for system prompt (XML block)
- [ ] **Execution environment** — NodeExecutionEnv (shell exec, file I/O, temp files)
- [ ] **Shell output** — `executeShellWithCapture()` with streaming, truncation, temp file spill
- [ ] **Truncation** — `truncateHead()`, `truncateTail()`, `truncateLine()`, `formatSize()`

## Verification
- [ ] `npm run test` passes
- [ ] `npm run build` produces valid ESM output
- [ ] Session state persists and recovers across restarts via JSONL files
- [ ] Compaction fires at threshold and recovers from overflow
- [ ] Agent lifecycle events fire in correct order
- [ ] Extensions can register tools, commands, and event handlers
