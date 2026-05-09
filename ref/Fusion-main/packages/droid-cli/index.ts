import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import {
  streamViaCli,
  discoverDroidModels,
  validateCliPresenceAsync,
  validateCliAuthAsync,
  killAllProcesses,
  getCustomToolDefs,
  toolsFromContext,
  writeMcpConfig,
  type McpToolDef,
} from "@fusion-plugin-examples/droid-runtime";
import { createHash } from "node:crypto";

process.on("exit", killAllProcesses);

const PROVIDER_ID = "droid-cli";

let cliValidationPromise: Promise<void> | undefined;
type DiscoveredModel = { id: string; name: string; reasoning: boolean; input: Array<"text" | "image">; cost: { input: number; output: number; cacheRead: number; cacheWrite: number }; contextWindow: number; maxTokens: number };
let discoveredModelsPromise: Promise<DiscoveredModel[]> | undefined;
type StreamSimpleHandler = NonNullable<Parameters<ExtensionAPI["registerProvider"]>[1]["streamSimple"]>;

function runCliValidationOnce(): Promise<void> {
  if (cliValidationPromise) return cliValidationPromise;
  cliValidationPromise = (async () => {
    const presence = await validateCliPresenceAsync();
    if (!presence.ok) {
      console.warn(`[droid-cli] ${presence.error.message}`);
      return;
    }
    await validateCliAuthAsync();
  })();
  return cliValidationPromise;
}

async function getDiscoveredModels() {
  if (!discoveredModelsPromise) {
    discoveredModelsPromise = (async () => {
      try {
        const ids = Array.from(new Set(await discoverDroidModels()));
        if (ids.length === 0) return [];
        return ids.map((id) => ({
          id,
          name: id,
          reasoning: true,
          input: ["text", "image"] as Array<"text" | "image">,
          cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
          contextWindow: 200_000,
          maxTokens: 8_192,
        }));
      } catch (error) {
        console.warn("[droid-cli] model auto-discovery failed; registering provider with empty model list", error);
        return [];
      }
    })();
  }
  return discoveredModelsPromise;
}

let cachedMcpConfig: { hash: string; configPath: string } | undefined;

function ensureMcpConfig(
  pi: ExtensionAPI,
  contextTools?: ReadonlyArray<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }>,
): string | undefined {
  try {
    let toolDefs: McpToolDef[] = toolsFromContext(contextTools);

    if (toolDefs.length === 0) {
      const allTools = pi.getAllTools();
      if (!Array.isArray(allTools)) return cachedMcpConfig?.configPath;
      toolDefs = getCustomToolDefs(pi);
    }

    if (toolDefs.length === 0) {
      cachedMcpConfig = undefined;
      return undefined;
    }

    const hash = createHash("sha1").update(JSON.stringify(toolDefs)).digest("hex").slice(0, 12);
    if (cachedMcpConfig?.hash === hash) return cachedMcpConfig.configPath;

    const configPath = writeMcpConfig(toolDefs, hash);
    cachedMcpConfig = { hash, configPath };
    return configPath;
  } catch {
    return cachedMcpConfig?.configPath;
  }
}

export default function (pi: ExtensionAPI) {
  void runCliValidationOnce();

  pi.on("session_start", async () => {
    const allTools = pi.getAllTools();
    if (Array.isArray(allTools)) {
      pi.setActiveTools(allTools.map((t: { name: string }) => t.name));
    }
  });

  void (async () => {
    const models = await getDiscoveredModels();
    try {
      pi.registerProvider(PROVIDER_ID, {
        baseUrl: "droid-cli",
        apiKey: "unused",
        api: "droid-cli",
        models,
        streamSimple: ((model, context, options) => {
          const configPath = ensureMcpConfig(
            pi,
            (context as { tools?: ReadonlyArray<{ name: string; description: string; parameters: Record<string, unknown> }> }).tools,
          );
          return streamViaCli(
            model,
            context as never,
            { ...(options ?? {}), mcpConfigPath: configPath } as never,
          ) as unknown as ReturnType<StreamSimpleHandler>;
        }) as StreamSimpleHandler,
      });
    } catch (err) {
      console.error("[droid-cli] Failed to register provider:", err);
    }
  })();
}
