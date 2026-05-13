import type { ModelRegistry, ProviderConfig } from "./types.js";

export class ModelRegistryImpl implements ModelRegistry {
  private models: Array<{ api: string; modelId: string; name: string; [key: string]: unknown }> = [];
  private providers = new Map<string, ProviderConfig>();

  constructor() {
    this.initDefaultModels();
  }

  private initDefaultModels(): void {
    this.models = [
      { api: "openai", modelId: "gpt-4o", name: "GPT-4o" },
      { api: "openai", modelId: "gpt-4o-mini", name: "GPT-4o Mini" },
      { api: "openai", modelId: "o3-mini", name: "o3-mini" },
      { api: "anthropic", modelId: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
      { api: "anthropic", modelId: "claude-haiku-3-5-20241022", name: "Claude Haiku 3.5" },
      { api: "anthropic", modelId: "claude-opus-4-20250514", name: "Claude Opus 4" },
      { api: "gemini", modelId: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
      { api: "gemini", modelId: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
    ];
  }

  getAvailable(): Array<{ api: string; modelId: string; name: string }> {
    return [...this.models];
  }

  find(query: string): Record<string, unknown> | undefined {
    return this.models.find(
      (m) => m.modelId === query || m.name === query || m.modelId.includes(query)
    );
  }

  getAll(): Array<Record<string, unknown>> {
    return [...this.models];
  }

  registerProvider(name: string, config: ProviderConfig): void {
    this.providers.set(name, config);
  }

  async refresh(): Promise<void> {
    // Providers can override this to fetch available models
  }

  getApiKeyAndHeaders(api: string): { apiKey?: string; headers?: Record<string, string> } {
    const keyMap: Record<string, string | undefined> = {
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      gemini: process.env.GEMINI_API_KEY,
    };
    return { apiKey: keyMap[api] };
  }
}
