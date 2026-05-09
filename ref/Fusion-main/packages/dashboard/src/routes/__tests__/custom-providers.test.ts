// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { CustomProvider, TaskStore } from "@fusion/core";
import { createApiRoutes } from "../../routes.js";
import { request } from "../../test-request.js";

const mockCentralListProjects = vi.fn().mockResolvedValue([]);
const mockCentralInit = vi.fn().mockResolvedValue(undefined);
const mockCentralClose = vi.fn().mockResolvedValue(undefined);
const mockCentralReconcileProjectStatuses = vi.fn().mockResolvedValue(undefined);

vi.mock("@fusion/core", async () => {
  const actual = await vi.importActual<typeof import("@fusion/core")>("@fusion/core");
  return {
    ...actual,
    isGhAvailable: vi.fn(),
    isGhAuthenticated: vi.fn(),
    isQmdAvailable: vi.fn().mockResolvedValue(false),
    CentralCore: vi.fn().mockImplementation(() => ({
      init: mockCentralInit,
      close: mockCentralClose,
      listProjects: mockCentralListProjects,
      reconcileProjectStatuses: mockCentralReconcileProjectStatuses,
    })),
  };
});

vi.mock("@fusion/engine", () => ({
  createFnAgent: vi.fn(async () => ({ session: { state: { messages: [] }, prompt: vi.fn(), dispose: vi.fn() } })),
  promptWithFallback: vi.fn(),
}));

function createMockStore(overrides: Partial<TaskStore> = {}): TaskStore {
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
    updateGlobalSettings: vi.fn(),
    getSettingsByScope: vi.fn().mockResolvedValue({ global: {}, project: {} }),
    getSettingsByScopeFast: vi.fn().mockResolvedValue({ global: {}, project: {} }),
    getGlobalSettingsStore: vi.fn(),
    logEntry: vi.fn().mockResolvedValue(undefined),
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
    deleteTaskDocument: vi.fn().mockResolvedValue(undefined),
    updatePrInfo: vi.fn().mockResolvedValue(undefined),
    updateIssueInfo: vi.fn().mockResolvedValue(undefined),
    getRootDir: vi.fn().mockReturnValue("/fake/root"),
    listWorkflowSteps: vi.fn().mockResolvedValue([]),
    createWorkflowStep: vi.fn(),
    getWorkflowStep: vi.fn(),
    updateWorkflowStep: vi.fn(),
    deleteWorkflowStep: vi.fn(),
    getMissionStore: vi.fn().mockReturnValue({
      listMissions: vi.fn().mockReturnValue([]),
      createMission: vi.fn(),
      getMissionWithHierarchy: vi.fn(),
      updateMission: vi.fn(),
      getMission: vi.fn(),
      deleteMission: vi.fn(),
      listMilestonesByMission: vi.fn().mockReturnValue([]),
      createMilestone: vi.fn(),
      updateMilestone: vi.fn(),
      getMilestone: vi.fn(),
      deleteMilestone: vi.fn(),
      listTasksByMilestone: vi.fn().mockReturnValue([]),
      createMissionTask: vi.fn(),
      updateMissionTask: vi.fn(),
      getMissionTask: vi.fn(),
      deleteMissionTask: vi.fn(),
    }),
    ...overrides,
  } as unknown as TaskStore;
}

function createCustomProviderStore(initialCustomProviders: CustomProvider[] = []) {
  let customProviders = [...initialCustomProviders];
  const globalSettingsStore = {
    getSettings: vi.fn().mockImplementation(async () => ({ customProviders })),
    updateSettings: vi.fn().mockImplementation(async (updates: { customProviders?: CustomProvider[] }) => {
      customProviders = updates.customProviders ?? customProviders;
      return { customProviders };
    }),
  };

  const store = createMockStore({
    getGlobalSettingsStore: vi.fn().mockReturnValue(globalSettingsStore),
    updateGlobalSettings: vi.fn().mockImplementation(async (updates: { customProviders?: CustomProvider[] }) => {
      customProviders = updates.customProviders ?? customProviders;
      return { customProviders };
    }),
  });

  return { store, globalSettingsStore };
}

function setupApp(store?: TaskStore) {
  const app = express();
  app.use(express.json());
  app.use("/api", createApiRoutes(store ?? createCustomProviderStore().store));
  return app;
}

async function doRequest(
  app: express.Express,
  method: string,
  path: string,
  body?: unknown,
) {
  return request(
    app,
    method,
    path,
    body === undefined ? undefined : JSON.stringify(body),
    body === undefined ? undefined : { "Content-Type": "application/json" },
  );
}

describe("custom providers API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/custom-providers returns empty array when none configured", async () => {
    const app = setupApp(createCustomProviderStore().store);
    const res = await doRequest(app, "GET", "/api/custom-providers");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("GET /api/custom-providers returns existing providers with masked api keys", async () => {
    const app = setupApp(
      createCustomProviderStore([
        {
          id: "cp-1",
          name: "Provider One",
          apiType: "openai-compatible",
          baseUrl: "https://api.example.com/v1",
          apiKey: "sk-1234567890",
          models: [{ id: "model-1", name: "Model 1" }],
        },
        {
          id: "cp-2",
          name: "Provider Two",
          apiType: "anthropic-compatible",
          baseUrl: "https://anthropic.example.com",
          apiKey: "short",
        },
      ]).store,
    );

    const res = await doRequest(app, "GET", "/api/custom-providers");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      expect.objectContaining({
        id: "cp-1",
        name: "Provider One",
        apiType: "openai-compatible",
        baseUrl: "https://api.example.com/v1",
        models: [{ id: "model-1", name: "Model 1" }],
        apiKey: "sk-•••••7890",
      }),
      expect.objectContaining({
        id: "cp-2",
        apiKey: "••••••••",
      }),
    ]);
  });

  it("POST /api/custom-providers creates provider and persists settings", async () => {
    const { store } = createCustomProviderStore();
    const app = setupApp(store);
    const res = await doRequest(app, "POST", "/api/custom-providers", {
      name: "My Provider",
      apiType: "openai-compatible",
      baseUrl: "https://api.example.com/v1",
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: "My Provider",
        apiType: "openai-compatible",
        baseUrl: "https://api.example.com/v1",
      }),
    );
    expect(vi.mocked(store.updateGlobalSettings)).toHaveBeenCalledWith({
      customProviders: [expect.objectContaining({ name: "My Provider" })],
    });
  });

  it("POST /api/custom-providers rejects missing name", async () => {
    const app = setupApp(createCustomProviderStore().store);
    const res = await doRequest(app, "POST", "/api/custom-providers", {
      apiType: "openai-compatible",
      baseUrl: "https://api.example.com/v1",
    });

    expect(res.status).toBe(400);
    expect(String(res.body.error)).toContain("name is required");
  });

  it("POST /api/custom-providers rejects invalid apiType", async () => {
    const app = setupApp(createCustomProviderStore().store);
    const res = await doRequest(app, "POST", "/api/custom-providers", {
      name: "Bad",
      apiType: "invalid",
      baseUrl: "https://api.example.com/v1",
    });

    expect(res.status).toBe(400);
    expect(String(res.body.error)).toContain("apiType must be either");
  });

  it("POST /api/custom-providers rejects invalid baseUrl format", async () => {
    const app = setupApp(createCustomProviderStore().store);
    const res = await doRequest(app, "POST", "/api/custom-providers", {
      name: "Bad URL",
      apiType: "openai-compatible",
      baseUrl: "not-a-url",
    });

    expect(res.status).toBe(400);
    expect(String(res.body.error)).toContain("baseUrl must be a valid URL");
  });

  it("POST /api/custom-providers rejects non-http/https baseUrl", async () => {
    const app = setupApp(createCustomProviderStore().store);
    const res = await doRequest(app, "POST", "/api/custom-providers", {
      name: "Bad URL",
      apiType: "openai-compatible",
      baseUrl: "ftp://example.com",
    });

    expect(res.status).toBe(400);
    expect(String(res.body.error)).toContain("baseUrl must use http or https");
  });

  it("PUT /api/custom-providers/:id updates existing provider", async () => {
    const app = setupApp(
      createCustomProviderStore([
        {
          id: "cp-1",
          name: "Provider One",
          apiType: "openai-compatible",
          baseUrl: "https://api.example.com/v1",
        },
      ]).store,
    );

    const res = await doRequest(app, "PUT", "/api/custom-providers/cp-1", {
      name: "Provider One Updated",
      baseUrl: "https://api.updated.example.com/v1",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        id: "cp-1",
        name: "Provider One Updated",
        baseUrl: "https://api.updated.example.com/v1",
      }),
    );
  });

  it("PUT /api/custom-providers/:id returns 404 for unknown id", async () => {
    const app = setupApp(createCustomProviderStore().store);
    const res = await doRequest(app, "PUT", "/api/custom-providers/unknown", {
      name: "Updated",
    });

    expect(res.status).toBe(404);
    expect(String(res.body.error)).toContain("not found");
  });

  it("PUT /api/custom-providers/:id validates baseUrl", async () => {
    const app = setupApp(
      createCustomProviderStore([
        {
          id: "cp-1",
          name: "Provider One",
          apiType: "openai-compatible",
          baseUrl: "https://api.example.com/v1",
        },
      ]).store,
    );

    const res = await doRequest(app, "PUT", "/api/custom-providers/cp-1", {
      baseUrl: "ftp://example.com",
    });

    expect(res.status).toBe(400);
    expect(String(res.body.error)).toContain("baseUrl must use http or https");
  });

  it("DELETE /api/custom-providers/:id removes provider", async () => {
    const app = setupApp(
      createCustomProviderStore([
        {
          id: "cp-1",
          name: "Provider One",
          apiType: "openai-compatible",
          baseUrl: "https://api.example.com/v1",
        },
      ]).store,
    );

    const del = await doRequest(app, "DELETE", "/api/custom-providers/cp-1");
    expect(del.status).toBe(200);
    expect(del.body).toEqual({ success: true });

    const getAfter = await doRequest(app, "GET", "/api/custom-providers");
    expect(getAfter.status).toBe(200);
    expect(getAfter.body).toEqual([]);
  });

  it("DELETE /api/custom-providers/:id returns 404 for unknown id", async () => {
    const app = setupApp(createCustomProviderStore().store);
    const res = await doRequest(app, "DELETE", "/api/custom-providers/unknown");

    expect(res.status).toBe(404);
    expect(String(res.body.error)).toContain("not found");
  });
});
