#!/usr/bin/env deno run --allow-read --allow-write --allow-run --allow-env

/**
 * CTO Dashboard (PROJ-019)
 *
 * Terminal-based dashboard for ticket oversight, developer progress,
 * review queue, and blocked tickets.
 *
 * Usage:
 *   deno run -A dashboard.ts                 # Full dashboard
 *   deno run -A dashboard.ts --summary       # Brief summary only
 *   deno run -A dashboard.ts --review        # Review queue only
 *   deno run -A dashboard.ts --dev=zerwiz    # Single dev workload
 *   deno run -A dashboard.ts --aging         # Aging/overdue tickets
 *   deno run -A dashboard.ts --watch         # Watch mode (continuous)
 *   deno run -A dashboard.ts --json          # JSON output
 */

import { join } from "https://deno.land/std@0.224.0/path/mod.ts";
import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";

const ROOT = Deno.cwd();
const TICKETS_DIR = join(ROOT, "thoughts", "shared", "tickets");
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
  github_issue?: string;
  created?: string;
  updated?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  [key: string]: unknown;
}

interface Ticket {
  id: string;
  file: string;
  frontmatter: TicketFrontmatter;
  body: string;
}

interface TeamConfig {
  developers: Array<{ id: string; name: string; role: string; email?: string; github?: string; projects: string[]; skills: string[]; timezone?: string }>;
  projects: Array<{ id: string; name: string; prefix: string; description?: string; members: string[]; default_assignee?: string }>;
  roles: Record<string, { permissions: string[]; description: string }>;
  ticket_namespaces: Record<string, { project: string; description: string }>;
}

const STATUS_ORDER = ["Backlog", "Planned", "Ready", "In Progress", "Submitted for Review", "Changes Requested", "Approved", "Done", "Blocked"];
const STATUS_COLORS: Record<string, string> = {
  "Backlog": "\x1b[90m",
  "Planned": "\x1b[94m",
  "Ready": "\x1b[92m",
  "In Progress": "\x1b[93m",
  "Submitted for Review": "\x1b[95m",
  "Changes Requested": "\x1b[91m",
  "Approved": "\x1b[96m",
  "Done": "\x1b[32m",
  "Blocked": "\x1b[31m",
};
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

// --- Parsing ---

function parseFrontmatter(content: string): { frontmatter: TicketFrontmatter; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const fm: TicketFrontmatter = {};
  for (const line of match[1].split("\n")) {
    const sep = line.indexOf(": ");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    let val: unknown = line.slice(sep + 2).trim();
    if (val === "true") val = true;
    else if (val === "false") val = false;
    if (typeof val === "string" && val.startsWith("[") && val.endsWith("]")) {
      try { val = JSON.parse(val); } catch {}
    }
    if (typeof val === "string") {
      // Strip surrounding quotes if present (YAML quoted values)
      const trimmed = val.trim();
      if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        val = trimmed.slice(1, -1);
      }
    }
    fm[key] = val;
  }

  return { frontmatter: fm, body: match[2].trim() };
}

async function loadTeamConfig(): Promise<TeamConfig | null> {
  try {
    return JSON.parse(await Deno.readTextFile(TEAM_CONFIG_PATH));
  } catch {
    try {
      return JSON.parse(await Deno.readTextFile(TEAM_CONFIG_TEMPLATE));
    } catch {
      return null;
    }
  }
}

async function loadTickets(): Promise<Ticket[]> {
  const tickets: Ticket[] = [];
  async function walk(dir: string) {
    try {
      for await (const entry of Deno.readDir(dir)) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory && !entry.name.startsWith(".")) {
          await walk(fullPath);
        } else if (entry.name.endsWith(".md") && entry.name !== "TODO.md" && entry.name !== "ticket-template.md") {
          const content = await Deno.readTextFile(fullPath);
          const { frontmatter, body } = parseFrontmatter(content);
          const match = fullPath.match(/(WOW|OPT|PROJ|TEAM)-(\d+)/);
          const id = match ? `${match[1]}-${match[2]}` : entry.name.replace(".md", "");
          tickets.push({ id, file: fullPath.replace(ROOT + "/", ""), frontmatter, body: body.slice(0, 200) });
        }
      }
    } catch {}
  }
  await walk(TICKETS_DIR);
  return tickets.sort((a, b) => a.id.localeCompare(b.id));
}

// --- Display ---

function colorStatus(status: string): string {
  const c = STATUS_COLORS[status] ?? "";
  return c ? `${c}${status}${RESET}` : status;
}

function shortId(file: string): string {
  const match = file.match(/(WOW|OPT|PROJ|TEAM)-\d+/);
  return match?.[0] ?? file.split("/").pop()?.replace(".md", "") ?? file;
}

function daysSince(dateStr?: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff < 0) return "future";
  if (diff === 0) return "today";
  if (diff === 1) return "1 day";
  return `${diff} days`;
}

// --- Summary ---

function showSummary(tickets: Ticket[], team: TeamConfig | null): void {
  const total = tickets.length;
  const byStatus: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  const byNamespace: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const devCounts: Record<string, { total: number; inProgress: number; review: number }> = {};
  const devNames: Record<string, string> = {};

  if (team) {
    for (const d of team.developers) {
      devCounts[d.id] = { total: 0, inProgress: 0, review: 0 };
      devNames[d.id] = d.name;
    }
  }

  for (const t of tickets) {
    const s = t.frontmatter.status ?? "Unknown";
    byStatus[s] = (byStatus[s] ?? 0) + 1;
    const p = t.frontmatter.priority ?? "None";
    byPriority[p] = (byPriority[p] ?? 0) + 1;
    const n = (t.frontmatter.namespace ?? t.frontmatter.project ?? "none").toLowerCase();
    byNamespace[n] = (byNamespace[n] ?? 0) + 1;
    const c = t.frontmatter.category ?? "uncategorized";
    byCategory[c] = (byCategory[c] ?? 0) + 1;

    const assignee = (t.frontmatter.assignee ?? "").replace("@", "");
    if (assignee && devCounts[assignee]) {
      devCounts[assignee].total++;
      if (t.frontmatter.status === "In Progress") devCounts[assignee].inProgress++;
      if (t.frontmatter.status === "Submitted for Review") devCounts[assignee].review++;
    }
  }

  console.log(`\n${BOLD}=== CTO Dashboard ===${RESET}`);
  console.log(`Total Tickets: ${total}\n`);

  // Status breakdown
  console.log(`${BOLD}Status Distribution:${RESET}`);
  const orderedStatuses = STATUS_ORDER.filter((s) => byStatus[s]);
  const maxStatusLen = Math.max(...orderedStatuses.map((s) => s.length));
  for (const s of orderedStatuses) {
    const count = byStatus[s] ?? 0;
    const bar = "█".repeat(count);
    console.log(`  ${colorStatus(s).padEnd(maxStatusLen + 10)} ${String(count).padStart(3)} ${DIM}${bar}${RESET}`);
  }
  console.log();

  // Priority breakdown
  console.log(`${BOLD}Priority Breakdown:${RESET}`);
  const priorityOrder = ["Critical", "High", "Medium", "Low"];
  for (const p of priorityOrder) {
    if (!byPriority[p]) continue;
    const pColor = p === "Critical" ? "\x1b[31m" : p === "High" ? "\x1b[93m" : p === "Medium" ? "\x1b[94m" : "\x1b[90m";
    console.log(`  ${pColor}${p}${RESET}: ${byPriority[p]}`);
  }
  console.log();

  // Namespace breakdown
  console.log(`${BOLD}Namespace Breakdown:${RESET}`);
  for (const [ns, count] of Object.entries(byNamespace).sort()) {
    const nsLabel = ns.toUpperCase();
    console.log(`  ${nsLabel}: ${count}`);
  }
  console.log();

  // Developer workload
  console.log(`${BOLD}Developer Workload:${RESET}`);
  const sortedDevs = Object.entries(devCounts).sort((a, b) => b[1].total - a[1].total);
  for (const [id, counts] of sortedDevs) {
    const inProg = counts.inProgress > 0 ? ` ●${counts.inProgress} in-prog` : "";
    const review = counts.review > 0 ? ` ▤${counts.review} review` : "";
    console.log(`  ${devNames[id] ?? id}: ${counts.total} assigned${inProg}${review}`);
  }
}

// --- Review Queue ---

function showReviewQueue(tickets: Ticket[]): void {
  const review = tickets.filter(
    (t) => t.frontmatter.status === "Submitted for Review" || t.frontmatter.status === "Changes Requested",
  );

  if (review.length === 0) {
    console.log("\n  ✓ No tickets pending review");
    return;
  }

  console.log(`\n${BOLD}=== Review Queue ===${RESET}`);
  for (const t of review) {
    const assignee = t.frontmatter.assignee ?? "unassigned";
    const priority = t.frontmatter.priority ?? "none";
    const updated = daysSince(t.frontmatter.updated);
    console.log(`  ${colorStatus(t.frontmatter.status ?? "")} ${BOLD}${t.id}${RESET}`);
    console.log(`    Title: ${t.frontmatter.title ?? "untitled"}`);
    console.log(`    Assignee: ${assignee} | Priority: ${priority} | Updated: ${updated} ago`);
    if (t.frontmatter.pr_url) console.log(`    PR: ${t.frontmatter.pr_url}`);
    console.log();
  }
}

// --- Dev Workload ---

function showDevWorkload(tickets: Ticket[], devId: string, team: TeamConfig | null): void {
  const devName = team?.developers.find((d) => d.id === devId)?.name ?? devId;
  const devTickets = tickets.filter((t) => (t.frontmatter.assignee ?? "").replace("@", "") === devId);

  console.log(`\n${BOLD}=== ${devName}'s Workload ===${RESET}`);
  if (devTickets.length === 0) {
    console.log("  No tickets assigned.");
    return;
  }

  const inProgress = devTickets.filter((t) => t.frontmatter.status === "In Progress");
  const review = devTickets.filter((t) => t.frontmatter.status === "Submitted for Review");
  const planned = devTickets.filter((t) => ["Backlog", "Planned", "Ready"].includes(t.frontmatter.status ?? ""));
  const blocked = devTickets.filter((t) => t.frontmatter.status === "Blocked");

  console.log(`  Active: ${inProgress.length} | Review: ${review.length} | Planned: ${planned.length} | Blocked: ${blocked.length}\n`);

  for (const t of devTickets) {
    const status = colorStatus(t.frontmatter.status ?? "Unknown");
    const priority = t.frontmatter.priority ?? "none";
    console.log(`  ${status} ${BOLD}${t.id}${RESET}: ${t.frontmatter.title ?? "untitled"} (${priority})`);
    if (t.frontmatter.blockers?.length) {
      console.log(`    ${DIM}Blocked by: ${t.frontmatter.blockers.join(", ")}${RESET}`);
    }
  }
}

// --- Blocked Tickets ---

function showBlockedTickets(tickets: Ticket[]): void {
  const blocked = tickets.filter((t) => t.frontmatter.status === "Blocked");
  const hasBlockers = tickets.filter((t) => t.frontmatter.blockers?.length && t.frontmatter.status !== "Blocked");

  if (blocked.length === 0 && hasBlockers.length === 0) {
    console.log("\n  ✓ No blocked tickets");
    return;
  }

  if (blocked.length > 0) {
    console.log(`\n${BOLD}=== Blocked Tickets ===${RESET}`);
    for (const t of blocked) {
      console.log(`  ${BOLD}${t.id}${RESET}: ${t.frontmatter.title ?? "untitled"}`);
      console.log(`    Assignee: ${t.frontmatter.assignee ?? "unassigned"} | Updated: ${daysSince(t.frontmatter.updated)} ago`);
      console.log();
    }
  }

  if (hasBlockers.length > 0) {
    console.log(`\n${BOLD}=== Tickets with Blockers (not yet blocked) ===${RESET}`);
    for (const t of hasBlockers) {
      console.log(`  ${BOLD}${t.id}${RESET}: blocked by ${t.frontmatter.blockers?.join(", ")}`);
    }
    console.log();
  }
}

// --- Aging Tickets ---

function showAgingTickets(tickets: Ticket[]): void {
  const now = Date.now();
  const aging = tickets
    .filter((t) => {
      if (!t.frontmatter.updated) return false;
      const days = Math.floor((now - new Date(t.frontmatter.updated).getTime()) / 86400000);
      return days >= 7 && !["Done", "Approved"].includes(t.frontmatter.status ?? "");
    })
    .map((t) => ({
      ticket: t,
      days: Math.floor((now - new Date(t.frontmatter.updated!).getTime()) / 86400000),
    }))
    .sort((a, b) => b.days - a.days);

  if (aging.length === 0) {
    console.log("\n  ✓ No aging tickets");
    return;
  }

  console.log(`\n${BOLD}=== Aging Tickets (7+ days since update) ===${RESET}`);
  for (const { ticket: t, days } of aging) {
    const color = days >= 30 ? "\x1b[31m" : days >= 14 ? "\x1b[93m" : "";
    console.log(`  ${color}${BOLD}${t.id}${RESET}${color} (${days}d)${RESET}: ${t.frontmatter.title ?? "untitled"}`);
    console.log(`    Status: ${colorStatus(t.frontmatter.status ?? "")} | Assignee: ${t.frontmatter.assignee ?? "unassigned"}`);
  }
  console.log();
}

// --- JSON Output ---

function showJSON(tickets: Ticket[], team: TeamConfig | null): void {
  const byStatus: Record<string, Ticket[]> = {};
  for (const t of tickets) {
    const s = t.frontmatter.status ?? "Unknown";
    (byStatus[s] = byStatus[s] ?? []).push(t);
  }

  const devLoad = team?.developers.map((d) => {
    const assigned = tickets.filter((t) => (t.frontmatter.assignee ?? "").replace("@", "") === d.id);
    return {
      id: d.id,
      name: d.name,
      role: d.role,
      total: assigned.length,
      inProgress: assigned.filter((t) => t.frontmatter.status === "In Progress").length,
      review: assigned.filter((t) => t.frontmatter.status === "Submitted for Review").length,
      blocked: assigned.filter((t) => t.frontmatter.status === "Blocked").length,
      done: assigned.filter((t) => ["Done", "Approved"].includes(t.frontmatter.status ?? "")).length,
    };
  }) ?? [];

  const summary = {
    total: tickets.length,
    byStatus: Object.fromEntries(STATUS_ORDER.filter((s) => byStatus[s]).map((s) => {
      const count = byStatus[s]?.length ?? 0;
      const percentage = Math.round((count / tickets.length) * 100);
      return [s, { count, percentage }];
    })),
    byPriority: countBy(tickets, (t) => t.frontmatter.priority ?? "None"),
    byNamespace: countBy(tickets, (t) => (t.frontmatter.namespace ?? t.frontmatter.project ?? "none").toUpperCase()),
    reviewQueue: tickets.filter((t) => t.frontmatter.status === "Submitted for Review" || t.frontmatter.status === "Changes Requested").length,
    blocked: tickets.filter((t) => t.frontmatter.status === "Blocked").length,
  };

  console.log(JSON.stringify({ summary, developerWorkload: devLoad, tickets: tickets.map((t) => ({
    id: t.id,
    file: t.file,
    title: t.frontmatter.title,
    status: t.frontmatter.status,
    priority: t.frontmatter.priority,
    assignee: t.frontmatter.assignee,
    created: t.frontmatter.created,
    updated: t.frontmatter.updated,
  })) }, null, 2));
}

function countBy<T>(items: T[], fn: (item: T) => string): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of items) {
    const key = fn(item);
    result[key] = (result[key] ?? 0) + 1;
  }
  return result;
}

// --- Main ---

const args = parse(Deno.args, {
  string: ["dev"],
  boolean: ["summary", "review", "aging", "blocked", "json", "watch", "help"],
  alias: { h: "help" },
});

if (args.help) {
  console.log(`
CTO Dashboard (PROJ-019)

Usage:
  dashboard.ts                        Full dashboard
  dashboard.ts --summary              Brief summary only
  dashboard.ts --review               Review queue only
  dashboard.ts --dev=zerwiz           Single dev workload
  dashboard.ts --aging                Aging tickets (7+ days stale)
  dashboard.ts --blocked              Blocked tickets
  dashboard.ts --json                 Machine-readable JSON output
  dashboard.ts --watch                Watch mode (continuous refresh)
`);
  Deno.exit(0);
}

const team = await loadTeamConfig();
const tickets = await loadTickets();

if (args.json) {
  showJSON(tickets, team);
  Deno.exit(0);
}

if (args.watch) {
  console.log(`${DIM}Watching for changes. Press Ctrl+C to stop.${RESET}`);
  const watcher = Deno.watchFs(TICKETS_DIR);
  const refresh = async () => {
    console.clear();
    const updatedTickets = await loadTickets();
    showSummary(updatedTickets, team);
    console.log(`${DIM}\n--- Watching ${TICKETS_DIR} ---${RESET}`);
  };
  await refresh();
  for await (const _event of watcher) {
    await refresh();
  }
  Deno.exit(0);
}

if (args.summary) {
  showSummary(tickets, team);
} else if (args.review) {
  showReviewQueue(tickets);
} else if (args.dev) {
  showDevWorkload(tickets, args.dev, team);
} else if (args.aging) {
  showAgingTickets(tickets);
} else if (args.blocked) {
  showBlockedTickets(tickets);
} else {
  // Full dashboard
  showSummary(tickets, team);
  showReviewQueue(tickets);
  showBlockedTickets(tickets);
  showAgingTickets(tickets);
}
