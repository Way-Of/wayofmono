import { cpSync, existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const FUSION_SKILL_NAME = "fusion";

export type SupportedSkillClient = "claude" | "codex" | "gemini";

export interface SkillInstallTarget {
  client: SupportedSkillClient;
  targetDir: string;
}

export type SkillInstallOutcome = "installed" | "skipped" | "warning";

export interface SkillInstallResult {
  client: SupportedSkillClient;
  targetDir: string;
  outcome: SkillInstallOutcome;
  reason?: string;
}

export interface InstallBundledFusionSkillResult {
  sourceDir: string | null;
  results: SkillInstallResult[];
}

export function getSupportedSkillInstallTargets(
  homeDir = process.env.HOME || process.env.USERPROFILE || homedir(),
): SkillInstallTarget[] {
  return [
    { client: "claude", targetDir: join(homeDir, ".claude", "skills", FUSION_SKILL_NAME) },
    { client: "codex", targetDir: join(homeDir, ".codex", "skills", FUSION_SKILL_NAME) },
    { client: "gemini", targetDir: join(homeDir, ".gemini", "skills", FUSION_SKILL_NAME) },
  ];
}

export function resolveBundledFusionSkillSource(): string | null {
  const here = fileURLToPath(import.meta.url);
  const source = resolve(dirname(here), "..", "..", "skill", FUSION_SKILL_NAME);
  return existsSync(source) ? source : null;
}

export function installBundledFusionSkill(options: {
  homeDir?: string;
  sourceDir?: string | null;
} = {}): InstallBundledFusionSkillResult {
  const sourceDir = options.sourceDir ?? resolveBundledFusionSkillSource();
  const targets = getSupportedSkillInstallTargets(options.homeDir);

  if (!sourceDir) {
    return {
      sourceDir,
      results: targets.map((target) => ({
        client: target.client,
        targetDir: target.targetDir,
        outcome: "warning" as const,
        reason: "bundled Fusion skill source directory not found",
      })),
    };
  }

  const results = targets.map<SkillInstallResult>((target) => {
    try {
      if (existsSync(target.targetDir)) {
        return {
          client: target.client,
          targetDir: target.targetDir,
          outcome: "skipped",
          reason: "existing install preserved",
        };
      }

      mkdirSync(dirname(target.targetDir), { recursive: true });
      cpSync(sourceDir, target.targetDir, { recursive: true });

      return {
        client: target.client,
        targetDir: target.targetDir,
        outcome: "installed",
      };
    } catch (error) {
      return {
        client: target.client,
        targetDir: target.targetDir,
        outcome: "warning",
        reason: error instanceof Error ? error.message : String(error),
      };
    }
  });

  return { sourceDir, results };
}
