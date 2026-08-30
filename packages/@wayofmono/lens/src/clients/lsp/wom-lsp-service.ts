/**
 * Wom-LSP-Service Layer
 *
 * Specialized WayOfMono (Wom) LSP orchestration engine.
 * Handles polyglot language server lifecycles, real-time diagnostic aggregation,
 * and idle-resource reaping.
 */

import * as nodeFs from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

// --- Types ---

export interface LSPClient {
  serverId: string;
  isAlive(): boolean;
  shutdown(): Promise<void>;
  notifyOpen(path: string, content: string, languageId: string): Promise<void>;
  notifyChange(path: string, content: string): Promise<void>;
  getDiagnostics(path: string): Promise<WomDiagnostic[]>;
}

export interface WomDiagnostic {
  id: string;
  message: string;
  severity: "error" | "warning" | "info";
  line: number;
  column: number;
  tool: string;
}

export interface LSPState {
  clients: Map<string, LSPClient>; // key: "serverId:root"
  idleTimers: Map<string, NodeJS.Timeout>; // Idle reaping timers
}

// --- Service ---

export class WomLSPDiscoveryService {
  private state: LSPState = {
    clients: new Map(),
    idleTimers: new Map(),
  };

  private readonly IDLE_TIMEOUT_MS = 240_000; // 4 minutes

  /**
   * Sync file content with active LSP servers.
   */
  async syncFile(filePath: string, content: string, languageId: string): Promise<void> {
    const clients = await this.getClientsForFile(filePath);
    for (const client of clients) {
      await client.notifyOpen(filePath, content, languageId);
      this.resetIdleTimer(client);
    }
  }

  /**
   * Collect aggregated diagnostics from all relevant servers.
   */
  async aggregateDiagnostics(filePath: string): Promise<WomDiagnostic[]> {
    const clients = await this.getClientsForFile(filePath);
    const results = await Promise.all(clients.map(c => c.getDiagnostics(filePath)));
    return this.mergeAndDedup(results.flat());
  }

  /**
   * Internal: Get or spawn clients for a file.
   * (Stub for now, will implement discovery logic in next step)
   */
  private async getClientsForFile(filePath: string): Promise<LSPClient[]> {
    // Discovery logic will be implemented here
    return [];
  }

  private resetIdleTimer(client: LSPClient): void {
    const key = `${client.serverId}`; // Simplified key for now
    if (this.state.idleTimers.has(key)) {
      clearTimeout(this.state.idleTimers.get(key));
    }

    const timer = setTimeout(() => {
      this.reapClient(client);
    }, this.IDLE_TIMEOUT_MS);

    this.state.idleTimers.set(key, timer);
  }

  private async reapClient(client: LSPClient): Promise<void> {
    console.log(`[Wom-Lens] Reaping idle LSP server: ${client.serverId}`);
    await client.shutdown();
    this.state.clients.delete(client.serverId);
    this.state.idleTimers.delete(client.serverId);
  }

  private mergeAndDedup(diags: WomDiagnostic[]): WomDiagnostic[] {
    const seen = new Set<string>();
    return diags.filter(d => {
      const key = `${d.line}:${d.column}:${d.message}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async shutdown(): Promise<void> {
    for (const timer of this.state.idleTimers.values()) {
      clearTimeout(timer);
    }
    for (const client of this.state.clients.values()) {
      await client.shutdown();
    }
    this.state.clients.clear();
    this.state.idleTimers.clear();
  }
}

// --- Singleton ---

let _instance: WomLSPDiscoveryService | null = null;

export function getWomLSPService(): WomLSPDiscoveryService {
  if (!_instance) {
    _instance = new WomLSPDiscoveryService();
  }
  return _instance;
}
