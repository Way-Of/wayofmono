import type { Model, Usage } from "./types.js";

export function calculateCost(model: Model, usage: Usage): number {
  let cost = 0;

  if (model.inputPrice) {
    cost += (usage.input / 1_000_000) * model.inputPrice;
  }

  if (model.outputPrice) {
    cost += (usage.output / 1_000_000) * model.outputPrice;
  }

  if (usage.cache?.input && model.cacheInputPrice) {
    cost += (usage.cache.input / 1_000_000) * model.cacheInputPrice;
  }

  if (usage.cache?.creation && model.cacheCreationPrice) {
    cost += (usage.cache.creation / 1_000_000) * model.cacheCreationPrice;
  }

  if (usage.reasoning && model.thinkingPrice) {
    cost += (usage.reasoning / 1_000_000) * model.thinkingPrice;
  }

  return cost;
}
