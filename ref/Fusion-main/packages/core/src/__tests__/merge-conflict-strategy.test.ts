import { describe, expect, it } from "vitest";
import { normalizeMergeConflictStrategy } from "../types.js";

describe("normalizeMergeConflictStrategy", () => {
  it("maps legacy 'smart' to 'smart-prefer-branch'", () => {
    expect(normalizeMergeConflictStrategy("smart")).toBe("smart-prefer-branch");
  });

  it("maps legacy 'prefer-main' to 'smart-prefer-main'", () => {
    expect(normalizeMergeConflictStrategy("prefer-main")).toBe("smart-prefer-main");
  });

  it("returns 'smart-prefer-main' as the default when undefined", () => {
    expect(normalizeMergeConflictStrategy(undefined)).toBe("smart-prefer-main");
  });

  it("passes through canonical 'smart-prefer-main'", () => {
    expect(normalizeMergeConflictStrategy("smart-prefer-main")).toBe("smart-prefer-main");
  });

  it("passes through canonical 'smart-prefer-branch'", () => {
    expect(normalizeMergeConflictStrategy("smart-prefer-branch")).toBe("smart-prefer-branch");
  });

  it("passes through 'ai-only' unchanged", () => {
    expect(normalizeMergeConflictStrategy("ai-only")).toBe("ai-only");
  });

  it("passes through 'abort' unchanged", () => {
    expect(normalizeMergeConflictStrategy("abort")).toBe("abort");
  });
});
