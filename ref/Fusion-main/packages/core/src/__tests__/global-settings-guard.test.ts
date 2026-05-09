import { describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveGlobalDir } from "../global-settings.js";

function withTempHome<T>(fn: (homeDir: string) => T): T {
  const originalHome = process.env.HOME;
  const homeDir = mkdtempSync(join(tmpdir(), "kb-global-dir-guard-"));
  process.env.HOME = homeDir;

  try {
    return fn(homeDir);
  } finally {
    if (originalHome === undefined) {
      delete process.env.HOME;
    } else {
      process.env.HOME = originalHome;
    }
    rmSync(homeDir, { recursive: true, force: true });
  }
}

function withVitestEnv<T>(value: string | undefined, fn: () => T): T {
  const originalVitest = process.env.VITEST;

  if (value === undefined) {
    delete process.env.VITEST;
  } else {
    process.env.VITEST = value;
  }

  try {
    return fn();
  } finally {
    if (originalVitest === undefined) {
      delete process.env.VITEST;
    } else {
      process.env.VITEST = originalVitest;
    }
  }
}

describe("resolveGlobalDir() VITEST guard", () => {
  it("throws without explicit dir during test execution", () => {
    withVitestEnv("true", () => {
      withTempHome(() => {
        expect(() => resolveGlobalDir()).toThrow(
          "resolveGlobalDir() called without explicit dir during test execution. Pass a temp directory to avoid writing to real ~/.fusion/",
        );
      });
    });
  });

  it("allows explicit dir during test execution", () => {
    withVitestEnv("true", () => {
      const explicitPath = "/some/explicit/path";

      expect(resolveGlobalDir(explicitPath)).toBe(explicitPath);
    });
  });

  it("preserves production behavior when VITEST is not set", () => {
    withVitestEnv(undefined, () => {
      withTempHome((homeDir) => {
        expect(resolveGlobalDir()).toBe(join(homeDir, ".fusion"));
      });
    });
  });
});
