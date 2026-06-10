#!/usr/bin/env deno run --allow-read

/**
 * AI Harness /help Command
 *
 * Unified help system: reads skill-registry.json, agent-registry.json,
 * and SKILL.md files to present categorized documentation.
 *
 * Usage:
 *   deno run -A help.ts                  Top-level overview
 *   deno run -A help.ts skills           List all skills
 *   deno run -A help.ts commands         List slash commands
 *   deno run -A help.ts agents           List core agents
 *   deno run -A help.ts <skill-name>     Detail for a specific skill
 *   deno run -A help.ts ticket           Ticket workflow
 *   deno run -A help.ts team             Team setup
 *   deno run -A help.ts dashboard        CTO dashboard
 */

import { join, dirname } from "https://deno.land/std@0.224.0/path/mod.ts";
import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";

const ROOT = Deno.cwd();
const HARNESS_DIR = join(ROOT, "packages/@aiengineeringharness");
const REGISTRY_PATH = join(HARNESS_DIR, "skills", "skill-registry.json");
const AGENT_REGISTRY_PATH = join(HARNESS_DIR, "agents", "agent-registry.json");
const CANONICAL_SKILLS_DIR = join(HARNESS_DIR, "skills");
const HARNESS_CONFIG_PATH = join(ROOT, ".wo", "config", "harness.json");

function getProjectSlug(): string {
  try {
    const content = Deno.readTextFileSync(HARNESS_CONFIG_PATH);
    return JSON.parse(content).project_slug || "wayofmono";
  } catch {
    return "wayofmono";
  }
}

const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[96m";
const YELLOW = "\x1b[93m";
const MAGENTA = "\x1b[95m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

interface SkillRegistry {
  skills: Record<string, {
    name: string;
    namespace: string;
    version: string;
    description: string;
    dependencies: string[];
    platforms: string[];
    path: string;
  }>;
  agent_registries: Record<string, { path: string; description: string }>;
  loader_precedence: string[];
}

interface AgentRegistry {
  agents: Record<string, {
    name: string;
    namespace: string;
    description: string;
    tools: string[];
    source: string;
    platforms: string[];
  }>;
}

interface SkillInfo {
  name: string;
  namespace: string;
  description: string;
  version?: string;
  dependencies: string[];
  tools?: string;
  isSystem: boolean;
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

async function loadSkills(): Promise<{ system: SkillInfo[]; ref: SkillInfo[] }> {
  const registry = await readJson<SkillRegistry>(REGISTRY_PATH);
  const registeredNames = new Set(Object.keys(registry?.skills ?? {}));
  const system: SkillInfo[] = [];
  const ref: SkillInfo[] = [];

  for await (const entry of Deno.readDir(CANONICAL_SKILLS_DIR)) {
    if (!entry.isDirectory) continue;
    const skillDir = join(CANONICAL_SKILLS_DIR, entry.name);
    const skillMdPath = join(skillDir, "SKILL.md");
    try {
      const content = await Deno.readTextFile(skillMdPath);
      const fm = await parseFrontmatter(content);
      const name = (fm.name as string) ?? entry.name;
      const description = (fm.description as string) ?? "";
      const tools = (fm.tools as string) ?? (fm["allowed-tools"] as string) ?? "";
      const dependencies = (fm.dependencies as string[]) ?? [];

      const info: SkillInfo = {
        name,
        namespace: (fm.namespace as string) ?? "unknown",
        description,
        version: fm.version as string,
        dependencies: Array.isArray(dependencies) ? dependencies : [],
        tools,
        isSystem: registeredNames.has(entry.name),
      };

      if (registeredNames.has(entry.name)) {
        system.push(info);
      } else {
        ref.push(info);
      }
    } catch {
      // SKILL.md not found or unreadable
    }
  }

  return { system, ref };
}

async function printOverview(): Promise<void> {
  const { system, ref } = await loadSkills();
  const agentRegistry = await readJson<AgentRegistry>(AGENT_REGISTRY_PATH);

  const byNamespace: Record<string, SkillInfo[]> = {};
  for (const s of [...system, ...ref]) {
    const ns = s.namespace;
    (byNamespace[ns] = byNamespace[ns] ?? []).push(s);
  }

  console.log(`\n${BOLD}AI Engineering Harness${RESET}`);
  console.log(`${DIM}Unified help for skills, commands, agents, and workflows${RESET}\n`);

  console.log(`${BOLD}Quick Links${RESET}`);
  console.log(`  /help skills       List all skills (${system.length + ref.length} total)`);
  console.log(`  /help commands     List slash commands (12)`);
  console.log(`  /help agents       List core agents (${agentRegistry ? Object.keys(agentRegistry.agents).length : 6})`);
  console.log(`  /help <skill>      Help for a specific skill`);
  console.log(`  /help ticket       Ticket workflow`);
  console.log(`  /help team         Team setup`);
  console.log(`  /help dashboard    CTO dashboard`);
  console.log();

  console.log(`${BOLD}System Skills by Namespace${RESET}`);
  for (const [ns, skills] of Object.entries(byNamespace).sort()) {
    const sysCount = skills.filter((s) => s.isSystem).length;
    const refCount = skills.filter((s) => !s.isSystem).length;
    console.log(`  ${CYAN}${ns}${RESET} (${sysCount} system, ${refCount} ref):`);
    for (const s of skills.slice(0, 5)) {
      const tag = s.isSystem ? `${GREEN}sys${RESET}` : `${DIM}ref${RESET}`;
      console.log(`    ${tag} ${BOLD}${s.name}${RESET}${s.description ? ` — ${s.description.slice(0, 70)}` : ""}`);
    }
    if (skills.length > 5) {
      console.log(`    ${DIM}... and ${skills.length - 5} more. Use /help skills for full list.${RESET}`);
    }
  }
  console.log();

  console.log(`${BOLD}Workflow${RESET}`);
  console.log(`  ${DIM}Ticket → /create_plan → /implement_plan → /validate_plan → /commit${RESET}`);
  console.log();
}

async function printSkills(filterNamespace?: string): Promise<void> {
  const { system, ref } = await loadSkills();

  const byNamespace: Record<string, { system: SkillInfo[]; ref: SkillInfo[] }> = {};
  const addToNs = (s: SkillInfo) => {
    const ns = s.namespace;
    if (!byNamespace[ns]) byNamespace[ns] = { system: [], ref: [] };
    if (s.isSystem) byNamespace[ns].system.push(s);
    else byNamespace[ns].ref.push(s);
  };
  for (const s of system) addToNs(s);
  for (const s of ref) addToNs(s);

  const total = system.length + ref.length;
  console.log(`\n${BOLD}All Skills (${total})${RESET}\n`);

  for (const [ns, groups] of Object.entries(byNamespace).sort()) {
    if (filterNamespace && ns !== filterNamespace) continue;
    const all = [...groups.system, ...groups.ref];
    const nsLabel = ns === "unknown" ? "uncategorized" : ns;
    console.log(`  ${CYAN}${nsLabel}${RESET} (${all.length}):`);

    for (const s of groups.system) {
      const tag = `${GREEN}sys${RESET}`;
      const deps = s.dependencies.length > 0 ? `${DIM}[deps: ${s.dependencies.join(", ")}]${RESET}` : "";
      console.log(`    ${tag} ${BOLD}${s.name}${RESET}`);
      console.log(`         ${s.description} ${deps}`);
    }
    for (const s of groups.ref) {
      console.log(`    ${DIM}ref${RESET} ${BOLD}${s.name}${RESET}`);
      console.log(`         ${s.description}`);
    }
    console.log();
  }
}

async function printCommands(): Promise<void> {
  const cmds: Array<{ cmd: string; desc: string; skill?: string }> = [
    { cmd: "/init_harness", desc: `Initialize harness in a repo (AGENTS.md + thoughts/${getProjectSlug()}/)` },
    { cmd: "/create_plan", desc: "Generate implementation plan from a ticket" },
    { cmd: "/implement_plan", desc: "Execute approved plan phase-by-phase" },
    { cmd: "/validate_plan", desc: "Verify implementation against plan" },
    { cmd: "/validate_telemetry", desc: "Verify telemetry against a narrative spec" },
    { cmd: "/commit", desc: "Create well-structured git commits" },
    { cmd: "/debug", desc: "Investigate issues during testing" },
    { cmd: "/debug_k8s", desc: "Debug Kubernetes (MCP or kubectl)" },
    { cmd: "/research_codebase", desc: "Comprehensive codebase research" },
    { cmd: "/work <ticket-id>", desc: "Start working on a ticket", skill: "ticket-manager" },
    { cmd: "/complete <ticket-id>", desc: "Complete a ticket, syncs status", skill: "ticket-manager" },
    { cmd: "/sync team", desc: "Show team dashboard", skill: "cto-dashboard" },
    { cmd: "/sync skills", desc: "Sync skills across frontends", skill: "skill-auto-update" },
    { cmd: "/help", desc: "Show this help", skill: "help-command" },
  ];

  const skillCmds = cmds.filter((c) => c.skill);
  const builtinCmds = cmds.filter((c) => !c.skill);

  console.log(`\n${BOLD}Slash Commands${RESET}\n`);

  for (const c of builtinCmds) {
    console.log(`  ${GREEN}${c.cmd.padEnd(28)}${RESET} ${c.desc}`);
  }

  console.log(`\n${BOLD}Skill-Powered Commands${RESET}`);
  for (const c of skillCmds) {
    const skillTag = `${DIM}[${c.skill}]${RESET}`;
    console.log(`  ${GREEN}${c.cmd.padEnd(28)}${RESET} ${c.desc.padEnd(55)} ${skillTag}`);
  }
  console.log();
}

async function printAgents(): Promise<void> {
  const registry = await readJson<AgentRegistry>(AGENT_REGISTRY_PATH);
  if (!registry) {
    console.log("\nNo agent registry found.");
    return;
  }

  console.log(`\n${BOLD}Core Agents (${Object.keys(registry.agents).length})${RESET}\n`);
  for (const [, agent] of Object.entries(registry.agents)) {
    const tools = Array.isArray(agent.tools) ? agent.tools.join(", ") : "";
    console.log(`  ${CYAN}${BOLD}${agent.name}${RESET}`);
    console.log(`  ${agent.description}`);
    console.log(`  ${DIM}Tools: ${tools}${RESET}`);
    console.log();
  }
}

async function printSkillDetail(name: string): Promise<void> {
  const skillDir = join(CANONICAL_SKILLS_DIR, name);
  const skillMdPath = join(skillDir, "SKILL.md");

  try {
    const content = await Deno.readTextFile(skillMdPath);
    const fm = await parseFrontmatter(content);

    // Strip frontmatter and print body
    const body = content.replace(/^---\n[\s\S]*?\n---\n?/, "").trim();

    console.log(`\n${BOLD}${fm.name ?? name}${RESET}`);
    if (fm.description) console.log(`${fm.description}\n`);
    if (fm.version) console.log(`${DIM}Version:${RESET} ${fm.version}`);
    if (fm.namespace) console.log(`${DIM}Namespace:${RESET} ${fm.namespace}`);
    if (fm.dependencies) {
      const deps = Array.isArray(fm.dependencies) ? fm.dependencies.join(", ") : fm.dependencies;
      console.log(`${DIM}Dependencies:${RESET} ${deps}`);
    }
    if (fm.platforms) {
      const platforms = Array.isArray(fm.platforms) ? fm.platforms.join(", ") : fm.platforms;
      console.log(`${DIM}Platforms:${RESET} ${platforms}`);
    }
    if (fm.tools || fm["allowed-tools"]) {
      const t = (fm.tools as string) || (fm["allowed-tools"] as string) || "";
      console.log(`${DIM}Tools:${RESET} ${t.replace(/[[\]"]/g, "")}`);
    }
    console.log();

    // Print usage section if present
    const usageMatch = body.match(/## Usage\n\n([\s\S]*?)(?:\n##|$)/);
    if (usageMatch) {
      console.log(`${BOLD}Usage:${RESET}`);
      console.log(usageMatch[1].trim());
      console.log();
    }

    // Print first section of body
    const firstSection = body.replace(/^##\s+.*$/m, "").trim().slice(0, 400);
    if (firstSection) {
      console.log(firstSection.slice(0, 400));
      if (firstSection.length > 400) console.log("...");
      console.log();
    }
  } catch {
    console.log(`\nNo help available for "${name}". Try: /help skills`);
  }
}

async function printWorkflow(name: string): Promise<void> {
  switch (name) {
    case "ticket": {
      const slug = getProjectSlug();
      console.log(`\n${BOLD}Ticket Workflow${RESET}`);
      console.log(`${DIM}Ticket Manager — manage tickets across all namespaces (f-rr-d backed)${RESET}\n`);
      console.log(`  Project: ${slug}`);
      console.log(`  ${CYAN}1.${RESET} Create a ticket in ${DIM}thoughts/${slug}/shared/tickets/<category>/<id>-<slug>.md${RESET}`);
      console.log(`     Use the template: thoughts/shared/tickets/ticket-template.md (cross-project template)`);
      console.log(`     Namespaces: WOW (platform), OPT (opticat), WOMONO (wayofmono), TEAM (team)`);
      console.log();
      console.log(`  ${CYAN}2.${RESET} Run ${GREEN}/create_plan <ticket-path>${RESET} to generate an implementation plan`);
      console.log(`     Stored in: thoughts/${slug}/shared/plans/`);
      console.log();
      console.log(`  ${CYAN}3.${RESET} Run ${GREEN}/implement_plan <plan-path>${RESET} to execute phase-by-phase`);
      console.log();
      console.log(`  ${CYAN}4.${RESET} Run ${GREEN}/validate_plan${RESET} to verify the implementation`);
      console.log();
      console.log(`  ${CYAN}5.${RESET} Run ${GREEN}/commit${RESET} to commit changes`);
      console.log();
      console.log(`  ${CYAN}6.${RESET} Update ticket status: ${GREEN}/complete TICKET-123${RESET}`);
      console.log();
      console.log(`${BOLD}Commands:${RESET}`);
      console.log(`  deno run -A packages/@aiengineeringharness/skills/ticket-manager/sync.ts --list`);
      console.log(`  deno run -A packages/@aiengineeringharness/skills/ticket-manager/sync.ts --get=TICKET-123`);
      console.log(`  deno run -A packages/@aiengineeringharness/skills/ticket-manager/sync.ts --sync-todos`);
      break;
    }
    case "team": {
      console.log(`\n${BOLD}Team Setup${RESET}`);
      console.log(`${DIM}Team Setup — initialize and manage team configuration${RESET}\n`);
      console.log(`  Configuration: ${DIM}.wo/config/team-config.json${RESET}`);
      console.log(`  Template:      ${DIM}.wo/config/team-config.template.json${RESET}\n`);
      console.log(`${BOLD}Commands:${RESET}`);
      console.log(`  deno run -A packages/@aiengineeringharness/skills/team-setup/team-init.ts init`);
      console.log(`  deno run -A packages/@aiengineeringharness/skills/team-setup/team-init.ts list`);
      console.log(`  deno run -A packages/@aiengineeringharness/skills/team-setup/team-init.ts add --name=dev --role=junior --project=PROJ`);
      console.log(`  deno run -A packages/@aiengineeringharness/skills/team-setup/team-init.ts assign --dev=dev --ticket=TICKET-123`);
      break;
    }
    case "dashboard": {
      console.log(`\n${BOLD}CTO Dashboard${RESET}`);
      console.log(`${DIM}CTO Dashboard — ticket overview, developer progress, review queue${RESET}\n`);
      console.log(`${BOLD}Commands:${RESET}`);
      console.log(`  deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts`);
      console.log(`  deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts --summary`);
      console.log(`  deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts --dev=zerwiz`);
      console.log(`  deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts --review`);
      console.log(`  deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts --aging`);
      console.log(`  deno run -A packages/@aiengineeringharness/skills/cto-dashboard/dashboard.ts --json`);
      break;
    }
    default:
      console.log(`\nNo workflow help for "${name}". Try: ticket, team, dashboard`);
  }
}

// --- Main ---

const args = parse(Deno.args, {
  boolean: ["help"],
  alias: { h: "help" },
});

const topic = args._[0] as string | undefined;

if (args.help) {
  console.log(`
AI Engineering Harness Help System

Usage:
  deno run -A help.ts                    Top-level overview
  deno run -A help.ts skills             List all skills
  deno run -A help.ts commands           List slash commands
  deno run -A help.ts agents             List core agents
  deno run -A help.ts <skill-name>       Detail for a specific skill
  deno run -A help.ts ticket             Ticket workflow
  deno run -A help.ts team               Team setup
  deno run -A help.ts dashboard          CTO dashboard
`);
  Deno.exit(0);
}

if (!topic) {
  await printOverview();
} else if (topic === "skills") {
  await printSkills();
} else if (topic === "commands") {
  await printCommands();
} else if (topic === "agents") {
  await printAgents();
} else if (["ticket", "team", "dashboard"].includes(topic)) {
  await printWorkflow(topic);
} else {
  await printSkillDetail(topic);
}
