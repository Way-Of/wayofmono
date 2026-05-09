import { describe, expect, it } from "vitest";
import { CursorRuntimeAdapter } from "../runtime-adapter.js";

describe("CursorRuntimeAdapter", () => {
  it("creates a session with default model fallback", async () => {
    const adapter = new CursorRuntimeAdapter();
    const result = await adapter.createSession({ systemPrompt: "sys" });
    expect(result.session.model).toBe("cursor/default");
    expect(result.session.systemPrompt).toBe("sys");
  });

  it("promptWithFallback resolves without throwing", async () => {
    const adapter = new CursorRuntimeAdapter();
    await expect(adapter.promptWithFallback()).resolves.toBeUndefined();
  });

  it("describeModel formats cursor prefix", () => {
    const adapter = new CursorRuntimeAdapter();
    expect(adapter.describeModel({ model: "cursor/pro" })).toBe("cursor/cursor/pro");
  });
});
