// @vitest-environment node

import express from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TaskStore, GlobalSettings, CustomProvider } from "@fusion/core";
import { createApiRoutes } from "../../routes.js";
import { request as performRequest } from "../../test-request.js";

function createMockGlobalSettingsStore(settings: GlobalSettings) {
  return {
    getSettings: vi.fn(async () => settings),
    updateSettings: vi.fn(),
    getSettingsPath: vi.fn(),
    init: vi.fn(),
    invalidateCache: vi.fn(),
  };
}

function createMockStore(settings: GlobalSettings, onUpdate: (patch: Partial<GlobalSettings>) => void): TaskStore {
  const globalSettingsStore = createMockGlobalSettingsStore(settings);
  return {
    getTask: vi.fn(),
    listTasks: vi.fn().mockResolvedValue([]),
    searchTasks: vi.fn().mockResolvedValue([]),
    createTask: vi.fn(),
    moveTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    mergeTask: vi.fn(),
    archiveTask: vi.fn(),
    unarchiveTask: vi.fn(),
    getSettings: vi.fn().mockResolvedValue({}),
    getSettingsFast: vi.fn().mockResolvedValue({}),
    updateSettings: vi.fn(),
    updateGlobalSettings: vi.fn(async (patch: Partial<GlobalSettings>) => {
      onUpdate(patch);
      Object.assign(settings, patch);
      return settings;
    }),
    getSettingsByScope: vi.fn().mockResolvedValue({ global: settings, project: {} }),
    getSettingsByScopeFast: vi.fn().mockResolvedValue({ global: settings, project: {} }),
    getGlobalSettingsStore: vi.fn(() => globalSettingsStore),
    logEntry: vi.fn(),
    getAgentLogs: vi.fn().mockResolvedValue([]),
    getAgentLogCount: vi.fn().mockResolvedValue(0),
    getAgentLogsByTimeRange: vi.fn().mockResolvedValue([]),
    addSteeringComment: vi.fn(),
    addTaskComment: vi.fn(),
    updateTaskComment: vi.fn(),
    deleteTaskComment: vi.fn(),
    getTaskDocuments: vi.fn().mockResolvedValue([]),
    getTaskDocument: vi.fn().mockResolvedValue(null),
    getTaskDocumentRevisions: vi.fn().mockResolvedValue([]),
    getAllDocuments: vi.fn().mockResolvedValue([]),
    upsertTaskDocument: vi.fn(),
    deleteTaskDocument: vi.fn(),
    updatePrInfo: vi.fn(),
    updateIssueInfo: vi.fn(),
    getRootDir: vi.fn().mockReturnValue("/fake/root"),
    getFusionDir: vi.fn().mockReturnValue("/fake/root/.fusion"),
    getDatabase: vi.fn(),
    listWorkflowSteps: vi.fn().mockResolvedValue([]),
    createWorkflowStep: vi.fn(),
    getWorkflowStep: vi.fn(),
    updateWorkflowStep: vi.fn(),
    deleteWorkflowStep: vi.fn(),
    getMissionStore: vi.fn(),
  } as unknown as TaskStore;
}

async function REQUEST(
  app: express.Express,
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; body: any }> {
  const payload = body === undefined ? undefined : JSON.stringify(body);
  const res = await performRequest(
    app,
    method,
    path,
    payload,
    body === undefined ? undefined : { "Content-Type": "application/json" },
  );
  return { status: res.status, body: res.body };
}

function createApp(settings: GlobalSettings, onUpdate: (patch: Partial<GlobalSettings>) => void = () => undefined) {
  const app = express();
  app.use(express.json());
  app.use("/api", createApiRoutes(createMockStore(settings, onUpdate)));
  return app;
}

describe("custom provider routes", () => {
  let settings: GlobalSettings;

  beforeEach(() => {
    settings = {};
  });

  it("GET /custom-providers returns empty array when none configured", async () => {
    const app = createApp(settings);
    const res = await REQUEST(app, "GET", "/api/custom-providers");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("GET /custom-providers masks API keys", async () => {
    settings.customProviders = [
      {
        id: "cp-1",
        name: "OpenAI Proxy",
        apiType: "openai-compatible",
        baseUrl: "https://proxy.example.com/v1",
        apiKey: "sk-test-secret-key-1234",
      },
      {
        id: "cp-2",
        name: "Anthropic Proxy",
        apiType: "anthropic-compatible",
        baseUrl: "https://anthropic.example.com",
        apiKey: "short",
      },
    ];

    const app = createApp(settings);
    const res = await REQUEST(app, "GET", "/api/custom-providers");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: "cp-1",
        name: "OpenAI Proxy",
        apiType: "openai-compatible",
        baseUrl: "https://proxy.example.com/v1",
        apiKey: "sk-•••••1234",
      },
      {
        id: "cp-2",
        name: "Anthropic Proxy",
        apiType: "anthropic-compatible",
        baseUrl: "https://anthropic.example.com",
        apiKey: "••••••••",
      },
    ]);
  });

  it("POST /custom-providers creates provider with auto-generated id", async () => {
    const updates: Array<Partial<GlobalSettings>> = [];
    const app = createApp(settings, (patch) => updates.push(patch));

    const res = await REQUEST(app, "POST", "/api/custom-providers", {
      name: "My Provider",
      apiType: "openai-compatible",
      baseUrl: "https://example.com/v1",
      apiKey: "sk-my-secret-5678",
      models: [{ id: "gpt-4.1", name: "GPT 4.1" }],
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(res.body.apiKey).toBe("sk-•••••5678");
    expect(updates).toHaveLength(1);

    const persisted = updates[0].customProviders as CustomProvider[];
    expect(persisted[0]?.apiKey).toBe("sk-my-secret-5678");
  });

  it("POST /custom-providers rejects missing name", async () => {
    const app = createApp(settings);
    const res = await REQUEST(app, "POST", "/api/custom-providers", {
      apiType: "openai-compatible",
      baseUrl: "https://example.com",
    });

    expect(res.status).toBe(400);
  });

  it("POST /custom-providers rejects invalid apiType", async () => {
    const app = createApp(settings);
    const res = await REQUEST(app, "POST", "/api/custom-providers", {
      name: "Invalid",
      apiType: "bad-type",
      baseUrl: "https://example.com",
    });

    expect(res.status).toBe(400);
  });

  it("POST /custom-providers rejects invalid baseUrl", async () => {
    const app = createApp(settings);
    const res = await REQUEST(app, "POST", "/api/custom-providers", {
      name: "Invalid URL",
      apiType: "openai-compatible",
      baseUrl: "not-a-url",
    });

    expect(res.status).toBe(400);
  });

  it("POST /custom-providers rejects non-http/https baseUrl", async () => {
    const app = createApp(settings);
    const res = await REQUEST(app, "POST", "/api/custom-providers", {
      name: "FTP URL",
      apiType: "openai-compatible",
      baseUrl: "ftp://example.com",
    });

    expect(res.status).toBe(400);
  });

  it("PUT /custom-providers/:id updates an existing provider", async () => {
    settings.customProviders = [
      {
        id: "cp-1",
        name: "Original",
        apiType: "openai-compatible",
        baseUrl: "https://original.example.com",
      },
    ];

    const app = createApp(settings);
    const res = await REQUEST(app, "PUT", "/api/custom-providers/cp-1", {
      name: "Updated",
      apiKey: "sk-updated-9999",
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: "cp-1",
      name: "Updated",
      apiType: "openai-compatible",
      baseUrl: "https://original.example.com",
      apiKey: "sk-•••••9999",
    });
  });

  it("PUT /custom-providers/:id returns 404 for non-existent id", async () => {
    const app = createApp(settings);
    const res = await REQUEST(app, "PUT", "/api/custom-providers/missing", {
      name: "Updated",
    });

    expect(res.status).toBe(404);
  });

  it("DELETE /custom-providers/:id removes a provider", async () => {
    settings.customProviders = [
      {
        id: "cp-1",
        name: "Delete Me",
        apiType: "openai-compatible",
        baseUrl: "https://example.com",
      },
    ];

    const app = createApp(settings);
    const res = await REQUEST(app, "DELETE", "/api/custom-providers/cp-1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(settings.customProviders).toEqual([]);
  });

  it("DELETE /custom-providers/:id returns 404 for non-existent id", async () => {
    const app = createApp(settings);
    const res = await REQUEST(app, "DELETE", "/api/custom-providers/missing");

    expect(res.status).toBe(404);
  });
});
