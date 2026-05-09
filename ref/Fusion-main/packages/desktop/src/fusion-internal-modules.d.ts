declare module "@fusion/core" {
  export class TaskStore {
    constructor(rootDir: string);
    init(): Promise<void>;
    watch(): Promise<void>;
    close(): void;
  }
}

declare module "@fusion/dashboard" {
  import type { Server } from "node:http";

  export function createServer(store: {
    init(): Promise<void>;
    watch(): Promise<void>;
    close(): void;
  }): {
    listen(port?: number): Server;
  };
}
