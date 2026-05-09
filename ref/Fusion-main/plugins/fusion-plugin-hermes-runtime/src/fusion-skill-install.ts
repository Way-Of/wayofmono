import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  unlinkSync,
} from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const FUSION_SKILL_NAME = "fusion";

export type HermesFusionSkillInstallOutcome =
  | "installed"
  | "already-installed"
  | "replaced"
  | "skipped"
  | "warning";

export interface HermesFusionSkillInstallResult {
  outcome: HermesFusionSkillInstallOutcome;
  sourceDir: string | null;
  targetDir: string;
  reason?: string;
}

export function resolveHermesHome(profile?: string): string {
  const base = process.env.HERMES_HOME ?? join(homedir(), ".hermes");
  if (!profile || profile === "default") return base;
  return join(base, "profiles", profile);
}

export function getFusionSkillSourceCandidates(moduleUrl = import.meta.url): string[] {
  const here = fileURLToPath(moduleUrl);
  const moduleDir = dirname(here);

  return [
    resolve(moduleDir, "..", "..", "..", "..", "packages", "cli", "skill", FUSION_SKILL_NAME),
    resolve(moduleDir, "..", "..", "..", "skill", FUSION_SKILL_NAME),
    resolve(moduleDir, "..", "..", "skill", FUSION_SKILL_NAME),
    resolve(moduleDir, "..", "..", "..", "..", "skill", FUSION_SKILL_NAME),
  ];
}

export function resolveBundledFusionSkillSource(): string | null {
  const candidates = getFusionSkillSourceCandidates();

  for (const candidate of candidates) {
    if (existsSync(join(candidate, "SKILL.md"))) return candidate;
  }

  return null;
}

export function resolveBundledFusionSkillSourceFromCandidates(candidates: string[]): string | null {
  for (const candidate of candidates) {
    if (existsSync(join(candidate, "SKILL.md"))) return candidate;
  }

  return null;
}

export function installFusionSkillIntoHermesHome(options: {
  profile?: string;
  sourceDir?: string | null;
} = {}): HermesFusionSkillInstallResult {
  const sourceDir = options.sourceDir ?? resolveBundledFusionSkillSource();
  const targetDir = join(resolveHermesHome(options.profile), "skills", FUSION_SKILL_NAME);

  if (!sourceDir) {
    return {
      outcome: "warning",
      sourceDir,
      targetDir,
      reason: "bundled Fusion skill source directory not found",
    };
  }

  try {
    mkdirSync(dirname(targetDir), { recursive: true });

    let replaced = false;
    if (existsSync(targetDir) || isBrokenSymlink(targetDir)) {
      const stat = lstatSync(targetDir);
      if (stat.isSymbolicLink()) {
        const currentTarget = safeReadlink(targetDir);
        if (currentTarget && resolve(dirname(targetDir), currentTarget) === resolve(sourceDir)) {
          return { outcome: "already-installed", sourceDir, targetDir };
        }
        if (!looksLikeFusionSkillTarget(resolve(dirname(targetDir), currentTarget ?? ""))) {
          return {
            outcome: "skipped",
            sourceDir,
            targetDir,
            reason: "existing symlink does not look like a Fusion skill install",
          };
        }
        unlinkSync(targetDir);
        replaced = true;
      } else {
        if (!looksLikePriorFusionInstall(targetDir)) {
          return {
            outcome: "skipped",
            sourceDir,
            targetDir,
            reason: "existing directory does not look like a Fusion skill install",
          };
        }
        rmSync(targetDir, { recursive: true, force: true });
        replaced = true;
      }
    }

    try {
      symlinkSync(sourceDir, targetDir, "dir");
    } catch (error) {
      const symlinkReason = error instanceof Error ? error.message : String(error);
      try {
        cpSync(sourceDir, targetDir, { recursive: true });
        return {
          outcome: replaced ? "replaced" : "installed",
          sourceDir,
          targetDir,
          reason: `symlink failed (${symlinkReason}); copied files instead`,
        };
      } catch (copyError) {
        return {
          outcome: "warning",
          sourceDir,
          targetDir,
          reason: copyError instanceof Error ? copyError.message : String(copyError),
        };
      }
    }

    return { outcome: replaced ? "replaced" : "installed", sourceDir, targetDir };
  } catch (error) {
    return {
      outcome: "warning",
      sourceDir,
      targetDir,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

function safeReadlink(path: string): string | null {
  try {
    return readlinkSync(path);
  } catch {
    return null;
  }
}

function isBrokenSymlink(path: string): boolean {
  try {
    const stat = lstatSync(path);
    return stat.isSymbolicLink() && !existsSync(path);
  } catch {
    return false;
  }
}

function looksLikePriorFusionInstall(path: string): boolean {
  const skillMd = join(path, "SKILL.md");
  if (!existsSync(skillMd)) return false;
  try {
    const body = readFileSync(skillMd, "utf-8");
    return /\bfusion\b/i.test(body) && /\bskill\b/i.test(body);
  } catch {
    return false;
  }
}

function looksLikeFusionSkillTarget(path: string): boolean {
  if (!path) return false;
  if (basename(path).toLowerCase() === FUSION_SKILL_NAME) return true;
  return existsSync(join(path, "SKILL.md"));
}
