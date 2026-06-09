#!/usr/bin/env deno run --allow-read --allow-write --allow-net --allow-run --allow-env

/**
 * Documentation Sync Updater
 * Fetches latest docs from all agent frontend sources and updates skills/agents.
 * Run with: deno run --allow-read --allow-write --allow-net --allow-run --allow-env docs-sync.ts
 */

import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";

interface DocSource {
  id: string;
  name: string;
  url: string;
  type: "html" | "markdown" | "json";
  enabled: boolean;
  checkIntervalHours: number;
  selectors: Record<string, string>;
  platforms: string[];
}

interface SyncConfig {
  sources: DocSource[];
  settings: {
    autoUpdateNonBreaking: boolean;
    createTicketsForBreaking: boolean;
    ticketPrefix: string;
    stateFile: string;
    notificationOnChange: boolean;
    maxConcurrentFetches: number;
    timeoutSeconds: number;
    userAgent: string;
  };
  platformMapping: Record<string, string[]>;
}

interface SourceState {
  lastFetch: string;
  etag?: string;
  contentHash: string;
  version?: string;
}

const CONFIG_PATH = join(Deno.cwd(), ".wo", "config", "docs-sync.json");
const STATE_PATH = join(Deno.cwd(), ".wo", "state", "docs-sync-state.json");

async function loadConfig(): Promise<SyncConfig> {
  try {
    const content = await Deno.readTextFile(CONFIG_PATH);
    return JSON.parse(content);
  } catch {
    const templatePath = join(Deno.cwd(), ".wo", "config", "docs-sync.template.json");
    const content = await Deno.readTextFile(templatePath);
    return JSON.parse(content);
  }
}

async function loadState(): Promise<Record<string, SourceState>> {
  try {
    const content = await Deno.readTextFile(STATE_PATH);
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function saveState(state: Record<string, SourceState>): Promise<void> {
  await Deno.mkdir(dirname(STATE_PATH), { recursive: true });
  await Deno.writeTextFile(STATE_PATH, JSON.stringify(state, null, 2));
}

function dirname(path: string): string {
  return path.substring(0, path.lastIndexOf("/"));
}

async function fetchSource(source: DocSource, state: Record<string, SourceState>): Promise<{ changed: boolean; data: any; newState: SourceState }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), source.settings?.timeoutSeconds * 1000 || 30000);

  try {
    const headers: Record<string, string> = {
      "User-Agent": "WayOfMono-DocsSync/1.0",
    };
    const prevState = state[source.id];
    if (prevState?.etag) {
      headers["If-None-Match"] = prevState.etag;
    }

    const response = await fetch(source.url, {
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.status === 304) {
      return { changed: false, data: null, newState: prevState };
    }

    const content = await response.text();
    const etag = response.headers.get("etag") || undefined;
    const contentHash = await hashContent(content);

    if (prevState?.contentHash === contentHash) {
      return { changed: false, data: null, newState: { ...prevState, lastFetch: new Date().toISOString() } };
    }

    const data = await parseContent(source, content);
    const version = extractVersion(data, source);

    return {
      changed: true,
      data,
      newState: {
        lastFetch: new Date().toISOString(),
        etag,
        contentHash,
        version,
      },
    };
  } catch (e) {
    clearTimeout(timeout);
    console.error(`  ❌ Failed to fetch ${source.name}: ${e}`);
    return { changed: false, data: null, newState: state[source.id] || { lastFetch: new Date().toISOString(), contentHash: "" } };
  }
}

async function hashContent(content: string): Promise<string> {
  const buf = new TextEncoder().encode(content);
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function parseContent(source: DocSource, content: string): Promise<any> {
  if (source.type === "html") {
    return { html: content, url: source.url };
  }
  return { raw: content, url: source.url };
}

function extractVersion(data: any, source: DocSource): string | undefined {
  return undefined;
}

async function detectChanges(source: DocSource, data: any, prevState: SourceState): Promise<{ breaking: any[]; nonBreaking: any[] }> {
  return { breaking: [], nonBreaking: [] };
}

async function createUpdateTickets(changes: any[], source: DocSource): Promise<void> {
  console.log(`  📝 Would create ${changes.length} tickets for ${source.name}`);
}

async function applyNonBreakingUpdates(changes: any[], source: DocSource): Promise<void> {
  console.log(`  🔧 Would apply ${changes.length} non-breaking updates for ${source.name}`);
}

async function syncOnce(config: SyncConfig): Promise<void> {
  console.log("🔄 Starting documentation sync...");

  const state = await loadState();
  const enabledSources = config.sources.filter(s => s.enabled);

  for (const source of enabledSources) {
    console.log(`\n📡 Fetching ${source.name} (${source.url})...`);
    const result = await fetchSource(source, state);

    if (result.changed && result.data) {
      console.log(`  🔄 Changes detected for ${source.name}`);

      const { breaking, nonBreaking } = await detectChanges(source, result.data, result.newState);

      if (config.settings.createTicketsForBreaking && breaking.length > 0) {
        await createUpdateTickets(breaking, source);
      }

      if (config.settings.autoUpdateNonBreaking && nonBreaking.length > 0) {
        await applyNonBreakingUpdates(nonBreaking, source);
      }

      state[source.id] = result.newState;
    } else {
      console.log(`  ✅ No changes for ${source.name}`);
      if (result.newState) {
        state[source.id] = result.newState;
      }
    }
  }

  await saveState(state);
  console.log("\n✅ Documentation sync complete");
}

async function main(): Promise<void> {
  const args = parse(Deno.args, {
    boolean: ["watch", "once", "status"],
    string: ["source"],
  });

  const config = await loadConfig();

  if (args.status) {
    const state = await loadState();
    console.log("📊 Documentation Sync Status:");
    for (const source of config.sources) {
      const s = state[source.id];
      if (s) {
        console.log(`  ${source.name}: last fetch ${s.lastFetch}, version ${s.version || "unknown"}`);
      } else {
        console.log(`  ${source.name}: never fetched`);
      }
    }
    return;
  }

  if (args.once || (!args.watch && !args.once)) {
    await syncOnce(config);
    return;
  }

  if (args.watch) {
    console.log("👀 Starting watch mode (Ctrl+C to stop)...");
    while (true) {
      await syncOnce(config);
      const interval = 60 * 60 * 1000;
      console.log(`😴 Sleeping for ${interval / 1000 / 60} minutes...`);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
}

if (import.meta.main) {
  await main();
}