import { describe, expect, it, vi } from "vitest";

vi.mock("../cli-spawn.js", () => ({ runCursorCommand: vi.fn() }));

import { runCursorCommand } from "../cli-spawn.js";
import { probeCursorBinary } from "../probe.js";

describe("probeCursorBinary", () => {
  it("reports available when probe succeeds", async () => {
    vi.mocked(runCursorCommand).mockResolvedValue({ code: 0, stdout: "1.2.3", stderr: "" });
    const result = await probeCursorBinary({ binaryPath: "cursor-agent" });
    expect(result.available).toBe(true);
    expect(result.version).toBe("1.2.3");
  });

  it("reports keychain lock as auth failure", async () => {
    vi.mocked(runCursorCommand).mockResolvedValue({ code: 1, stdout: "", stderr: "Error: Your macOS login keychain is locked." });
    const result = await probeCursorBinary({ binaryPath: "cursor-agent" });
    expect(result.available).toBe(true);
    expect(result.authenticated).toBe(false);
    expect(result.reason).toContain("keychain");
  });

  it("reports ide-not-installed as unavailable auth state", async () => {
    vi.mocked(runCursorCommand).mockResolvedValue({ code: 1, stdout: "", stderr: "Error: No Cursor IDE installation found." });
    const result = await probeCursorBinary({ binaryPath: "cursor" });
    expect(result.available).toBe(true);
    expect(result.authenticated).toBe(false);
    expect(result.reason).toContain("installation not found");
  });

  it("reports binary unavailable when all candidates fail", async () => {
    vi.mocked(runCursorCommand)
      .mockResolvedValueOnce({ code: 127, stdout: "", stderr: "" })
      .mockResolvedValueOnce({ code: 127, stdout: "", stderr: "" });

    const result = await probeCursorBinary();
    expect(result.available).toBe(false);
    expect(result.reason).toContain("not found");
  });
});
