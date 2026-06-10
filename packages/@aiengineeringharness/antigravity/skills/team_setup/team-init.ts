#!/usr/bin/env deno run --allow-read --allow-write --allow-run --allow-env
/**
 * Team Setup & Init Script
 *
 * Manages team configuration: init, add members, list, assign tickets.
 *
 * Usage:
 *   deno run -A team-init.ts init                    # Init from template
 *   deno run -A team-init.ts list                    # List team members
 *   deno run -A team-init.ts add jane --role=senior --projects=WO,PROJ  # Add member
 *   deno run -A team-init.ts assign TKT-001 zerwiz   # Assign ticket
 */

import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";

const ROOT = Deno.cwd();
const CONFIG_DIR = join(ROOT, ".wo", "config");
const TEAM_CONFIG_PATH = join(CONFIG_DIR, "team-config.json");
const TEAM_TEMPLATE_PATH = join(CONFIG_DIR, "team-config.template.json");
const HARNESS_CONFIG_PATH = join(CONFIG_DIR, "harness.json");
const HARNESS_TEMPLATE_PATH = join(CONFIG_DIR, "harness.template.json");

const DEFAULT_F_RRD_URL = "https://github.com/Way-Of/f-rr-d.git";

function detectProjectSlug(): string {
  try {
    const cmd = new Deno.Command("basename", {
      args: [Deno.cwd()],
      stdout: "piped",
    });
    const { stdout } = cmd.outputSync();
    return new TextDecoder().decode(stdout).trim();
  } catch {
    return "project";
  }
}

function loadHarnessConfig(): { slug: string; url: string } {
  try {
    const content = Deno.readTextFileSync(HARNESS_CONFIG_PATH);
    const config = JSON.parse(content);
    return {
      slug: config.project_slug || detectProjectSlug(),
      url: config.f_rrd_url || DEFAULT_F_RRD_URL,
    };
  } catch {
    return { slug: detectProjectSlug(), url: DEFAULT_F_RRD_URL };
  }
}

async function cloneThoughts(url: string): Promise<boolean> {
  try {
    await Deno.stat(join(ROOT, "thoughts", ".git"));
    // Already cloned — pull latest
    console.log("thoughts/ already exists, pulling latest...");
    const cmd = new Deno.Command("git", {
      args: ["-C", join(ROOT, "thoughts"), "pull", "--ff-only"],
      stdout: "piped",
      stderr: "piped",
    });
    const { code, stderr } = await cmd.output();
    if (code !== 0) {
      console.warn(`git pull warning: ${new TextDecoder().decode(stderr).trim()}`);
    }
    return true;
  } catch {
    // Not cloned yet
    console.log(`Cloning f-rr-d (${url}) into thoughts/...`);
    const cmd = new Deno.Command("git", {
      args: ["clone", url, join(ROOT, "thoughts")],
      stdout: "piped",
      stderr: "piped",
    });
    const { code, stderr } = await cmd.output();
    if (code !== 0) {
      console.error(`Failed to clone f-rr-d: ${new TextDecoder().decode(stderr).trim()}`);
      return false;
    }
    console.log("Cloned f-rr-d into thoughts/");
    return true;
  }
}

async function createProjectDirs(slug: string): Promise<void> {
  const base = join(ROOT, "thoughts", slug);
  await Deno.mkdir(join(base, "shared", "tickets"), { recursive: true });
  await Deno.mkdir(join(base, "shared", "plans"), { recursive: true });
  await Deno.mkdir(join(base, "shared", "research"), { recursive: true });
  await Deno.mkdir(join(base, "global"), { recursive: true });
  console.log(`  Created thoughts/${slug}/`);

  // Create root global folder (cross-project global thoughts)
  await Deno.mkdir(join(ROOT, "thoughts", "global"), { recursive: true });
  console.log(`  Created thoughts/global/ (cross-project)`);
}

async function createHarnessConfig(slug: string, url: string): Promise<void> {
  const config = {
    $schema: "https://wayofmono.dev/schemas/harness.json",
    version: "1.0.0",
    description: `AI Engineering Harness configuration for ${slug}`,
    f_rrd_url: url,
    project_slug: slug,
    settings: {
      auto_pull_thoughts: true,
      auto_push_ticket_changes: false,
      git_user_name: "",
      git_user_email: "",
    },
  };
  await Deno.mkdir(CONFIG_DIR, { recursive: true });
  await Deno.writeTextFile(HARNESS_CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log(`  Created ${HARNESS_CONFIG_PATH}`);
}

interface Developer {
  id: string;
  name: string;
  role: "cto" | "lead" | "senior" | "junior";
  email?: string;
  github?: string;
  projects: string[];
  skills?: string[];
  timezone?: string;
}

interface Project {
  id: string;
  name: string;
  prefix: string;
  description: string;
  members: string[];
  default_assignee: string;
  repositories?: string[];
}

interface TeamConfig {
  version: string;
  description: string;
  developers: Developer[];
  projects: Project[];
  roles: Record<string, { permissions: string[]; description: string }>;
  ticket_namespaces: Record<string, { project: string; description: string }>;
  settings: Record<string, unknown>;
}

async function loadConfig(): Promise<TeamConfig | null> {
  try {
    const content = await Deno.readTextFile(TEAM_CONFIG_PATH);
    return JSON.parse(content);
  } catch {
    try {
      const content = await Deno.readTextFile(TEAM_TEMPLATE_PATH);
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
}

async function saveConfig(config: TeamConfig): Promise<void> {
  await Deno.mkdir(CONFIG_DIR, { recursive: true });
  await Deno.writeTextFile(TEAM_CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log(`Saved team config to ${TEAM_CONFIG_PATH}`);
}

async function cmdInit(): Promise<void> {
  const slug = detectProjectSlug();

  // Step 1: Clone / pull f-rr-d
  const ok = await cloneThoughts(DEFAULT_F_RRD_URL);
  if (!ok) {
    console.error("Cannot proceed without thoughts/ repo.");
    Deno.exit(1);
  }

  // Step 1.5: Remove WRONG local thoughts/shared/ folder (global thoughts go in thoughts/global/)
  const wrongShared = join(ROOT, "thoughts", "shared");
  try {
    await Deno.stat(wrongShared);
    console.log(`  Removing WRONG location: thoughts/shared/ (global thoughts go in thoughts/global/)`);
    await Deno.remove(wrongShared, { recursive: true });
  } catch {
    // doesn't exist, that's fine
  }

  // Step 2: Create project subfolder in thoughts/
  await createProjectDirs(slug);

  // Step 3: Create harness config
  await createHarnessConfig(slug, DEFAULT_F_RRD_URL);

  // Step 4: Init team config (if not exists)
  try {
    await Deno.stat(TEAM_CONFIG_PATH);
    console.log("Team config already exists.");
  } catch {
    try {
      const template = await Deno.readTextFile(TEAM_TEMPLATE_PATH);
      await Deno.writeTextFile(TEAM_CONFIG_PATH, template);
      console.log("Team config initialized from template.");
      console.log(`  Edit ${TEAM_CONFIG_PATH} to customize.`);
    } catch (err) {
      console.warn("No team-config.template.json found. Create one manually.");
    }
  }

  // Step 5: Create personal dirs under project slug
  const config = await loadConfig();
  if (config) {
    for (const dev of config.developers) {
      const thoughtsDir = join(ROOT, "thoughts", slug, dev.id);
      await Deno.mkdir(join(thoughtsDir, "tickets"), { recursive: true });
      await Deno.mkdir(join(thoughtsDir, "plans"), { recursive: true });
      await Deno.mkdir(join(thoughtsDir, "research"), { recursive: true });
      console.log(`  Created thoughts/${slug}/${dev.id}/`);
    }
  }

  console.log(`\nInitialized harness for project '${slug}'`);
  console.log(`  Tickets: thoughts/${slug}/shared/tickets/`);
  console.log(`  Config:  ${CONFIG_DIR}/`);
  console.log(`  f-rr-d:  ${DEFAULT_F_RRD_URL}`);
}

async function cmdList(): Promise<void> {
  const config = await loadConfig();
  if (!config) {
    console.log("No team config found. Run 'ai-harness team init' first.");
    return;
  }

  console.log(`\nTeam: ${config.description}\n`);
  console.log("Developers:");
  console.log("─".repeat(60));
  for (const dev of config.developers) {
    const projects = dev.projects.join(", ");
    console.log(`  ${dev.id.padEnd(10)} ${dev.role.padEnd(8)} ${dev.name.padEnd(12)} Projects: ${projects}`);
  }

  console.log("\nProjects:");
  console.log("─".repeat(60));
  for (const proj of config.projects) {
    console.log(`  ${proj.id.padEnd(6)} ${proj.name.padEnd(25)} Prefix: ${proj.prefix}`);
  }
}

async function cmdAdd(
  name: string,
  role: string,
  projects: string[],
): Promise<void> {
  const config = await loadConfig();
  if (!config) {
    console.error("No team config. Run 'init' first.");
    Deno.exit(1);
  }

  const id = name.toLowerCase().replace(/\s+/g, "_");
  if (config.developers.find((d) => d.id === id)) {
    console.error(`Developer '${id}' already exists.`);
    Deno.exit(1);
  }

  const validRoles = ["cto", "lead", "senior", "junior"];
  if (!validRoles.includes(role)) {
    console.error(`Invalid role '${role}'. Must be one of: ${validRoles.join(", ")}`);
    Deno.exit(1);
  }

  config.developers.push({
    id,
    name,
    role: role as Developer["role"],
    projects,
  });

  await saveConfig(config);

  // Create thought directories under project slug
  const hc = loadHarnessConfig();
  const thoughtsDir = join(ROOT, "thoughts", hc.slug, id);
  await Deno.mkdir(join(thoughtsDir, "tickets"), { recursive: true });
  await Deno.mkdir(join(thoughtsDir, "plans"), { recursive: true });
  await Deno.mkdir(join(thoughtsDir, "research"), { recursive: true });
  console.log(`Added ${name} (${role}) to projects: ${projects.join(", ")}`);
}

async function cmdAssign(ticketId: string, developerId: string): Promise<void> {
  const config = await loadConfig();
  if (!config) {
    console.error("No team config. Run 'init' first.");
    Deno.exit(1);
  }

  if (!config.developers.find((d) => d.id === developerId)) {
    console.error(`Developer '${developerId}' not found.`);
    console.log(`Available: ${config.developers.map((d) => d.id).join(", ")}`);
    Deno.exit(1);
  }

  // Update ticket frontmatter
  const hc = loadHarnessConfig();
  const ticketsDir = join(ROOT, "thoughts", hc.slug, "shared", "tickets");
  const pattern = new RegExp(ticketId.replace("-", "[-]"), "i");
  let found = false;

  async function walk(dir: string) {
    for await (const entry of Deno.readDir(dir)) {
      if (entry.isDirectory && !entry.name.startsWith(".")) {
        await walk(join(dir, entry.name));
      } else if (entry.name.endsWith(".md") && pattern.test(entry.name)) {
        const filePath = join(dir, entry.name);
        let content = await Deno.readTextFile(filePath);
        if (content.includes(`assignee:`)) {
          content = content.replace(/assignee:.*/, `assignee: "@${developerId}"`);
        } else {
          content = content.replace("---", `---\nassignee: "@${developerId}"`);
        }
        await Deno.writeTextFile(filePath, content);
        console.log(`Assigned ${ticketId} to @${developerId}`);
        found = true;
      }
    }
  }

  await walk(ticketsDir);
  if (!found) console.log(`Ticket ${ticketId} not found.`);
}

const args = parse(Deno.args, {
  string: ["role", "projects"],
  boolean: ["help"],
  alias: { h: "help" },
});

const command = args._[0] as string | undefined;

if (args.help || !command) {
  const hc = loadHarnessConfig();
  console.log(`
Team Setup & Init (f-rr-d backed)

Project: ${hc.slug}
Tickets: thoughts/${hc.slug}/shared/tickets/

Usage:
  team-init.ts init                                    Init from template + clone f-rr-d
  team-init.ts list                                    List team members
  team-init.ts add <name> --role=<role> --projects=<p> Add developer
  team-init.ts assign <ticket-id> <developer-id>       Assign ticket

Examples:
  team-init.ts init
  team-init.ts list
  team-init.ts add Jane --role=senior --projects=WO,PROJ
  team-init.ts assign TKT-001 zerwiz
`);
  Deno.exit(0);
}

switch (command) {
  case "init":
    await cmdInit();
    break;
  case "list":
    await cmdList();
    break;
  case "add":
    if (!args._[1]) {
      console.error("Usage: team-init.ts add <name> --role=<role> --projects=<projects>");
      Deno.exit(1);
    }
    await cmdAdd(
      String(args._[1]),
      String(args.role || "junior"),
      String(args.projects || "WO").split(",").map((s: string) => s.trim()),
    );
    break;
  case "assign":
    if (!args._[1] || !args._[2]) {
      console.error("Usage: team-init.ts assign <ticket-id> <developer-id>");
      Deno.exit(1);
    }
    await cmdAssign(String(args._[1]), String(args._[2]));
    break;
  default:
    console.error(`Unknown command: ${command}`);
    Deno.exit(1);
}
