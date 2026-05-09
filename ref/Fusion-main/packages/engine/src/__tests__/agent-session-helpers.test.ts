import { describe, expect, it } from "vitest";
import { extractRuntimeHint } from "../agent-session-helpers.js";

describe("extractRuntimeHint", () => {
  it("returns undefined for undefined config", () => {
    expect(extractRuntimeHint(undefined)).toBeUndefined();
  });

  it("returns undefined when runtimeHint key is missing", () => {
    expect(extractRuntimeHint({})).toBeUndefined();
  });

  it("returns normalized runtime hint when configured", () => {
    expect(extractRuntimeHint({ runtimeHint: " openclaw " })).toBe("openclaw");
  });

  it("returns undefined for whitespace-only runtimeHint", () => {
    expect(extractRuntimeHint({ runtimeHint: "   " })).toBeUndefined();
  });

  it("returns undefined for non-string runtimeHint", () => {
    expect(extractRuntimeHint({ runtimeHint: 42 })).toBeUndefined();
  });
});
