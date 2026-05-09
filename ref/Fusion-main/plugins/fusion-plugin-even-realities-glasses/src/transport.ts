import type { GlassesCard } from "./cards.js";

export type GlassesAction = {
  type: "start-work" | "request-review" | "quick-capture";
  taskId?: string;
  text?: string;
  timestamp: string;
};

export interface GlassesTransport {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  pushCard(card: GlassesCard): Promise<void>;
  onAction(handler: (action: GlassesAction) => void | Promise<void>): void;
}

export class StubGlassesTransport implements GlassesTransport {
  private handlers: Array<(action: GlassesAction) => void | Promise<void>> = [];
  public readonly pushedCards: GlassesCard[] = [];
  public connected = false;

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async pushCard(card: GlassesCard): Promise<void> {
    this.pushedCards.push(card);
  }

  onAction(handler: (action: GlassesAction) => void | Promise<void>): void {
    this.handlers.push(handler);
  }

  async emitAction(action: GlassesAction): Promise<void> {
    for (const handler of this.handlers) {
      await handler(action);
    }
  }
}
