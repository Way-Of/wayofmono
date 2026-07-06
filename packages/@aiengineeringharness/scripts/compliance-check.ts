#!/usr/bin/env -S deno run -A
/**
 * Phase 4: Online Compliance Checking
 *
 * Reads skill files across all tools and validates them against
 * known tool specifications from docs/tools/ai-coding-tools/.
 * Supports SKILL.md for all tools; Codex additionally supports skill.yaml.
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
    naming: "kebab",
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
  pi: {
    name: "pi",
    naming: "kebab",
    toolNameCase: "lowercase",
    allowedToolsFormat: "lowercase",
    supportedFrontmatter: ["name", "description", "allowed-tools"],
    disableSyntax: "N/A",
    knownToolNames: ["read", "bash", "edit", "write", "grep", "glob", "webfetch", "websearch", "question", "skill", "task", "lsp"],
    deprecatedPatterns: [],
    extraChecks: {},
  },
  wocode: {
    name: "wocode",
    naming: "kebab",
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

function applyFixes(
  content: string,
  issues: ComplianceIssue[],
  spec: ToolSpec,
  skillDir: string,
): { fixed: string; fixCount: number } {
  let fixCount = 0;

  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { fixed: content, fixCount: 0 };

  let frontmatterYaml = match[1];
  let body = match[2];
  const originalYaml = frontmatterYaml;
  const originalBody = body;

  // 1. Fix UNSUPPORTED_FRONTMATTER — remove unsupported fields
  const unsupportedIssues = issues.filter((i) => i.code === "UNSUPPORTED_FRONTMATTER");
  for (const issue of unsupportedIssues) {
    const fieldMatch = issue.message.match(/Frontmatter field "([^"]+)"/);
    if (!fieldMatch) continue;
    const field = fieldMatch[1];
    const lines = frontmatterYaml.split("\n").filter((l) => {
      const trimmed = l.trim();
      return !trimmed.startsWith(`${field}:`) && !trimmed.startsWith(`${field}: `);
    });
    if (lines.length < frontmatterYaml.split("\n").length) {
      frontmatterYaml = lines.join("\n");
      fixCount++;
    }
  }

  // 2. Fix WRONG_TOOL_CASE (allowed-tools) — normalize case
  const toolCaseIssues = issues.filter((i) => i.code === "WRONG_TOOL_CASE");
  if (toolCaseIssues.length > 0) {
    const lines = frontmatterYaml.split("\n");
    const fixedLines = lines.map((line) => {
      const atMatch = line.match(/^allowed-tools:\s*(.+)$/);
      if (atMatch) {
        const tools = atMatch[1].split(/\s*,\s*|\s+/).filter(Boolean);
        const fixedTools = tools.map((t) => {
          if (spec.toolNameCase === "lowercase") return t.toLowerCase();
          if (spec.toolNameCase === "PascalCase") {
            return t.replace(/\b([a-z])/g, (_, c) => c.toUpperCase());
          }
          return t;
        });
        return `allowed-tools: ${fixedTools.join(" ")}`;
      }
      return line;
    });
    const newYaml = fixedLines.join("\n");
    if (newYaml !== frontmatterYaml) {
      frontmatterYaml = newYaml;
      fixCount += toolCaseIssues.length;
    }
  }

  // 3. Fix NAME_MISMATCH — update frontmatter name to match dir
  const nameIssues = issues.filter((i) => i.code === "NAME_MISMATCH");
  for (const _ni of nameIssues) {
    const expectedName = spec.naming === "kebab"
      ? skillDir.replace(/_/g, "-")
      : skillDir.replace(/-/g, "_");
    frontmatterYaml = frontmatterYaml.split("\n").map((line) => {
      const nMatch = line.match(/^name:\s*(.+)$/);
      if (nMatch && nMatch[1].trim() !== expectedName) {
        return `name: ${expectedName}`;
      }
      return line;
    }).join("\n");
    fixCount++;
  }

  // 4. Fix BODY_WRONG_TOOL_CASE — fix tool name casing in body (skip code blocks & inline code)
  const bodyIssues = issues.filter((i) => i.code === "BODY_WRONG_TOOL_CASE");
  if (bodyIssues.length > 0) {
    const bodyLines = body.split("\n");
    let inCodeBlock = false;
    for (let i = 0; i < bodyLines.length; i++) {
      if (bodyLines[i].trimStart().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;

      const hasIssue = bodyIssues.some((bi) => bi.line - 1 === i);
      if (!hasIssue) continue;

      const oldLine = bodyLines[i];

      // Protect inline code with placeholders
      const inlineCodes: string[] = [];
      const protectedLine = oldLine.replace(/`[^`]*`/g, (m) => {
        inlineCodes.push(m);
        return `\x00IC${inlineCodes.length - 1}\x00`;
      });

      let fixedLine = protectedLine;
      if (spec.toolNameCase === "lowercase") {
        fixedLine = protectedLine.replace(
          /(?<![-_])\b(Read|Write|Edit|Bash|Grep|Glob|WebFetch|WebSearch|AskUserQuestion|Skill)\b/g,
          (m) => m.toLowerCase(),
        );
      } else if (spec.toolNameCase === "PascalCase") {
        fixedLine = protectedLine.replace(
          /(?<![-_])\b(read|write|edit|bash|grep|glob)\b/g,
          (m) => m.charAt(0).toUpperCase() + m.slice(1),
        );
      }

      // Restore inline code placeholders
      for (let j = inlineCodes.length - 1; j >= 0; j--) {
        fixedLine = fixedLine.replace(`\x00IC${j}\x00`, inlineCodes[j]);
      }
      bodyLines[i] = fixedLine;
    }
    const newBody = bodyLines.join("\n");
    if (newBody !== body) {
      body = newBody;
      fixCount += bodyIssues.length;
    }
  }

  if (frontmatterYaml === originalYaml && body === originalBody) {
    return { fixed: content, fixCount: 0 };
  }

  return { fixed: `---\n${frontmatterYaml}\n---\n${body}`, fixCount };
}

async function checkTool(toolName: string, fixMode: boolean): Promise<ComplianceResult[]> {
  const spec = TOOL_SPECS[toolName];
  if (!spec) {
    console.error(`Unknown tool: ${toolName}`);
    Deno.exit(1);
  }

  const skillDir = join(REPO_ROOT, "packages/@aiengineeringharness", toolName, "skills");
  const results: ComplianceResult[] = [];
  let totalFixed = 0;

  try {
    const entries = Deno.readDirSync(skillDir);
    for (const entry of entries) {
      if (!entry.isDirectory) continue;
      const skillPath = join(skillDir, entry.name, "SKILL.md");

      let content: string;
      let isCodexYaml = false;
      try {
        content = Deno.readTextFileSync(skillPath);
      } catch {
        if (toolName === "codex") {
          // Codex supports native skill.yaml format alongside SKILL.md
          try {
            content = Deno.readTextFileSync(join(skillDir, entry.name, "skill.yaml"));
            isCodexYaml = true;
          } catch {
            results.push({
              tool: toolName,
              skill: entry.name,
              issues: [{ file: entry.name, line: 0, severity: "error", code: "MISSING_SKILL", message: "SKILL.md/skill.yaml not found" }],
              passed: false,
            });
            continue;
          }
        } else {
          results.push({
            tool: toolName,
            skill: entry.name,
            issues: [{ file: entry.name, line: 0, severity: "error", code: "MISSING_SKILL", message: "SKILL.md not found" }],
            passed: false,
          });
          continue;
        }
      }

      // Handle Codex native YAML format separately
      if (isCodexYaml) {
        const issues: ComplianceIssue[] = [];
        try {
          const yaml = parseYaml(content) as Record<string, unknown>;
          issues.push(...checkNamingConvention(entry.name, spec));
          if (yaml?.name && typeof yaml.name === "string" && yaml.name !== entry.name) {
            issues.push({
              file: entry.name, line: 0, severity: "warning", code: "NAME_MISMATCH",
              message: `YAML name "${yaml.name}" doesn't match dir name "${entry.name}"`,
            });
          }
          if (yaml?.tools && Array.isArray(yaml.tools)) {
            for (const tool of yaml.tools) {
              if (typeof tool === "string" && tool !== tool.toLowerCase()) {
                issues.push({
                  file: entry.name, line: 0, severity: "error", code: "WRONG_TOOL_CASE",
                  message: `Tool name "${tool}" should be lowercase for codex`,
                });
              }
            }
          }
        } catch (e) {
          issues.push({
            file: entry.name, line: 0, severity: "error", code: "PARSE_ERROR",
            message: `YAML parse error: ${e}`,
          });
        }
        results.push({ tool: toolName, skill: entry.name, issues, passed: issues.length === 0 });
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

      // Auto-fix mode
      if (fixMode && issues.length > 0) {
        const fixable = issues.filter((i) =>
          ["UNSUPPORTED_FRONTMATTER", "WRONG_TOOL_CASE", "NAME_MISMATCH", "BODY_WRONG_TOOL_CASE"].includes(i.code)
        );
        if (fixable.length > 0) {
          const { fixed, fixCount } = applyFixes(content, fixable, spec, entry.name);
          if (fixCount > 0) {
            Deno.writeTextFileSync(skillPath, fixed);
            console.log(`  ✧ FIXED    ${entry.name}/SKILL.md (${fixCount} issue(s))`);
            totalFixed += fixCount;
            // Re-check after fix
            const reContent = Deno.readTextFileSync(skillPath);
            const { frontmatter: fm2 } = parseFrontmatter(reContent);
            issues.length = 0;
            if (error) issues.push({ file: entry.name, line: 0, severity: "error", code: "PARSE_ERROR", message: error });
            issues.push(...checkNamingConvention(entry.name, spec));
            issues.push(...checkFrontmatterFields(entry.name, fm2, spec));
            issues.push(...checkToolNameCase(entry.name, fm2, spec));
            issues.push(...checkMentionedToolNames(entry.name, reContent, spec));
            issues.push(...checkDeprecatedPatterns(entry.name, reContent, spec));
            issues.push(...checkFrontmatterNameMatch(entry.name, fm2, spec));
          }
        }
      }

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

  if (fixMode && totalFixed > 0) {
    console.log(`  └ ${toolName}: ${totalFixed} issue(s) auto-fixed\n`);
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
