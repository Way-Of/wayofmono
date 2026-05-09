import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

describe("FN-3298 regression: dashboard vitest runtime plugins resolve from source", () => {
  it("aliases hermes/openclaw/paperclip runtime plugin imports to src entrypoints", () => {
    const testDir = dirname(fileURLToPath(import.meta.url));
    const vitestConfigPath = join(testDir, "..", "..", "vitest.config.ts");
    const config = readFileSync(vitestConfigPath, "utf8");

    expect(config).toContain('"@fusion-plugin-examples/hermes-runtime": resolve(');
    expect(config).toContain('"../../plugins/fusion-plugin-hermes-runtime/src/index.ts"');

    expect(config).toContain('"@fusion-plugin-examples/openclaw-runtime": resolve(');
    expect(config).toContain('"../../plugins/fusion-plugin-openclaw-runtime/src/index.ts"');

    expect(config).toContain('"@fusion-plugin-examples/paperclip-runtime": resolve(');
    expect(config).toContain('"../../plugins/fusion-plugin-paperclip-runtime/src/index.ts"');

    expect(config).not.toContain('fusion-plugin-hermes-runtime/dist/index.js');
    expect(config).not.toContain('fusion-plugin-openclaw-runtime/dist/index.js');
    expect(config).not.toContain('fusion-plugin-paperclip-runtime/dist/index.js');
  });
});
