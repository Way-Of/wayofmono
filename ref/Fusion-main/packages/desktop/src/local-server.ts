import type { AddressInfo } from "node:net";
import { once } from "node:events";
import type { Server } from "node:http";
type TaskStoreLike = {
  init(): Promise<void>;
  watch(): Promise<void>;
  close(): void;
};

export interface DesktopLocalRuntime {
  store: TaskStoreLike;
  server: Server;
  port: number;
}

export interface DesktopLocalServerState {
  status: "idle" | "starting" | "ready" | "error";
  port?: number;
  error?: string | null;
}

export class DesktopLocalServerManager {
  private runtime: DesktopLocalRuntime | null = null;
  private state: DesktopLocalServerState = { status: "idle", error: null };

  constructor(private readonly rootDir: string) {}

  getState(): DesktopLocalServerState {
    return this.state;
  }

  getPort(): number | undefined {
    return this.runtime?.port;
  }

  async start(): Promise<DesktopLocalRuntime> {
    if (this.runtime) {
      this.state = { status: "ready", port: this.runtime.port, error: null };
      return this.runtime;
    }

    this.state = { status: "starting", error: null };

    try {
      const { TaskStore } = await import("@fusion/core");
      const { createServer } = await import("@fusion/dashboard");
      const store = new TaskStore(this.rootDir) as TaskStoreLike;
      await store.init();
      await store.watch();
      const app = createServer(store);
      const server = app.listen(0);

      await Promise.race([
        once(server, "listening"),
        once(server, "error").then(([error]) => {
          throw error;
        }),
      ]);

      const address = server.address() as AddressInfo | null;
      if (!address?.port) {
        throw new Error("Failed to resolve local server port");
      }

      this.runtime = { store, server, port: address.port };
      this.state = { status: "ready", port: address.port, error: null };
      return this.runtime;
    } catch (error) {
      this.state = {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      };
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.runtime) {
      this.state = { status: "idle", error: null };
      return;
    }

    const runtime = this.runtime;
    this.runtime = null;

    await new Promise<void>((resolve) => runtime.server.close(() => resolve()));
    runtime.store.close();
    this.state = { status: "idle", error: null };
  }
}
