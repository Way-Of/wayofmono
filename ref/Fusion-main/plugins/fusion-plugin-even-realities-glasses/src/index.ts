import { definePlugin } from "@fusion/plugin-sdk";
import type { FusionPlugin, PluginContext, PluginRouteDefinition, PluginRouteResponse } from "@fusion/plugin-sdk";
import { FusionApiClient } from "./fusion-api-client.js";
import { createNotifier } from "./notifier.js";
import { quickCaptureRoutes } from "./routes/quick-capture-routes.js";
import { createNotificationRoutes } from "./routes/notification-routes.js";
import { agentActionRoutes } from "./routes/agent-action-routes.js";
import { getFusionBaseUrl, getFusionToken, getNotifyColumns, settingsSchema } from "./settings.js";
import { StubGlassesTransport } from "./transport.js";

export type PluginDb = {
  exec(sql: string): void;
  prepare(sql: string): {
    get(...args: unknown[]): unknown;
    all(...args: unknown[]): unknown;
    run(...args: unknown[]): unknown;
  };
};

type PluginInstance = {
  client: FusionApiClient;
  transport: StubGlassesTransport;
  notifier: ReturnType<typeof createNotifier>;
};

const instances = new Map<string, PluginInstance>();

function getDbFromTaskStore(ctx: PluginContext): PluginDb {
  const pluginStore = ctx.taskStore.getPluginStore();
  const db = (pluginStore as unknown as { db?: PluginDb }).db;
  if (!db) throw new Error("Plugin database unavailable");
  return db;
}

function getInstanceOrResponse(ctx: PluginContext): { instance?: PluginInstance; error?: PluginRouteResponse } {
  const instance = instances.get(ctx.pluginId);
  if (!instance) return { error: { status: 503, body: { error: "Plugin instance not initialized" } } };
  return { instance };
}

const coreRoutes: PluginRouteDefinition[] = [
  {
    method: "GET",
    path: "/status",
    handler: async (_req, ctx) => {
      const { instance, error } = getInstanceOrResponse(ctx);
      if (!instance) return error as PluginRouteResponse;
      return {
        status: 200,
        body: {
          connected: instance.transport.connected,
          lastPollTime: instance.notifier.lastPolledAt() ?? null,
          notifyOnColumns: getNotifyColumns(ctx.settings),
        },
      };
    },
  },
  {
    method: "POST",
    path: "/reconnect",
    handler: async (_req, ctx) => {
      const { instance, error } = getInstanceOrResponse(ctx);
      if (!instance) return error as PluginRouteResponse;
      await instance.transport.disconnect();
      await instance.transport.connect();
      return { status: 200, body: { ok: true } };
    },
  },
];

const notificationRoutes = createNotificationRoutes((ctx) => instances.get(ctx.pluginId)?.notifier);

const plugin: FusionPlugin = definePlugin({
  manifest: {
    id: "fusion-plugin-even-realities-glasses",
    name: "Even Realities Glasses",
    version: "0.1.0",
    description: "Task-focused card bridge between Fusion and Even Realities glasses.",
    author: "Fusion Team",
    fusionVersion: ">=0.1.0",
    settingsSchema,
  },
  state: "installed",
  routes: [...coreRoutes, ...quickCaptureRoutes, ...agentActionRoutes, ...notificationRoutes],
  hooks: {
    onSchemaInit: (db) => {
      (db as PluginDb).exec(`
        CREATE TABLE IF NOT EXISTS even_realities_seen_tasks (
          taskId TEXT PRIMARY KEY,
          lastColumn TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )
      `);
    },
    onLoad: async (ctx) => {
      const token = getFusionToken(ctx.settings);
      if (!token) {
        ctx.logger.warn("fusionApiToken is missing; even-realities plugin not initialized");
        return;
      }
      const db = getDbFromTaskStore(ctx);
      const client = new FusionApiClient(getFusionBaseUrl(ctx.settings), token);
      const transport = new StubGlassesTransport();
      await transport.connect();
      const notifier = createNotifier({
        taskStore: ctx.taskStore,
        db,
        transport,
        settings: ctx.settings,
        logger: ctx.logger,
        pluginId: ctx.pluginId,
      });
      notifier.start();
      instances.set(ctx.pluginId, { client, transport, notifier });
    },
    onUnload: async () => {
      for (const [pluginId, instance] of instances.entries()) {
        await instance.notifier.stop();
        await instance.transport.disconnect();
        instances.delete(pluginId);
      }
    },
  },
});

export default plugin;
