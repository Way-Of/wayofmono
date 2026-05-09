import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

interface WorkspacePackageJson {
  scripts?: Record<string, string | undefined>;
}

describe("mobile pipeline scripts", () => {
  const rootPackagePath = resolve(__dirname, "../../../../package.json");

  it("defines required root mobile scripts", () => {
    const packageJson = JSON.parse(readFileSync(rootPackagePath, "utf8")) as WorkspacePackageJson;
    const scripts = packageJson.scripts ?? {};

    const requiredScriptNames = [
      "mobile:build",
      "mobile:ios",
      "mobile:android",
      "mobile:dev:ios",
      "mobile:dev:android",
      "mobile:sync",
    ];

    for (const scriptName of requiredScriptNames) {
      expect(typeof scripts[scriptName]).toBe("string");
      expect((scripts[scriptName] ?? "").trim().length).toBeGreaterThan(0);
    }
  });

  it("configures mobile:build to run dashboard build and cap sync", () => {
    const packageJson = JSON.parse(readFileSync(rootPackagePath, "utf8")) as WorkspacePackageJson;
    const mobileBuild = packageJson.scripts?.["mobile:build"] ?? "";

    expect(mobileBuild).toContain("dashboard");
    expect(mobileBuild).toContain("build");
    expect(mobileBuild).toContain("cap sync");
  });

  it("includes platform-specific open commands", () => {
    const packageJson = JSON.parse(readFileSync(rootPackagePath, "utf8")) as WorkspacePackageJson;

    expect(packageJson.scripts?.["mobile:ios"] ?? "").toContain("ios");
    expect(packageJson.scripts?.["mobile:android"] ?? "").toContain("android");
  });
});
