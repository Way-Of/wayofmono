#!/usr/bin/env -S deno run -A
/**
 * Fix remaining compliance issues across all 7 harness skill directories.
 *
 * Fixes:
 *   1. allowed-tools casing per tool spec
 *   2. Strip unsupported frontmatter fields
 *   3. Fix name field to match directory name
 *
 * Usage:
 *   deno run -A scripts/fix-skills.ts
 */

import { join } from "jsr:@std/path@1/join";
import { parse as parseYaml, stringify as stringifyYaml } from "jsr:@std/yaml@1";

const REPO_ROOT = join(import.meta.dirname!, "..", "..", "..");

const TOOL_SPECS: Record<string, { naming: "snake" | "kebab"; allowedTools: string[] }> = {
  opencode: {
    naming: "snake",
    allowedTools: ["read", "write", "bash", "edit", "grep", "glob", "webfetch", "websearch", "question", "todowrite", "skill", "lsp", "apply_patch"],
  },
  claude: {
    naming: "snake",
    allowedTools: ["Read", "Write", "Bash", "Edit", "Glob", "Grep", "WebFetch", "WebSearch", "Skill", "Agent", "Question", "TodoWrite", "LSP", "Task"],
  },
  gemini: {
    naming: "snake",
    allowedTools: ["read_file", "run_shell_command", "edit_file", "write_file", "glob", "grep", "web_fetch", "web_search", "ask_user", "task"],
  },
  pi: {
    naming: "kebab",
    allowedTools: ["Read", "Write", "Bash", "Edit", "Glob", "Grep", "WebFetch", "WebSearch", "Question", "Skill", "Task", "LSP"],
  },
  antigravity: {
    naming: "snake",
    allowedTools: ["read", "write", "bash", "edit", "grep", "glob", "webfetch", "websearch", "question", "skill", "todowrite"],
  },
  codex: {
    naming: "snake",
    allowedTools: ["read_file", "write_file", "run_shell_command", "glob", "grep", "web_fetch", "web_search", "bash", "edit", "read", "write"],
  },
  wocoder: {
    naming: "snake",
    allowedTools: ["read", "write", "bash", "edit", "grep", "glob", "skill", "todowrite", "webfetch", "websearch", "question"],
  },
};

const UNSUPPORTED_FIELDS = ["version", "namespace", "tools", "platforms", "dependencies", "argument-hint", "triggers", "official-docs"];

function toCorrectCase(value: string, spec: typeof TOOL_SPECS[string]): string {
  const lower = value.toLowerCase().replace(/[,_\s]+/g, " ").trim();
  const parts = lower.split(/\s+/).filter(Boolean);

  return parts.map((p) => {
    // Find match in allowedTools (case-insensitive)
    const match = spec.allowedTools.find((at) => at.toLowerCase() === p || at.toLowerCase() === p.replace(/[,]/g, ""));
    if (match) return match;
    // If we can't match, apply default casing for this tool
    if (spec.allowedTools.length > 0) {
      const first = spec.allowedTools[0];
      if (first[0] === first[0].toUpperCase()) {
        return p[0].toUpperCase() + p.slice(1);
      }
    }
    return p.toLowerCase();
  }).join(", ");
}

function fixSkillFile(filePath: string, toolName: string): { fixed: boolean; issues: string[] } {
  const spec = TOOL_SPECS[toolName];
  if (!spec) return { fixed: false, issues: [`Unknown tool: ${toolName}`] };

  const issues: string[] = [];
  let content: string;
  try {
    content = Deno.readTextFileSync(filePath);
  } catch {
    return { fixed: false, issues: ["Cannot read file"] };
  }

  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { fixed: false, issues: ["No frontmatter"] };

  const rawFrontmatter = match[1];
  const body = match[2];

  let fm: Record<string, unknown>;
  try {
    fm = parseYaml(rawFrontmatter) as Record<string, unknown>;
    if (!fm || typeof fm !== "object") return { fixed: false, issues: ["Empty frontmatter"] };
  } catch {
    return { fixed: false, issues: ["YAML parse error — skipping"] };
  }

  let changed = false;

  // Fix 1: Fix allowed-tools casing
  if (fm["allowed-tools"] !== undefined) {
    const val = fm["allowed-tools"];
    let strVal: string;
    if (Array.isArray(val)) {
      strVal = val.join(", ");
      changed = true;
    } else {
      strVal = String(val);
    }

    const corrected = toCorrectCase(strVal, spec);
    if (corrected !== strVal) {
      fm["allowed-tools"] = corrected;
      changed = true;
      issues.push(`Fixed allowed-tools: "${strVal}" → "${corrected}"`);
    }
  }

  // Fix 2: Strip unsupported fields
  for (const field of UNSUPPORTED_FIELDS) {
    if (fm[field] !== undefined) {
      delete fm[field];
      changed = true;
      issues.push(`Removed unsupported field: ${field}`);
    }
  }

  // Fix 3: Fix name to match dir name
  const dirName = filePath.split("/").slice(-2, -1)[0];
  if (fm["name"] !== undefined && typeof fm["name"] === "string") {
    const expectedName = spec.naming === "kebab"
      ? dirName.replace(/_/g, "-")
      : dirName.replace(/-/g, "_");
    if (fm["name"] !== expectedName) {
      issues.push(`Fixed name: "${fm["name"]}" → "${expectedName}"`);
      fm["name"] = expectedName;
      changed = true;
    }
  }

  if (!changed) return { fixed: false, issues: [] };

  // Reconstruct file
  const newFrontmatter = stringifyYaml(fm).trim();
  const newContent = `---\n${newFrontmatter}\n---\n${body}`;
  Deno.writeTextFileSync(filePath, newContent);
  return { fixed: true, issues };
}

function main() {
  const allTools = Object.keys(TOOL_SPECS);
  let totalFixed = 0;
  let totalIssues = 0;

  for (const tool of allTools) {
    const skillsDir = join(REPO_ROOT, "packages/@aiengineeringharness", tool, "skills");
    let toolFixed = 0;

    for (const entry of Deno.readDirSync(skillsDir)) {
      if (!entry.isDirectory) continue;
      const skillPath = join(skillsDir, entry.name, "SKILL.md");

      try {
        Deno.statSync(skillPath);
      } catch {
        continue;
      }

      const result = fixSkillFile(skillPath, tool);
      if (result.fixed) {
        toolFixed++;
        totalFixed++;
        for (const issue of result.issues) {
          totalIssues++;
          console.log(`  [${tool}/${entry.name}] ${issue}`);
        }
      }
    }

    console.log(`${tool}: fixed ${toolFixed} skills`);
  }

  console.log(`\nFixed ${totalFixed} files with ${totalIssues} changes`);
}

if (import.meta.main) {
  main();
}
