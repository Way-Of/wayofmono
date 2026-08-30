#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env
/**
 * Docs Sync — ai-harness docs sync
 *
 * Syncs canonical skills from docs/skills/ to all 7 tool packages.
 * Handles per-tool naming conventions and frontmatter adaptations.
 *
 * Usage:
 *   deno run -A scripts/docs-sync.ts                    # sync all
 *   deno run -A scripts/docs-sync.ts --check             # check only, no write
 *   deno run -A scripts/docs-sync.ts --tool=opencode     # single tool
 *   deno run -A scripts/docs-sync.ts --skill=init_harness # single skill
 */

import { join, relative } from "jsr:@std/path@1";
import { ensureDir } from "jsr:@std/fs@1/ensure-dir";

const REPO_ROOT = join(import.meta.dirname!, "..", "..", "..");

interface ToolConfig {
  dir: string;
  skillDir: string;
  naming: "snake" | "kebab";
  stripFields: string[];
  toolNames: Record<string, string>;
}

const CANONICAL_TOOL_NAMES: Record<string, string> = {
  read_file: "read_file",
  write_file: "write_file",
  run_shell_command: "run_shell_command",
  search_file_content: "search_file_content",
  delegate_to_agent: "delegate_to_agent",
  write_todos: "write_todos",
  web_search: "web_search",
  web_fetch: "web_fetch",
};

const TOOLS: Record<string, ToolConfig> = {
  pi: {
    dir: "packages/@aiengineeringharness/pi",
    skillDir: "skills",
    naming: "kebab",
    stripFields: ["docs-url"],
    toolNames: {
      read_file: "Read",
      write_file: "Write",
      run_shell_command: "Bash",
      search_file_content: "Grep",
      delegate_to_agent: "Task",
      write_todos: "TodoWrite",
      web_search: "WebSearch",
      web_fetch: "WebFetch",
    },
  },
  opencode: {
    dir: "packages/@aiengineeringharness/opencode",
    skillDir: "skills",
    naming: "snake",
    stripFields: ["docs-url"],
    toolNames: {
      read_file: "read",
      write_file: "write",
      run_shell_command: "bash",
      search_file_content: "grep",
      delegate_to_agent: "task",
      write_todos: "todowrite",
      web_search: "web_search",
      web_fetch: "web_fetch",
    },
  },
  claude: {
    dir: "packages/@aiengineeringharness/claude",
    skillDir: "skills",
    naming: "snake",
    stripFields: ["docs-url"],
    toolNames: {
      read_file: "Read",
      write_file: "Write",
      run_shell_command: "Bash",
      search_file_content: "Grep",
      delegate_to_agent: "Task",
      write_todos: "TodoWrite",
      web_search: "WebSearch",
      web_fetch: "WebFetch",
    },
  },
  gemini: {
    dir: "packages/@aiengineeringharness/gemini",
    skillDir: "skills",
    naming: "snake",
    stripFields: ["docs-url"],
    toolNames: {
      read_file: "read",
      write_file: "write",
      run_shell_command: "bash",
      search_file_content: "grep",
      delegate_to_agent: "task",
      write_todos: "todowrite",
      web_search: "web_search",
      web_fetch: "web_fetch",
    },
  },
  codex: {
    dir: "packages/@aiengineeringharness/codex",
    skillDir: "skills",
    naming: "snake",
    stripFields: ["docs-url"],
    toolNames: { ...CANONICAL_TOOL_NAMES },
  },
  wocoder: {
    dir: "packages/@aiengineeringharness/wocoder",
    skillDir: "skills",
    naming: "snake",
    stripFields: ["docs-url"],
    toolNames: {
      read_file: "Read",
      write_file: "Write",
      run_shell_command: "Bash",
      search_file_content: "Grep",
      delegate_to_agent: "Task",
      write_todos: "TodoWrite",
      web_search: "WebSearch",
      web_fetch: "WebFetch",
    },
  },
  antigravity: {
    dir: "packages/@aiengineeringharness/antigravity",
    skillDir: "skills",
    naming: "snake",
    stripFields: ["docs-url"],
    toolNames: {
      read_file: "read",
      write_file: "write",
      run_shell_command: "bash",
      search_file_content: "grep",
      delegate_to_agent: "task",
      write_todos: "todowrite",
      web_search: "web_search",
      web_fetch: "web_fetch",
    },
  },
};

function toToolName(name: string, naming: "snake" | "kebab"): string {
  if (naming === "kebab") return name.replace(/_/g, "-");
  return name.replace(/-/g, "_");
}

function stripFrontmatterFields(content: string, fields: string[]): string {
  let result = content;
  for (const field of fields) {
    result = result.replace(new RegExp(`^${field}:.*$\\n?`, "m"), "");
  }
  return result;
}

function translateToolNames(content: string, mapping: Record<string, string>): string {
  return content.replace(
    /^(allowed-tools|tools):\s*(.+)$/m,
    (_, field, value) => {
      const translated = value.split(/,\s*/).map((t: string) => {
        const trimmed = t.trim();
        return mapping[trimmed] ?? trimmed;
      }).join(", ");
      return `${field}: ${translated}`;
    },
  );
}

interface SyncResult {
  tool: string;
  skill: string;
  status: "synced" | "unchanged" | "missing-canonical" | "error";
  error?: string;
}

async function syncSkill(
  tool: string,
  config: ToolConfig,
  skillName: string,
  canonicalDir: string,
  dryRun: boolean,
): Promise<SyncResult> {
  const canonicalFile = join(canonicalDir, skillName, "SKILL.md");
  const toolSkillName = toToolName(skillName, config.naming);
  const toolFile = join(REPO_ROOT, config.dir, config.skillDir, toolSkillName, "SKILL.md");

  try {
    const canonicalContent = await Deno.readTextFile(canonicalFile);
    let adaptedContent = stripFrontmatterFields(canonicalContent, config.stripFields);
    adaptedContent = translateToolNames(adaptedContent, config.toolNames);

    try {
      const existingContent = await Deno.readTextFile(toolFile);
      if (existingContent === adaptedContent) {
        return { tool, skill: skillName, status: "unchanged" };
      }
    } catch {
      // File doesn't exist — will create
    }

    if (dryRun) {
      return { tool, skill: skillName, status: "synced" };
    }

    await ensureDir(join(REPO_ROOT, config.dir, config.skillDir, toolSkillName));
    await Deno.writeTextFile(toolFile, adaptedContent);
    return { tool, skill: skillName, status: "synced" };
  } catch (err) {
    return {
      tool,
      skill: skillName,
      status: "error",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main() {
  const args = Deno.args;
  const dryRun = args.includes("--check") || args.includes("--dry-run");
  const toolFilter = args.find((a) => a.startsWith("--tool="))?.split("=")[1];
  const skillFilter = args.find((a) => a.startsWith("--skill="))?.split("=")[1];

  const canonicalDir = join(REPO_ROOT, "docs", "skills");

  // Discover all canonical skills
  const skills: string[] = [];
  for await (const entry of Deno.readDir(canonicalDir)) {
    if (entry.isDirectory) {
      try {
        await Deno.stat(join(canonicalDir, entry.name, "SKILL.md"));
        skills.push(entry.name);
      } catch {
        // No SKILL.md — skip
      }
    }
  }

  skills.sort();

  const filteredSkills = skillFilter
    ? skills.filter((s) => s === skillFilter || s.replace(/-/g, "_") === skillFilter.replace(/-/g, "_"))
    : skills;

  const toolsToSync = toolFilter
    ? [toolFilter]
    : Object.keys(TOOLS);

  console.log(`Docs Sync — ${dryRun ? "DRY RUN (no writes)" : "SYNCING"}`);
  console.log(`  Canonical skills: ${skills.length}`);
  console.log(`  Tools: ${toolsToSync.join(", ")}`);
  console.log(`  Skills: ${skillFilter || "all"}`);
  console.log();

  const results: SyncResult[] = [];

  for (const tool of toolsToSync) {
    const config = TOOLS[tool];
    if (!config) {
      console.error(`  Unknown tool: ${tool}`);
      continue;
    }

    console.log(`\n  ${tool} (${config.naming}-case, skill dir: ${config.skillDir})`);

    for (const skill of filteredSkills) {
      const result = await syncSkill(tool, config, skill, canonicalDir, dryRun);
      results.push(result);

      if (result.status === "synced") {
        const action = dryRun ? "would sync" : "synced";
        console.log(`    ${action}  ${skill}`);
      } else if (result.status === "unchanged") {
        // console.log(`    ✓ ok     ${skill}`);
      } else if (result.status === "missing-canonical") {
        console.log(`    ⚠ no canonical  ${skill}`);
      } else if (result.status === "error") {
        console.log(`    ❌ error  ${skill}: ${result.error}`);
      }
    }
  }

  // Summary
  const synced = results.filter((r) => r.status === "synced").length;
  const unchanged = results.filter((r) => r.status === "unchanged").length;
  const errors = results.filter((r) => r.status === "error").length;

  console.log(`\n── Summary ──`);
  if (dryRun) {
    console.log(`  Would sync: ${synced}`);
  } else {
    console.log(`  Synced: ${synced}`);
  }
  console.log(`  Unchanged: ${unchanged}`);
  console.log(`  Errors: ${errors}`);

  if (errors > 0) {
    console.log("\nErrors:");
    for (const r of results.filter((r) => r.status === "error")) {
      console.log(`  ${r.tool}/${r.skill}: ${r.error}`);
    }
  }

  Deno.exit(errors > 0 ? 1 : 0);
}

if (import.meta.main) {
  await main();
}
