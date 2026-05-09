import { describe, expect, it } from "vitest";
import { buildDevNodeArgs } from "../../../../scripts/dev-with-memory-lib.mjs";

describe("buildDevNodeArgs", () => {
  it("enables source-condition resolution before loading the tsx runtime", () => {
    const args = buildDevNodeArgs({
      inspectFlags: ["--inspect=9230"],
      preload: "/tmp/preflight.cjs",
      loader: "/tmp/loader.mjs",
      entry: "/tmp/bin.ts",
      args: ["dashboard", "--host", "0.0.0.0"],
    });

    expect(args).toEqual([
      "--inspect=9230",
      "--conditions=source",
      "--require",
      "/tmp/preflight.cjs",
      "--import",
      "file:///tmp/loader.mjs",
      "/tmp/bin.ts",
      "dashboard",
      "--host",
      "0.0.0.0",
    ]);
  });
});
