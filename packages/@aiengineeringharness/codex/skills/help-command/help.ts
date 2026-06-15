#!/usr/bin/env -S deno run --allow-read --allow-env
/**
 * AI Engineering Harness — Unified /help Command
 *
 * Usage:
 *   deno run -A packages/@aiengineeringharness/codex/skills/help_command/help.ts
 *   deno run -A packages/@aiengineeringharness/codex/skills/help_command/help.ts skills
 *   deno run -A packages/@aiengineeringharness/codex/skills/help_command/help.ts commands
 *   deno run -A packages/@aiengineeringharness/codex/skills/help_command/help.ts agents
 *   deno run -A packages/@aiengineeringharness/codex/skills/help_command/help.ts <skill-name>
 *   deno run -A packages/@aiengineeringharness/codex/skills/help_command/help.ts workflow
 *   deno run -A packages/@aiengineeringharness/codex/skills/help_command/help.ts practices
 *   deno run -A packages/@aiengineeringharness/codex/skills/help_command/help.ts search <term>
 *   deno run -A packages/@aiengineeringharness/codex/skills/help_command/help.ts onboarding
 *   deno run -A packages/@aiengineeringharness/codex/skills/help_command/help.ts ticket
 *   deno run -A packages/@aiengineeringharness/codex/skills/help_command/help.ts team
 *   deno run -A packages/@aiengineeringharness/codex/skills/help_command/help.ts dashboard
 *   deno run -A packages/@aiengineeringharness/codex/skills/help_command/help.ts --json skills
 *   deno run -A packages/@aiengineeringharness/codex/skills/help_command/help.ts --markdown skills
 */

import { parseArgs } from "jsr:@std/cli@1/parse-args";
import { join, dirname } from "jsr:@std/path@1/join";
import { globToRegExp } from "jsr:@std/path@1/glob-to-regexp";

// Auto-detect tool from script path: packages/@aiengineeringharness/<tool>/skills/...
const SCRIPT_PATH = import.meta.url.startsWith("file://")
  ? import.meta.url.slice(7)
  : import.meta.url;
const TOOL = SCRIPT_PATH.split("/packages/@aiengineeringharness/")[1]?.split("/")[0] ?? "codex";
const ROOT = resolveRoot();
const HARNESS_DIR = join(ROOT, "packages/@aiengineeringharness");
const MANIFEST_PATH = join(HARNESS_DIR, "manifest.json");
const TOOL_SKILLS_DIR = join(HARNESS_DIR, TOOL, "skills");
const TOOL_AGENTS_DIR = join(HARNESS_DIR, TOOL, "agents");
const THOUGHTS_DIR = join(ROOT, "thoughts");

const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[96m";
const YELLOW = "\x1b[93m";
const MAGENTA = "\x1b[95m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

function resolveRoot(): string {
  let d = Deno.cwd();
  for (let i = 0; i < 10; i++) {
    if (
      Deno.statSync(join(d, "packages/@aiengineeringharness/manifest.json")).isFile
    ) return d;
    const parent = join(d, "..");
    if (parent === d) break;
    d = parent;
  }
  return Deno.cwd();
}

interface Manifest {
  version: string;
  tools: Record<string, {
    target: string;
    components: Record<string, {
      description: string;
      files: { src: string; dest: string }[];
    }>;
  }>;
}

interface SkillEntry {
  key: string;
  name: string;
  description: string;
  src: string;
}

interface AgentInfo {
  name: string;
  path: string;
  description: string;
}

async function readJson<T>(path: string): Promise<T | null> {
  try {
    return JSON.parse(await Deno.readTextFile(path));
  } catch {
    return null;
  }
}

async function parseFrontmatter(content: string): Promise<Record<string, unknown>> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const sep = line.indexOf(": ");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    let val: unknown = line.slice(sep + 2).trim();
    if (typeof val === "string") {
      const t = val.trim();
      if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
        val = t.slice(1, -1);
      }
      if ((val as string).startsWith("[") && (val as string).endsWith("]")) {
        try { val = JSON.parse(val as string); } catch {}
      }
    }
    fm[key] = val;
  }
  return fm;
}

function loadManifest(): Promise<Manifest | null> {
  return readJson<Manifest>(MANIFEST_PATH);
}

async function loadSkills(manifest: Manifest): Promise<SkillEntry[]> {
  const tool = manifest.tools[TOOL];
  if (!tool) return [];
  const skills: SkillEntry[] = [];
  for (const [key, comp] of Object.entries(tool.components)) {
    if (!key.startsWith("skill/")) continue;
    const skillName = key.replace("skill/", "");
    for (const file of comp.files) {
      if (file.src.endsWith("/SKILL.md")) {
        const srcPath = join(HARNESS_DIR, file.src);
        let description = comp.description;
        // Try to read actual description from SKILL.md frontmatter
        try {
          const content = await Deno.readTextFile(srcPath);
          const fm = await parseFrontmatter(content);
          description = (fm.description as string) ?? description;
        } catch {}
        skills.push({
          key,
          name: skillName,
          description,
          src: srcPath,
        });
      }
    }
  }
  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

async function loadAgents(): Promise<AgentInfo[]> {
  const agents: AgentInfo[] = [];
  try {
    for await (const entry of Deno.readDir(TOOL_AGENTS_DIR)) {
      if (!entry.isFile || !entry.name.endsWith(".md") || entry.name === "README.md") continue;
      const path = join(TOOL_AGENTS_DIR, entry.name);
      const content = await Deno.readTextFile(path);
      const fm = await parseFrontmatter(content);
      agents.push({
        name: entry.name.replace(/\.md$/, ""),
        path,
        description: (fm.description as string) ?? "",
      });
    }
  } catch {}
  return agents.sort((a, b) => a.name.localeCompare(b.name));
}

function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

// ── Subcommands ──────────────────────────────────────────────────────────

async function printOverview(format: "text" | "json" | "markdown"): Promise<void> {
  const manifest = await loadManifest();
  const skills = manifest ? await loadSkills(manifest) : [];
  const agents = await loadAgents();

  if (format === "json") {
    console.log(JSON.stringify({
      tool: TOOL,
      harness_version: manifest?.version ?? "unknown",
      skills_total: skills.length,
      agents_total: agents.length,
      quick_links: [
        "skills", "commands", "agents", "workflow", "practices",
        "search", "onboarding", "ticket", "team", "dashboard",
      ],
    }, null, 2));
    return;
  }

  if (format === "markdown") {
    console.log(`# AI Engineering Harness — ${TOOL}`);
    console.log();
    console.log(`**Tool**: ${TOOL}`);
    console.log(`**Version**: ${manifest?.version ?? "unknown"}`);
    console.log(`**Skills**: ${skills.length}`);
    console.log(`**Agents**: ${agents.length}`);
    console.log();
    console.log("## Quick Links");
    console.log("- `/help skills` — List all skills");
    console.log("- `/help commands` — List slash commands");
    console.log("- `/help agents` — List core agents");
    console.log("- `/help <skill-name>` — Detail for a specific skill");
    console.log("- `/help workflow` — Standard workflows");
    console.log("- `/help practices` — Production-ready practices");
    console.log("- `/help search <term>` — Search across skills/commands/agents/docs");
    console.log("- `/help onboarding` — New developer quickstart");
    console.log("- `/help ticket` — Ticket workflow");
    console.log("- `/help team` — Team setup");
    console.log("- `/help dashboard` — CTO Dashboard");
    console.log();
    console.log("## Workflow");
    console.log("Ticket → /create_plan → /implement_plan → /validate_plan → [/validate_telemetry] → /commit");
    console.log();
    return;
  }

  // text (default)
  console.log(`\n${BOLD}AI Engineering Harness — ${TOOL}${RESET}`);
  console.log(`${DIM}Unified help for skills, commands, agents, and workflows${RESET}\n`);

  console.log(`${BOLD}Quick Links${RESET}`);
  console.log(`  ${GREEN}/help skills${RESET}       List all skills (${skills.length} total)`);
  console.log(`  ${GREEN}/help commands${RESET}     List slash commands`);
  console.log(`  ${GREEN}/help agents${RESET}       List core agents (${agents.length} total)`);
  console.log(`  ${GREEN}/help <skill>${RESET}      Help for a specific skill`);
  console.log(`  ${GREEN}/help workflow${RESET}     Standard WoW workflows`);
  console.log(`  ${GREEN}/help practices${RESET}    Production-ready practices guide`);
  console.log(`  ${GREEN}/help search <term>${RESET} Search skills/commands/agents/docs`);
  console.log(`  ${GREEN}/help onboarding${RESET}   New developer quickstart`);
  console.log(`  ${GREEN}/help ticket${RESET}       Ticket workflow`);
  console.log(`  ${GREEN}/help team${RESET}         Team setup`);
  console.log(`  ${GREEN}/help dashboard${RESET}    CTO Dashboard`);
  console.log();

  console.log(`${BOLD}Workflow${RESET}`);
  console.log(`  Ticket → ${DIM}/create_plan${RESET} → ${DIM}/implement_plan${RESET} → ${DIM}/validate_plan${RESET} → ${DIM}[/validate_telemetry]${RESET} → ${DIM}/commit${RESET}`);
  console.log();

  console.log(`${BOLD}Flags${RESET}`);
  console.log(`  --json       Machine-readable JSON output`);
  console.log(`  --markdown   Markdown-formatted output (agent-friendly)`);
  console.log();
}

async function printSkills(format: "text" | "json" | "markdown", filterName?: string): Promise<void> {
  const manifest = await loadManifest();
  if (!manifest) { console.log("Manifest not found."); return; }
  const skills = await loadSkills(manifest);

  if (filterName) {
    const match = skills.find((s) => s.name === filterName);
    if (!match) {
      console.log(`No skill named "${filterName}".`);
      return;
    }
    await printSkillDetail(match.name, format);
    return;
  }

  if (format === "json") {
    console.log(JSON.stringify(skills.map((s) => ({
      name: s.name,
      description: s.description,
    })), null, 2));
    return;
  }

  if (format === "markdown") {
    console.log(`# Skills (${skills.length})`);
    console.log();
    for (const s of skills) {
      console.log(`- **${s.name}** — ${s.description}`);
    }
    console.log();
    return;
  }

  console.log(`\n${BOLD}Skills (${skills.length})${RESET}\n`);
  for (const s of skills) {
    console.log(`  ${CYAN}${s.name}${RESET}`);
    console.log(`    ${s.description.slice(0, 120)}`);
  }
  console.log();
}

async function printSkillDetail(name: string, format: "text" | "json" | "markdown"): Promise<void> {
  // Try to find the SKILL.md in the tool-specific directory
  const possibleDirs = [
    join(TOOL_SKILLS_DIR, name),
    join(TOOL_SKILLS_DIR, name.replace(/_/g, "-")),
    join(TOOL_SKILLS_DIR, name.replace(/-/g, "_")),
  ];

  let content = "";
  let skillPath = "";
  for (const dir of possibleDirs) {
    const p = join(dir, "SKILL.md");
    try {
      content = await Deno.readTextFile(p);
      skillPath = p;
      break;
    } catch {}
  }

  if (!content) {
    console.log(`No help available for "${name}".`);
    return;
  }

  const fm = await parseFrontmatter(content);
  const body = content.replace(/^---\n[\s\S]*?\n---\n?/, "").trim();

  if (format === "json") {
    console.log(JSON.stringify({
      name: fm.name ?? name,
      description: fm.description ?? "",
      version: fm.version,
      namespace: fm.namespace,
      tools: fm.tools ?? fm["allowed-tools"],
      platforms: fm.platforms ?? [],
      dependencies: fm.dependencies ?? [],
      body_preview: body.slice(0, 500),
      path: skillPath,
    }, null, 2));
    return;
  }

  console.log(`\n${BOLD}${fm.name ?? name}${RESET}`);
  if (fm.description) console.log(`  ${DIM}${fm.description}${RESET}\n`);
  if (fm.version) console.log(`  Version: ${fm.version}`);
  if (fm.namespace) console.log(`  Namespace: ${fm.namespace}`);
  if (fm.platforms) {
    const p = Array.isArray(fm.platforms) ? fm.platforms.join(", ") : fm.platforms;
    console.log(`  Platforms: ${p}`);
  }
  if (fm.tools || fm["allowed-tools"]) {
    const t = (fm.tools as string) || (fm["allowed-tools"] as string) || "";
    console.log(`  Tools: ${t.replace(/[[\]"]/g, "")}`);
  }
  if (fm.dependencies) {
    const deps = Array.isArray(fm.dependencies) ? fm.dependencies.join(", ") : String(fm.dependencies);
    if (deps.length > 0 && deps !== "[]") console.log(`  Dependencies: ${deps}`);
  }
  console.log();

  // Print usage section if present
  const usageMatch = body.match(/## Usage\n\n([\s\S]*?)(?:\n##|$)/);
  if (usageMatch) {
    console.log(`${BOLD}Usage:${RESET}`);
    console.log(usageMatch[1].trim());
    console.log();
  }

  // Print body preview
  const cleaned = body.replace(/^##\s+.*$/m, "").trim().slice(0, 600);
  if (cleaned) {
    console.log(cleaned.slice(0, 600));
    if (cleaned.length > 600) console.log("...");
    console.log();
  }
}

const COMMANDS = [
  { cmd: "/init_harness", desc: "Initialize harness in a repo (AGENTS.md + thoughts/)" },
  { cmd: "/create_plan", desc: "Generate implementation plan from a ticket" },
  { cmd: "/implement_plan", desc: "Execute approved plan phase-by-phase" },
  { cmd: "/validate_plan", desc: "Verify implementation against plan" },
  { cmd: "/validate_telemetry", desc: "Verify telemetry against a narrative spec" },
  { cmd: "/commit", desc: "Create well-structured git commits", skill: "git_commit_helper" },
  { cmd: "/debug", desc: "Investigate issues during testing" },
  { cmd: "/debug_k8s", desc: "Debug Kubernetes (MCP or kubectl)" },
  { cmd: "/research_codebase", desc: "Comprehensive codebase research" },
  { cmd: "/work <ticket-id>", desc: "Start working on a ticket", skill: "ticket_manager" },
  { cmd: "/complete <ticket-id>", desc: "Complete a ticket, syncs status", skill: "ticket_manager" },
  { cmd: "/sync team", desc: "Show team dashboard", skill: "cto_dashboard" },
  { cmd: "/sync skills", desc: "Sync skills across frontends", skill: "skill_auto_update" },
  { cmd: "/help", desc: "Show this help", skill: "help_command" },
];

async function printCommands(format: "text" | "json" | "markdown"): Promise<void> {
  if (format === "json") {
    console.log(JSON.stringify(COMMANDS, null, 2));
    return;
  }

  if (format === "markdown") {
    console.log("# Slash Commands\n");
    console.log("| Command | Description | Skill |");
    console.log("|---------|-------------|-------|");
    for (const c of COMMANDS) {
      console.log(`| \`${c.cmd}\` | ${c.desc} | ${c.skill ?? "built-in"} |`);
    }
    console.log();
    return;
  }

  console.log(`\n${BOLD}Slash Commands${RESET}\n`);
  for (const c of COMMANDS) {
    const tag = c.skill ? `${DIM}[${c.skill}]${RESET}` : `${DIM}[built-in]${RESET}`;
    console.log(`  ${GREEN}${c.cmd.padEnd(28)}${RESET} ${c.desc.padEnd(55)} ${tag}`);
  }
  console.log();
}

async function printAgents(format: "text" | "json" | "markdown"): Promise<void> {
  const agents = await loadAgents();

  if (format === "json") {
    console.log(JSON.stringify(agents, null, 2));
    return;
  }

  if (format === "markdown") {
    console.log(`# Agents (${agents.length})\n`);
    for (const a of agents) {
      console.log(`## ${a.name}`);
      console.log(a.description || "No description.");
      console.log();
    }
    return;
  }

  console.log(`\n${BOLD}Agents (${agents.length})${RESET}\n`);
  for (const a of agents) {
    console.log(`  ${CYAN}${BOLD}${a.name}${RESET}`);
    console.log(`  ${a.description || "No description."}`);
    console.log();
  }
}

async function printWorkflow(): Promise<void> {
  console.log(`\n${BOLD}Workflows${RESET}\n`);

  console.log(`${CYAN}1.${RESET} ${BOLD}Feature Delivery (f-rr-d)${RESET}`);
  console.log(`   Ticket → ${DIM}/create_plan${RESET} → ${DIM}/implement_plan${RESET} → ${DIM}/validate_plan${RESET} → ${DIM}/commit${RESET}`);
  console.log(`   Full lifecycle from ticket to PR.`);
  console.log();

  console.log(`${CYAN}2.${RESET} ${BOLD}TDD (Test-Driven Development)${RESET}`);
  console.log(`   Red → Green → Refactor`);
  console.log(`   Write failing test → make it pass → clean up.`);
  console.log(`   Skill: tdd`);
  console.log();

  console.log(`${CYAN}3.${RESET} ${BOLD}PRD to Issues${RESET}`);
  console.log(`   Client brief → PRD → Vertical-slice issues`);
  console.log(`   Skill: write_a_prd, prd_to_issues`);
  console.log();

  console.log(`${CYAN}4.${RESET} ${BOLD}Observability-Driven Development${RESET}`);
  console.log(`   Narrative spec → Instrument → Validate telemetry`);
  console.log(`   Skill: observability_driven_development`);
  console.log();

  console.log(`${CYAN}5.${RESET} ${BOLD}Experimental Workflow${RESET}`);
  console.log(`   Commit → Retroactive ticket → Retroactive PR`);
  console.log(`   Skill: experimental_pr_workflow`);
  console.log();

  console.log(`${CYAN}6.${RESET} ${BOLD}Codebase Architecture Improvement${RESET}`);
  console.log(`   Explore → Find friction → RFC issue → Refactor`);
  console.log(`   Skill: improve_codebase_architecture`);
  console.log();

  console.log(`${CYAN}7.${RESET} ${BOLD}Interview-Driven Design${RESET}`);
  console.log(`   Interview → Shared understanding → Implement`);
  console.log(`   Skill: interview`);
  console.log();

  console.log(`${BOLD}Workflow Steps Detail:${RESET}`);
  console.log(`  ${DIM}1.${RESET} Create ticket in ${GREEN}thoughts/shared/tickets/${RESET} (use ticket-template.md)`);
  console.log(`  ${DIM}2.${RESET} Run ${GREEN}/create_plan <ticket-path>${RESET} to generate implementation plan`);
  console.log(`  ${DIM}3.${RESET} Run ${GREEN}/implement_plan <plan-path>${RESET} to execute phase-by-phase`);
  console.log(`  ${DIM}4.${RESET} Run ${GREEN}/validate_plan${RESET} to verify implementation`);
  console.log(`  ${DIM}5.${RESET} (Optional) Run ${GREEN}/validate_telemetry${RESET} to verify traces`);
  console.log(`  ${DIM}6.${RESET} Run ${GREEN}/commit${RESET} to commit changes`);
  console.log();
}

async function printPractices(format: "text" | "json" | "markdown"): Promise<void> {
  // Discover best-practices docs from thoughts directory
  const bpDir = join(THOUGHTS_DIR, "wayofmono", "docs", "best-practices");
  const docs: string[] = [];
  try {
    for await (const entry of Deno.readDir(bpDir)) {
      if (entry.isFile && entry.name.endsWith(".md")) docs.push(entry.name);
    }
  } catch {}

  if (format === "json") {
    console.log(JSON.stringify({
      production_ready_mandate: "All code must be production-ready: no mock data, enterprise grade, proper error handling, observability, security, edge cases, tests for failure modes.",
      best_practices_docs: docs,
    }, null, 2));
    return;
  }

  if (format === "markdown") {
    console.log("# Production-Ready Practices\n");
    console.log("**Production-Ready Mandate**: All code must be enterprise grade — no mock data in application code, proper error handling, observability, security, edge cases, failure-mode tests.\n");
    console.log("## Best Practices Docs\n");
    for (const d of docs) {
      console.log(`- [${d.replace(/\.md$/, "")}](thoughts/wayofmono/docs/best-practices/${d})`);
    }
    console.log();
    return;
  }

  console.log(`\n${BOLD}Production-Ready Practices${RESET}\n`);
  console.log(`  ${YELLOW}Mandate:${RESET} All code must be production-ready:`);
  console.log(`    • No mock data in application code`);
  console.log(`    • Enterprise-grade error handling`);
  console.log(`    • Observability (logging, metrics, traces)`);
  console.log(`    • Security (input validation, auth, rate limiting)`);
  console.log(`    • Edge cases (empty states, timeouts, duplicates)`);
  console.log(`    • Tests for failure modes (not just happy path)`);
  console.log();

  if (docs.length > 0) {
    console.log(`${BOLD}Best Practices Docs:${RESET}`);
    for (const d of docs) {
      console.log(`  • ${DIM}thoughts/wayofmono/docs/best-practices/${d}${RESET}`);
    }
    console.log();
  }

  console.log(`${BOLD}Skills:${RESET}`);
  console.log(`  • ${CYAN}womono_practices_guide${RESET} — Full production-ready mandate`);
  console.log(`  • ${CYAN}womono_practices_audit${RESET} — Compliance checker for practices`);
  console.log(`  • ${CYAN}womono_practices_backlog${RESET} — Ticket creator with naming logic`);
  console.log();
}

async function printSearch(term: string, format: "text" | "json" | "markdown"): Promise<void> {
  const manifest = await loadManifest();
  const skills = manifest ? await loadSkills(manifest) : [];
  const agents = await loadAgents();
  const results: { type: string; name: string; match: string; path?: string }[] = [];
  const lowerTerm = term.toLowerCase();

  // Search skills
  for (const s of skills) {
    if (
      s.name.toLowerCase().includes(lowerTerm) ||
      s.description.toLowerCase().includes(lowerTerm)
    ) {
      results.push({ type: "skill", name: s.name, match: s.name, path: s.src });
    }
  }

  // Search agents
  for (const a of agents) {
    if (
      a.name.toLowerCase().includes(lowerTerm) ||
      a.description.toLowerCase().includes(lowerTerm)
    ) {
      results.push({ type: "agent", name: a.name, match: a.name, path: a.path });
    }
  }

  // Search commands
  for (const c of COMMANDS) {
    if (
      c.cmd.toLowerCase().includes(lowerTerm) ||
      c.desc.toLowerCase().includes(lowerTerm)
    ) {
      results.push({ type: "command", name: c.cmd, match: c.desc });
    }
  }

  // Search SKILL.md files
  for (const s of skills) {
    try {
      const content = await Deno.readTextFile(s.src);
      if (content.toLowerCase().includes(lowerTerm)) {
        // Find first matching line
        for (const line of content.split("\n")) {
          if (line.toLowerCase().includes(lowerTerm)) {
            results.push({ type: "skill-content", name: s.name, match: line.trim().slice(0, 120) });
            break;
          }
        }
      }
    } catch {}
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique = results.filter((r) => {
    const key = `${r.type}:${r.name}:${r.match.slice(0, 40)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (format === "json") {
    console.log(JSON.stringify({ term, results: unique }, null, 2));
    return;
  }

  if (format === "markdown") {
    console.log(`# Search Results for "${term}"\n`);
    if (unique.length === 0) {
      console.log("No results found.\n");
      return;
    }
    for (const r of unique) {
      console.log(`- **[${r.type}]** ${r.name} — ${r.match}`);
    }
    console.log();
    return;
  }

  console.log(`\n${BOLD}Search Results for "${term}"${RESET}\n`);
  if (unique.length === 0) {
    console.log(`  No results found for "${term}".`);
    console.log();
    return;
  }

  const byType: Record<string, typeof unique> = {};
  for (const r of unique) {
    (byType[r.type] = byType[r.type] ?? []).push(r);
  }

  for (const [type, items] of Object.entries(byType)) {
    console.log(`  ${BOLD}${type}${RESET} (${items.length}):`);
    for (const item of items) {
      console.log(`    ${CYAN}${item.name}${RESET}`);
      console.log(`      ${item.match.slice(0, 100)}`);
    }
    console.log();
  }
}

async function printOnboarding(format: "text" | "json" | "markdown"): Promise<void> {
  if (format === "json") {
    console.log(JSON.stringify({
      steps: [
        "Install the harness: ai-harness --tool=<name>",
        "Pick your tool(s): claude, opencode, gemini, pi, wocoder, antigravity, codex",
        "Run update: ai-harness --update",
        "Report skills: ai-harness --report-skills",
        "Create first ticket: use ticket_manager skill",
        "Start working: /work <ticket-id>",
      ],
      commands: [
        "/help", "/help skills", "/help commands", "/help agents",
        "/help workflow", "/help practices", "/help onboarding",
        "/create_plan", "/implement_plan", "/validate_plan", "/commit",
      ],
    }, null, 2));
    return;
  }

  if (format === "markdown") {
    console.log("# Onboarding — New Developer Quickstart\n");
    console.log("## 1. Install the Harness\n");
    console.log("```bash");
    console.log("deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --install-cli");
    console.log("```\n");
    console.log("## 2. Pick Your Tools\n");
    console.log("Supported tools: claude, opencode, gemini, pi, wocoder, antigravity, codex\n");
    console.log("```bash");
    console.log("ai-harness --tool=claude");
    console.log("ai-harness --tool=opencode");
    console.log("ai-harness --tool=all  # Install everything\n");
    console.log("```\n");
    console.log("## 3. Update\n");
    console.log("```bash");
    console.log("ai-harness --update\n");
    console.log("```\n");
    console.log("## 4. Report Skills\n");
    console.log("```bash");
    console.log("ai-harness --report-skills\n");
    console.log("```\n");
    console.log("## 5. Create Your First Ticket\n");
    console.log("Use the `ticket_manager` skill or run:");
    console.log("```bash");
    console.log("cp thoughts/shared/tickets/ticket-template.md thoughts/wayofmono/shared/tickets/WOMONO-001-MY-FEATURE.md");
    console.log("# Edit the ticket, then run:");
    console.log("/work WOMONO-001\n");
    console.log("```\n");
    console.log("## 6. Start Working\n");
    console.log("1. ` /work <ticket-id>` - Start a ticket");
    console.log("2. `/create_plan <ticket-path>` - Generate plan");
    console.log("3. `/implement_plan <plan-path>` - Execute");
    console.log("4. `/validate_plan` - Verify");
    console.log("5. `/commit` - Commit changes\n");
    console.log("## Key Commands\n");
    console.log("| Command | Purpose |");
    console.log("|---------|---------|");
    for (const c of COMMANDS) {
      console.log(`| \`${c.cmd}\` | ${c.desc} |`);
    }
    console.log("\n## Production-Ready Mandate\n");
    console.log("All code must be enterprise grade:");
    console.log("- No mock data in application code");
    console.log("- Proper error handling for all failure modes");
    console.log("- Observability: logging, metrics, traces");
    console.log("- Security: input validation, auth, rate limiting");
    console.log("- Tests for edge cases and failure paths");
    return;
  }

  console.log(`\n${BOLD}Onboarding — New Developer Quickstart${RESET}\n`);

  console.log(`${CYAN}1.${RESET} ${BOLD}Install the Harness${RESET}`);
  console.log(`   deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --install-cli`);
  console.log();

  console.log(`${CYAN}2.${RESET} ${BOLD}Pick Your Tools${RESET}`);
  console.log(`   Supported: claude, opencode, gemini, pi, wocoder, antigravity, codex`);
  console.log(`   ai-harness --tool=claude`);
  console.log(`   ai-harness --tool=all`);
  console.log();

  console.log(`${CYAN}3.${RESET} ${BOLD}Update${RESET}`);
  console.log(`   ai-harness --update`);
  console.log();

  console.log(`${CYAN}4.${RESET} ${BOLD}Report Skills${RESET}`);
  console.log(`   ai-harness --report-skills`);
  console.log();

  console.log(`${CYAN}5.${RESET} ${BOLD}Create First Ticket${RESET}`);
  console.log(`   Use ticket_manager skill or manually create in thoughts/shared/tickets/`);
  console.log();

  console.log(`${CYAN}6.${RESET} ${BOLD}Start Working${RESET}`);
  console.log(`   /work <ticket-id> → /create_plan → /implement_plan → /validate_plan → /commit`);
  console.log();

  console.log(`${BOLD}Production-Ready Mandate:${RESET}`);
  console.log(`  All code must be enterprise grade — no mock data, proper error handling,`);
  console.log(`  observability, security, edge cases, failure-mode tests.`);
  console.log();
}

async function printTicketWorkflow(format: "text" | "json" | "markdown"): Promise<void> {
  // Detect available namespaces from thoughts directory
  const namespaces: string[] = [];
  try {
    for await (const entry of Deno.readDir(THOUGHTS_DIR)) {
      if (entry.isDirectory && !entry.name.startsWith(".") && entry.name !== "global" && entry.name !== "shared") {
        namespaces.push(entry.name);
      }
    }
  } catch {}
  if (namespaces.length === 0) namespaces.push("wayofmono", "wow", "opticat");

  if (format === "json") {
    console.log(JSON.stringify({
      namespaces,
      template: "thoughts/shared/tickets/ticket-template.md",
      naming: "<PREFIX>-<NNN>-<UPPERCASE-DASHED-DESC>.md",
      prefixes: { WOMONO: "wayofmono", WOW: "wow", OPT: "opticat" },
      workflow: [
        "1. Create ticket in thoughts/<project>/shared/tickets/<id>.md",
        "2. Run /create_plan <ticket-path>",
        "3. Run /implement_plan <plan-path>",
        "4. Run /validate_plan",
        "5. Run /commit to commit changes",
        "6. Run /complete TICKET-123 to sync status",
      ],
    }, null, 2));
    return;
  }

  if (format === "markdown") {
    console.log("# Ticket Workflow\n");
    console.log("## Naming Convention\n");
    console.log("`<PREFIX>-<NNN>-<UPPERCASE-DASHED-DESC>.md`\n");
    console.log("| Prefix | Project | Namespace |");
    console.log("|--------|---------|-----------|");
    console.log("| WOMONO | wayofmono | womono |");
    console.log("| WOW | wayofwork | wow |");
    console.log("| OPT | opticat | opticat |\n");
    console.log("## Workflow\n");
    console.log("1. Create ticket in `thoughts/<project>/shared/tickets/`");
    console.log("2. Use template: `thoughts/shared/tickets/ticket-template.md`");
    console.log("3. Run `/create_plan <ticket-path>` to generate plan");
    console.log("4. Run `/implement_plan <plan-path>` to execute");
    console.log("5. Run `/validate_plan` to verify");
    console.log("6. Run `/commit` to commit changes\n");
    console.log("## Commands\n");
    console.log("- `/work <ticket-id>` - Start working on a ticket");
    console.log("- `/complete <ticket-id>` - Complete a ticket, syncs status");
    return;
  }

  console.log(`\n${BOLD}Ticket Workflow${RESET}\n`);

  console.log(`${BOLD}Naming Convention${RESET}`);
  console.log(`  Format: ${GREEN}<PREFIX>-<NNN>-<UPPERCASE-DASHED-DESC>.md${RESET}`);
  console.log();
  console.log(`  Prefixes:`);
  for (const ns of namespaces) {
    const prefix = ns === "wayofmono" ? "WOMONO" : ns === "wow" ? "WOW" : ns === "opticat" ? "OPT" : ns.toUpperCase();
    console.log(`    ${CYAN}${prefix}${RESET} → ${ns}`);
  }
  console.log();

  console.log(`${BOLD}Template${RESET}`);
  console.log(`  ${DIM}thoughts/shared/tickets/ticket-template.md${RESET}`);
  console.log();

  console.log(`${BOLD}Workflow${RESET}`);
  console.log(`  ${CYAN}1.${RESET} Create ticket in ${DIM}thoughts/<project>/shared/tickets/<id>.md${RESET}`);
  console.log(`  ${CYAN}2.${RESET} Run ${GREEN}/create_plan <ticket-path>${RESET}`);
  console.log(`  ${CYAN}3.${RESET} Run ${GREEN}/implement_plan <plan-path>${RESET}`);
  console.log(`  ${CYAN}4.${RESET} Run ${GREEN}/validate_plan${RESET}`);
  console.log(`  ${CYAN}5.${RESET} Run ${GREEN}/commit${RESET}`);
  console.log(`  ${CYAN}6.${RESET} Run ${GREEN}/complete TICKET-123${RESET} to sync`);
  console.log();
}

async function printTeamSetup(format: "text" | "json" | "markdown"): Promise<void> {
  if (format === "json") {
    console.log(JSON.stringify({
      config: ".wo/config/team-config.json",
      template: ".wo/config/team-config.template.json",
      commands: [
        "deno run -A packages/@aiengineeringharness/skills/team-setup/team-init.ts init",
        "deno run -A packages/@aiengineeringharness/skills/team-setup/team-init.ts list",
        "deno run -A packages/@aiengineeringharness/skills/team-setup/team-init.ts add --name=<dev> --role=<role> --project=<proj>",
        "deno run -A packages/@aiengineeringharness/skills/team-setup/team-init.ts assign --dev=<dev> --ticket=<id>",
      ],
    }, null, 2));
    return;
  }

  if (format === "markdown") {
    console.log("# Team Setup\n");
    console.log("Configuration file: `.wo/config/team-config.json`\n");
    console.log("## Commands\n");
    console.log("- `deno run -A packages/@aiengineeringharness/skills/team-setup/team-init.ts init`");
    console.log("- `deno run -A packages/@aiengineeringharness/skills/team-setup/team-init.ts list`");
    console.log("- `deno run -A packages/@aiengineeringharness/skills/team-setup/team-init.ts add --name=<dev> --role=<role> --project=<proj>`");
    console.log("- `deno run -A packages/@aiengineeringharness/skills/team-setup/team-init.ts assign --dev=<dev> --ticket=<id>`");
    return;
  }

  console.log(`\n${BOLD}Team Setup${RESET}\n`);
  console.log(`  Config: ${DIM}.wo/config/team-config.json${RESET}`);
  console.log();
  console.log(`${BOLD}Commands:${RESET}`);
  console.log(`  deno run -A packages/@aiengineeringharness/skills/team-setup/team-init.ts init`);
  console.log(`  deno run -A packages/@aiengineeringharness/skills/team-setup/team-init.ts list`);
  console.log(`  deno run -A packages/@aiengineeringharness/skills/team-setup/team-init.ts add --name=<dev> --role=<role> --project=<proj>`);
  console.log(`  deno run -A packages/@aiengineeringharness/skills/team-setup/team-init.ts assign --dev=<dev> --ticket=<id>`);
  console.log();
}

async function printDashboard(format: "text" | "json" | "markdown"): Promise<void> {
  if (format === "json") {
    console.log(JSON.stringify({
      commands: [
        "deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts",
        "deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts --summary",
        "deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts --dev=<name>",
        "deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts --review",
        "deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts --aging",
        "deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts --json",
      ],
      skill: "cto_dashboard",
    }, null, 2));
    return;
  }

  if (format === "markdown") {
    console.log("# CTO Dashboard\n");
    console.log("Skill: `cto_dashboard`\n");
    console.log("## Commands\n");
    console.log("- `deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts` — Full dashboard");
    console.log("- `deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts --summary` — Summary view");
    console.log("- `deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts --dev=<name>` — Developer view");
    console.log("- `deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts --review` — Review queue");
    console.log("- `deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts --aging` — Ticket aging");
    console.log("- `deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts --json` — Machine-readable");
    return;
  }

  console.log(`\n${BOLD}CTO Dashboard${RESET}\n`);
  console.log(`  Skill: ${CYAN}cto_dashboard${RESET}`);
  console.log();
  console.log(`${BOLD}Commands:${RESET}`);
  console.log(`  deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts`);
  console.log(`  deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts --summary`);
  console.log(`  deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts --dev=<name>`);
  console.log(`  deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts --review`);
  console.log(`  deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts --aging`);
  console.log(`  deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts --json`);
  console.log();
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(Deno.args, {
    boolean: ["help", "json", "markdown"],
    alias: { h: "help" },
  });

  let format: "text" | "json" | "markdown" = "text";
  if (args.json) format = "json";
  if (args.markdown) format = "markdown";

  if (args.help) {
    console.log(`
AI Engineering Harness — Unified Help System

Usage:
  deno run -A <path>/help.ts                    Top-level overview
  deno run -A <path>/help.ts skills             List all skills
  deno run -A <path>/help.ts skills <name>      Detail for a specific skill
  deno run -A <path>/help.ts commands           List slash commands
  deno run -A <path>/help.ts agents             List core agents
  deno run -A <path>/help.ts workflow           Standard workflows
  deno run -A <path>/help.ts practices          Production-ready practices
  deno run -A <path>/help.ts search <term>      Search across everything
  deno run -A <path>/help.ts onboarding         New developer quickstart
  deno run -A <path>/help.ts ticket             Ticket workflow
  deno run -A <path>/help.ts team               Team setup
  deno run -A <path>/help.ts dashboard          CTO Dashboard

Flags:
  --json       Machine-readable JSON output
  --markdown   Markdown-formatted output (agent-friendly)
`);
    Deno.exit(0);
  }

  const topic = args._[0] as string | undefined;
  const subtopic = args._[1] as string | undefined;

  switch (topic) {
    case undefined:
      await printOverview(format);
      break;
    case "skills":
      await printSkills(format, subtopic);
      break;
    case "commands":
      await printCommands(format);
      break;
    case "agents":
      await printAgents(format);
      break;
    case "workflow":
      await printWorkflow();
      break;
    case "practices":
      await printPractices(format);
      break;
    case "search":
      if (!subtopic) {
        console.log("Usage: /help search <term>");
        Deno.exit(1);
      }
      await printSearch(subtopic, format);
      break;
    case "onboarding":
      await printOnboarding(format);
      break;
    case "ticket":
      await printTicketWorkflow(format);
      break;
    case "team":
      await printTeamSetup(format);
      break;
    case "dashboard":
      await printDashboard(format);
      break;
    default:
      // Treat as skill name
      await printSkillDetail(topic, format);
      break;
  }
}

if (import.meta.main) {
  await main();
}
