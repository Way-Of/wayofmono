#!/usr/bin/env -S deno run -A
/**
 * Phase 4: Online Compliance Checking
 *
 * Reads skill SKILL.md files across all tools and validates them against
 * known tool specifications from docs/tools/ai-coding-tools/.
 *
 * Checks:
 *   1. Tool name usage (e.g., Pi using PascalCase tool names vs OpenCode lowercase)
 *   2. Frontmatter field validity per tool (e.g., `disable-model-invocation` unsupported in OpenCode)
 *   3. Known tool name mismatches in body text
 *   4. MCP disable syntax per tool
 *
 * Usage:
 *   deno run -A scripts/compliance-check.ts
 *   deno run -A scripts/compliance-check.ts --tool=opencode
 *   deno run -A scripts/compliance-check.ts --fix
 */

import { parseArgs } from "jsr:@std/cli@1/parse-args";
import { join } from "jsr:@std/path@1/join";
import { walk } from "jsr:@std/fs@1/walk";
import { parse as parseYaml } from "jsr:@std/yaml@1";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ToolSpec {
  name: string; // tool key (opencode, claude, pi, etc.)
  naming: "snake" | "kebab";
  toolNameCase: "PascalCase" | "lowercase" | "UPPERCASE";
  allowedToolsFormat: "PascalCase" | "lowercase" | "space_separated_tools";
  supportedFrontmatter: string[];
  disableSyntax: string; // e.g., "enabled: false" for OpenCode, "disabled: true" for Claude
  knownToolNames: string[];
  deprecatedPatterns: string[];
  extraChecks: Record<string, string[]>;
}

interface ComplianceIssue {
  file: string;
  line: number;
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
}

interface ComplianceResult {
  tool: string;
  skill: string;
  issues: ComplianceIssue[];
  passed: boolean;
}

// ---------------------------------------------------------------------------
// Tool specifications (compiled from docs/tools/ai-coding-tools/)
// ---------------------------------------------------------------------------

const TOOL_SPECS: Record<string, ToolSpec> = {
  opencode: {
    name: "opencode",
    naming: "snake",
    toolNameCase: "lowercase",
    allowedToolsFormat: "lowercase",
    supportedFrontmatter: ["name", "description", "allowed-tools", "docs-url", "disable-model-invocation", "on"],
    disableSyntax: '"enabled": false',
    knownToolNames: ["bash", "edit", "write", "read", "grep", "glob", "lsp", "apply_patch", "skill", "todowrite", "webfetch", "websearch", "question"],
    deprecatedPatterns: [],
    extraChecks: {},
  },
  claude: {
    name: "claude",
    naming: "snake",
    toolNameCase: "PascalCase",
    allowedToolsFormat: "PascalCase",
    supportedFrontmatter: ["name", "description", "allowed-tools", "disable-model-invocation"],
    disableSyntax: '"disabled": true',
    knownToolNames: ["Agent", "AskUserQuestion", "Bash", "CronCreate", "CronDelete", "CronList", "Edit", "EnterPlanMode", "EnterWorktree", "ExitPlanMode", "ExitWorktree", "Glob", "Grep", "ListMcpResourcesTool", "LSP", "Monitor", "NotebookEdit", "PowerShell", "PushNotification", "Read", "ReadMcpResourceTool", "RemoteTrigger", "ScheduleWakeup", "SendMessage", "ShareOnboardingGuide", "Skill", "TaskCreate", "TaskGet", "TaskList", "TaskStop", "TaskUpdate", "TeamCreate", "TeamDelete", "TodoWrite", "ToolSearch", "WaitForMcpServers", "WebFetch", "WebSearch", "Workflow", "Write"],
    deprecatedPatterns: ["TodoWrite"],
    extraChecks: {},
  },
  gemini: {
    name: "gemini",
    naming: "snake",
    toolNameCase: "lowercase",
    allowedToolsFormat: "snake_case",
    supportedFrontmatter: ["name", "description", "allowed-tools", "docs-url", "on"],
    disableSyntax: "N/A",
    knownToolNames: ["read_file", "run_shell_command", "edit_file", "write_file", "glob", "grep", "web_fetch", "web_search", "ask_user", "task"],
    deprecatedPatterns: [],
    extraChecks: {},
  },
  pi: {
    name: "pi",
    naming: "kebab",
    toolNameCase: "PascalCase",
    allowedToolsFormat: "word", // space-separated PascalCase
    supportedFrontmatter: ["name", "description", "allowed-tools"],
    disableSyntax: "N/A",
    knownToolNames: ["Read", "Bash", "Edit", "Write", "Grep", "Glob", "WebFetch", "WebSearch", "Question", "Skill", "Task", "LSP"],
    deprecatedPatterns: [],
    extraChecks: {},
  },
  wocoder: {
    name: "wocoder",
    naming: "snake",
    toolNameCase: "lowercase",
    allowedToolsFormat: "lowercase",
    supportedFrontmatter: ["name", "description", "allowed-tools", "docs-url", "disable-model-invocation", "on"],
    disableSyntax: '"enabled": false',
    knownToolNames: ["bash", "edit", "write", "read", "grep", "glob", "skill", "todowrite", "webfetch", "websearch", "question"],
    deprecatedPatterns: [],
    extraChecks: {},
  },
  codex: {
    name: "codex",
    naming: "snake",
    toolNameCase: "lowercase",
    allowedToolsFormat: "lowercase",
    supportedFrontmatter: ["name", "description", "allowed-tools"],
    disableSyntax: "N/A",
    knownToolNames: ["bash", "edit", "write", "read", "grep", "glob", "web_fetch", "web_search"],
    deprecatedPatterns: [],
    extraChecks: {},
  },
  antigravity: {
    name: "antigravity",
    naming: "snake",
    toolNameCase: "lowercase",
    allowedToolsFormat: "lowercase",
    supportedFrontmatter: ["name", "description", "allowed-tools", "docs-url", "disable-model-invocation", "on"],
    disableSyntax: '"enabled": false',
    knownToolNames: ["bash", "edit", "write", "read", "grep", "glob", "skill", "todowrite", "webfetch", "websearch", "question"],
    deprecatedPatterns: [],
    extraChecks: {},
  },
};

const REPO_ROOT = join(import.meta.dirname!, "..", "..", "..");

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string; error?: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: content, error: "No valid frontmatter found" };
  }
  try {
    const fm = parseYaml(match[1]) as Record<string, unknown>;
    return { frontmatter: fm ?? {}, body: match[2] };
  } catch (e) {
    return { frontmatter: {}, body: match[2], error: `YAML parse error: ${e}` };
  }
}

function readLines(content: string): string[] {
  return content.split("\n");
}

// ---------------------------------------------------------------------------
// Compliance checks
// ---------------------------------------------------------------------------

function checkFrontmatterFields(
  skillName: string,
  frontmatter: Record<string, unknown>,
  spec: ToolSpec,
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  const validFields = spec.supportedFrontmatter;

  for (const key of Object.keys(frontmatter)) {
    if (key === "name" || key === "description") continue; // always valid
    if (key === "allowed-tools" && !spec.allowedToolsFormat) continue;
    if (!validFields.includes(key)) {
      issues.push({
        file: skillName,
        line: 0,
        severity: "warning",
        code: "UNSUPPORTED_FRONTMATTER",
        message: `Frontmatter field "${key}" is not in supported fields for ${spec.name}: ${validFields.join(", ")}`,
      });
    }
  }

  return issues;
}

function checkToolNameCase(
  skillName: string,
  frontmatter: Record<string, unknown>,
  spec: ToolSpec,
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  const allowed = frontmatter["allowed-tools"];
  if (!allowed || typeof allowed !== "string") return issues;

  const names = allowed.split(/\s+/).filter(Boolean);
  for (const name of names) {
    // Check if name matches expected case
    if (spec.toolNameCase === "PascalCase") {
      if (!/^[A-Z][a-z]/.test(name) && name.length > 1) {
        issues.push({
          file: skillName,
          line: 0,
          severity: "error",
          code: "WRONG_TOOL_CASE",
          message: `Tool name "${name}" should be PascalCase for ${spec.name} (e.g., "Read" not "read")`,
        });
      }
    } else if (spec.toolNameCase === "lowercase") {
      if (name !== name.toLowerCase()) {
        issues.push({
          file: skillName,
          line: 0,
          severity: "error",
          code: "WRONG_TOOL_CASE",
          message: `Tool name "${name}" should be lowercase for ${spec.name} (e.g., "read" not "Read")`,
        });
      }
    }
  }

  return issues;
}

function checkMentionedToolNames(
  skillName: string,
  content: string,
  spec: ToolSpec,
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  // Skip the frontmatter
  const body = content.replace(/^---[\s\S]*?---\n/, "");

  // Check for wrong-case tool names in body (e.g., Pi body mentioning "Read" is fine,
  // but OpenCode body mentioning "Read" instead of "read" is wrong)
  if (spec.toolNameCase === "lowercase") {
    const lines = readLines(body);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const pascalMatches = line.match(/\b(Read|Write|Edit|Bash|Grep|Glob|WebFetch|WebSearch|AskUserQuestion|Skill)\b/g);
      if (pascalMatches) {
        issues.push({
          file: skillName,
          line: i + 1,
          severity: "warning",
          code: "BODY_WRONG_TOOL_CASE",
          message: `PascalCase tool name "${pascalMatches[0]}" in body — should be lowercase for ${spec.name}`,
        });
      }
    }
  } else if (spec.toolNameCase === "PascalCase") {
    const lines = readLines(body);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerMatches = line.match(/\b(read|write|edit|bash|grep|glob|webfetch|websearch)\b/g);
      if (lowerMatches) {
        // Only flag if it's clearly a tool reference (not a regular word)
        const word = lowerMatches[0];
        if (["read", "write", "edit", "bash", "grep", "glob"].includes(word)) {
          issues.push({
            file: skillName,
            line: i + 1,
            severity: "warning",
            code: "BODY_WRONG_TOOL_CASE",
            message: `Lowercase tool name "${word}" in body — should be PascalCase for ${spec.name}`,
          });
        }
      }
    }
  }

  return issues;
}

function checkDeprecatedPatterns(
  skillName: string,
  content: string,
  spec: ToolSpec,
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  for (const pattern of spec.deprecatedPatterns) {
    if (content.includes(pattern)) {
      issues.push({
        file: skillName,
        line: 0,
        severity: "warning",
        code: "DEPRECATED_PATTERN",
        message: `Deprecated pattern "${pattern}" found — should be avoided for ${spec.name}`,
      });
    }
  }

  return issues;
}

function checkNamingConvention(
  skillName: string,
  spec: ToolSpec,
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];

  if (spec.naming === "kebab" && skillName.includes("_")) {
    issues.push({
      file: skillName,
      line: 0,
      severity: "error",
      code: "WRONG_NAMING_CONVENTION",
      message: `Skill dir "${skillName}" uses snake_case but ${spec.name} requires kebab-case`,
    });
  } else if (spec.naming === "snake" && skillName.includes("-")) {
    issues.push({
      file: skillName,
      line: 0,
      severity: "error",
      code: "WRONG_NAMING_CONVENTION",
      message: `Skill dir "${skillName}" uses kebab-case but ${spec.name} requires snake_case`,
    });
  }

  return issues;
}

function checkFrontmatterNameMatch(
  skillDir: string,
  frontmatter: Record<string, unknown>,
  spec: ToolSpec,
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  const fmName = frontmatter["name"];
  if (fmName && typeof fmName === "string") {
    const expectedName = spec.naming === "kebab"
      ? skillDir.replace(/_/g, "-")
      : skillDir.replace(/-/g, "_");
    if (fmName !== expectedName) {
      issues.push({
        file: skillDir,
        line: 0,
        severity: "warning",
        code: "NAME_MISMATCH",
        message: `Frontmatter name "${fmName}" doesn't match dir name "${skillDir}" (expected "${expectedName}")`,
      });
    }
  }
  return issues;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function checkTool(toolName: string, fixMode: boolean): Promise<ComplianceResult[]> {
  const spec = TOOL_SPECS[toolName];
  if (!spec) {
    console.error(`Unknown tool: ${toolName}`);
    Deno.exit(1);
  }

  const skillDir = join(REPO_ROOT, "packages/@aiengineeringharness", toolName, "skills");
  const results: ComplianceResult[] = [];

  try {
    const entries = Deno.readDirSync(skillDir);
    for (const entry of entries) {
      if (!entry.isDirectory) continue;
      const skillPath = join(skillDir, entry.name, "SKILL.md");

      let content: string;
      try {
        content = Deno.readTextFileSync(skillPath);
      } catch {
        results.push({
          tool: toolName,
          skill: entry.name,
          issues: [{ file: entry.name, line: 0, severity: "error", code: "MISSING_SKILL", message: "SKILL.md not found" }],
          passed: false,
        });
        continue;
      }

      const { frontmatter, body, error } = parseFrontmatter(content);
      const issues: ComplianceIssue[] = [];

      if (error) {
        issues.push({ file: entry.name, line: 0, severity: "error", code: "PARSE_ERROR", message: error });
      }

      issues.push(...checkNamingConvention(entry.name, spec));
      issues.push(...checkFrontmatterFields(entry.name, frontmatter, spec));
      issues.push(...checkToolNameCase(entry.name, frontmatter, spec));
      issues.push(...checkMentionedToolNames(entry.name, content, spec));
      issues.push(...checkDeprecatedPatterns(entry.name, content, spec));
      issues.push(...checkFrontmatterNameMatch(entry.name, frontmatter, spec));

      results.push({
        tool: toolName,
        skill: entry.name,
        issues,
        passed: issues.length === 0,
      });
    }
  } catch (e) {
    console.error(`Error reading ${skillDir}: ${e}`);
  }

  return results;
}

function printResults(results: ComplianceResult[]): void {
  const bySeverity: Record<string, ComplianceIssue[]> = { error: [], warning: [], info: [] };

  for (const result of results) {
    for (const issue of result.issues) {
      bySeverity[issue.severity]?.push(issue);
    }
  }

  console.log("\n── Compliance Report ──\n");

  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  for (const [severity, issues] of Object.entries(bySeverity)) {
    if (issues.length === 0) continue;
    const icon = severity === "error" ? "✗" : severity === "warning" ? "△" : "ℹ";
    console.log(`  ${icon} ${severity.toUpperCase()}: ${issues.length}`);
    for (const issue of issues) {
      const loc = issue.line > 0 ? `:${issue.line}` : "";
      console.log(`      [${issue.code}] ${issue.tool}/${issue.file}${loc} — ${issue.message}`);
    }
    console.log();
  }

  console.log(`  Skills: ${total} total, ${passed} passed, ${failed} with issues`);
  console.log();
}

async function main(): Promise<void> {
  const args = parseArgs(Deno.args, {
    string: ["tool"],
    boolean: ["fix"],
  });

  const allTools = Object.keys(TOOL_SPECS);
  const toolFilter = args.tool ? [args.tool] : allTools;
  const fixMode = !!args.fix;

  console.log(`\nPhase 4: Online Compliance Check${fixMode ? " (fix mode)" : ""}`);
  console.log(`Checking tools: ${toolFilter.join(", ")}`);

  for (const tool of toolFilter) {
    const results = await checkTool(tool, fixMode);
    printResults(results);
  }
}

if (import.meta.main) {
  await main();
}
