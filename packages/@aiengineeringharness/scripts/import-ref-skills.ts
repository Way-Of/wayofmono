#!/usr/bin/env deno run --allow-read --allow-write --allow-run --allow-env

/**
 * Import & Adapt Ref Skills/Agents (WOMONO-016)
 *
 * Reads skills from ref/skills/ and ref/agents/ and imports them into
 * the harness canonical structure and all platform-specific directories.
 *
 * Usage:
 *   deno run -A import-ref-skills.ts                    # Import all missing skills
 *   deno run -A import-ref-skills.ts --gap-analysis     # Show gaps only
 *   deno run -A import-ref-skills.ts --skill=tdd        # Import specific skill
 *   deno run -A import-ref-skills.ts --platform=claude   # Import for specific platform
 *   deno run -A import-ref-skills.ts --canonical        # Create canonical only
 *   deno run -A import-ref-skills.ts --agents           # Import agents only
 */

import { join, basename, dirname, extname } from "https://deno.land/std@0.224.0/path/mod.ts";
import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";

const SCRIPT_DIR = dirname(new URL(import.meta.url).pathname);
// Navigate up from scripts/ to harness dir, then to repo root
let ROOT = join(SCRIPT_DIR, "..", "..", "..");
// Verify we found the right root
try {
  await Deno.stat(join(ROOT, "ref", "skills"));
} catch {
  // Fallback: use CWD
  ROOT = Deno.cwd();
}
const REF_SKILLS_DIR = join(ROOT, "ref", "skills");
const REF_AGENTS_DIR = join(ROOT, "ref", "agents");
const HARNESS_DIR = join(ROOT, "packages", "@aiengineeringharness");
const CANONICAL_SKILLS_DIR = join(HARNESS_DIR, "skills");
const CANONICAL_AGENTS_DIR = join(HARNESS_DIR, "agents");

const PLATFORMS = ["claude", "opencode", "gemini", "pi", "wocoder", "antigravity"];

// Tool name mappings: ref tool names → platform-specific tool names
const TOOL_MAP: Record<string, Record<string, string>> = {
  claude: {
    read_file: "Read",
    run_shell_command: "Bash",
    search_file_content: "Grep",
    glob: "Glob",
    write: "Edit",
    write_file: "Write",
    replace: "Edit",
    web_search: "WebSearch",
    web_fetch: "WebFetch",
  },
  opencode: {
    read_file: "read",
    run_shell_command: "bash",
    search_file_content: "grep",
    glob: "glob",
    write: "edit",
    write_file: "write",
    replace: "edit",
    web_search: "web_search",
    web_fetch: "web_fetch",
  },
  gemini: {
    read_file: "Read",
    run_shell_command: "Bash",
    search_file_content: "Grep",
    glob: "Glob",
    write: "Edit",
    write_file: "Write",
    replace: "Edit",
    web_search: "WebSearch",
    web_fetch: "WebFetch",
  },
  pi: {
    read_file: "read",
    run_shell_command: "bash",
    search_file_content: "grep",
    glob: "glob",
    write: "edit",
    write_file: "write",
    replace: "edit",
    web_search: "web_search",
    web_fetch: "web_fetch",
  },
  wocoder: {
    read_file: "read",
    run_shell_command: "bash",
    search_file_content: "grep",
    glob: "glob",
    write: "edit",
    write_file: "write",
    replace: "edit",
    web_search: "web_search",
    web_fetch: "web_fetch",
  },
  antigravity: {
    read_file: "Read",
    run_shell_command: "Bash",
    search_file_content: "Grep",
    glob: "Glob",
    write: "write",
    write_file: "Write",
    replace: "write",
    web_search: "WebSearch",
    web_fetch: "WebFetch",
  },
};

// Naming conventions per platform
const NAMING: Record<string, "snake" | "kebab"> = {
  claude: "snake",
  opencode: "snake",
  gemini: "snake",
  pi: "kebab",
  wocoder: "snake",
  antigravity: "snake",
};

function toSnakeCase(name: string): string {
  return name.toLowerCase().replace(/[\s-]+/g, "_").replace(/[^a-z0-9_]/g, "");
}

function toKebabCase(name: string): string {
  return name.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function adaptName(name: string, platform: string): string {
  return NAMING[platform] === "kebab" ? toKebabCase(name) : toSnakeCase(name);
}

function adaptToolNames(content: string, platform: string): string {
  const map = TOOL_MAP[platform];
  if (!map) return content;

  let result = content;
  for (const [refName, platName] of Object.entries(map)) {
    // Replace in allowed-tools: and tools: frontmatter lines
    result = result.replace(
      new RegExp(`\\b${refName}\\b`, "g"),
      platName,
    );
    // Replace in markdown body references
    result = result.replace(
      new RegExp(`\`${refName}\``, "g"),
      `\`${platName}\``,
    );
  }
  return result;
}

function getAllowedToolsLine(frontmatter: string, platform: string): string {
  const match = frontmatter.match(/allowed-tools:\s*(.+)/);
  if (!match) return "";
  const tools = match[1].split(",").map((t: string) => t.trim());
  const adapted = tools.map((t: string) => {
    const map = TOOL_MAP[platform];
    return map?.[t] ?? t;
  });
  return `allowed-tools: ${adapted.join(", ")}`;
}

async function copyRecursive(src: string, dest: string, overwrite = false): Promise<void> {
  await ensureDir(dest);
  for await (const entry of Deno.readDir(src)) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory) {
      await copyRecursive(srcPath, destPath, overwrite);
    } else if (entry.isFile) {
      try {
        await Deno.stat(destPath);
        if (!overwrite) continue;
      } catch {
        // doesn't exist, proceed
      }
      await Deno.copyFile(srcPath, destPath);
    }
  }
}

async function parseSkillFrontmatter(content: string): Promise<{
  frontmatter: Record<string, string>;
  body: string;
  rawFrontmatter: string;
}> {
  const match = content.match(/^---\n([\s\S]*?)\n(?:---|\.\.\.)\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content, rawFrontmatter: "" };

  const fm: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    fm[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
  }

  return { frontmatter: fm, body: match[2], rawFrontmatter: match[1] };
}

async function skillExists(skillName: string, platform: string): Promise<boolean> {
  const dir = join(HARNESS_DIR, platform, "skills", skillName);
  try {
    await Deno.stat(dir);
    return true;
  } catch {
    return false;
  }
}

async function importSkillToCanonical(refName: string): Promise<boolean> {
  const srcDir = join(REF_SKILLS_DIR, refName);
  const canonicalName = toSnakeCase(refName);
  const destDir = join(CANONICAL_SKILLS_DIR, canonicalName);

  try {
    await copyRecursive(srcDir, destDir, false);
    console.log(`  ✓ Canonical: ${canonicalName}`);
    return true;
  } catch (err) {
    console.error(`  ✗ Canonical: ${canonicalName} — ${err.message}`);
    return false;
  }
}

async function importSkillToPlatform(
  refName: string,
  platform: string,
): Promise<void> {
  const srcDir = join(REF_SKILLS_DIR, refName);
  const platformName = adaptName(refName, platform);
  const destDir = join(HARNESS_DIR, platform, "skills", platformName);

  if (await skillExists(platformName, platform)) {
    console.log(`  - ${platform}: ${platformName} (already exists)`);
    return;
  }

  await ensureDir(destDir);

  // Copy all files from ref skill
  for await (const entry of Deno.readDir(srcDir)) {
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);

    if (entry.isDirectory) {
      await copyRecursive(srcPath, destPath, false);
      continue;
    }

    if (!entry.name.endsWith(".md")) {
      await Deno.copyFile(srcPath, destPath);
      continue;
    }

    // Read, adapt, and write markdown files
    let content = await Deno.readTextFile(srcPath);
    const { frontmatter, body, rawFrontmatter } = await parseSkillFrontmatter(content);

    // Adapt tool names in frontmatter
    if (rawFrontmatter) {
      const adaptedTools = getAllowedToolsLine(rawFrontmatter, platform);
      const toolsLine = rawFrontmatter.match(/tools:\s*(.+)/);
      const adaptedToolsLine = toolsLine
        ? `tools: ${toolsLine[1].split(",").map((t: string) => {
            const map = TOOL_MAP[platform];
            return map?.[t.trim()] ?? t.trim();
          }).join(", ")}`
        : "";

      let newFrontmatter = rawFrontmatter;
      if (adaptedTools) {
        newFrontmatter = newFrontmatter.replace(/allowed-tools:\s*.+/, adaptedTools);
      }
      if (adaptedToolsLine) {
        newFrontmatter = newFrontmatter.replace(/tools:\s*.+/, adaptedToolsLine);
      }

      // Adapt body
      const adaptedBody = body.includes("allowed-tools")
        ? adaptToolNames(body, platform)
        : body;

      content = `---\n${newFrontmatter}\n---\n${adaptedBody}`;
    } else {
      content = adaptToolNames(content, platform);
    }

    await Deno.writeTextFile(destPath, content);
  }

  console.log(`  ✓ ${platform}: ${platformName}`);
}

async function importAgentToPlatform(
  agentFile: string,
  platform: string,
): Promise<void> {
  const agentName = basename(agentFile, ".md");
  const platformName = adaptName(agentName, platform);
  const destDir = join(HARNESS_DIR, platform, "agents");
  const destPath = join(destDir, `${platformName}.md`);

  try {
    await Deno.stat(destPath);
    return; // already exists
  } catch {
    // doesn't exist, proceed
  }

  await ensureDir(destDir);
  let content = await Deno.readTextFile(agentFile);
  content = adaptToolNames(content, platform);
  await Deno.writeTextFile(destPath, content);
  console.log(`  ✓ ${platform}: agents/${platformName}.md`);
}

async function gapAnalysis(): Promise<void> {
  const refSkills = new Set<string>();
  for await (const entry of Deno.readDir(REF_SKILLS_DIR)) {
    if (entry.isDirectory) refSkills.add(entry.name);
  }

  console.log("\n📊 Gap Analysis — Skills Missing Per Platform\n");

  for (const platform of PLATFORMS) {
    const platformSkills = new Set<string>();
    const dir = join(HARNESS_DIR, platform, "skills");
    try {
      for await (const entry of Deno.readDir(dir)) {
        if (entry.isDirectory) platformSkills.add(entry.name);
      }
    } catch {
      // dir doesn't exist
    }

    const normalizedPlatform = new Set<string>();
    for (const s of platformSkills) {
      normalizedPlatform.add(toSnakeCase(s));
    }

    const missing: string[] = [];
    for (const ref of refSkills) {
      if (!normalizedPlatform.has(toSnakeCase(ref))) {
        missing.push(ref);
      }
    }

    if (missing.length > 0) {
      console.log(`  ${platform} (${missing.length} missing):`);
      for (const m of missing.slice(0, 10)) {
        console.log(`    - ${m}`);
      }
      if (missing.length > 10) {
        console.log(`    ... and ${missing.length - 10} more`);
      }
      console.log();
    } else {
      console.log(`  ${platform}: all skills present ✅\n`);
    }
  }

  // Agent gap analysis
  console.log("\n📊 Agent Gap Analysis\n");
  const refAgents: string[] = [];
  for await (const entry of Deno.readDir(REF_AGENTS_DIR)) {
    if (entry.name.endsWith(".md")) refAgents.push(entry.name);
  }

  for (const platform of PLATFORMS) {
    const platformAgents = new Set<string>();
    const dir = join(HARNESS_DIR, platform, "agents");
    try {
      for await (const entry of Deno.readDir(dir)) {
        platformAgents.add(toSnakeCase(entry.name));
      }
    } catch {
      // dir doesn't exist
    }

    const missing = refAgents.filter((a) => !platformAgents.has(toSnakeCase(a)));
    if (missing.length > 0) {
      console.log(`  ${platform}: ${missing.length} agents missing`);
    } else {
      console.log(`  ${platform}: all agents present ✅`);
    }
  }
}

async function importAllSkills(
  filterSkill?: string,
  filterPlatform?: string,
  canonicalOnly = false,
): Promise<void> {
  const refSkills: string[] = [];
  for await (const entry of Deno.readDir(REF_SKILLS_DIR)) {
    if (entry.isDirectory) refSkills.push(entry.name);
  }
  refSkills.sort();

  const targetPlatforms = filterPlatform
    ? [filterPlatform]
    : PLATFORMS;

  let imported = 0;
  let skipped = 0;

  for (const refName of refSkills) {
    if (filterSkill && toSnakeCase(refName) !== toSnakeCase(filterSkill)) {
      continue;
    }

    console.log(`\n📦 ${refName}`);

    // Canonical import
    if (canonicalOnly || !filterPlatform) {
      const canonicalName = toSnakeCase(refName);
      const canonicalPath = join(CANONICAL_SKILLS_DIR, canonicalName);
      try {
        await Deno.stat(canonicalPath);
        console.log(`  ✓ Canonical: ${canonicalName} (already exists)`);
      } catch {
        if (await importSkillToCanonical(refName)) {
          imported++;
        }
      }
    }

    if (canonicalOnly) continue;

    // Platform imports
    for (const platform of targetPlatforms) {
      try {
        await importSkillToPlatform(refName, platform);
        imported++;
      } catch (err) {
        console.error(`  ✗ ${platform}: ${err.message}`);
        skipped++;
      }
    }
  }

  console.log(`\n✅ Done: ${imported} imports, ${skipped} errors`);
}

async function importAllAgents(filterPlatform?: string): Promise<void> {
  const refAgents: string[] = [];
  for await (const entry of Deno.readDir(REF_AGENTS_DIR)) {
    if (entry.name.endsWith(".md")) refAgents.push(entry.name);
  }
  refAgents.sort();

  const targetPlatforms = filterPlatform
    ? [filterPlatform]
    : PLATFORMS;

  let imported = 0;

  for (const agentFile of refAgents) {
    const agentPath = join(REF_AGENTS_DIR, agentFile);
    console.log(`\n📄 ${agentFile}`);

    // Copy to canonical agents
    await ensureDir(CANONICAL_AGENTS_DIR);
    const destPath = join(CANONICAL_AGENTS_DIR, agentFile);
    try {
      await Deno.stat(destPath);
    } catch {
      await Deno.copyFile(agentPath, destPath);
      console.log(`  ✓ Canonical: ${agentFile}`);
      imported++;
    }

    for (const platform of targetPlatforms) {
      await importAgentToPlatform(agentPath, platform);
      imported++;
    }
  }

  console.log(`\n✅ Agents done: ${imported} imports`);
}

// CLI
const args = parse(Deno.args, {
  string: ["skill", "platform"],
  boolean: ["gap-analysis", "canonical", "agents", "help"],
  alias: { h: "help" },
});

if (args.help) {
  console.log(`
Import Ref Skills/Agents (PROJ-016)

Usage:
  import-ref-skills.ts                     Import all missing skills to all platforms
  import-ref-skills.ts --gap-analysis      Show what's missing per platform
  import-ref-skills.ts --skill=tdd         Import specific skill
  import-ref-skills.ts --platform=claude   Import for specific platform only
  import-ref-skills.ts --canonical         Create canonical skills only
  import-ref-skills.ts --agents            Import agents only
`);
  Deno.exit(0);
}

if (args["gap-analysis"]) {
  await gapAnalysis();
} else if (args.agents) {
  await importAllAgents(args.platform);
} else {
  await importAllSkills(args.skill, args.platform, args.canonical);
}
