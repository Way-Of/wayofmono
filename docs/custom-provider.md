# Custom LLM Provider

Add support for custom LLM providers in Wo.

## Overview

Wo supports custom providers via the `@wayofmono/wo-ai` provider interface. Implement the `LLMProvider` interface.

## Provider Interface

```typescript
// @wayofmono/wo-ai
interface LLMProvider {
  name: string;
  models: string[];
  defaultModel: string;
  
  // Required: Complete chat
  complete(options: CompleteOptions): Promise<CompleteResponse>;
  completeStream(options: CompleteOptions): AsyncIterable<StreamChunk>;
  
  // Optional: List models
  listModels?(): Promise<string[]>;
  
  // Optional: Health check
  healthCheck?(): Promise<boolean>;
}

interface CompleteOptions {
  messages: Message[];
  model: string;
  temperature?: number;
  maxTokens?: number;
  tools?: Tool[];
  toolChoice?: 'auto' | 'none' | 'required';
  stream?: boolean;
}

interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | ContentBlock[];
  toolCalls?: ToolCall[];
  toolCallId?: string;
}
```

## Implementation Example

### 1. Create Provider

```typescript
// my-provider.ts
import { LLMProvider, CompleteOptions, CompleteResponse, StreamChunk, Message } from '@wayofmono/wo-ai';

export class MyCustomProvider implements LLMProvider {
  name = 'my-custom';
  models = ['custom-model-v1', 'custom-model-v2'];
  defaultModel = 'custom-model-v1';

  private apiKey: string;
  private baseUrl: string;

  constructor(config: { apiKey: string; baseUrl?: string }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.custom.com/v1';
  }

  async complete(options: CompleteOptions): Promise<CompleteResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.transformRequest(options))
    });

    const data = await response.json();
    return this.transformResponse(data);
  }

  async *completeStream(options: CompleteOptions): AsyncIterable<StreamChunk> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...this.transformRequest(options), stream: true })
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
      
      for (const line of lines) {
        if (line === 'data: [DONE]') return;
        const data = JSON.parse(line.slice(6));
        yield this.transformStreamChunk(data);
      }
    }
  }

  private transformRequest(options: CompleteOptions) {
    return {
      model: options.model,
      messages: options.messages.map(m => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : m.content.map(c => c.text).join('')
      })),
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      tools: options.tools,
      tool_choice: options.toolChoice
    };
  }

  private transformResponse(data: any): CompleteResponse {
    const choice = data.choices[0];
    return {
      text: choice.message.content || '',
      toolCalls: choice.message.tool_calls?.map((tc: any) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments)
      })) || [],
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      } : undefined,
      finishReason: choice.finish_reason
    };
  }

  private transformStreamChunk(data: any): StreamChunk {
    const choice = data.choices[0];
    return {
      text: choice.delta?.content || '',
      toolCalls: choice.delta?.tool_calls?.map((tc: any) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: tc.function.arguments
      })) || [],
      finishReason: choice.finish_reason
    };
  }
}
```

### 2. Register Provider

```typescript
// Register globally
import { registerProvider } from '@wayofmono/wo-ai';
import { MyCustomProvider } from './my-provider';

registerProvider('my-custom', new MyCustomProvider({
  apiKey: process.env.MY_CUSTOM_API_KEY,
  baseUrl: 'https://api.custom.com/v1'
}));
```

### 3. Configure in models.json

```json
{
  "providers": {
    "my-custom": {
      "apiKey": "${MY_CUSTOM_API_KEY}",
      "baseUrl": "https://api.custom.com/v1",
      "models": ["custom-model-v1", "custom-model-v2"]
    }
  },
  "defaultProvider": "my-custom",
  "defaultModel": "custom-model-v1"
}
```

## OpenAI-Compatible APIs

For OpenAI-compatible endpoints (vLLM, TGI, LocalAI, etc.):

```typescript
import { OpenAICompatibleProvider } from '@wayofmono/wo-ai';

const provider = new OpenAICompatibleProvider({
  name: 'vllm',
  baseUrl: 'http://localhost:8000/v1',
  apiKey: 'dummy',  // Often not required
  models: ['meta-llama/Meta-Llama-3.1-8B-Instruct'],
  defaultModel: 'meta-llama/Meta-Llama-3.1-8B-Instruct'
});

registerProvider('vllm', provider);
```

## Azure OpenAI

```typescript
import { AzureOpenAIProvider } from '@wayofmono/wo-ai';

const provider = new AzureOpenAIProvider({
  endpoint: 'https://my-resource.openai.azure.com',
  apiKey: process.env.AZURE_OPENAI_KEY,
  apiVersion: '2024-02-15-preview',
  deployments: {
    'gpt-4o': 'my-gpt4o-deployment',
    'gpt-4o-mini': 'my-gpt4o-mini-deployment'
  }
});

registerProvider('azure', provider);
```

## Bedrock (AWS)

```typescript
import { BedrockProvider } from '@wayofmono/wo-ai';

const provider = new BedrockProvider({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  models: [
    'anthropic.claude-3-5-sonnet-20240620-v1:0',
    'meta.llama3-1-70b-instruct-v1:0'
  ]
});

registerProvider('bedrock', provider);
```

## Vertex AI (Google Cloud)

```typescript
import { VertexAIProvider } from '@wayofmono/wo-ai';

const provider = new VertexAIProvider({
  project: 'my-gcp-project',
  location: 'us-central1',
  credentials: './service-account.json',  // or ADC
  models: ['gemini-1.5-pro', 'gemini-1.5-flash']
});

registerProvider('vertex', provider);
```

## Testing

```typescript
import { createLLMClient } from '@wayofmono/wo-ai';

const client = createLLMClient({
  provider: 'my-custom',
  model: 'custom-model-v1'
});

const response = await client.complete({
  messages: [{ role: 'user', content: 'Test' }]
});

console.log(response.text);
```

## Publishing

```bash
npm publish --access public
```

Then users install:
```bash
npm install @myorg/wo-provider-custom
```

And register in their code:
```typescript
import { registerProvider } from '@wayofmono/wo-ai';
import { CustomProvider } from '@myorg/wo-provider-custom';

registerProvider('custom', new CustomProvider({ apiKey: '...' }));
```

## Related

- [SDK](sdk.md)
- [Models](models.md)
- [Wo AI Package](https://www.npmjs.com/package/@wayofmono/wo-ai)