import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "node:events";
import { createServer } from "../server.js";
import { get, request } from "../test-request.js";

// ── Mock file-service for searchWorkspaceFiles ─────────────────────────

const { mockSearchWorkspaceFiles } = vi.hoisted(() => ({
  mockSearchWorkspaceFiles: vi.fn(),
}));

vi.mock("../file-service.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../file-service.js")>();
  return {
    ...actual,
    searchWorkspaceFiles: mockSearchWorkspaceFiles,
  };
});

// ── Mock Store ────────────────────────────────────────────────────────

class MockStore extends EventEmitter {
  getRootDir(): string {
    return "/tmp/fn-1947-test";
  }

  getFusionDir(): string {
    return "/tmp/fn-1947-test/.fusion";
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
}

// ── Tests ─────────────────────────────────────────────────────────────

describe("GET /api/files/search", () => {
  let store: MockStore;
  let app: ReturnType<typeof import("../server.js").createServer>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchWorkspaceFiles.mockReset();
    store = new MockStore();
    app = createServer(store);
  });

  afterEach(() => {
    if (app.close) app.close();
  });

  it("returns 400 when query parameter 'q' is missing", async () => {
    const res = await get(app, "/api/files/search");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toContain("'q' is required");
  });

  it("returns 400 when query parameter 'q' is empty string", async () => {
    const res = await get(app, "/api/files/search?q=");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toContain("'q' is required");
  });

  it("returns 400 when query parameter 'q' is whitespace-only", async () => {
    const res = await get(app, "/api/files/search?q=%20%20");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toContain("'q' is required");
  });

  it("returns matching files with correct response shape", async () => {
    mockSearchWorkspaceFiles.mockResolvedValueOnce({
      files: [
        { path: "src/index.ts", name: "index.ts" },
        { path: "src/app.ts", name: "app.ts" },
      ],
    });

    const res = await get(app, "/api/files/search?q=index");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("files");
    expect(Array.isArray(res.body.files)).toBe(true);
    expect(res.body.files).toHaveLength(2);
    expect(res.body.files[0]).toEqual({ path: "src/index.ts", name: "index.ts" });
  });

  it("defaults workspace to 'project' when not provided", async () => {
    mockSearchWorkspaceFiles.mockResolvedValueOnce({ files: [] });

    await get(app, "/api/files/search?q=test");

    expect(mockSearchWorkspaceFiles).toHaveBeenCalledWith(
      expect.any(Object),
      "project",
      "test",
    );
  });

  it("accepts custom workspace parameter", async () => {
    mockSearchWorkspaceFiles.mockResolvedValueOnce({ files: [] });

    await get(app, "/api/files/search?q=test&workspace=task-FN-001");

    expect(mockSearchWorkspaceFiles).toHaveBeenCalledWith(
      expect.any(Object),
      "task-FN-001",
      "test",
    );
  });

  it("returns empty files array when no matches found", async () => {
    mockSearchWorkspaceFiles.mockResolvedValueOnce({ files: [] });

    const res = await get(app, "/api/files/search?q=nonexistent");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ files: [] });
  });

  it("handles special characters in query gracefully", async () => {
    mockSearchWorkspaceFiles.mockResolvedValueOnce({ files: [] });

    const res = await get(app, "/api/files/search?q=file.ts");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("files");
  });
});
