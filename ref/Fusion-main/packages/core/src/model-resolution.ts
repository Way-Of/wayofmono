import type { Settings } from "./types.js";

export interface ResolvedModelSelection {
  provider?: string;
  modelId?: string;
}

type ModelPair =
  | ResolvedModelSelection
  | {
      provider?: string | null;
      modelId?: string | null;
    }
  | undefined;

type TaskModelLike = {
  modelProvider?: string | null;
  modelId?: string | null;
  validatorModelProvider?: string | null;
  validatorModelId?: string | null;
  planningModelProvider?: string | null;
  planningModelId?: string | null;
};

function hasCompleteModelPair(pair: ModelPair): pair is { provider: string; modelId: string } {
  return Boolean(pair?.provider && pair?.modelId);
}

function pickFirstModelPair(...pairs: ModelPair[]): ResolvedModelSelection {
  for (const pair of pairs) {
    if (hasCompleteModelPair(pair)) {
      return { provider: pair.provider, modelId: pair.modelId };
    }
  }
  return {};
}

export function resolveProjectDefaultModel(settings?: Partial<Settings>): ResolvedModelSelection {
  return pickFirstModelPair(
    {
      provider: settings?.defaultProviderOverride,
      modelId: settings?.defaultModelIdOverride,
    },
    {
      provider: settings?.defaultProvider,
      modelId: settings?.defaultModelId,
    },
  );
}

export function resolveExecutionSettingsModel(settings?: Partial<Settings>): ResolvedModelSelection {
  return pickFirstModelPair(
    {
      provider: settings?.executionProvider,
      modelId: settings?.executionModelId,
    },
    {
      provider: settings?.executionGlobalProvider,
      modelId: settings?.executionGlobalModelId,
    },
    resolveProjectDefaultModel(settings),
  );
}

export function resolvePlanningSettingsModel(settings?: Partial<Settings>): ResolvedModelSelection {
  return pickFirstModelPair(
    {
      provider: settings?.planningProvider,
      modelId: settings?.planningModelId,
    },
    {
      provider: settings?.planningGlobalProvider,
      modelId: settings?.planningGlobalModelId,
    },
    resolveProjectDefaultModel(settings),
  );
}

export function resolveValidatorSettingsModel(settings?: Partial<Settings>): ResolvedModelSelection {
  return pickFirstModelPair(
    {
      provider: settings?.validatorProvider,
      modelId: settings?.validatorModelId,
    },
    {
      provider: settings?.validatorGlobalProvider,
      modelId: settings?.validatorGlobalModelId,
    },
    resolveProjectDefaultModel(settings),
  );
}

export function resolveTitleSummarizerSettingsModel(settings?: Partial<Settings>): ResolvedModelSelection {
  return pickFirstModelPair(
    {
      provider: settings?.titleSummarizerProvider,
      modelId: settings?.titleSummarizerModelId,
    },
    {
      provider: settings?.titleSummarizerGlobalProvider,
      modelId: settings?.titleSummarizerGlobalModelId,
    },
    {
      provider: settings?.planningProvider,
      modelId: settings?.planningModelId,
    },
    resolveProjectDefaultModel(settings),
  );
}

export function resolveTaskExecutionModel(
  task: TaskModelLike,
  settings?: Partial<Settings>,
): ResolvedModelSelection {
  return pickFirstModelPair(
    {
      provider: task.modelProvider,
      modelId: task.modelId,
    },
    resolveExecutionSettingsModel(settings),
  );
}

export function resolveTaskValidatorModel(
  task: TaskModelLike,
  settings?: Partial<Settings>,
): ResolvedModelSelection {
  return pickFirstModelPair(
    {
      provider: task.validatorModelProvider,
      modelId: task.validatorModelId,
    },
    resolveValidatorSettingsModel(settings),
  );
}

export function resolveTaskPlanningModel(
  task: TaskModelLike,
  settings?: Partial<Settings>,
): ResolvedModelSelection {
  return pickFirstModelPair(
    {
      provider: task.planningModelProvider,
      modelId: task.planningModelId,
    },
    resolvePlanningSettingsModel(settings),
  );
}
