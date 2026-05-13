---
title: "[PROJ-009] Implement @wayofmono/wo-agent — embeddable general-purpose Agent SDK"
type: "Feature"
priority: "High"
status: "In Progress"
assignee: "@zerwiz"
created: "2026-05-13"
---

## Context
Wo has two agent packages:
- `wo-agent-core` — low-level runtime (types, extensions, tool engine, events) — infrastructure only
- `wo-coding-agent` — CLI coding agent (`wo` binary) — focused on code manipulation

Missing: a **programmable, embeddable Agent SDK** that application developers install in their own Node.js projects to get a working agent without writing a CLI. This is the package that external systems (like [wayofpi](https://github.com/zerwiz/wayofpi)) import to get an agent that can do documentation, file operations, search, data extraction, and general tasks — but NOT code rewriting.

## What It Is

`@wayofmono/wo-agent` is a library SDK, not a CLI. Developers use it like:

```ts
import { createAgent } from "@wayofmono/wo-agent";

const agent = await createAgent({
  model: { api: "anthropic", modelId: "claude-sonnet-4-20250514" },
  skills: ["documentation", "file-operations", "search"],
});

const result = await agent.prompt("summarize the README files in this project");
console.log(result.content);
```

## Requirements

### Agent Class
- [x] `createAgent(config): Agent` factory function
- [x] `agent.prompt(text, options?)` — single prompt, returns response
- [x] `agent.task(description, options?)` — multi-step task with tool use
- [x] Agent lifecycle: init → ready → running → dispose
- [x] Event subscription: `agent.on("message", handler)` / `agent.on("tool_use", handler)`

### Built-in Skills (Not Code Rewriting)
Skills are modular collections of tools + prompts for specific domains:

- [x] **documentation** — read/write docs, generate README, update CHANGELOG, format markdown
- [x] **file-operations** — read, write, edit, search, list files (read-only-safe subset of coding-agent tools)
- [x] **search** — grep/find across project, semantic search
- [ ] **data-extraction** — parse logs, extract structured data from text, format conversion
- [x] **summarization** — summarize files, diffs, directories, conversations
- [ ] **project-introspection** — analyze project structure, dependencies, configs

### Embeddable API
- [x] Pure async API (no process.stdin/stdout dependency)
- [x] Custom tool registration: `agent.registerTool(tool)`
- [ ] Custom skill loading from `.md` files (reuse wo-agent-core skill-loader)
- [ ] Session persistence hooks (optional, app provides storage)
- [x] AbortSignal support for cancellation
- [x] Streaming via `onChunk` callback

### Multi-Provider
- [ ] Reuse wo-ai providers (OpenAI, Anthropic, Gemini) — partial, model resolution is basic
- [x] Model config via `ModelConfig` object
- [x] API key from env vars or config
- [ ] Provider auto-detection

### Skill Loading
- [x] Built-in skills compiled into package (no external files needed)
- [ ] Custom skills from `.md` files in `<project>/.wo/skills/`
- [x] Skill selection on agent creation: `skills: ["docs", "files"]`
- [ ] Dynamic skill enable/disable during agent lifetime

### Tool Loop / ReAct
wayofpi's bundled chat (`chat-orchestrator-tools.ts`) implements its own ReAct tool loop. wo-agent needs a built-in one.

- [x] Built-in ReAct tool loop: send → parse tool_calls → execute → loop (max steps, nudge logic)
- [x] Tool registry with name/description/schema/executor
- [x] Streaming SSE parsing (OpenAI-compatible /v1/chat/completions format)
- [ ] Tool gating: per-tool enable/disable via config
- [x] Max steps, timeout, nudge handling

### Session Persistence
wayofpi uses Pi-compatible JSONL format at `<project>/agent/sessions/wayofpi-chat-*.jsonl`.

- [x] JSONL session store with Pi-compatible format (`{"type":"message","message":{"role":"...","content":"..."}}`)
- [x] Session save/restore
- [x] Context budget trimming (max messages/characters)
- [ ] Session branching

### Agent Discovery
wayofpi scans `agents/`, `.claude/agents/`, `.pi/agents/`, `.cursor/agents/` for `.md` agent definitions.

- [x] Agent metadata scanner — discover `.md` files with YAML frontmatter (`name`, `description`, `tools`, `skills`)
- [x] Agent metadata types — `{name, description, tools[], skills[], model?, body}`
- [ ] Team roster — read/write team definitions (teams.yaml)

### System Prompt Composition
wayofpi composes multi-block system prompts in `session-prompts.ts`.

- [x] Structured system prompt builder: env prompt → agent body → mode notes → tool descriptions → index boost
- [x] Mode templates: Orchestrator, Plan, Build
- [x] Tool description auto-injection

### Intent Dispatch
wayofpi has phrase dispatch (`orchestrator-dispatch-intent.ts`) for agent handoff detection.

- [ ] Intent classification — detect handoff intents ("dispatch the scout", "ask planner")
- [ ] Dispatch router — route to correct agent
- [ ] Transient agent merging — merge specialist body for one turn without persisting

### Workspace Jail
wayofpi resolves all paths relative to workspace root.

- [x] Path resolver — resolve paths relative to workspace, prevent escape
- [x] Max file size limits
- [x] Tool timeout defaults

### Relationship to wayofpi
[wayofpi](https://github.com/zerwiz/wayofpi) will:
- Import `@wayofmono/wo-agent` as its agent backend
- Add Pi-specific skills (package management, pi.dev integration, etc.)
- Use the agent SDK instead of bundling its own agent logic
- This means wayofpi becomes a thin skill layer on top of Wo's agent SDK

### Relationship to Existing Packages
```
wo-ai (providers)
  ↑
wo-agent-core (runtime types, extensions, tool engine)
  ↑
@wayofmono/wo-agent (embeddable agent SDK) ← NEW
  ↑
wo-coding-agent (CLI)     wayofpi (Pi integration)
```

## Success Criteria
- [ ] `npm install @wayofmono/wo-agent` in a fresh project
- [ ] `createAgent()` returns working agent with configured model
- [ ] `agent.prompt("hello")` returns LLM response
- [ ] Built-in documentation skill can generate README
- [ ] Built-in file-operations skill can search and read files
- [ ] Custom `.md` skills load from project `.wo/skills/` dir
- [ ] `agent.on("error", ...)` fires on failures
- [ ] No global state — multiple agents can coexist
- [ ] wayofpi can import and use it as backend
