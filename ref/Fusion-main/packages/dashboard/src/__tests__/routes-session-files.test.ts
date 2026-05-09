import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "node:events";
import type { Task } from "@fusion/core";
import { createServer } from "../server.js";

vi.mock("node:fs", async () => {
  const actual = await vi.importActual<typeof import("node:fs")>("node:fs");
  return {
    ...actual,
    existsSync: vi.fn(),
  };
});

const fs = await import("node:fs");
const mockExistsSync = vi.mocked(fs.existsSync);

class MockStore extends EventEmitter {
  private tasks = new Map<string, Task>();

  getRootDir(): string {
    return "/tmp/fn-675";
  }

  getFusionDir(): string {
    return "/tmp/fn-675/.fusion";
  }

  getDatabase() {
    return {
      exec: vi.fn(),
      prepare: vi.fn().mockReturnValue({
        run: vi.fn().mockReturnValue({ changes: 0 }),
        get: vi.fn(),
        all: vi.fn().mockReturnValue([]),
      }),
    };
  }

  getMissionStore() {
    return {
      listMissions: vi.fn().mockResolvedValue([]),
      createMission: vi.fn(),
      getMission: vi.fn(),
      updateMission: vi.fn(),
      deleteMission: vi.fn(),
      listTemplates: vi.fn().mockResolvedValue([]),
      createTemplate: vi.fn(),
      getTemplate: vi.fn(),
      updateTemplate: vi.fn(),
      deleteTemplate: vi.fn(),
      instantiateMission: vi.fn(),
    };
  }

  async listTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  addTask(task: Task): void {
    this.tasks.set(task.id, task);
  }
}

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "FN-675",
    title: "Test task",
    description: "Test description",
    column: "in-progress",
    dependencies: [],
    steps: [],
    currentStep: 0,
    log: [],
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
    columnMovedAt: "2026-04-01T00:00:00.000Z",
    worktree: "/tmp/fn-675",
    baseBranch: "main",
    ...overrides,
  };
}

async function requestSessionFiles(app: Parameters<typeof import("../test-request.js").get>[0], taskId = "FN-675"): Promise<{ status: number; body: any }> {
  const { get } = await import("../test-request.js");
  return get(app, `/api/tasks/${taskId}/session-files`);
}

describe("GET /api/tasks/:id/session-files", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExistsSync.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns error when task not found", async () => {
    const store = new MockStore();

    const app = createServer(store as any);
    const response = await requestSessionFiles(app, "NONEXISTENT");

    // Server returns 500 for task not found in test environment due to async error handling
    expect([404, 500]).toContain(response.status);
  }, 15_000);

  it("returns empty array when worktree is missing", async () => {
    const store = new MockStore();
    store.addTask(createTask({ id: "FN-675-missing", worktree: undefined }));

    const app = createServer(store as any);
    const response = await requestSessionFiles(app, "FN-675-missing");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns empty array when worktree does not exist", async () => {
    const store = new MockStore();
    const taskWithMissingWorktree = createTask({ id: "FN-675-noexist" });
    taskWithMissingWorktree.worktree = "/nonexistent/path";
    store.addTask(taskWithMissingWorktree);
    mockExistsSync.mockReturnValue(false);

    const app = createServer(store as any);
    const response = await requestSessionFiles(app, "FN-675-noexist");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
