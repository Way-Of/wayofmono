#!/usr/bin/env deno run --allow-read --allow-write --allow-run --allow-env

/**
 * Skill Adapter
 *
 * Converts canonical skill format to platform-specific formats
 * for all 7 frontends: claude, opencode, gemini, pi, wocoder, antigravity, and codex.
 *
 * Usage:
 *   deno run -A adapter.ts list                                    # List all canonical skills
 *   deno run -A adapter.ts generate <skill> --platform=all          # Generate for all platforms
 *   deno run -A adapter.ts generate <skill> --platform=claude       # Generate for one platform
 *   deno run -A adapter.ts generate --all --platform=all            # Generate all skills for all platforms
 *   deno run -A adapter.ts validate <skill>                         # Validate canonical format
 */

import { join, dirname, basename, extname } from "https://deno.land/std@0.224.0/path/mod.ts";
import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";

// adapter.ts is at: packages/@aiengineeringharness/skills/skill-adapter/adapter.ts
const SCRIPT_DIR = dirname(new URL(import.meta.url).pathname);
// Go up: skill-adapter/ → skills/ → @aiengineeringharness/ → packages/ → root
const ROOT = join(SCRIPT_DIR, "..", "..", "..", "..");
const HARNESS_DIR = join(ROOT, "packages", "@aiengineeringharness");
const CANONICAL_SKILLS_DIR = join(HARNESS_DIR, "skills");

const PLATFORMS = ["claude", "opencode", "gemini", "pi", "wocoder", "antigravity", "codex"];

interface SkillFrontmatter {
  name: string;
  description: string;
  version?: string;
  namespace?: string;
  tools?: string;
  "allowed-tools"?: string;
  platforms?: string[];
  dependencies?: string[];
  [key: string]: unknown;
}

interface CanonicalSkill {
  name: string;
  frontmatter: SkillFrontmatter;
  body: string;
  rawContent: string;
  path: string;
  files: string[];
}

// --- Parsing ---

function parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown>;
  body: string;
  rawFrontmatter: string;
} {
  const match = content.match(/^---\n([\s\S]*?)\n(?:---|\.\.\.)\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content, rawFrontmatter: "" };

  const fm: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    let val: unknown = line.slice(sep + 1).trim();
    if (typeof val === "string" && val.startsWith("[") && val.endsWith("]")) {
      try { val = JSON.parse(val as string); } catch { /* keep as string */ }
    }
    fm[key] = val;
  }
  return { frontmatter: fm, body: match[2], rawFrontmatter: match[1] };
}

function formatFrontmatter(fm: Record<string, unknown>): string {
  const lines = ["---"];
  for (const [key, val] of Object.entries(fm)) {
    if (val === undefined || val === null) continue;
    if (Array.isArray(val)) {
      lines.push(`${key}: ${JSON.stringify(val)}`);
    } else {
      lines.push(`${key}: ${val}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}

// --- Skill Discovery ---

async function listCanonicalSkills(): Promise<CanonicalSkill[]> {
  const skills: CanonicalSkill[] = [];
  for await (const entry of Deno.readDir(CANONICAL_SKILLS_DIR)) {
    if (!entry.isDirectory) continue;
    const skillPath = join(CANONICAL_SKILLS_DIR, entry.name);
    const skillMdPath = join(skillPath, "SKILL.md");
    try {
      const rawContent = await Deno.readTextFile(skillMdPath);
      const { frontmatter, body } = parseFrontmatter(rawContent);

      const files: string[] = [];
      for await (const f of Deno.readDir(skillPath)) {
        if (f.isFile) files.push(f.name);
      }

      skills.push({
        name: entry.name,
        frontmatter: frontmatter as SkillFrontmatter,
        body,
        rawContent,
        path: skillPath,
        files,
      });
    } catch {
      // SKILL.md not found, skip
    }
  }
  return skills;
}

// --- Platform Generators ---

function toClaude(skill: CanonicalSkill): { filename: string; content: string } {
  const body = addPlatformNotice(skill, "Claude Code");
  const content = `---\nname: ${skill.frontmatter.name}\ndescription: ${skill.frontmatter.description}\nallowed-tools: ${skill.frontmatter["allowed-tools"] ?? skill.frontmatter.tools ?? ""}\n---\n\n${body}`;
  return { filename: `${skill.name}.md`, content };
}

function toOpenCode(skill: CanonicalSkill): { filename: string; content: string } {
  const body = addPlatformNotice(skill, "OpenCode");
  const content = `---\nname: ${skill.frontmatter.name}\ndescription: ${skill.frontmatter.description}\n---\n\n${body}`;
  return { filename: `${skill.name}.md`, content };
}

function toGemini(skill: CanonicalSkill): { filename: string; content: string } {
  const body = addPlatformNotice(skill, "Gemini CLI");
  // Gemini uses TOML-like frontmatter
  const content = `---
name: ${skill.frontmatter.name}
description: "${skill.frontmatter.description}"
allowed-tools: [${(skill.frontmatter["allowed-tools"] ?? skill.frontmatter.tools ?? "").split(",").map((t: string) => `"${t.trim()}"`).join(", ")}]
---

${body}`;
  return { filename: "SKILL.md", content };
}

function toPi(skill: CanonicalSkill): Array<{ filename: string; content: string }> {
  const body = addPlatformNotice(skill, "Pi");
  const skillJson = {
    name: toKebabCase(skill.name),
    description: skill.frontmatter.description,
    version: skill.frontmatter.version ?? "1.0.0",
    tools: (skill.frontmatter["allowed-tools"] ?? skill.frontmatter.tools ?? "").split(",").map((t: string) => t.trim()),
  };
  return [
    { filename: "skill.json", content: JSON.stringify(skillJson, null, 2) },
    { filename: "prompt.md", content: body },
  ];
}

function toCodex(skill: CanonicalSkill): Array<{ filename: string; content: string }> {
  const body = addPlatformNotice(skill, "Codex");
  const yaml = `name: ${skill.name}
description: "${skill.frontmatter.description}"
version: ${skill.frontmatter.version ?? "1.0.0"}
tools:
${(skill.frontmatter["allowed-tools"] ?? skill.frontmatter.tools ?? "").split(",").map((t: string) => `  - ${t.trim()}`).join("\n")}
`;
  return [
    { filename: "skill.yaml", content: yaml },
    { filename: "prompt.md", content: body },
  ];
}

function toAntigravity(skill: CanonicalSkill): { filename: string; content: string } {
  // Gemini-compatible format (Antigravity uses same format)
  return toGemini(skill);
}

function toWocode(skill: CanonicalSkill): { filename: string; content: string } {
  // Node/Deno command registration format
  const body = addPlatformNotice(skill, "Wo Coder");
  const registration = `// Auto-generated from canonical skill: ${skill.name}
// Platform: WoCoder (Node/Deno)
// Description: ${skill.frontmatter.description}

export const skill = {
  name: "${skill.name}",
  description: "${skill.frontmatter.description}",
  tools: [${(skill.frontmatter["allowed-tools"] ?? skill.frontmatter.tools ?? "").split(",").map((t: string) => `"${t.trim()}"`).join(", ")}],
  prompt: \`${body.replace(/`/g, "\\`")}\`,
};
`;
  return { filename: `${skill.name}.ts`, content: registration };
}

function addPlatformNotice(skill: CanonicalSkill, platformName: string): string {
  return `> **Platform**: ${platformName} | **Skill**: ${skill.frontmatter.name} | **Version**: ${skill.frontmatter.version ?? "1.0.0"}\n>\n> _Auto-generated from canonical format. Do not edit directly._\n\n${skill.body}`;
}

function toKebabCase(name: string): string {
  return name.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// --- Generate ---

async function generateForPlatform(
  skill: CanonicalSkill,
  platform: string,
  outputDir: string,
): Promise<string[]> {
  const generated: string[] = [];
  const platformDir = join(outputDir, platform, "skills", skill.name);
  await ensureDir(platformDir);

  let results: Array<{ filename: string; content: string }> = [];

  switch (platform) {
    case "claude":
      results = [toClaude(skill)];
      break;
    case "opencode":
      results = [toOpenCode(skill)];
      break;
    case "gemini":
      results = [toGemini(skill)];
      break;
    case "pi":
      results = toPi(skill);
      break;
    case "codex":
      results = toCodex(skill);
      break;
    case "antigravity":
      results = [toAntigravity(skill)];
      break;
    case "wocoder":
      results = [toWocode(skill)];
      break;
    default:
      console.error(`Unknown platform: ${platform}`);
      return generated;
  }

  for (const result of results) {
    const destPath = join(platformDir, result.filename);
    await Deno.writeTextFile(destPath, result.content);
    generated.push(destPath);
  }

  // Copy auxiliary files (non-SKILL.md, non-tools.json)
  for (const file of skill.files) {
    if (file === "SKILL.md" || file === "tools.json" || file.endsWith(".sh") || file.endsWith(".bat") || file.endsWith(".ps1")) {
      continue;
    }
    if (results.some((r) => r.filename === file)) continue;
    try {
      await Deno.copyFile(join(skill.path, file), join(platformDir, file));
      generated.push(join(platformDir, file));
    } catch {
      // skip
    }
  }

  return generated;
}

// --- Validate Canonical Format ---

async function validateSkill(skill: CanonicalSkill): Promise<string[]> {
  const errors: string[] = [];
  if (!skill.frontmatter.name) errors.push("Missing 'name' in frontmatter");
  if (!skill.frontmatter.description) errors.push("Missing 'description' in frontmatter");
  if (!skill.body || skill.body.trim().length < 10) errors.push("Body too short (<10 chars)");

  const allowedTypes = ["read", "write", "bash", "grep", "glob", "ls", "find", "edit",
    "web_search", "web_fetch", "Read", "Write", "Bash", "Grep", "Glob", "Edit",
    "run_shell_command", "read_file", "search_file_content", "replace", "write_file"];
  const toolsStr = (skill.frontmatter["allowed-tools"] ?? skill.frontmatter.tools ?? "") as string;
  const tools = toolsStr.replace(/[[\]"]/g, "").split(",").map((t: string) => t.trim()).filter(Boolean);
  for (const t of tools) {
    if (!allowedTypes.includes(t)) {
      errors.push(`Unknown tool: "${t}"`);
    }
  }
  return errors;
}

// --- Main ---

const args = parse(Deno.args, {
  string: ["platform", "skill"],
  boolean: ["all", "help"],
  alias: { h: "help" },
});

const command = args._[0] as string | undefined;

if (args.help || !command) {
  console.log(`
Skill Adapter

Converts canonical skills to platform-specific formats.

Usage:
  adapter.ts list                                    List canonical skills
  adapter.ts validate <skill>                        Validate canonical format
  adapter.ts generate <skill> --platform=claude      Generate for platform
  adapter.ts generate <skill> --platform=all          Generate for all platforms
  adapter.ts generate --all --platform=all            Generate all skills for all platforms

Platforms: ${PLATFORMS.join(", ")}

Examples:
  adapter.ts list
  adapter.ts generate ticket-manager --platform=all
  adapter.ts generate --all --platform=claude
  adapter.ts validate ticket-manager
`);
  Deno.exit(0);
}

const skills = await listCanonicalSkills();

switch (command) {
  case "list": {
    console.log(`\nCanonical Skills (${skills.length}):\n`);
    for (const s of skills) {
      const ns = s.frontmatter.namespace ?? "unknown";
      const platforms = Array.isArray(s.frontmatter.platforms)
        ? s.frontmatter.platforms.join(", ")
        : "all";
      console.log(`  ${s.name.padEnd(25)} [${ns.padEnd(8)}] platforms: ${platforms}`);
    }
    console.log();
    Deno.exit(0);
  }

  case "validate": {
    const skillName = args.skill || (args._[1] as string);
    if (!skillName) {
      console.error("Usage: adapter.ts validate <skill>");
      Deno.exit(1);
    }
    const skill = skills.find((s) => s.name === skillName || s.frontmatter.name === skillName);
    if (!skill) {
      console.error(`Skill '${skillName}' not found`);
      Deno.exit(1);
    }
    const errors = await validateSkill(skill);
    if (errors.length === 0) {
      console.log(`✅ ${skill.name}: valid`);
    } else {
      console.log(`❌ ${skill.name}: ${errors.length} issues`);
      for (const e of errors) console.log(`   - ${e}`);
    }
    Deno.exit(0);
  }

  case "generate": {
    const generateAll = args.all || args._[1] === "all";
    const skillFilter = args.skill || (args._[1] as string);
    const platformFilter = args.platform || "all";
    const targetPlatforms = platformFilter === "all" ? PLATFORMS : [platformFilter];

    const targetSkills = generateAll
      ? skills
      : skills.filter((s) => s.name === skillFilter || s.frontmatter.name === skillFilter);

    if (targetSkills.length === 0) {
      console.error(`No skills matched. Use 'list' to see available skills.`);
      Deno.exit(1);
    }

    let total = 0;
    for (const skill of targetSkills) {
      const errors = await validateSkill(skill);
      if (errors.length > 0) {
        console.log(`⚠  ${skill.name}: skipping (${errors.length} validation issues)`);
        continue;
      }

      for (const platform of targetPlatforms) {
        const files = await generateForPlatform(skill, platform, HARNESS_DIR);
        console.log(`  ✓ ${skill.name} → ${platform}/skills/${skill.name}/ (${files.length} files)`);
        total += files.length;
      }
    }

    console.log(`\n✅ Generated ${total} files across ${targetSkills.length} skills and ${targetPlatforms.length} platforms`);
    break;
  }

  default:
    console.error(`Unknown command: ${command}. Use: list, validate, generate`);
    Deno.exit(1);
}
