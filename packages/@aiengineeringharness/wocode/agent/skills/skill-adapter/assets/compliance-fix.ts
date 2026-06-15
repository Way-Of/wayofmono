#!/usr/bin/env -S deno run -A
/**
 * compliance-fix.ts v1.0
 *
 * Auto-fixes compliance issues across all 7 AI tool skill files:
 *   1. WRONG_TOOL_CASE — Fixes tool name casing in allowed-tools frontmatter
 *   2. UNSUPPORTED_FRONTMATTER — Removes fields unsupported by target tool
 *   3. BODY_WRONG_TOOL_CASE — Fixes tool name casing in markdown body
 *   4. PARSE_ERROR — Fixes YAML syntax issues (stray quotes, double dashes)
 *
 * Usage:
 *   deno run -A compliance-fix.ts [--tool=opencode] [--dry-run]
 *   deno run -A compliance-fix.ts                  # fix all tools
 *   deno run -A compliance-fix.ts --dry-run         # preview only
 *
 * Asset of: skill-compliance-checker, skill-adapter, skill-auto-update
 */

import { parseArgs } from "jsr:@std/cli@1/parse-args";
import { join } from "jsr:@std/path@1/join";
import { walk } from "jsr:@std/fs@1/walk";
import { parse as parseYaml, stringify as stringifyYaml } from "jsr:@std/yaml@1";

// --- Tool specs (mirrors compliance-check.ts) ---
interface ToolSpec {
  name: string;
  naming: "snake" | "kebab";
  toolNameCase: "PascalCase" | "lowercase";
  allowedToolsFormat: "PascalCase" | "lowercase" | "snake_case" | "word";
  supportedFrontmatter: string[];
  knownToolNames: string[];
}

const TOOL_SPECS: Record<string, ToolSpec> = {
  opencode: {
    name: "opencode",
    naming: "snake",
    toolNameCase: "lowercase",
    allowedToolsFormat: "lowercase",
    supportedFrontmatter: ["name", "description", "allowed-tools", "docs-url", "disable-model-invocation", "on"],
    knownToolNames: ["bash", "edit", "write", "read", "grep", "glob", "skill", "todowrite", "webfetch", "websearch", "question"],
  },
  claude: {
    name: "claude",
    naming: "snake",
    toolNameCase: "PascalCase",
    allowedToolsFormat: "PascalCase",
    supportedFrontmatter: ["name", "description", "allowed-tools", "disable-model-invocation"],
    knownToolNames: ["Read", "Write", "Bash", "Edit", "Glob", "Grep", "Skill", "WebFetch", "WebSearch", "Question", "TodoWrite", "Agent", "ToolSearch"],
  },
  gemini: {
    name: "gemini",
    naming: "snake",
    toolNameCase: "lowercase",
    allowedToolsFormat: "snake_case",
    supportedFrontmatter: ["name", "description", "allowed-tools", "docs-url", "on"],
    knownToolNames: ["read_file", "run_shell_command", "edit_file", "write_file", "glob", "grep", "web_fetch", "web_search", "ask_user", "task"],
  },
  pi: {
    name: "pi",
    naming: "kebab",
    toolNameCase: "lowercase",
    allowedToolsFormat: "lowercase",
    supportedFrontmatter: ["name", "description", "allowed-tools"],
    knownToolNames: ["read", "bash", "edit", "write", "grep", "glob", "webfetch", "websearch", "question", "skill", "task", "lsp"],
  },
  wocode: {
    name: "wocode",
    naming: "snake",
    toolNameCase: "lowercase",
    allowedToolsFormat: "lowercase",
    supportedFrontmatter: ["name", "description", "allowed-tools", "docs-url", "disable-model-invocation", "on"],
    knownToolNames: ["bash", "edit", "write", "read", "grep", "glob", "skill", "todowrite", "webfetch", "websearch", "question"],
  },
  codex: {
    name: "codex",
    naming: "snake",
    toolNameCase: "lowercase",
    allowedToolsFormat: "lowercase",
    supportedFrontmatter: ["name", "description", "allowed-tools"],
    knownToolNames: ["bash", "edit", "write", "read", "grep", "glob", "web_fetch", "web_search"],
  },
  antigravity: {
    name: "antigravity",
    naming: "snake",
    toolNameCase: "lowercase",
    allowedToolsFormat: "lowercase",
    supportedFrontmatter: ["name", "description", "allowed-tools", "docs-url", "disable-model-invocation", "on"],
    knownToolNames: ["bash", "edit", "write", "read", "grep", "glob", "skill", "todowrite", "webfetch", "websearch", "question"],
  },
};

const CASE_MAP_PASCAL_TO_LOWER: Record<string, string> = {
  "Read": "read", "Write": "write", "Bash": "bash", "Edit": "edit",
  "Grep": "grep", "Glob": "glob", "Skill": "skill", "WebFetch": "webfetch",
  "WebSearch": "websearch", "Question": "question", "TodoWrite": "todowrite",
  "LSP": "lsp", "Task": "task", "Agent": "agent", "ToolSearch": "toolsearch",
};

const CASE_MAP_LOWER_TO_PASCAL: Record<string, string> = {
  "read": "Read", "write": "Write", "bash": "Bash", "edit": "Edit",
  "grep": "Grep", "glob": "Glob", "skill": "Skill",
  "webfetch": "WebFetch", "websearch": "WebSearch", "question": "Question",
  "todowrite": "TodoWrite", "lsp": "LSP", "task": "Task",
};

const REPO_ROOT = join(import.meta.dirname!, "..", "..", "..", "..", "..", "..", "..");

function pascalToLower(s: string): string {
  return CASE_MAP_PASCAL_TO_LOWER[s] || s.toLowerCase();
}

function lowerToPascal(s: string): string {
  return CASE_MAP_LOWER_TO_PASCAL[s] || s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function isKnownTool(name: string, spec: ToolSpec): boolean {
  const lower = name.toLowerCase().replace(/,/g, "").trim();
  return spec.knownToolNames.some((t) => t.toLowerCase() === lower);
}

function toPascalCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fixAllowedToolsYaml(allowed: unknown, spec: ToolSpec): { fixed: unknown; changed: boolean } {
  if (!allowed) return { fixed: allowed, changed: false };

  if (typeof allowed === "string") {
    const names = allowed.split(/[,\s]+/).filter(Boolean);
    const fixedNames = names.map((n) => {
      const clean = n.replace(/,/g, "").trim();
      if (spec.toolNameCase === "PascalCase" && clean === clean.toLowerCase()) {
        return lowerToPascal(clean);
      }
      if (spec.toolNameCase === "lowercase" && clean !== clean.toLowerCase()) {
        return pascalToLower(clean);
      }
      return n;
    });
    const result = fixedNames.join(", ");
    return { fixed: result, changed: result !== allowed };
  }

  if (Array.isArray(allowed)) {
    const fixed = allowed.map((item) => {
      if (typeof item !== "string") return item;
      const clean = item.trim();
      if (spec.toolNameCase === "PascalCase" && clean === clean.toLowerCase()) {
        const pascal = CASE_MAP_LOWER_TO_PASCAL[clean] || toPascalCase(clean);
        return pascal;
      }
      if (spec.toolNameCase === "lowercase" && clean !== clean.toLowerCase()) {
        return pascalToLower(clean);
      }
      return item;
    });
    return { fixed, changed: JSON.stringify(fixed) !== JSON.stringify(allowed) };
  }

  return { fixed: allowed, changed: false };
}

function removeUnsupportedFrontmatter(fm: Record<string, unknown>, spec: ToolSpec): { fixed: Record<string, unknown>; changed: boolean; removed: string[] } {
  const removed: string[] = [];
  const fixed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fm)) {
    if (key === "name" || key === "description") {
      fixed[key] = value;
    } else if (spec.supportedFrontmatter.includes(key)) {
      fixed[key] = value;
    } else {
      removed.push(key);
    }
  }
  return { fixed, changed: removed.length > 0, removed };
}

function fixBodyToolNames(body: string, spec: ToolSpec): { fixed: string; changed: boolean; fixes: number } {
  let fixes = 0;
  let result = body;

  if (spec.toolNameCase === "lowercase") {
    result = result.replace(/\b(Read|Write|Edit|Bash|Grep|Glob|WebFetch|WebSearch|Question|Skill)\b/g, (match) => {
      const lower = pascalToLower(match);
      if (lower !== match) fixes++;
      return lower;
    });
  } else if (spec.toolNameCase === "PascalCase") {
    result = result.replace(/\b(read|write|edit|bash|grep|glob|webfetch|websearch|question|skill)\b/g, (match) => {
      if (["read", "write", "edit", "bash", "grep", "glob", "webfetch", "websearch", "question", "skill"].includes(match)) {
        const pascal = lowerToPascal(match);
        if (pascal !== match) fixes++;
        return pascal;
      }
      return match;
    });
  }

  return { fixed: result, changed: fixes > 0, fixes };
}

function needsQuoting(s: string): boolean {
  return /[:,]/.test(s) || s.includes("'") || s.startsWith('"') || s.trim() !== s;
}

function quoteYamlValue(s: string): string {
  if (needsQuoting(s)) {
    const escaped = s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return `"${escaped}"`;
  }
  return s;
}

function rebuildFrontmatterYaml(fm: Record<string, unknown>, spec: ToolSpec): string {
  const lines: string[] = [];
  lines.push("name: " + quoteYamlValue(String(fm["name"])));
  lines.push("description: " + quoteYamlValue(String(fm["description"])));

  const allowed = fm["allowed-tools"];
  if (allowed) {
    if (typeof allowed === "string") {
      if (spec.allowedToolsFormat === "word") {
        lines.push("allowed-tools: " + allowed);
      } else {
        lines.push("allowed-tools: " + allowed);
      }
    } else if (Array.isArray(allowed)) {
      lines.push("allowed-tools:");
      for (const tool of allowed) {
        lines.push("  - " + tool);
      }
    }
  }

  // Add remaining fields in order
  for (const key of Object.keys(fm)) {
    if (["name", "description", "allowed-tools"].includes(key)) continue;
    const val = fm[key];
    if (typeof val === "string") {
      lines.push(`${key}: ${val}`);
    } else if (typeof val === "boolean") {
      lines.push(`${key}: ${val}`);
    }
  }

  return lines.join("\n");
}

async function fixToolSkills(toolName: string, dryRun: boolean): Promise<{ fixed: number; errors: number }> {
  const spec = TOOL_SPECS[toolName];
  if (!spec) {
    console.error(`Unknown tool: ${toolName}`);
    Deno.exit(1);
  }

  const skillDir = join(REPO_ROOT, "packages/@aiengineeringharness", toolName, "skills");
  let fixed = 0;
  let errors = 0;

  try {
    const entries = Deno.readDirSync(skillDir);
    for (const entry of entries) {
      if (!entry.isDirectory) continue;
      const skillPath = join(skillDir, entry.name, "SKILL.md");

      let content: string;
      try {
        content = Deno.readTextFileSync(skillPath);
      } catch {
        continue;
      }

      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!frontmatterMatch) continue;

      const [, rawFm, body] = frontmatterMatch;
      let fm: Record<string, unknown>;
      try {
        fm = parseYaml(rawFm) as Record<string, unknown>;
        if (!fm || typeof fm !== "object") continue;
      } catch {
        // YAML parse error — try to fix common issues
        let fixedRaw = rawFm
          .replace(/'\s*-\s*/g, "- ")
          .replace(/\s*-'\s*/g, "- ")
          .replace(/(\w)'(\s*)$/gm, "$1$2")
          .replace(/^(\s*)- - /gm, "$1- ");
        try {
          fm = parseYaml(fixedRaw) as Record<string, unknown>;
          if (!fm || typeof fm !== "object") continue;
          // Only keep the fix if parse succeeded
          if (!dryRun) {
            content = content.replace(rawFm, fixedRaw);
          }
          console.log(`  [FIX] ${entry.name}: repaired YAML syntax`);
        } catch {
          console.error(`  [ERR] ${entry.name}: unrepairable YAML`);
          errors++;
          continue;
        }
      }

      let changed = false;
      const changes: string[] = [];

      // Fix 1: allowed-tools case
      if (fm["allowed-tools"] !== undefined) {
        const { fixed: fixedAllowed, changed: caseChanged } = fixAllowedToolsYaml(fm["allowed-tools"], spec);
        if (caseChanged) {
          fm["allowed-tools"] = fixedAllowed;
          changed = true;
          changes.push("allowed-tools case");
        }
      }

      // Fix 2: remove unsupported frontmatter
      const { fixed: fixedFm, changed: fmChanged, removed } = removeUnsupportedFrontmatter(fm, spec);
      if (fmChanged) {
        fm = fixedFm;
        changed = true;
        changes.push(`removed: ${removed.join(", ")}`);
      }

      // Fix 3: body tool name case
      const { fixed: fixedBody, changed: bodyChanged, fixes: bodyFixes } = fixBodyToolNames(body, spec);
      if (bodyChanged) {
        changed = true;
        changes.push(`body tool case (${bodyFixes} fixes)`);
      }

      if (!changed) continue;

      if (dryRun) {
        console.log(`  [DRY-RUN] ${entry.name}: ${changes.join("; ")}`);
        fixed++;
        continue;
      }

      // Rebuild frontmatter YAML
      const newFm = rebuildFrontmatterYaml(fm, spec);
      const newContent = "---\n" + newFm + "\n---\n" + fixedBody;

      Deno.writeTextFileSync(skillPath, newContent);
      console.log(`  [FIXED] ${entry.name}: ${changes.join("; ")}`);
      fixed++;
    }
  } catch (e) {
    console.error(`Error reading ${skillDir}: ${e}`);
    errors++;
  }

  return { fixed, errors };
}

async function main(): Promise<void> {
  const args = parseArgs(Deno.args, {
    string: ["tool"],
    boolean: ["dry-run"],
  });

  const allTools = Object.keys(TOOL_SPECS);
  const toolFilter = args.tool ? [args.tool] : allTools;
  const dryRun = !!args["dry-run"];

  console.log(`Compliance Fix Tool v1.0${dryRun ? " (DRY RUN)" : ""}`);
  console.log(dryRun ? "Previewing fixes for:" : "Fixing:", toolFilter.join(", "));
  console.log();

  let totalFixed = 0;
  let totalErrors = 0;

  for (const tool of toolFilter) {
    console.log(`\n── ${tool} ──`);
    const { fixed, errors } = await fixToolSkills(tool, dryRun);
    totalFixed += fixed;
    totalErrors += errors;
  }

  console.log(`\nDone. ${totalFixed} files ${dryRun ? "would be fixed" : "fixed"}, ${totalErrors} errors.`);
}

if (import.meta.main) {
  await main();
}
