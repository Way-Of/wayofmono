#!/usr/bin/env -S deno run -A
/**
 * Remove old per-tool skill entries from manifest.json and delete directories.
 * Run BEFORE deploying with ai-harness --tool=all --yes.
 */
import { join } from "jsr:@std/path@1/join";

const HARNESS_DIR = join(import.meta.dirname!, "..");
const manifestPath = join(HARNESS_DIR, "manifest.json");
const manifest = JSON.parse(Deno.readTextFileSync(manifestPath));

// Tool-specific old skill names to remove
const OLD_SKILLS_BY_TOOL: Record<string, string[]> = {
  claude: [
    "build_claude_agent",
    "build_claude_extension",
    "build_claude_skill",
    "claude_cli",
    "claude_config",
    "claude_keybindings",
    "claude_orchestrate",
    "claude_prompts",
    "claude_skill_creator",
    "claude_themes",
    "claude_tui",
  ],
  opencode: [
    "opencode_skill_creator",
  ],
  gemini: [
    "gemini_skill_creator",
  ],
  pi: [
    "build-pi-agent",
    "build-pi-extension",
    "build-pi-skill",
    "pi-cli",
    "pi-config",
    "pi-extension",
    "pi-keybindings",
    "pi-orchestrate",
    "pi-prompts",
    "pi-skill",
    "pi-skill-creator",
    "pi-themes",
    "pi-tui",
  ],
  antigravity: [
    "antigravity_cli",
    "antigravity_config",
    "antigravity_keybindings",
    "antigravity_orchestrate",
    "antigravity_prompts",
    "antigravity_skill_creator",
    "antigravity_themes",
    "antigravity_tui",
    "build_antigravity_agent",
    "build_antigravity_extension",
    "build_antigravity_skill",
  ],
  codex: [
    "codex_skill_creator",
  ],
  wocoder: [
    "wocoder_skill_creator",
  ],
};

// Also remove corresponding skill+ prefix variants if they exist (build_skill_creator, build_* for unified etc.)
// Check for old build_* skills that don't share a name with unified skills
const EXTRA_VARIANTS: Record<string, string[]> = {
  claude: ["build_skill_creator"],
  opencode: ["build_skill_creator"],
  gemini: ["build_skill_creator"],
  antigravity: ["build_skill_creator"],
  codex: ["build_skill_creator"],
  wocoder: ["build_skill_creator"],
  pi: ["build-skill-creator"],
};

let removedCount = 0;

for (const [tool, skills] of Object.entries(OLD_SKILLS_BY_TOOL)) {
  const components = manifest.tools[tool]?.components;
  if (!components) {
    console.log(`  ! ${tool}: no components found`);
    continue;
  }

  // Remove main skill entries
  for (const skill of skills) {
    const key = `skill/${skill}`;
    if (components[key]) {
      delete components[key];
      removedCount++;
      console.log(`  ✓ ${tool}: removed manifest entry ${key}`);
    } else {
      console.log(`  - ${tool}: ${key} not in manifest (already clean)`);
    }
  }

  // Remove extra variants
  const extras = EXTRA_VARIANTS[tool] || [];
  for (const extra of extras) {
    const key = `skill/${extra}`;
    if (components[key]) {
      delete components[key];
      removedCount++;
      console.log(`  ✓ ${tool}: removed manifest entry ${key}`);
    }
  }
}

Deno.writeTextFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\nRemoved ${removedCount} old skill entries from manifest.`);

// Now delete the skill directories
let deletedDirCount = 0;
for (const [tool, skills] of Object.entries(OLD_SKILLS_BY_TOOL)) {
  for (const skill of skills) {
    const dir = join(HARNESS_DIR, tool, "skills", skill);
    try {
      const stat = Deno.statSync(dir);
      if (stat.isDirectory) {
        Deno.removeSync(dir, { recursive: true });
        deletedDirCount++;
        console.log(`  ✗ deleted: ${tool}/skills/${skill}/`);
      }
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        console.log(`  - not found: ${tool}/skills/${skill}/`);
      } else {
        console.log(`  ! error deleting ${tool}/skills/${skill}/: ${e}`);
      }
    }
  }
}

// Also delete extra variant dirs
for (const [tool, extras] of Object.entries(EXTRA_VARIANTS)) {
  for (const extra of extras) {
    if (OLD_SKILLS_BY_TOOL[tool]?.includes(extra)) continue; // already handled above
    const dir = join(HARNESS_DIR, tool, "skills", extra);
    try {
      const stat = Deno.statSync(dir);
      if (stat.isDirectory) {
        Deno.removeSync(dir, { recursive: true });
        deletedDirCount++;
        console.log(`  ✗ deleted: ${tool}/skills/${extra}/`);
      }
    } catch {
      // ignore
    }
  }
}

console.log(`\nDeleted ${deletedDirCount} old skill directories.`);
