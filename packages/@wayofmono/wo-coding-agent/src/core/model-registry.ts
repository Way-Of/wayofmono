export interface ModelRecord {
  id: string;
  provider: string;
  name: string;
  maxTokens: number;
  supportsThinking: boolean;
  inputPrice: number;
  outputPrice: number;
}

export type ModelSource = "builtin" | "custom" | "extension";

export class ModelRegistry {
  private models: Map<string, ModelRecord> = new Map();
  private providers: Map<string, { streamSimple?: unknown; completeSimple?: unknown }> = new Map();

  static create(): ModelRegistry {
    const reg = new ModelRegistry();
    reg.initDefaultModels();
    return reg;
  }

  private initDefaultModels(): void {
    const defaults: ModelRecord[] = [
      { id: "gpt-4o", provider: "openai", name: "GPT-4o", maxTokens: 128000, supportsThinking: false, inputPrice: 2.50, outputPrice: 10.00 },
      { id: "gpt-4o-mini", provider: "openai", name: "GPT-4o Mini", maxTokens: 128000, supportsThinking: false, inputPrice: 0.15, outputPrice: 0.60 },
      { id: "o3-mini", provider: "openai", name: "O3 Mini", maxTokens: 200000, supportsThinking: true, inputPrice: 1.10, outputPrice: 4.40 },
      { id: "claude-sonnet-4-20250514", provider: "anthropic", name: "Claude Sonnet 4", maxTokens: 200000, supportsThinking: true, inputPrice: 3.00, outputPrice: 15.00 },
      { id: "claude-haiku-3-5-20241022", provider: "anthropic", name: "Claude Haiku 3.5", maxTokens: 200000, supportsThinking: false, inputPrice: 0.80, outputPrice: 4.00 },
      { id: "claude-opus-4-20250514", provider: "anthropic", name: "Claude Opus 4", maxTokens: 200000, supportsThinking: true, inputPrice: 15.00, outputPrice: 75.00 },
      { id: "gemini-2.5-flash", provider: "gemini", name: "Gemini 2.5 Flash", maxTokens: 1048576, supportsThinking: true, inputPrice: 0.15, outputPrice: 0.60 },
      { id: "gemini-2.5-pro", provider: "gemini", name: "Gemini 2.5 Pro", maxTokens: 1048576, supportsThinking: true, inputPrice: 1.25, outputPrice: 10.00 },
    ];
    for (const m of defaults) {
      this.models.set(`${m.provider}:${m.id}`, m);
    }
  }

  find(query: string): ModelRecord | undefined {
    for (const m of this.models.values()) {
      if (m.id === query || m.name === query || m.id.includes(query)) return m;
    }
    return undefined;
  }

  getAvailable(): ModelRecord[] {
    return Array.from(this.models.values());
  }

  getAll(): ModelRecord[] {
    return Array.from(this.models.values());
  }

  register(record: ModelRecord, source: ModelSource = "custom"): void {
    this.models.set(`${record.provider}:${record.id}`, record);
  }

  registerProvider(name: string, config: { streamSimple?: unknown; completeSimple?: unknown }): void {
    this.providers.set(name, config);
  }

  getApiKeyAndHeaders(provider: string): { apiKey?: string; headers?: Record<string, string> } {
    const envMap: Record<string, string> = {
      anthropic: "ANTHROPIC_API_KEY",
      openai: "OPENAI_API_KEY",
      gemini: "GEMINI_API_KEY",
    };
    const envKey = envMap[provider];
    const apiKey = envKey ? process.env[envKey] : undefined;
    return { apiKey };
  }
}
