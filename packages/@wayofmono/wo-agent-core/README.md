# @wayofmono/wo-agent-core

Core agent runtime with transport abstraction, state management, and attachment support. The foundational engine that powers `wo-coding-agent` (wocode) and `wo-agent` (wouser).

## Installation

```bash
pnpm add @wayofmono/wo-agent-core
```

## What It Does

This package provides the core event-loop, tool execution, session management, skill/prompt-template loading, and context compaction for AI agents. It is completely UI-agnostic and can be embedded in any application.

## Quick Start

```typescript
import { Agent, streamSimple } from "@wayofmono/wo-agent-core";

const agent = new Agent({
  streamFn: streamSimple,
  initialState: {
    model: myModel,
    tools: [readTool, bashTool, editTool],
    systemPrompt: "You are a helpful coding assistant.",
  },
});

agent.subscribe((event) => {
  if (event.type === "message_end") {
    console.log("Agent finished:", event.message);
  }
});

await agent.prompt("Fix the bug in auth.ts");
```

## Architecture

```
┌─────────────────────────────────────┐
│           AgentHarness              │  ← High-level orchestrator
│  (session, skills, compaction)      │
├─────────────────────────────────────┤
│           Agent (stateful)          │  ← Core event-loop
│  (transcript, tools, streaming)     │
├─────────────────────────────────────┤
│           wo-ai                     │  ← LLM streaming
│  (providers, models, API keys)      │
└─────────────────────────────────────┘
```

## Exported Classes

### Agent

Stateful wrapper around the agent loop. Owns the transcript, emits lifecycle events, executes tools.

```typescript
const agent = new Agent(options?: AgentOptions);
```

**AgentOptions:**

| Option | Type | Description |
|--------|------|-------------|
| `initialState` | `Partial<AgentState>` | Initial model, thinking level, tools, messages |
| `streamFn` | `StreamFn` | Stream function (default: `streamSimple` from wo-ai) |
| `getApiKey` | `(provider: string) => Promise<string>` | Dynamic API key resolver |
| `transport` | `"sse" \| "websocket" \| "auto"` | Transport protocol |
| `toolExecution` | `"parallel" \| "sequential"` | Tool execution strategy |
| `sessionId` | `string` | Session identifier for cache-aware backends |

**Key Methods:**

| Method | Description |
|--------|-------------|
| `prompt(message)` | Start a new prompt |
| `continue()` | Continue from current transcript |
| `steer(message)` | Queue message for mid-run injection |
| `followUp(message)` | Queue message after agent stops |
| `subscribe(listener)` | Subscribe to lifecycle events |
| `abort()` | Abort current run |
| `reset()` | Clear transcript and state |

### AgentHarness

High-level orchestrator wrapping `Agent` with session persistence, skill invocation, compaction, and branching.

```typescript
const harness = new AgentHarness({
  env: new NodeExecutionEnv(),
  session: sessionManager,
  tools: codingTools,
  resources: { skills, promptTemplates },
  systemPrompt: "You are a coding assistant.",
  model: myModel,
});
```

**Key Methods:**

| Method | Description |
|--------|-------------|
| `prompt(text)` | Send a user prompt |
| `skill(name)` | Invoke a skill by name |
| `promptFromTemplate(name, args)` | Invoke a prompt template |
| `compact()` | Compact conversation history |
| `navigateTree(targetId)` | Navigate session tree |
| `setModel(model)` | Change model mid-session |
| `setTools(tools)` | Replace tool set |

### Session

Tree-structured conversation history with compaction and branching.

```typescript
session.appendMessage(message);
session.appendCompaction(summary, firstKeptId, tokens);
session.moveTo(entryId);
```

## AgentTool Interface

```typescript
interface AgentTool<TParameters, TDetails> {
  name: string;
  description: string;
  parameters: TParameters;        // Typebox schema
  label: string;
  execute: (toolCallId, params, signal?) => Promise<AgentToolResult<TDetails>>;
}
```

## Transport Abstraction

| Transport | Description |
|-----------|-------------|
| `"sse"` | Server-Sent Events (default) |
| `"websocket"` | WebSocket connection |
| `"auto"` | Auto-detect best transport |

For proxied backends:

```typescript
streamProxy(model, context, {
  proxyUrl: "https://your-backend.com",
  authToken: "...",
})
```

## Skills & Prompt Templates

```typescript
// Load skills from directories
const skills = await loadSkills(env, ["~/.config/opencode/skills/"]);

// Load prompt templates
const templates = await loadPromptTemplates(env, ["~/.config/opencode/prompts/"]);

// Format for system prompt
const skillBlock = formatSkillsForSystemPrompt(skills);
```

## Execution Environment

`NodeExecutionEnv` provides filesystem and shell operations:

```typescript
const env = new NodeExecutionEnv({ cwd: "/my/project" });
await env.exec("ls -la");
await env.readTextFile("package.json");
await env.writeFile("output.txt", "content");
```

## Package Dependencies

- `@wayofmono/wo-ai` — LLM streaming, models, message types
- `typebox` — Schema-based tool parameter validation
- `yaml` — SKILL.md frontmatter parsing

## Related Packages

- `@wayofmono/wo-coding-agent` — Coding agent CLI (wocode) built on this
- `@wayofmono/wo-agent` — General-purpose agent SDK (wouser) built on this
- `@wayofmono/wo-ai` — LLM provider abstraction used by this
- `@wayofmono/wo-tui` — Terminal UI used by the agent CLIs

---

*Part of the WayOfMono high-performance coding agent ecosystem.*
