#!/usr/bin/env deno run --allow-read --allow-write --allow-run

/**
 * Ticket Migration Script
 * Migrates tickets from aiharnes subfolders to categorized structure at thoughts/wayofmono/shared/tickets/
 * Renames PROJ-XXX to WOMONO-XXX
 * Run with: deno run --allow-read --allow-write --allow-run migrate-tickets.ts
 */

import { join, basename, dirname } from "https://deno.land/std@0.224.0/path/mod.ts";
import { existsSync } from "https://deno.land/std@0.224.0/fs/exists.ts";

const SOURCE_ROOT = join(Deno.cwd(), "thoughts", "wayofmono", "shared", "aiharness");
const TARGET_ROOT = join(Deno.cwd(), "thoughts", "wayofmono", "shared", "tickets");

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

  // Additional tickets found
  "PROJ-024-ai-harness-help-command.md": "system/harness",
  "PROJ-025-codex-first-class-platform.md": "system/harness",
  "PROJ-026-centralized-ticket-repo.md": "system/harness",
};

async function ensureDir(path: string): Promise<void> {
  try {
    await Deno.mkdir(path, { recursive: true });
  } catch (e) {
    if (!(e instanceof Deno.errors.AlreadyExists)) throw e;
  }
}

async function findAllTickets(): Promise<string[]> {
  const tickets: string[] = [];
  async function walk(dir: string) {
    try {
      for await (const entry of Deno.readDir(dir)) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory && !entry.name.startsWith(".")) {
          await walk(fullPath);
        } else if (entry.name.endsWith(".md") && entry.name !== "TODO.md" && entry.name !== "ticket-template.md") {
          tickets.push(fullPath);
        }
      }
    } catch {
      // skip unreadable dirs
    }
  }
  await walk(SOURCE_ROOT);
  return tickets;
}

async function migrate(): Promise<void> {
  console.log("🔄 Starting ticket migration (PROJ-XXX → WOMONO-XXX + categorize)...");
  console.log(`📁 Source: ${SOURCE_ROOT}`);
  console.log(`📁 Target: ${TARGET_ROOT}`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  const allTickets = await findAllTickets();
  console.log(`📋 Found ${allTickets.length} ticket files to process\n`);

  for (const sourcePath of allTickets) {
    const filename = basename(sourcePath);
    const category = CATEGORY_MAP[filename];
    
    if (!category) {
      console.log(`  ⚠️  No category mapping for ${filename}, skipping`);
      skipped++;
      continue;
    }

    // Rename PROJ-XXX to WOMONO-XXX
    const newFilename = filename.replace(/^PROJ-/, "WOMONO-");
    const targetDir = join(TARGET_ROOT, category);
    const targetPath = join(targetDir, newFilename);

    if (existsSync(targetPath)) {
      console.log(`  ⏭️  Skipping ${filename} (already in ${category} as ${newFilename})`);
      skipped++;
      continue;
    }

    try {
      await ensureDir(targetDir);
      await Deno.rename(sourcePath, targetPath);
      if (filename !== newFilename) {
        console.log(`  ✅ Moved & renamed ${filename} → ${category}/${newFilename}`);
      } else {
        console.log(`  ✅ Moved ${filename} → ${category}/`);
      }
      migrated++;
    } catch (e) {
      console.error(`  ❌ Failed to move ${filename}: ${e}`);
      errors++;
    }
  }

  // Also copy ticket-template.md to target if it exists
  const templateSource = join(SOURCE_ROOT, "templates", "ticket-template.md");
  const templateTarget = join(TARGET_ROOT, "ticket-template.md");
  if (existsSync(templateSource) && !existsSync(templateTarget)) {
    await ensureDir(TARGET_ROOT);
    await Deno.copyFile(templateSource, templateTarget);
    console.log(`  📋 Copied ticket-template.md to target root`);
  }

  console.log(`\n📊 Migration complete:`);
  console.log(`   ✅ Migrated: ${migrated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);

  // Verify structure
  console.log("\n📂 Final structure:");
  for (const entry of Deno.readDirSync(TARGET_ROOT)) {
    if (entry.isDirectory) {
      const files = Array.from(Deno.readDirSync(join(TARGET_ROOT, entry.name)))
        .filter(f => f.isFile && f.name.endsWith(".md"))
        .length;
      console.log(`   ${entry.name}/: ${files} tickets`);
    } else if (entry.name.endsWith(".md")) {
      console.log(`   ${entry.name} (root)`);
    }
  }
}

if (import.meta.main) {
  await migrate();
}