import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  getFusionSkillSourceCandidates,
  installFusionSkillIntoHermesHome,
  resolveBundledFusionSkillSourceFromCandidates,
} from "../fusion-skill-install.js";

const tempDirs: string[] = [];

function tempDir(prefix: string): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

function makeSkillSource(dir: string): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "SKILL.md"), "# Fusion Skill\n");
}

afterEach(() => {
  delete process.env.HERMES_HOME;
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("fusion skill installer", () => {
  it("resolves workspace and packaged candidate layouts", () => {
    const workspaceCandidates = getFusionSkillSourceCandidates("file:///repo/plugins/fusion-plugin-hermes-runtime/src/index.ts");
    expect(workspaceCandidates[0].replace(/\\/g, "/")).toMatch(/\/packages\/cli\/skill\/fusion$/);

    const packagedCandidates = getFusionSkillSourceCandidates("file:///repo/packages/cli/dist/plugins/fusion-plugin-hermes-runtime/bundled.js");
    expect(
      packagedCandidates.some((candidate) => candidate.replace(/\\/g, "/").endsWith("/packages/cli/dist/skill/fusion")),
    ).toBe(true);
  });

  it("installs skill for configured Hermes home", () => {
    const home = tempDir("hermes-home-");
    const source = path.join(tempDir("fusion-source-"), "fusion");
    makeSkillSource(source);
    process.env.HERMES_HOME = home;

    const result = installFusionSkillIntoHermesHome({ sourceDir: source });
    expect(result.outcome).toBe("installed");
    expect(result.targetDir).toBe(path.join(home, "skills", "fusion"));
  });

  it("no-ops when already installed to same source", () => {
    const home = tempDir("hermes-home-");
    const source = path.join(tempDir("fusion-source-"), "fusion");
    makeSkillSource(source);
    process.env.HERMES_HOME = home;

    expect(installFusionSkillIntoHermesHome({ sourceDir: source }).outcome).toBe("installed");
    expect(installFusionSkillIntoHermesHome({ sourceDir: source }).outcome).toBe("already-installed");
  });

  it("replaces prior fusion directory install safely", () => {
    const home = tempDir("hermes-home-");
    const source = path.join(tempDir("fusion-source-"), "fusion");
    makeSkillSource(source);
    process.env.HERMES_HOME = home;

    const target = path.join(home, "skills", "fusion");
    makeSkillSource(target);
    writeFileSync(path.join(target, "old.txt"), "stale");

    const result = installFusionSkillIntoHermesHome({ sourceDir: source });
    expect(result.outcome).toBe("replaced");
  });

  it("skips replacement for unrelated existing directory", () => {
    const home = tempDir("hermes-home-");
    const source = path.join(tempDir("fusion-source-"), "fusion");
    makeSkillSource(source);
    process.env.HERMES_HOME = home;

    const target = path.join(home, "skills", "fusion");
    mkdirSync(target, { recursive: true });
    writeFileSync(path.join(target, "README.md"), "my custom skill");

    const result = installFusionSkillIntoHermesHome({ sourceDir: source });
    expect(result.outcome).toBe("skipped");
  });

  it("warns when source is missing", () => {
    const home = tempDir("hermes-home-");
    process.env.HERMES_HOME = home;

    const result = installFusionSkillIntoHermesHome({ sourceDir: null });
    expect(result.outcome).toBe("warning");
  });

  it("can resolve first existing candidate", () => {
    const source = path.join(tempDir("fusion-source-"), "fusion");
    makeSkillSource(source);
    const resolved = resolveBundledFusionSkillSourceFromCandidates(["/missing", source]);
    expect(resolved).toBe(source);
  });

  it("replaces stale fusion symlink", () => {
    const home = tempDir("hermes-home-");
    const source = path.join(tempDir("fusion-source-"), "fusion");
    const oldSource = path.join(tempDir("fusion-old-source-"), "fusion");
    makeSkillSource(source);
    makeSkillSource(oldSource);
    process.env.HERMES_HOME = home;

    const target = path.join(home, "skills", "fusion");
    mkdirSync(path.dirname(target), { recursive: true });
    symlinkSync(oldSource, target, "dir");

    const result = installFusionSkillIntoHermesHome({ sourceDir: source });
    expect(result.outcome).toBe("replaced");
  });
});
