import type { EventHandler, ExtensionContext } from "./types.js";

interface HandlerEntry {
  handler: EventHandler;
  priority: number;
}

export class EventEmitter {
  private handlers = new Map<string, HandlerEntry[]>();

  on(event: string, handler: EventHandler, priority = 0): void {
    const entries = this.handlers.get(event) || [];
    entries.push({ handler, priority });
    entries.sort((a, b) => b.priority - a.priority);
    this.handlers.set(event, entries);
  }

  async emit(event: string, data: unknown, ctx: ExtensionContext): Promise<Array<unknown>> {
    const entries = this.handlers.get(event);
    if (!entries) return [];

    const results: Array<unknown> = [];
    for (const entry of entries) {
      try {
        const result = await entry.handler(data, ctx);
        if (result !== undefined) {
          results.push(result);
        }
      } catch (err) {
        console.error(`[wo] Error in handler for "${event}":`, err);
      }
    }
    return results;
  }

  async emitFirst(event: string, data: unknown, ctx: ExtensionContext): Promise<unknown> {
    const entries = this.handlers.get(event);
    if (!entries) return undefined;

    for (const entry of entries) {
      try {
        const result = await entry.handler(data, ctx);
        if (result !== undefined) return result;
      } catch (err) {
        console.error(`[wo] Error in handler for "${event}":`, err);
      }
    }
    return undefined;
  }

  removeAll(event?: string): void {
    if (event) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
    }
  }

  hasHandlers(event: string): boolean {
    const entries = this.handlers.get(event);
    return !!entries && entries.length > 0;
  }

  getEvents(): string[] {
    return Array.from(this.handlers.keys());
  }
}
