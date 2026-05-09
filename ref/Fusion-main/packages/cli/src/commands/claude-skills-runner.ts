/**
 * Thin wrapper around claude-skills install logic that also handles the
 * "should we even try?" question (reads global settings, checks detection)
 * so call sites don't each repeat that plumbing.
 */

import { getPackageManagerAgentDir } from "./auth-paths.js";
import {
  ensureFusionSkillForProjects,
  installFusionSkillIntoProject,
  isPiClaudeCliConfigured,
  resolveFusionSkillSource,
  type InstallResult,
} from "./claude-skills.js";
import { createReadOnlyProviderSettingsView } from "./provider-settings.js";

/**
 * Resolve whether pi-claude-cli is configured by reading the user's global
 * settings (`~/.fusion/agent/settings.json` with cascade to legacy `.pi`).
 *
 * The project path is used only so the settings reader can merge the
 * project's `.fusion/settings.json` overlay; we only examine the global
 * portion for this check.
 */
export function detectPiClaudeCli(projectPath: string): boolean {
  try {
    const agentDir = getPackageManagerAgentDir();
    const view = createReadOnlyProviderSettingsView(projectPath, agentDir);
    return isPiClaudeCliConfigured(view.getGlobalSettings());
  } catch {
    return false;
  }
}

/**
 * Install the fusion skill into a single newly-created project, logging the
 * outcome to the console. Intended for CLI entry points (`fn init`,
 * `fn project add`) where the user is watching the output.
 *
 * No-op (and silent) when pi-claude-cli is not configured so the file layout
 * stays clean for users who only use direct Anthropic API.
 */
export function maybeInstallClaudeSkillForNewProject(projectPath: string): InstallResult {
  const enabled = detectPiClaudeCli(projectPath);
  const result = installFusionSkillIntoProject(projectPath, { enabled });
  logInstallResult(result, { verbose: enabled });
  return result;
}

/**
 * Install the fusion skill into every registered project during server
 * startup. Non-blocking: callers invoke this without awaiting. Logs one line
 * per non-skipped, non-already-installed project; stays quiet when there's
 * nothing to do.
 */
export function ensureClaudeSkillsForAllProjectsOnStartup(
  projects: Array<{ id: string; name: string; path: string }>,
): InstallResult[] {
  if (projects.length === 0) return [];
  // Detect using the first project; all share the same user-level settings.
  const enabled = detectPiClaudeCli(projects[0]!.path);
  if (!enabled) {
    return projects.map((p) => ({
      outcome: "skipped" as const,
      target: `${p.path}/.claude/skills/fusion`,
      reason: "pi-claude-cli not configured",
    }));
  }
  const source = resolveFusionSkillSource();
  const results = ensureFusionSkillForProjects(projects, { enabled, source });
  for (let i = 0; i < results.length; i++) {
    const result = results[i]!;
    if (result.outcome === "installed" || result.outcome === "replaced") {
      console.log(
        `[fusion] Installed Claude skill for project '${projects[i]!.name}' (${result.outcome}): ${result.target}`,
      );
    } else if (result.outcome === "failed") {
      console.warn(
        `[fusion] Could not install Claude skill for project '${projects[i]!.name}': ${result.reason ?? "unknown error"}`,
      );
    }
  }
  return results;
}

function logInstallResult(result: InstallResult, options: { verbose: boolean }): void {
  switch (result.outcome) {
    case "installed":
      console.log(`  ✓ Installed fusion skill at ${result.target}`);
      break;
    case "replaced":
      console.log(`  ✓ Refreshed fusion skill at ${result.target}`);
      break;
    case "already-installed":
      if (options.verbose) {
        console.log(`  ✓ Fusion skill already present at ${result.target}`);
      }
      break;
    case "failed":
      console.warn(
        `  ⚠ Could not install fusion skill: ${result.reason ?? "unknown error"}`,
      );
      break;
    case "skipped":
      // Silent — the user hasn't opted into Claude Code routing.
      break;
  }
}
