import { describe, expect, it, vi } from "vitest";

vi.mock("../cli-spawn.js", () => ({ runCursorCommand: vi.fn() }));

import { runCursorCommand } from "../cli-spawn.js";
import { discoverCursorModels } from "../process-manager.js";

describe("discoverCursorModels", () => {
  it("uses json list when available", async () => {
    vi.mocked(runCursorCommand).mockResolvedValueOnce({ code: 0, stdout: '[{"id":"cursor/a"},{"id":"cursor/b"}]', stderr: "" });
    const result = await discoverCursorModels("cursor-agent");
    expect(result.models).toEqual(["cursor/a", "cursor/b"]);
    expect(result.fallbackUsed).toBe(false);
  });

  it("falls back to text parsing", async () => {
    vi.mocked(runCursorCommand)
      .mockResolvedValueOnce({ code: 1, stdout: "", stderr: "" })
      .mockResolvedValueOnce({ code: 1, stdout: "", stderr: "" })
      .mockResolvedValueOnce({ code: 0, stdout: "cursor/x\ncursor/y", stderr: "" });
    const result = await discoverCursorModels("cursor-agent");
    expect(result.models).toEqual(["cursor/x", "cursor/y"]);
    expect(result.fallbackUsed).toBe(true);
  });
});
