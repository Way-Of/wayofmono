#!/usr/bin/env deno run --allow-read --allow-write --allow-run --allow-env
/**
 * Ticket Manager Sync Engine
 *
 * Core sync logic for the Ticket Manager skill:
 * - Parses ticket markdown files in thoughts/shared/tickets/
 * - Generates personal TODO.md from assigned shared tickets
 * - Syncs ticket status to TODO.md checkboxes
 *
 * Usage:
 *   deno run -A sync.ts --list                    # List all tickets
 *   deno run -A sync.ts --get=TKT-001             # Get ticket details
 *   deno run -A sync.ts --sync-todos              # Regenerate personal TODOs
 *   deno run -A sync.ts --update=TKT-001 --status="In Progress"  # Update status
 */

import { join, dirname } from "https://deno.land/std@0.224.0/path/mod.ts";
import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";
import { basename } from "https://deno.land/std@0.224.0/path/mod.ts";

const ROOT = Deno.cwd();
const HARNESS_CONFIG_PATH = join(ROOT, ".wo", "config", "harness.json");
const HARNESS_CONFIG_TEMPLATE = join(ROOT, ".wo", "config", "harness.template.json");
const TEAM_CONFIG_PATH = join(ROOT, ".wo", "config", "team-config.json");
const TEAM_CONFIG_TEMPLATE = join(ROOT, ".wo", "config", "team-config.template.json");

// Default values (overridden by harness.json)
let PROJECT_SLUG = "wayofmono";
let F_RRD_URL = "https://github.com/Way-Of/f-rr-d.git";
let THOUGHTS_DIR = join(ROOT, "thoughts");

function loadHarnessConfig(): { slug: string; url: string } {
  try {
    const content = Deno.readTextFileSync(HARNESS_CONFIG_PATH);
    const config = JSON.parse(content);
    return {
      slug: config.project_slug || PROJECT_SLUG,
      url: config.f_rrd_url || F_RRD_URL,
    };
  } catch {
    // Fall back to defaults
    return { slug: PROJECT_SLUG, url: F_RRD_URL };
  }
}

function initPaths() {
  const cfg = loadHarnessConfig();
  PROJECT_SLUG = cfg.slug;
  F_RRD_URL = cfg.url;
  THOUGHTS_DIR = join(ROOT, "thoughts");
}

function ticketsDir(): string {
  initPaths();
  return join(ROOT, "thoughts", PROJECT_SLUG, "shared", "tickets");
}

function todoFile(): string {
  return join(ticketsDir(), "TODO.md");
}

function personalTodoPath(devId: string): string {
  return join(ROOT, "thoughts", PROJECT_SLUG, devId, "TODO.md");
}

function personalTicketsDir(devId: string): string {
  return join(ROOT, "thoughts", PROJECT_SLUG, devId, "tickets");
}

function personalTicketTemplatePath(): string {
  return join(ticketsDir(), "personal-ticket-template.md");
}

async function pullThoughts(): Promise<void> {
  try {
    const cmd = new Deno.Command("git", {
      args: ["-C", THOUGHTS_DIR, "pull", "--ff-only"],
      stdout: "piped",
      stderr: "piped",
    });
    const { code, stdout, stderr } = await cmd.output();
    if (code === 0) {
      const out = new TextDecoder().decode(stdout).trim();
      if (out) console.log(`f-rr-d: ${out}`);
    } else {
      const err = new TextDecoder().decode(stderr).trim();
      console.error(`f-rr-d pull failed (${code}): ${err}`);
    }
  } catch (e) {
    // thoughts/ might not be a git repo yet (fresh init)
    if (!(e instanceof Deno.errors.NotFound)) {
      console.error(`f-rr-d pull error: ${e}`);
    }
  }
}

async function pushThoughts(message: string): Promise<void> {
  try {
    // Stage all changes in thoughts/
    const addCmd = new Deno.Command("git", {
      args: ["-C", THOUGHTS_DIR, "add", "-A"],
      stdout: "piped",
      stderr: "piped",
    });
    await addCmd.output();

    // Check if there's anything to commit
    const diffCmd = new Deno.Command("git", {
      args: ["-C", THOUGHTS_DIR, "diff", "--cached", "--quiet"],
      stdout: "piped",
      stderr: "piped",
    });
    const { code: diffCode } = await diffCmd.output();
    if (diffCode === 0) return; // nothing to commit

    const commitCmd = new Deno.Command("git", {
      args: ["-C", THOUGHTS_DIR, "commit", "-m", message],
      stdout: "piped",
      stderr: "piped",
    });
    const { code: commitCode, stdout: commitOut, stderr: commitErr } = await commitCmd.output();
    if (commitCode !== 0) {
      const err = new TextDecoder().decode(commitErr).trim();
      console.error(`f-rr-d commit failed: ${err}`);
      return;
    }

    const pushCmd = new Deno.Command("git", {
      args: ["-C", THOUGHTS_DIR, "push"],
      stdout: "piped",
      stderr: "piped",
    });
    const { code: pushCode, stderr: pushErr } = await pushCmd.output();
    if (pushCode !== 0) {
      const err = new TextDecoder().decode(pushErr).trim();
      console.warn(`f-rr-d push failed (set GIT_CREDENTIALS or auto_push_ticket_changes): ${err}`);
    } else {
      console.log("f-rr-d: changes pushed");
    }
  } catch (e) {
    console.error(`f-rr-d push error: ${e}`);
  }
}

interface TicketFrontmatter {
  title?: string;
  type?: string;
  priority?: string;
  status?: string;
  assignee?: string;
  reporter?: string;
  project?: string;
  namespace?: string;
  category?: string;
  role_required?: string;
  parent_ticket?: string;
  blockers?: string[];
  unblocks?: string[];
  pr_url?: string;
  created?: string;
  updated?: string;
  [key: string]: unknown;
}

interface TeamConfig {
  developers: Array<{ id: string; name: string; role: string; projects: string[] }>;
  projects: Array<{ id: string; name: string; prefix: string; members: string[] }>;
}

function parseFrontmatter(content: string): { frontmatter: TicketFrontmatter; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const fm: TicketFrontmatter = {};
  for (const line of match[1].split("\n")) {
    const sep = line.indexOf(": ");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    let val: unknown = line.slice(sep + 2).trim();

    if (val.startsWith("[") && val.endsWith("]")) {
      try { val = JSON.parse(val); } catch { /* keep as string */ }
    }
    if (typeof val === "string") {
      // Strip surrounding quotes if present (YAML quoted values)
      const trimmed = val.trim();
      if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        val = trimmed.slice(1, -1);
      }
    }
    fm[key] = val as string;
  }

  return { frontmatter: fm, body: match[2].trim() };
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

async function findTicketFiles(): Promise<string[]> {
  const tickets: string[] = [];
  const dir = ticketsDir();
  async function walk(dir: string) {
    try {
      for await (const entry of Deno.readDir(dir)) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory && !entry.name.startsWith(".")) {
          await walk(fullPath);
        } else if (entry.name.endsWith(".md") && entry.name !== "TODO.md" && entry.name !== "ticket-template.md") {
          tickets.push(fullPath);
        }
      }
    } catch {
      // skip unreadable dirs
    }
  }
  await walk(dir);
  return tickets.sort();
}

async function loadTeamConfig(): Promise<TeamConfig | null> {
  try {
    const content = await Deno.readTextFile(TEAM_CONFIG_PATH);
    return JSON.parse(content);
  } catch {
    try {
      const content = await Deno.readTextFile(TEAM_CONFIG_TEMPLATE);
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
}

async function listTickets(namespace?: string, status?: string, assignee?: string): Promise<void> {
  await pullThoughts();
  const files = await findTicketFiles();
  console.log(`Found ${files.length} ticket files\n`);

  for (const file of files) {
    const content = await Deno.readTextFile(file);
    const { frontmatter } = parseFrontmatter(content);
    const relPath = file.replace(ROOT + "/", "");

    if (namespace && frontmatter.namespace !== namespace) continue;
    if (status && frontmatter.status !== status) continue;
    if (assignee && frontmatter.assignee?.replace("@", "") !== assignee) continue;

    const statusIcon = STATUS_ICONS[frontmatter.status as string] ?? "○";
    const assigneeStr = frontmatter.assignee ?? "unassigned";
    console.log(`${statusIcon} [${frontmatter.title ?? relPath}]`);
    console.log(`   File: ${relPath}`);
    console.log(`   Status: ${frontmatter.status ?? "unknown"} | Assignee: ${assigneeStr} | Priority: ${frontmatter.priority ?? "none"}`);
    console.log();
  }
}

async function getTicket(ticketId: string): Promise<void> {
  await pullThoughts();
  const files = await findTicketFiles();
  const pattern = new RegExp(ticketId.replace("-", "[-]"), "i");

  for (const file of files) {
    if (!pattern.test(file)) continue;
    const content = await Deno.readTextFile(file);
    const { frontmatter, body } = parseFrontmatter(content);
    console.log(`=== ${frontmatter.title ?? ticketId} ===`);
    console.log(`File: ${file.replace(ROOT + "/", "")}`);
    console.log(`Status: ${frontmatter.status ?? "unknown"}`);
    console.log(`Priority: ${frontmatter.priority ?? "none"}`);
    console.log(`Assignee: ${frontmatter.assignee ?? "unassigned"}`);
    console.log(`Project: ${frontmatter.project ?? "none"}`);
    console.log(`Namespace: ${frontmatter.namespace ?? "none"}`);
    console.log(`Category: ${frontmatter.category ?? "none"}`);
    if (frontmatter.blockers?.length) console.log(`Blockers: ${frontmatter.blockers.join(", ")}`);
    if (frontmatter.unblocks?.length) console.log(`Unblocks: ${frontmatter.unblocks.join(", ")}`);
    if (frontmatter.pr_url) console.log(`PR: ${frontmatter.pr_url}`);
    console.log(`\n${body.slice(0, 500)}${body.length > 500 ? "\n..." : ""}`);
    return;
  }
  console.log(`Ticket ${ticketId} not found.`);
}

async function updateTicket(
  ticketId: string,
  updates: { status?: string; assignee?: string; pr_url?: string },
): Promise<void> {
  await pullThoughts();
  const files = await findTicketFiles();
  const pattern = new RegExp(ticketId.replace("-", "[-]"), "i");

  for (const file of files) {
    if (!pattern.test(file)) continue;
    const content = await Deno.readTextFile(file);
    const { frontmatter, body } = parseFrontmatter(content);

    const updated = { ...frontmatter, updated: new Date().toISOString().slice(0, 10) };
    if (updates.status) updated.status = updates.status;
    if (updates.assignee) updated.assignee = `@${updates.assignee.replace("@", "")}`;
    if (updates.pr_url) updated.pr_url = updates.pr_url;

    const newContent = `${formatFrontmatter(updated as Record<string, unknown>)}

${body}`;
    await Deno.writeTextFile(file, newContent);
    console.log(`Updated ${ticketId} in ${file.replace(ROOT + "/", "")}`);
    await syncTodoCheckboxes(ticketId, updates.status);
    await pushThoughts(`sync: update ${ticketId} — ${updates.status ?? "modified"}`);
    return;
  }
  console.log(`Ticket ${ticketId} not found.`);
}

async function syncTodoCheckboxes(ticketId: string, newStatus?: string): Promise<void> {
  try {
    const todoPath = todoFile();
    let todo = await Deno.readTextFile(todoPath);
    if (!newStatus) return;

    const checked = newStatus === "Done" || newStatus === "Approved";
    const pattern = new RegExp(`(- \\[ \\])?\\s*\\[${ticketId.replace("-", "\\-")}\\]`, "g");
    todo = todo.replace(pattern, (match) => {
      if (checked && match.startsWith("- [ ]")) {
        return match.replace("- [ ]", "- [x]");
      }
      return match;
    });
    await Deno.writeTextFile(todoPath, todo);
    console.log(`Synced TODO.md checkboxes for ${ticketId}`);
  } catch {
    // TODO.md might not exist
  }
}

async function syncPersonalTodos(developerId?: string): Promise<void> {
  await pullThoughts();
  const team = await loadTeamConfig();
  if (!team) {
    console.log("No team config found. Run 'ai-harness team init' first.");
    return;
  }

  const devs = developerId
    ? team.developers.filter((d) => d.id === developerId)
    : team.developers;

  for (const dev of devs) {
    const devTicketsDir = join(ROOT, "thoughts", PROJECT_SLUG, dev.id, "tickets");
    const todoPath = join(ROOT, "thoughts", PROJECT_SLUG, dev.id, "TODO.md");
    await Deno.mkdir(devTicketsDir, { recursive: true });

    const lines: string[] = [];
    const roleLabel = dev.role.toUpperCase();
    lines.push(`# TODO — ${dev.name} (${roleLabel})`);
    lines.push("");
    lines.push("## Assigned Shared Tickets");
    lines.push("");

    const files = await findTicketFiles();
    let hasAssigned = false;

    for (const file of files) {
      const content = await Deno.readTextFile(file);
      const { frontmatter } = parseFrontmatter(content);
      const fileAssignee = (frontmatter.assignee ?? "").replace("@", "");

      if (fileAssignee !== dev.id) continue;
      hasAssigned = true;

      const match = file.match(/(WOW|OPT|WOMONO|TEAM)-\d+/);
      const ticketId = match ? match[0] : "UNKNOWN";
      const title = frontmatter.title ?? ticketId;
      const status = frontmatter.status ?? "Backlog";
      const isDone = status === "Done" || status === "Approved";
      const checkbox = isDone ? "- [x]" : "- [ ]";

      lines.push(`### ${ticketId}: ${title}`);
      lines.push(`${checkbox} Status: ${status}`);
      lines.push("");
    }

    if (!hasAssigned) {
      lines.push("_No tickets assigned._");
      lines.push("");
    }

    lines.push("## Personal Tickets");
    lines.push("");
    lines.push(`_See thoughts/${PROJECT_SLUG}/${dev.id}/tickets/ for personal breakdowns._`);
    lines.push("");
    lines.push("## Blocked / Waiting");
    lines.push("");
    lines.push("_List blockers here._");

    await Deno.writeTextFile(todoPath, lines.join("\n"));
    console.log(`Generated ${todoPath}`);
  }
  await pushThoughts("sync: regenerate personal TODOs");
}

async function showPersonalTodo(developerId: string): Promise<void> {
  const team = await loadTeamConfig();
  if (!team) {
    console.log("No team config found. Run 'ai-harness team init' first.");
    return;
  }

  const dev = team.developers.find((d) => d.id === developerId);
  if (!dev) {
    console.log(`Developer "${developerId}" not found in team config.`);
    return;
  }

  const todoPath = personalTodoPath(dev.id);
  try {
    const todo = await Deno.readTextFile(todoPath);
    console.log(todo);
  } catch {
    console.log(`No TODO.md found for ${dev.name}. Run --sync-todos first.`);
  }
}

async function addPersonalSubTask(
  developerId: string,
  parentTicketId: string,
  description: string,
): Promise<void> {
  const team = await loadTeamConfig();
  if (!team) {
    console.log("No team config found. Run 'ai-harness team init' first.");
    return;
  }

  const dev = team.developers.find((d) => d.id === developerId);
  if (!dev) {
    console.log(`Developer "${developerId}" not found in team config.`);
    return;
  }

  // Verify parent ticket exists and is assigned to this developer
  const files = await findTicketFiles();
  let parentTicket: { file: string; frontmatter: TicketFrontmatter } | null = null;
  const pattern = new RegExp(parentTicketId.replace("-", "[-]"), "i");

  for (const file of files) {
    if (!pattern.test(file)) continue;
    const content = await Deno.readTextFile(file);
    const { frontmatter } = parseFrontmatter(content);
    const fileAssignee = (frontmatter.assignee ?? "").replace("@", "");
    if (fileAssignee === dev.id) {
      parentTicket = { file, frontmatter };
      break;
    }
  }

  if (!parentTicket) {
    console.log(`Parent ticket ${parentTicketId} not found or not assigned to ${dev.name}.`);
    return;
  }

  const ticketsDir = personalTicketsDir(dev.id);
  await Deno.mkdir(ticketsDir, { recursive: true });

  // Generate personal ticket ID: DEVID-XXX
  let nextNum = 1;
  try {
    for await (const entry of Deno.readDir(ticketsDir)) {
      if (entry.name.endsWith(".md")) {
        const match = entry.name.match(new RegExp(`${dev.id.toUpperCase()}-(\\d+)`));
        if (match) {
          const num = parseInt(match[1], 10);
          if (num >= nextNum) nextNum = num + 1;
        }
      }
    }
  } catch {
    // dir doesn't exist yet
  }

  const personalTicketId = `${dev.id.toUpperCase()}-${String(nextNum).padStart(3, "0")}`;
  const personalTicketPath = join(ticketsDir, `${personalTicketId}.md`);

  // Read template
  let template = "";
  try {
    template = await Deno.readTextFile(personalTicketTemplatePath());
  } catch {
    template = `---
title: "[${personalTicketId}] Brief Description"
type: "Personal Task"
priority: "Medium"
status: "Backlog"
assignee: "@${dev.id}"
reporter: "@${dev.id}"
project: "${PROJECT_SLUG}"
namespace: "PERSONAL"
category: "personal"
parent_ticket: "${parentTicketId}"
blockers: []
unblocks: []
created: "${new Date().toISOString().slice(0, 10)}"
updated: "${new Date().toISOString().slice(0, 10)}"
---

## Context
Brief description of this personal sub-task and how it relates to the parent shared ticket.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Notes
Any additional notes, links, or context.
`;
  }

  // Replace template placeholders
  const today = new Date().toISOString().slice(0, 10);
  const content = template
    .replace(/PERSONAL-XXX/g, personalTicketId)
    .replace(/@<dev-id>/g, `@${dev.id}`)
    .replace(/YYYY-MM-DD/g, today)
    .replace(/WOMONO-XXX/g, parentTicketId)
    .replace(/Brief Description/g, description)
    .replace(/Brief description of this personal sub-task and how it relates to the parent shared ticket\./g, description);

  await Deno.writeTextFile(personalTicketPath, content);
  console.log(`Created personal ticket: ${personalTicketPath}`);
  console.log(`ID: ${personalTicketId}`);
  console.log(`Parent: ${parentTicketId} (${parentTicket.frontmatter.title})`);

  // Regenerate TODO to include the new personal ticket
  await syncPersonalTodos(dev.id);
}

async function showCtoTodoAll(): Promise<void> {
  const team = await loadTeamConfig();
  if (!team) {
    console.log("No team config found. Run 'ai-harness team init' first.");
    return;
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`CTO AGGREGATED TODO VIEW — All Developers`);
  console.log(`=${ "=".repeat(58)}`);

  for (const dev of team.developers) {
    const todoPath = personalTodoPath(dev.id);
    const roleLabel = dev.role.toUpperCase();
    console.log(`\n${"─".repeat(60)}`);
    console.log(`# TODO — ${dev.name} (${roleLabel})`);
    console.log(`="${ "=".repeat(58)}`);

    try {
      const todo = await Deno.readTextFile(todoPath);
      console.log(todo);
    } catch {
      console.log(`_No TODO.md found. Run --sync-todos first._`);
    }
  }
}

const STATUS_ICONS: Record<string, string> = {
  "Backlog": "○",
  "Planned": "◷",
  "Ready": "→",
  "In Progress": "●",
  "Submitted for Review": "▤",
  "Changes Requested": "↩",
  "Approved": "✓",
  "Done": "✅",
  "Blocked": "⊘",
};

// CLI entry point
initPaths();
const args = parse(Deno.args, {
  string: ["get", "update", "status", "assignee", "namespace", "status-filter", "assignee-filter", "dev", "show-todo", "add-todo", "parent"],
  boolean: ["list", "sync-todos", "pull", "push", "help", "cto-todo-all"],
  alias: { h: "help" },
});

if (args.help) {
  console.log(`
Ticket Manager Sync Engine (f-rr-d backed)

Reads/writes tickets from the shared f-rr-d repo (github.com/Way-Of/f-rr-d).
Project slug: ${PROJECT_SLUG}
Tickets:      thoughts/${PROJECT_SLUG}/shared/tickets/

Usage:
  deno run -A sync.ts --list                           List all tickets
  deno run -A sync.ts --list --namespace=proj           Filter by namespace
  deno run -A sync.ts --get=TKT-001                   Get ticket details
  deno run -A sync.ts --update=TKT-001 --status="In Progress"  Update status
  deno run -A sync.ts --sync-todos                    Regenerate personal TODOs
  deno run -A sync.ts --sync-todos --dev=zerwiz       Sync specific dev only
  deno run -A sync.ts --show-todo=zerwiz              Show personal TODO for developer
  deno run -A sync.ts --add-todo="Sub-task desc" --parent=WOMONO-021 --dev=zerwiz  Add personal sub-task
  deno run -A sync.ts --cto-todo-all                  CTO: Show all developers' TODOs
  deno run -A sync.ts --pull                          Pull latest from f-rr-d
  deno run -A sync.ts --push "<message>"              Push changes to f-rr-d
`);
  Deno.exit(0);
}

if (args.pull) {
  await pullThoughts();
} else if (args.push) {
  const msg = typeof args.push === "string" ? args.push : "sync: manual push";
  await pushThoughts(msg);
} else if (args.list) {
  await listTickets(args.namespace, args["status-filter"], args["assignee-filter"]);
} else if (args.get) {
  await getTicket(args.get);
} else if (args.update) {
  await updateTicket(args.update, {
    status: args.status,
    assignee: args.assignee,
  });
} else if (args["sync-todos"]) {
  await syncPersonalTodos(args.dev);
} else if (args["show-todo"]) {
  await showPersonalTodo(args["show-todo"]);
} else if (args["add-todo"]) {
  if (!args.parent) {
    console.log("Error: --parent=<ticket-id> is required when using --add-todo");
    Deno.exit(1);
  }
  if (!args.dev) {
    console.log("Error: --dev=<developer-id> is required when using --add-todo");
    Deno.exit(1);
  }
  await addPersonalSubTask(args.dev, args.parent, args["add-todo"]);
} else if (args["cto-todo-all"]) {
  await showCtoTodoAll();
} else {
  console.log("No command specified. Run with --help for usage.");
}
