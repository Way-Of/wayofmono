#!/usr/bin/env deno run --allow-read --allow-write --allow-run

/**
 * Ticket Migration Script
 * Migrates tickets from flat structure to categorized folder structure.
 * Run with: deno run --allow-read --allow-write --allow-run migrate-tickets.ts
 * Or: ./migrate-tickets.sh (Unix) / migrate-tickets.bat (Windows)
 */

import { join, basename, dirname } from "https://deno.land/std@0.224.0/path/mod.ts";
import { existsSync } from "https://deno.land/std@0.224.0/fs/exists.ts";

const TICKETS_ROOT = join(Deno.cwd(), "thoughts", "shared", "tickets");

const CATEGORY_MAP: Record<string, string> = {
  // Architecture
  "PROJ-001-initialize-wayofmono-core.md": "architecture",
  "PROJ-002-adapt-wo-ai.md": "architecture",
  "PROJ-003-adapt-wo-tui.md": "architecture",
  "PROJ-004-implement-telemetry.md": "architecture",
  "PROJ-005-adapt-wo-agent-core.md": "architecture",
  "PROJ-007-adapt-wo-coding-agent.md": "architecture",
  "PROJ-008-bulk-copy-pi-to-wo.md": "architecture",
  "PROJ-009-adapt-wo-agent.md": "architecture",
  "PROJ-010-bootstrap-wocoder.md": "architecture",
  "PROJ-011-fix-npm-packages-republish.md": "architecture",
  "PROJ-012-fix-pnpm-workspace-protocol-for-bun-compat.md": "architecture",

  // Frontend
  "PROJ-006-implement-wo-web-ui.md": "frontend",

  // Communications
  "implement-whatsapp-bot.md": "communications",

  // Backend
  "missing-telegram-server-files.md": "backend",

  // System/Harness
  "PROJ-013-implement-ticket-manager-skill.md": "system/harness",

  // System/Skills
  "PROJ-014-skill-auto-update-sync.md": "system/skills",
  "PROJ-016-import-ref-skills-agents.md": "system/skills",
  "PROJ-020-platform-specific-skill-loading.md": "system/skills",

  // System/Agents
  "PROJ-015-agent-namespacing-separation.md": "system/agents",

  // System/Team
  "PROJ-018-team-project-setup.md": "system/team",
  "PROJ-019-cto-dashboard-reporting.md": "system/team",
  "PROJ-021-personal-todo-hierarchy.md": "system/team",

  // System/Docs-Sync
  "PROJ-017-auto-ticket-creation-skill.md": "system/docs-sync",
  "PROJ-022-docs-sync-updater.md": "system/docs-sync",

  // System/Templates
  "PROJ-023-ticket-folder-organization.md": "system/templates",
  "PROJ-update.md": "system/templates",
};

async function ensureDir(path: string): Promise<void> {
  try {
    await Deno.mkdir(path, { recursive: true });
  } catch (e) {
    if (!(e instanceof Deno.errors.AlreadyExists)) throw e;
  }
}

async function migrate(): Promise<void> {
  console.log("🔄 Starting ticket migration...");
  console.log(`📁 Source: ${TICKETS_ROOT}`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const [filename, category] of Object.entries(CATEGORY_MAP)) {
    const sourcePath = join(TICKETS_ROOT, filename);
    const targetDir = join(TICKETS_ROOT, category);
    const targetPath = join(targetDir, filename);

    if (!existsSync(sourcePath)) {
      console.log(`  ⏭️  Skipping ${filename} (not found in root)`);
      skipped++;
      continue;
    }

    if (existsSync(targetPath)) {
      console.log(`  ⏭️  Skipping ${filename} (already in ${category})`);
      skipped++;
      continue;
    }

    try {
      await ensureDir(targetDir);
      await Deno.rename(sourcePath, targetPath);
      console.log(`  ✅ Moved ${filename} → ${category}/`);
      migrated++;
    } catch (e) {
      console.error(`  ❌ Failed to move ${filename}: ${e}`);
      errors++;
    }
  }

  console.log(`\n📊 Migration complete:`);
  console.log(`   ✅ Migrated: ${migrated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);

  // Verify structure
  console.log("\n📂 Final structure:");
  for (const entry of Deno.readDirSync(TICKETS_ROOT)) {
    if (entry.isDirectory) {
      const files = Array.from(Deno.readDirSync(join(TICKETS_ROOT, entry.name)))
        .filter(f => f.isFile && f.name.endsWith(".md"))
        .length;
      console.log(`   ${entry.name}/: ${files} tickets`);
    }
  }
}

if (import.meta.main) {
  await migrate();
}