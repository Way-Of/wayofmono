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

const ROOT = Deno.cwd();
const TICKETS_DIR = join(ROOT, "thoughts", "shared", "tickets");
const TODO_FILE = join(TICKETS_DIR, "TODO.md");
const TEAM_CONFIG_PATH = join(ROOT, ".wo", "config", "team-config.json");
const TEAM_CONFIG_TEMPLATE = join(ROOT, ".wo", "config", "team-config.template.json");

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
  await walk(TICKETS_DIR);
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
    return;
  }
  console.log(`Ticket ${ticketId} not found.`);
}

async function syncTodoCheckboxes(ticketId: string, newStatus?: string): Promise<void> {
  try {
    let todo = await Deno.readTextFile(TODO_FILE);
    if (!newStatus) return;

    const checked = newStatus === "Done" || newStatus === "Approved";
    const pattern = new RegExp(`(- \\[ \\])?\\s*\\[${ticketId.replace("-", "\\-")}\\]`, "g");
    todo = todo.replace(pattern, (match) => {
      if (checked && match.startsWith("- [ ]")) {
        return match.replace("- [ ]", "- [x]");
      }
      return match;
    });
    await Deno.writeTextFile(TODO_FILE, todo);
    console.log(`Synced TODO.md checkboxes for ${ticketId}`);
  } catch {
    // TODO.md might not exist
  }
}

async function syncPersonalTodos(developerId?: string): Promise<void> {
  const team = await loadTeamConfig();
  if (!team) {
    console.log("No team config found. Run 'ai-harness team init' first.");
    return;
  }

  const devs = developerId
    ? team.developers.filter((d) => d.id === developerId)
    : team.developers;

  for (const dev of devs) {
    const ticketsDir = join(ROOT, "thoughts", dev.id, "tickets");
    const todoPath = join(ROOT, "thoughts", dev.id, "TODO.md");
    await Deno.mkdir(ticketsDir, { recursive: true });

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

      const match = file.match(/(WOW|OPT|PROJ|TEAM)-\d+/);
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
    lines.push(`_See thoughts/${dev.id}/tickets/ for personal breakdowns._`);
    lines.push("");
    lines.push("## Blocked / Waiting");
    lines.push("");
    lines.push("_List blockers here._");

    await Deno.writeTextFile(todoPath, lines.join("\n"));
    console.log(`Generated ${todoPath}`);
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
const args = parse(Deno.args, {
  string: ["get", "update", "status", "assignee", "namespace", "status-filter", "assignee-filter", "dev"],
  boolean: ["list", "sync-todos", "help"],
  alias: { h: "help" },
});

if (args.help) {
  console.log(`
Ticket Manager Sync Engine

Usage:
  deno run -A sync.ts --list                           List all tickets
  deno run -A sync.ts --list --namespace=proj           Filter by namespace
  deno run -A sync.ts --get=TKT-001                   Get ticket details
  deno run -A sync.ts --update=TKT-001 --status="In Progress"  Update status
  deno run -A sync.ts --sync-todos                    Regenerate personal TODOs
  deno run -A sync.ts --sync-todos --dev=zerwiz       Sync specific dev only
`);
  Deno.exit(0);
}

if (args.list) {
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
} else {
  console.log("No command specified. Run with --help for usage.");
}
