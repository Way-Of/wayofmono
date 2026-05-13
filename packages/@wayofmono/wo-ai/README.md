# @wayofmono/wo-ai

Unified Multi-Provider LLM API for the Wo ecosystem. Provides a single interface over OpenAI, Anthropic, and Google Gemini.

```
npm install @wayofmono/wo-ai
```

## Usage

```ts
import { complete, completeSimple, getModel, initDefaultModels } from "@wayofmono/wo-ai";

// Register default models
initDefaultModels();

// Simple completion
const model = getModel("openai", "gpt-4o");
const result = await completeSimple(model, {
  systemPrompt: "You are a helpful assistant.",
  messages: [{ role: "user", content: "Hello!" }],
});

// Streaming completion
const streamResult = await complete(model, {
  messages: [{ role: "user", content: "Write a poem" }],
  onStream: (chunk) => {
    if (chunk.type === "text") process.stdout.write(chunk.text);
  },
});

// With tools
const result = await completeSimple(model, {
  messages: [{ role: "user", content: "What's the weather?" }],
  tools: [{
    name: "get_weather",
    description: "Get weather for a location",
    parameters: Type.Object({ location: Type.String() }),
  }],
});
```

## API

### Core Functions
| Function | Description |
|----------|-------------|
| `complete(model, params)` | Full streaming/non-streaming completion |
| `completeSimple(model, params)` | Simplified one-shot completion |
| `completeWithConfig(config, params)` | Completion from config object (resolves model) |

### Model Registry
| Function | Description |
|----------|-------------|
| `registerModel(model)` | Register a model |
| `getModel(provider, id)` | Look up a model |
| `getModels()` | List all registered models |
| `getModelsByApi(api)` | Filter by API type |
| `getSupportedThinkingLevels(model)` | Available thinking modes |
| `resolveModelConfig(config)` | Resolve config to model + credentials |
| `initDefaultModels()` | Register built-in model list |

### Utilities
| Function | Description |
|----------|-------------|
| `calculateCost(model, usage)` | Calculate cost from model pricing |
| `StringEnum(values)` | Create TypeBox string union schema |
| `estimateTokenCount(text)` | Heuristic token estimate (chars/4) |
| `estimateMessageTokens(message)` | Token estimate for a single message |
| `estimateMessagesTokens(messages, system?)` | Token estimate for full context |
| `validateContextWindow(messages, maxTokens, system?)` | Check if input fits context window |
| `calculateContextTokens(usage)` | Compute total tokens from Usage object |
| `isContextOverflow(result, contextWindow?)` | Detect context overflow errors |
| `fetchWithRetry(url, options)` | HTTP fetch with exponential backoff retry |
| `isRetryableError(status, text)` | Check if error is retryable |

### OAuth (`@wayofmono/wo-ai/oauth`)
| Function | Description |
|----------|-------------|
| `getOAuthProvider(name)` | Get registered OAuth provider |
| `registerOAuthProvider(provider)` | Register an OAuth provider |
| `createOAuthProvider(config)` | Create OAuth provider from config |

## Types

`Message`, `UserMessage`, `AssistantMessage`, `SystemMessage`, `ToolMessage`, `StopReason`, `Usage`, `Model`, `ModelConfig`, `Api`, `ThinkingLevel`, `ThinkingConfig`, `ToolDefinition`, `CompletionParams`, `CompletionResult`, `SimpleCompletionParams`, `StreamChunk`, `ImageContent`, `MessageContent`, `OAuthCredentials`, `OAuthProvider`, `AgentToolResult`

## Providers

- **OpenAI** — `gpt-4o`, `gpt-4o-mini`, `o3-mini`, and any OpenAI-compatible API (Azure, Together, etc.)
- **Anthropic** — `claude-sonnet-4-20250514`, `claude-haiku-3-5-20241022`, `claude-opus-4-20250514` with cache control and thinking
- **Gemini** — `gemini-2.5-flash`, `gemini-2.5-pro`

API keys read from `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` environment variables.
