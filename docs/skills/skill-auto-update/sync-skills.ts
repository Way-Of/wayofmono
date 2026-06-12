#!/usr/bin/env deno run --allow-read --allow-write --allow-run --allow-env

/**
 * Skill Auto-Update & Sync
 *
 * Scans canonical skills, compares with installed skills per frontend,
 * generates platform-specific formats via skill-adapter, and syncs.
 *
 * Usage:
 *   deno run -A sync-skills.ts                         # Sync all skills to all frontends
 *   deno run -A sync-skills.ts --platform=claude       # Sync to specific platform
 *   deno run -A sync-skills.ts --skill=ticket-manager  # Sync specific skill
 *   deno run -A sync-skills.ts --dry-run               # Preview only
 *   deno run -A sync-skills.ts --watch                 # Watch mode (continuous)
 *   deno run -A sync-skills.ts --status                # Show sync status
 */

import { join, dirname, basename } from "https://deno.land/std@0.224.0/path/mod.ts";
import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";

const SCRIPT_DIR = dirname(new URL(import.meta.url).pathname);
const HARNESS_DIR = join(SCRIPT_DIR, "..", "..");
const ROOT = join(HARNESS_DIR, "..", "..");
const CANONICAL_SKILLS_DIR = join(HARNESS_DIR, "skills");
const REGISTRY_PATH = join(CANONICAL_SKILLS_DIR, "skill-registry.json");
const STATE_DIR = join(ROOT, ".wo", "state");
const SYNC_STATE_PATH = join(STATE_DIR, "skill-sync-state.json");
const REF_SKILLS_DIR = join(ROOT, "ref", "skills");

const PLATFORMS = ["claude", "opencode", "gemini", "pi", "wocoder", "antigravity", "codex"];

interface SkillRegistry {
  version: string;
  skills: Record<string, {
    name: string;
    namespace: string;
    version: string;
    description: string;
    dependencies: string[];
    platforms: string[];
    path: string;
  }>;
}

interface SyncState {
  lastSync: string;
  skillHashes: Record<string, string>;
}

// --- Helpers ---

async function readJson<T>(path: string): Promise<T | null> {
  try {
    const content = await Deno.readTextFile(path);
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function writeJson(path: string, data: unknown): Promise<void> {
  await ensureDir(dirname(path));
  await Deno.writeTextFile(path, JSON.stringify(data, null, 2));
}

async function computeHash(filePath: string): Promise<string> {
  try {
    const content = await Deno.readTextFile(filePath);
    const bytes = new TextEncoder().encode(content);
    const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return "";
  }
}

function formatDate(): string {
  return new Date().toISOString();
}

function printDiff(added: string[], updated: string[], removed: string[]): void {
  for (const a of added) console.log(`  + added    ${a}`);
  for (const u of updated) console.log(`  ~ updated  ${u}`);
  for (const r of removed) console.log(`  - removed  ${r}`);
}

// --- Scanning ---

async function getCanonicalSkills(): Promise<Record<string, string>> {
  // Only sync skills registered in skill-registry.json (system skills)
  const registry = await readJson<SkillRegistry>(REGISTRY_PATH);
  const registeredNames = new Set(Object.keys(registry?.skills ?? {}));

  const skills: Record<string, string> = {};
  for await (const entry of Deno.readDir(CANONICAL_SKILLS_DIR)) {
    if (!entry.isDirectory) continue;
    // Skip ref skills — they live in ref/skills/ and are imported separately
    if (!registeredNames.has(entry.name)) continue;
    const skillMd = join(CANONICAL_SKILLS_DIR, entry.name, "SKILL.md");
    const hash = await computeHash(skillMd);
    if (hash) skills[entry.name] = hash;
  }
  return skills;
}

async function getRefSkillNames(): Promise<Set<string>> {
  const names = new Set<string>();
  try {
    for await (const entry of Deno.readDir(REF_SKILLS_DIR)) {
      if (entry.isDirectory) names.add(entry.name);
    }
  } catch {
    // ref/skills/ doesn't exist
  }
  return names;
}

async function getInstalledSkills(platform: string): Promise<Record<string, string>> {
  const skills: Record<string, string> = {};
  const platformSkillsDir = join(HARNESS_DIR, platform, "skills");
  try {
    for await (const entry of Deno.readDir(platformSkillsDir)) {
      if (!entry.isDirectory) continue;
      const skillDir = join(platformSkillsDir, entry.name);
      // Find the main file to hash
      const mainFile = join(skillDir, "SKILL.md");
      const hash = await computeHash(mainFile);
      if (hash) skills[entry.name] = hash;
    }
  } catch {
    // Platform dir doesn't exist yet
  }
  return skills;
}

// --- Diff ---

function diffSkills(
  canonical: Record<string, string>,
  installed: Record<string, string>,
): { added: string[]; updated: string[]; removed: string[]; unchanged: string[] } {
  const added: string[] = [];
  const updated: string[] = [];
  const removed: string[] = [];
  const unchanged: string[] = [];

  for (const [name, hash] of Object.entries(canonical)) {
    if (!(name in installed)) {
      added.push(name);
    } else if (installed[name] !== hash) {
      updated.push(name);
    } else {
      unchanged.push(name);
    }
  }

  for (const name of Object.keys(installed)) {
    if (!(name in canonical)) {
      removed.push(name);
    }
  }

  return { added, updated, removed, unchanged };
}

// --- Sync ---

async function syncSkillToPlatform(
  skillName: string,
  platform: string,
  dryRun: boolean,
): Promise<boolean> {
  const destDir = join(HARNESS_DIR, platform, "skills", skillName);
  const srcDir = join(CANONICAL_SKILLS_DIR, skillName);

  if (dryRun) {
    console.log(`  [dry-run] would sync ${skillName} → ${platform}`);
    return true;
  }

  await ensureDir(destDir);

  // Copy all files from canonical to platform
  let copied = 0;
  for await (const entry of Deno.readDir(srcDir)) {
    if (entry.isDirectory) continue;
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);

    // Skip cross-platform wrappers (.sh, .bat, .ps1) — they stay in canonical
    if (entry.name.endsWith(".sh") || entry.name.endsWith(".bat") || entry.name.endsWith(".ps1")) {
      continue;
    }

    await Deno.copyFile(srcPath, destPath);
    copied++;
  }

  return copied > 0;
}

// --- Status ---

async function showStatus(): Promise<void> {
  const canonical = await getCanonicalSkills();
  const state = await readJson<SyncState>(SYNC_STATE_PATH);

  console.log(`\nSkill Sync Status\n`);
  if (state) {
    console.log(`Last sync: ${state.lastSync}`);
    console.log(`Tracked skills: ${Object.keys(state.skillHashes).length}`);
  } else {
    console.log(`Last sync: never`);
  }

  console.log(`\nCanonical skills: ${Object.keys(canonical).length}`);

  for (const platform of PLATFORMS.slice(0, 6)) {
    const installed = await getInstalledSkills(platform);
    const { added, updated, removed } = diffSkills(canonical, installed);

    const statusColor = added.length === 0 && updated.length === 0
      ? "✓"
      : "◷";
    const installedCount = Object.keys(installed).length;
    console.log(`\n  ${statusColor} ${platform}: ${installedCount} installed`);
    if (added.length > 0) console.log(`      +${added.length} to add`);
    if (updated.length > 0) console.log(`      ~${updated.length} to update`);
    if (removed.length > 0 && removed.length > 0) console.log(`      -${removed.length} not tracked (ref skills)`);
  }
}

// --- Main ---

const args = parse(Deno.args, {
  string: ["platform", "skill"],
  boolean: ["dry-run", "watch", "status", "help"],
  alias: { h: "help", n: "dry-run" },
});

if (args.help) {
  console.log(`
Skill Auto-Update & Sync

Usage:
  sync-skills.ts                           Sync all skills to all platforms
  sync-skills.ts --platform=claude         Sync to specific platform
  sync-skills.ts --skill=ticket-manager    Sync specific skill
  sync-skills.ts --dry-run                 Preview changes only
  sync-skills.ts --watch                   Watch mode (continuous)
  sync-skills.ts --status                  Show sync status
`);
  Deno.exit(0);
}

if (args.status) {
  await showStatus();
  Deno.exit(0);
}

// Watch mode
if (args.watch) {
  console.log("👀 Watch mode enabled. Press Ctrl+C to stop.\n");
  const watcher = Deno.watchFs(CANONICAL_SKILLS_DIR);
  for await (const event of watcher) {
    if (event.kind === "modify" || event.kind === "create") {
      console.log(`\n📂 Change detected: ${event.paths.join(", ")}`);
      // Re-run sync
      const canonical = await getCanonicalSkills();
      for (const platform of PLATFORMS.filter((p) => p !== "codex")) {
        const installed = await getInstalledSkills(platform);
        const { added, updated } = diffSkills(canonical, installed);
        const toSync = [...added, ...updated];
        for (const name of toSync) {
          await syncSkillToPlatform(name, platform, false);
          console.log(`  ✓ ${name} → ${platform}`);
        }
      }
      await writeJson(SYNC_STATE_PATH, {
        lastSync: formatDate(),
        skillHashes: canonical,
      });
    }
  }
  Deno.exit(0);
}

// One-shot sync
const filterPlatform = args.platform;
const filterSkill = args.skill;
const dryRun = args["dry-run"];

const targetPlatforms = filterPlatform
  ? [filterPlatform]
  : PLATFORMS.filter((p) => p !== "codex"); // Skip codex for now

const canonical = await getCanonicalSkills();

console.log(`\n📦 Skill Sync\n`);
let totalAdded = 0;
let totalUpdated = 0;
let totalRemoved = 0;

for (const platform of targetPlatforms) {
  const installed = await getInstalledSkills(platform);
  const { added, updated, removed } = diffSkills(canonical, installed);

  const filteredAdded = filterSkill
    ? added.filter((s) => s === filterSkill)
    : added;
  const filteredUpdated = filterSkill
    ? updated.filter((s) => s === filterSkill)
    : updated;

  if (filteredAdded.length === 0 && filteredUpdated.length === 0 && removed.length === 0) {
    if (!filterSkill) console.log(`  ${platform}: up to date`);
    continue;
  }

  console.log(`\n  ${platform}:`);

  for (const name of filteredAdded) {
    await syncSkillToPlatform(name, platform, dryRun);
    if (!dryRun) console.log(`  ✓ added    ${name}`);
    totalAdded++;
  }

  for (const name of filteredUpdated) {
    await syncSkillToPlatform(name, platform, dryRun);
    if (!dryRun) console.log(`  ✓ updated  ${name}`);
    totalUpdated++;
  }

  // sync-skills only manages system skills (add/update). Never remove anything.
}

// Save sync state
if (!dryRun) {
  await writeJson(SYNC_STATE_PATH, {
    lastSync: formatDate(),
    skillHashes: canonical,
  });
}

console.log(
  `\n✅ ${dryRun ? "[DRY-RUN] " : ""}${totalAdded} added, ${totalUpdated} updated, ${totalRemoved} removed across ${targetPlatforms.length} platforms`,
);

// Run adapter generation for new/updated canonical skills
if (!dryRun && (totalAdded > 0 || totalUpdated > 0)) {
  console.log("\n🔄 Regenerating platform-specific formats via skill-adapter...");
  const adapterPath = join(HARNESS_DIR, "skills", "skill-adapter", "adapter.ts");
  for (const platform of targetPlatforms) {
    const cmd = new Deno.Command("deno", {
      args: ["run", "--allow-read", "--allow-write", adapterPath, "generate", "--all", `--platform=${platform}`],
    });
    const output = await cmd.output();
    if (!output.success) {
      console.error(`  adapter failed for ${platform}`);
    }
  }
  console.log("  ✓ Platform formats regenerated");
}
