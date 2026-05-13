import type { Api, Model, ThinkingLevel, ModelConfig } from "./types.js";

const modelRegistry = new Map<string, Model>();

export function registerModel(model: Model): void {
  const key = `${model.api}:${model.modelId}`;
  modelRegistry.set(key, model);
}

export function getModel(provider: string, id: string): Model | undefined {
  const key = `${provider}:${id}`;
  return modelRegistry.get(key);
}

export function getModels(): Model[] {
  return Array.from(modelRegistry.values());
}

export function getModelsByApi(api: Api): Model[] {
  return getModels().filter((m) => m.api === api);
}

export function getSupportedThinkingLevels(model: Model): ThinkingLevel[] {
  if (!model.supportsThinking) return ["none"];
  if (model.api === "anthropic") return ["none", "low", "medium", "high"];
  if (model.api === "openai") return ["none", "low", "medium", "high"];
  return ["none", "low", "medium"];
}

export function resolveModelConfig(config: ModelConfig): { model: Model; apiKey?: string; baseUrl?: string } {
  const api = config.api || "openai";
  const modelId = config.modelId || "gpt-4o";
  const key = `${api}:${modelId}`;
  const model = modelRegistry.get(key);

  if (!model) {
    const fallback: Model = {
      api: api as Api,
      modelId,
      name: modelId,
      provider: config.provider || api,
      maxTokens: config.maxTokens || 8192,
      supportsThinking: false,
      supportsSystemPrompt: true,
      supportsTools: true,
      supportsImages: true,
    };
    return { model: fallback, apiKey: config.apiKey, baseUrl: config.baseUrl };
  }

  return { model, apiKey: config.apiKey, baseUrl: config.baseUrl };
}

export function initDefaultModels(): void {
  const models: Model[] = [
    { api: "openai", modelId: "gpt-4o", name: "GPT-4o", provider: "openai", maxTokens: 128000, supportsThinking: false, supportsSystemPrompt: true, supportsTools: true, supportsImages: true, inputPrice: 2.5, outputPrice: 10 },
    { api: "openai", modelId: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai", maxTokens: 128000, supportsThinking: false, supportsSystemPrompt: true, supportsTools: true, supportsImages: true, inputPrice: 0.15, outputPrice: 0.6 },
    { api: "openai", modelId: "o3-mini", name: "o3-mini", provider: "openai", maxTokens: 200000, supportsThinking: true, supportsSystemPrompt: true, supportsTools: true, supportsImages: false, inputPrice: 1.1, outputPrice: 4.4 },
    { api: "anthropic", modelId: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", provider: "anthropic", maxTokens: 200000, supportsThinking: true, supportsSystemPrompt: true, supportsTools: true, supportsImages: true, supportsCacheControl: true, inputPrice: 3, outputPrice: 15, cacheInputPrice: 0.3, cacheCreationPrice: 3.75 },
    { api: "anthropic", modelId: "claude-haiku-3-5-20241022", name: "Claude Haiku 3.5", provider: "anthropic", maxTokens: 200000, supportsThinking: false, supportsSystemPrompt: true, supportsTools: true, supportsImages: true, supportsCacheControl: true, inputPrice: 0.8, outputPrice: 4, cacheInputPrice: 0.08, cacheCreationPrice: 1 },
    { api: "anthropic", modelId: "claude-opus-4-20250514", name: "Claude Opus 4", provider: "anthropic", maxTokens: 200000, supportsThinking: true, supportsSystemPrompt: true, supportsTools: true, supportsImages: true, supportsCacheControl: true, inputPrice: 15, outputPrice: 75, cacheInputPrice: 1.5, cacheCreationPrice: 18.75 },
    { api: "gemini", modelId: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "google", maxTokens: 1048576, supportsThinking: true, supportsSystemPrompt: true, supportsTools: true, supportsImages: true, inputPrice: 0.15, outputPrice: 0.6 },
    { api: "gemini", modelId: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "google", maxTokens: 1048576, supportsThinking: true, supportsSystemPrompt: true, supportsTools: true, supportsImages: true, inputPrice: 1.25, outputPrice: 10 },
  ];

  for (const model of models) {
    registerModel(model);
  }
}
