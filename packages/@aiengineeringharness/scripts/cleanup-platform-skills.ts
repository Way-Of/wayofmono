#!/usr/bin/env deno run --allow-read --allow-write --allow-env

/**
 * Cleanup Platform Skills - Remove Duplicate Naming Conventions
 * 
 * Removes incorrect naming convention duplicates from platform-specific skills directories.
 * Based on the canonical naming conventions:
 * - pi: kebab-case (hyphens)
 * - claude, opencode, gemini, wocoder, antigravity, codex: snake_case (underscores)
 * 
 * The 7 core skills (auto-ticket-creator, cto-dashboard, docs-sync-updater, 
 * help-command, skill-adapter, skill-auto-update, ticket-manager) use hyphens on ALL platforms.
 */

import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";

const HARNESS_DIR = new URL("../..", import.meta.url).pathname;

// Core skills that use hyphens on ALL platforms
const CORE_SKILLS_HYPHENS = new Set([
  "auto-ticket-creator",
  "cto-dashboard",
  "docs-sync-updater",
  "help-command",
  "skill-adapter",
  "skill-auto-update",
  "ticket-manager",
]);

// Platform naming conventions
const PLATFORM_NAMING: Record<string, "kebab" | "snake"> = {
  pi: "kebab",
  claude: "snake",
  opencode: "snake",
  gemini: "snake",
  wocoder: "snake",
  antigravity: "snake",
  codex: "snake",
};

function toKebabCase(name: string): string {
  return name.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function toSnakeCase(name: string): string {
  return name.toLowerCase().replace(/[\s-]+/g, "_").replace(/[^a-z0-9_]/g, "");
}

async function cleanupPlatform(platform: string): Promise<void> {
  const naming = PLATFORM_NAMING[platform];
  if (!naming) {
    console.log(`  ⚠️  Unknown platform: ${platform}`);
    return;
  }

  const skillsDir = join(HARNESS_DIR, platform, "skills");
  
  try {
    const entries = [];
    for await (const entry of Deno.readDir(skillsDir)) {
      if (entry.isDirectory) {
        entries.push(entry.name);
      }
    }

    console.log(`\n📁 ${platform} (${naming} case): ${entries.length} skills`);
    
    let removed = 0;
    
    for (const skillName of entries) {
      // Skip core skills - they correctly use hyphens everywhere
      if (CORE_SKILLS_HYPHENS.has(skillName)) {
        continue;
      }

      const isKebab = skillName.includes("-") && !skillName.includes("_");
      const isSnake = skillName.includes("_") && !skillName.includes("-");
      const hasBoth = skillName.includes("-") && skillName.includes("_");

      // Determine if this skill uses the wrong convention for this platform
      let shouldRemove = false;
      let reason = "";

      if (naming === "kebab") {
        // pi should use kebab-case
        if (isSnake) {
          shouldRemove = true;
          reason = "snake_case (should be kebab-case)";
        }
      } else {
        // Other platforms should use snake_case
        if (isKebab) {
          shouldRemove = true;
          reason = "kebab-case (should be snake_case)";
        }
      }

      if (shouldRemove) {
        const skillPath = join(skillsDir, skillName);
        console.log(`  🗑️  Removing ${skillName} (${reason})`);
        try {
          await Deno.remove(skillPath, { recursive: true });
          removed++;
        } catch (err) {
          console.error(`    ❌ Failed to remove ${skillName}: ${err.message}`);
        }
      }
    }

    if (removed === 0) {
      console.log(`  ✅ No duplicates to remove`);
    } else {
      console.log(`  ✅ Removed ${removed} duplicate skills`);
    }

  } catch (err) {
    console.error(`  ❌ Error reading ${platform}/skills: ${err.message}`);
  }
}

async function main() {
  console.log("==========================================");
  console.log("   Platform Skills Cleanup");
  console.log("==========================================");
  console.log("\nCore skills (hyphens on all platforms):");
  for (const s of CORE_SKILLS_HYPHENS) {
    console.log(`  - ${s}`);
  }

  const platforms = Object.keys(PLATFORM_NAMING);
  
  for (const platform of platforms) {
    await cleanupPlatform(platform);
  }

  console.log("\n==========================================");
  console.log("   Cleanup Complete");
  console.log("==========================================");
}

main().catch(console.error);