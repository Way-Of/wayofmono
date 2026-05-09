import { beforeEach, describe, expect, it, vi } from "vitest";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { readFileSync } from "node:fs";

const CLI_PACKAGE_VERSION = (
  JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf-8")) as { version: string }
).version;

const cacheDir = "/tmp/fusion-update-cache-test";

const { mockResolveGlobalDir } = vi.hoisted(() => ({
  mockResolveGlobalDir: vi.fn().mockReturnValue("/tmp/fusion-update-cache-test"),
}));

vi.mock("@fusion/core", () => ({
  resolveGlobalDir: mockResolveGlobalDir,
  GlobalSettingsStore: vi.fn(),
}));

const { getCachedUpdateStatus } = await import("../update-cache.js");

function writeUpdateCache(payload: { updateAvailable: boolean; latestVersion: string; currentVersion: string }): void {
  mkdirSync(cacheDir, { recursive: true });
  writeFileSync(`${cacheDir}/update-check.json`, JSON.stringify(payload), "utf-8");
}

beforeEach(() => {
  rmSync(cacheDir, { recursive: true, force: true });
  mockResolveGlobalDir.mockReset();
  mockResolveGlobalDir.mockReturnValue(cacheDir);
});

describe("getCachedUpdateStatus", () => {
  it("returns the cached update when it matches the installed CLI version", () => {
    writeUpdateCache({
      updateAvailable: true,
      currentVersion: CLI_PACKAGE_VERSION,
      latestVersion: "9.9.9",
    });

    expect(getCachedUpdateStatus(CLI_PACKAGE_VERSION)).toEqual({
      updateAvailable: true,
      currentVersion: CLI_PACKAGE_VERSION,
      latestVersion: "9.9.9",
    });
  });

  it("ignores stale cached updates from a different installed CLI version", () => {
    writeUpdateCache({
      updateAvailable: true,
      currentVersion: "0.0.1",
      latestVersion: "9.9.9",
    });

    expect(getCachedUpdateStatus(CLI_PACKAGE_VERSION)).toBeNull();
  });
});
