import type { CustomProvider } from "@fusion/core";

interface ModelRegistryLike {
  registerProvider: (name: string, config: {
    baseUrl: string;
    api: string;
    apiKey?: string;
    models: Array<{
      id: string;
      name: string;
      reasoning: boolean;
      input: ("text" | "image")[];
      cost: { input: number; output: number; cacheRead: number; cacheWrite: number };
      contextWindow: number;
      maxTokens: number;
    }>;
  }) => void;
  refresh: () => void;
}

export function resolveApiType(apiType: string): string {
  if (apiType === "anthropic-compatible") {
    return "anthropic";
  }
  return "openai-completions";
}

function toProviderConfig(provider: CustomProvider) {
  return {
    baseUrl: provider.baseUrl,
    api: resolveApiType(provider.apiType),
    apiKey: provider.apiKey,
    models: (provider.models ?? []).map((model) => ({
      id: model.id,
      name: model.name,
      reasoning: false,
      input: ["text" as const],
      cost: {
        input: 0,
        output: 0,
        cacheRead: 0,
        cacheWrite: 0,
      },
      contextWindow: 128000,
      maxTokens: 16384,
    })),
  };
}

function providersDiffer(previous: CustomProvider, current: CustomProvider): boolean {
  return JSON.stringify(toProviderConfig(previous)) !== JSON.stringify(toProviderConfig(current));
}

export function registerCustomProviders(
  modelRegistry: ModelRegistryLike,
  customProviders: CustomProvider[] | undefined,
  logFn: (message: string) => void,
): void {
  for (const provider of customProviders ?? []) {
    try {
      modelRegistry.registerProvider(provider.id, toProviderConfig(provider));
      logFn(`Registered custom provider ${provider.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logFn(`Failed to register custom provider ${provider.id}: ${message}`);
    }
  }

  modelRegistry.refresh();
}

export function reregisterCustomProviders(
  modelRegistry: ModelRegistryLike,
  previousProviders: CustomProvider[] | undefined,
  currentProviders: CustomProvider[] | undefined,
  logFn: (message: string) => void,
): void {
  const previousById = new Map((previousProviders ?? []).map((provider) => [provider.id, provider]));

  for (const provider of currentProviders ?? []) {
    const previous = previousById.get(provider.id);
    if (previous && !providersDiffer(previous, provider)) {
      continue;
    }

    try {
      modelRegistry.registerProvider(provider.id, toProviderConfig(provider));
      logFn(`${previous ? "Updated" : "Registered"} custom provider ${provider.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logFn(`Failed to register custom provider ${provider.id}: ${message}`);
    }
  }

  modelRegistry.refresh();
}
