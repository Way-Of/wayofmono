# @wayofmono/wo-ai

Unified LLM API with automatic model discovery, provider configuration, and multi-format streaming. Supports 30+ providers across 9 API formats.

## Installation

```bash
pnpm add @wayofmono/wo-ai
```

## Quick Start

```typescript
import { getModel, streamSimple, getEnvApiKey } from "@wayofmono/wo-ai";

// Get a model
const model = getModel("openai", "gpt-4o");

// Stream a response
const stream = streamSimple(model, {
  messages: [{ role: "user", content: "Hello!" }],
}, {
  apiKey: getEnvApiKey("openai"),
});

for await (const event of stream) {
  if (event.type === "text") {
    process.stdout.write(event.text);
  }
}
```

## Supported Providers

| Provider | API Format | Env Var |
|----------|-----------|---------|
| OpenAI | openai-completions | `OPENAI_API_KEY` |
| Anthropic | anthropic-messages | `ANTHROPIC_API_KEY` |
| Google Gemini | google-generative-ai | `GEMINI_API_KEY` |
| Amazon Bedrock | bedrock-converse-stream | `AWS_PROFILE` |
| Azure OpenAI | azure-openai-responses | `AZURE_OPENAI_API_KEY` |
| DeepSeek | openai-completions | `DEEPSEEK_API_KEY` |
| Groq | openai-completions | `GROQ_API_KEY` |
| OpenRouter | openai-completions | `OPENROUTER_API_KEY` |
| GitHub Copilot | openai-completions | `COPILOT_GITHUB_TOKEN` |
| Mistral | mistral-conversations | `MISTRAL_API_KEY` |
| Ollama (local) | openai-completions | `http://127.0.0.1:11434/v1` |
| llama.cpp Docker (local) | openai-completions | `http://127.0.0.1:8081/v1` |
| LM Studio (local) | openai-completions | `http://127.0.0.1:1234/v1` |

## API Reference

### Streaming

```typescript
// Low-level stream
stream(model, context, options?): AssistantMessageEventStream

// With reasoning/thinking support
streamSimple(model, context, options?): AssistantMessageEventStream

// Await completion
complete(model, context, options?): Promise<AssistantMessage>
completeSimple(model, context, options?): Promise<AssistantMessage>
```

### Model Discovery

```typescript
getModel(provider, modelId): Model<any>        // Get specific model
getProviders(): KnownProvider[]                 // List all providers
getModels(provider): Model<any>[]              // List models for a provider
calculateCost(model, usage): Usage["cost"]     // Calculate token cost
```

### API Key Resolution

```typescript
getEnvApiKey(provider): string | undefined     // From env vars
findEnvKeys(provider): string[]                // List matching env var names
```

## Provider Configuration

### OpenAI

```bash
export OPENAI_API_KEY="sk-..."
```

```typescript
const model = getModel("openai", "gpt-4o");
const result = await completeSimple(model, {
  messages: [{ role: "user", content: "Hello!" }],
}, { apiKey: getEnvApiKey("openai") });
```

### Anthropic

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

```typescript
const model = getModel("anthropic", "claude-sonnet-4-20250514");
```

### Google Gemini

```bash
export GEMINI_API_KEY="AIza..."
```

```typescript
const model = getModel("google", "gemini-2.0-flash");
```

### Ollama (Local)

No API key needed. Start Ollama first:

```bash
ollama pull qwen3.5:9b
ollama serve
```

Then configure in `models.json`:

```json
{
  "providers": {
    "ollama": {
      "api": "openai-completions",
      "baseUrl": "http://127.0.0.1:11434/v1",
      "models": [{ "id": "qwen3.5:9b", "name": "Ollama Qwen 3.5" }]
    }
  }
}
```

### llama.cpp Docker (Local)

No API key needed. See the [llama.cpp Setup Guide](https://github.com/Way-Of/wayofmono/tree/main/thoughts/global/docs/guides/llama-setup-for-wo-ai.md) for full setup instructions.

Run llama.cpp Docker containers:

```bash
# Start the Docker containers
docker compose -f ~/.config/llama-containers/compose.yml up -d

# Check health
curl http://localhost:8081/health
```

Built-in model IDs (no config needed):
- `qwen3.5-9b-32k` — Port 8081, 32K context, full GPU
- `qwen3.5-4b-65k` — Port 8084, 65K context, full GPU
- `qwen3.6-35b-a3b-16k` — Port 8083, 16K context, split GPU/CPU, reasoning
- `qwen3.5-9b-196k` — Port 8082, 196K context, full GPU

```typescript
const model = getModel("llama", "qwen3.5-9b-32k");
```

### LM Studio (Local)

No API key needed. Start LM Studio and load a model (default port 1234):

```bash
# LM Studio serves at http://127.0.0.1:1234/v1
```

```typescript
const model = getModel("lmstudio", "loaded-model");
```

### Amazon Bedrock

Uses AWS SDK authentication:

```bash
export AWS_PROFILE="my-profile"
# or
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
```

## Model Object

```typescript
interface Model<TApi> {
  id: string;                    // "gpt-4o"
  name: string;                  // "GPT-4o"
  api: TApi;                     // "openai-completions"
  provider: Provider;            // "openai"
  baseUrl: string;               // API endpoint
  reasoning: boolean;            // Supports reasoning/thinking
  contextWindow: number;         // Max context tokens
  maxTokens: number;             // Max output tokens
  cost: { input, output };       // $/million tokens
  input: ("text" | "image")[];   // Supported input types
}
```

## Stream Options

```typescript
interface StreamOptions {
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  signal?: AbortSignal;
  transport?: "sse" | "websocket" | "auto";
  sessionId?: string;
  cacheRetention?: "none" | "short" | "long";
}
```

## Custom Provider Registration

```typescript
import { registerApiProvider } from "@wayofmono/wo-ai";

registerApiProvider({
  id: "my-provider",
  api: "openai-completions",
  baseUrl: "https://my-api.com/v1",
  models: [{ id: "my-model", name: "My Model" }],
});
```

## Package Dependencies

- None (standalone LLM abstraction layer)

## Related Packages

- `@wayofmono/wo-agent-core` — Agent runtime that uses this for LLM calls
- `@wayofmono/wo-coding-agent` — Coding agent CLI that uses this
- `@wayofmono/wo-agent` — General agent SDK that uses this

---

*Part of the WayOfMono high-performance coding agent ecosystem.*
