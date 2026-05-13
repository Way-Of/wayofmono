import type { FlagDefinition } from "./types.js";

export class FlagManager {
  private flags = new Map<string, { def: FlagDefinition; value: unknown }>();

  register(name: string, def: FlagDefinition): void {
    this.flags.set(name, { def, value: def.default });
  }

  set(name: string, value: unknown): void {
    const entry = this.flags.get(name);
    if (entry) {
      entry.value = value;
    }
  }

  get(name: string): unknown {
    return this.flags.get(name)?.value;
  }

  getAll(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [name, entry] of this.flags) {
      result[name] = entry.value;
    }
    return result;
  }
}
