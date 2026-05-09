import { describe, expect, it } from "vitest";
import { tmpdir } from "node:os";
import { getFusionAuthPath } from "../auth-storage.js";

describe("test isolation guard", () => {
  it("overrides HOME to a temp fn-test-home directory", () => {
    const home = process.env.HOME;

    expect(home).toBeDefined();
    expect(home).toContain(tmpdir());
    expect(home).toContain("fn-test-home-");
  });

  it("resolves Fusion auth path under temp HOME", () => {
    const home = process.env.HOME;
    const authPath = getFusionAuthPath();

    expect(home).toBeDefined();
    expect(authPath).toContain("fn-test-home-");
    expect(authPath.startsWith(home!)).toBe(true);
    expect(authPath).toContain(".fusion");
  });
});
