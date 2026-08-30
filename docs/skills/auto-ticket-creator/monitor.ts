#!/usr/bin/env deno run --allow-read --allow-write --allow-run --allow-env --allow-net

/**
 * Auto-Ticket Creator Monitor
 *
 * Monitors codebase, dependencies, and external sources for changes
 * and auto-creates tickets via the ticket-manager.
 *
 * Usage:
 *   deno run -A monitor.ts                          # Single scan (all sources)
 *   deno run -A monitor.ts --once                   # Single scan (all sources)
 *   deno run -A monitor.ts --daemon                 # Continuous monitoring
 *   deno run -A monitor.ts --source=git,npm,ref     # Selective sources
 *   deno run -A monitor.ts --dry-run                # Preview only
 *   deno run -A monitor.ts --status                 # Show monitor state
 */

import { join, dirname, relative } from "https://deno.land/std@0.224.0/path/mod.ts";
import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";
import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";

const ROOT = Deno.cwd();
const STATE_DIR = join(ROOT, ".wo", "state", "monitor");
const STATE_PATH = join(STATE_DIR, "monitor-state.json");
const HARNESS_CONFIG_PATH = join(ROOT, ".wo", "config", "harness.json");
const THOUGHTS_DIR = join(ROOT, "thoughts");

function getProjectSlug(): string {
  try {
    const content = Deno.readTextFileSync(HARNESS_CONFIG_PATH);
    return JSON.parse(content).project_slug || "wayofmono";
  } catch {
    return "wayofmono";
  }
}

function ticketsDir(): string {
  return join(THOUGHTS_DIR, getProjectSlug(), "shared", "tickets");
}

async function pullThoughts(): Promise<void> {
  try {
    const cmd = new Deno.Command("git", {
      args: ["-C", THOUGHTS_DIR, "pull", "--ff-only"],
      stdout: "null", stderr: "null",
    });
    await cmd.output();
  } catch {
    // not a git repo yet
  }
}

async function pushThoughts(message: string): Promise<void> {
  try {
    const addCmd = new Deno.Command("git", {
      args: ["-C", THOUGHTS_DIR, "add", "-A"],
      stdout: "null", stderr: "null",
    });
    await addCmd.output();

    const diffCmd = new Deno.Command("git", {
      args: ["-C", THOUGHTS_DIR, "diff", "--cached", "--quiet"],
      stdout: "null", stderr: "null",
    });
    const { code } = await diffCmd.output();
    if (code === 0) return;

    const commitCmd = new Deno.Command("git", {
      args: ["-C", THOUGHTS_DIR, "commit", "-m", message],
      stdout: "null", stderr: "null",
    });
    const { code: cc } = await commitCmd.output();
    if (cc !== 0) return;

    const pushCmd = new Deno.Command("git", {
      args: ["-C", THOUGHTS_DIR, "push"],
      stdout: "null", stderr: "null",
    });
    await pushCmd.output();
  } catch {
    // push may fail without credentials
  }
}

interface MonitorState {
  lastRun: string;
  lastResults: Record<string, unknown>;
  seenChanges: Set<string>;
}

interface DetectedChange {
  type: "agent-update" | "skill-update" | "dep-update" | "security" | "breaking-change";
  source: string;
  title: string;
  description: string;
  priority: string;
  namespace: string;
  category: string;
}

// --- State ---

async function loadState(): Promise<MonitorState> {
  try {
    const content = await Deno.readTextFile(STATE_PATH);
    const data = JSON.parse(content);
    return { ...data, seenChanges: new Set(data.seenChanges ?? []) };
  } catch {
    return { lastRun: "", lastResults: {}, seenChanges: new Set() };
  }
}

async function saveState(state: MonitorState): Promise<void> {
  await ensureDir(STATE_DIR);
  await Deno.writeTextFile(
    STATE_PATH,
    JSON.stringify({ ...state, seenChanges: [...state.seenChanges] }, null, 2),
  );
}

// --- Ticket Creator ---

async function createTicket(change: DetectedChange, dryRun: boolean): Promise<void> {
  await pullThoughts();
  const id = `AUTO-${Date.now()}`;
  const slug = change.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
  const ticketPath = join(ticketsDir(), change.category, `${id}-${slug}.md`);

  const content = `---
title: "\\[${change.namespace}\\] ${change.title}"
type: "Chore"
priority: "${change.priority}"
status: "Backlog"
assignee: "@auto"
created: "${new Date().toISOString().slice(0, 10)}"
---

## Source: ${change.source}

${change.description}

## Change Type

${change.type}

## Auto-detected

This ticket was automatically created by the monitor system.
`;

  if (dryRun) {
    console.log(`  [dry-run] WOULD CREATE: ${change.title}`);
    console.log(`    Path: ${ticketPath}`);
    console.log(`    Type: ${change.type} | Priority: ${change.priority} | Namespace: ${change.namespace}`);
    return;
  }

  await ensureDir(dirname(ticketPath));
  await Deno.writeTextFile(ticketPath, content);
  console.log(`  + Created ticket: ${ticketPath}`);
  await pushThoughts(`monitor: auto-create ticket ${id}`);
}

// --- Git Adapter ---

async function scanGit(): Promise<DetectedChange[]> {
  const changes: DetectedChange[] = [];
  try {
    // Check for new branches
    const branchCmd = new Deno.Command("git", { args: ["branch", "-r"], cwd: ROOT });
    const branchOutput = await branchCmd.output();
    const branches = new TextDecoder().decode(branchOutput.stdout);

    // Check recent commits for patterns
    const logCmd = new Deno.Command("git", {
      args: ["log", "--oneline", "-20"],
      cwd: ROOT,
    });
    const logOutput = await logCmd.output();
    const commits = new TextDecoder().decode(logOutput.stdout);

    if (commits.includes("BREAKING CHANGE") || commits.includes("breaking")) {
      changes.push({
        type: "breaking-change",
        source: "git",
        title: "Breaking changes detected in recent commits",
        description: `Recent commits contain breaking changes:\n\n${commits.slice(0, 500)}`,
        priority: "High",
        namespace: "WOMONO",
        category: "system",
      });
    }

    if (commits.includes(" security") || commits.includes("CVE-") || commits.includes("vuln")) {
      changes.push({
        type: "security",
        source: "git",
        title: "Security-related commits detected",
        description: `Security-related commits found:\n\n${commits.slice(0, 500)}`,
        priority: "Critical",
        namespace: "WOMONO",
        category: "security",
      });
    }
  } catch {
    // Not a git repo or git not available
  }
  return changes;
}

// --- npm Adapter ---

async function scanNpm(): Promise<DetectedChange[]> {
  const changes: DetectedChange[] = [];
  const pkgPaths: string[] = [];

  // Find all package.json files
  async function findPkgJsons(dir: string) {
    try {
      for await (const entry of Deno.readDir(dir)) {
        if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory && !fullPath.includes("node_modules")) {
          await findPkgJsons(fullPath);
        } else if (entry.name === "package.json") {
          pkgPaths.push(fullPath);
        }
      }
    } catch {}
  }
  await findPkgJsons(ROOT);

  // Only scan root package.json and workspace packages
  const rootPkg = pkgPaths.find((p) => relative(ROOT, p) === "package.json");
  if (rootPkg) {
    try {
      const content = JSON.parse(await Deno.readTextFile(rootPkg));
      const deps = { ...content.dependencies, ...content.devDependencies } as Record<string, string>;
      for (const [pkg, ver] of Object.entries(deps)) {
        if (ver.startsWith("workspace:")) continue;
        // Check for pinned versions that might need updating
        if (ver.startsWith("~") || ver.startsWith("^")) {
          changes.push({
            type: "dep-update",
            source: "npm",
            title: `Dependency ${pkg} uses semver range ${ver}`,
            description: `Package ${pkg} is specified with range ${ver} in root package.json. Consider pinning for reproducible builds.`,
            priority: "Low",
            namespace: "WOMONO",
            category: "infrastructure",
          });
        }
      }
    } catch {}
  }

  return changes;
}

// --- Ref Adapter ---

async function scanRef(): Promise<DetectedChange[]> {
  const changes: DetectedChange[] = [];
  const refDir = join(ROOT, "ref");

  try {
    const refSkillsDir = join(refDir, "skills");
    const refAgentsDir = join(refDir, "agents");

    const harnessSkillsDir = join(ROOT, "packages/@aiengineeringharness", "skills");
    const importedRefSkills = new Set<string>();
    try {
      for await (const e of Deno.readDir(harnessSkillsDir)) {
        if (e.isDirectory) importedRefSkills.add(e.name);
      }
    } catch {}

    // Check for new ref skills not yet imported
    try {
      for await (const entry of Deno.readDir(refSkillsDir)) {
        if (!entry.isDirectory) continue;
        if (!importedRefSkills.has(entry.name)) {
          changes.push({
            type: "skill-update",
            source: "ref",
            title: `New ref skill available: ${entry.name}`,
            description: `Reference skill '${entry.name}' exists in ref/skills/ but hasn't been imported to the AI Engineering Harness yet.`,
            priority: "Medium",
            namespace: "WOMONO",
            category: "ai-agents",
          });
        }
      }
    } catch {}

    // Check for new ref agents
    try {
      const agentRegistryPath = join(ROOT, "packages/@aiengineeringharness", "agents", "agent-registry.json");
      const registry = JSON.parse(await Deno.readTextFile(agentRegistryPath));
      const importedAgents = new Set(Object.keys(registry.agents ?? {}));

      for await (const entry of Deno.readDir(refAgentsDir)) {
        if (!entry.isDirectory) continue;
        if (!importedAgents.has(entry.name)) {
          changes.push({
            type: "agent-update",
            source: "ref",
            title: `New ref agent available: ${entry.name}`,
            description: `Reference agent '${entry.name}' exists in ref/agents/ but hasn't been imported yet.`,
            priority: "Medium",
            namespace: "WOMONO",
            category: "ai-agents",
          });
        }
      }
    } catch {}
  } catch {}

  return changes;
}

// --- TODO/FIXME Scanner ---

async function scanCodebase(): Promise<DetectedChange[]> {
  const changes: DetectedChange[] = [];
  const commentRegex = /\/\/\s*(TODO|FIXME|HACK|XXX)\s*[:-]?\s*(.*)/gi;

  async function walk(dir: string, depth: number) {
    if (depth > 5) return;
    try {
      for await (const entry of Deno.readDir(dir)) {
        if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory) {
          await walk(fullPath, depth + 1);
        } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") || entry.name.endsWith(".js")) {
          try {
            const content = await Deno.readTextFile(fullPath);
            const regex = new RegExp(commentRegex.source, "gi");
            let match;
            while ((match = regex.exec(content)) !== null) {
              const prefix = match[1]?.trim() ?? "";
              const msg = match[2]?.trim() ?? "";
              if (msg && msg.length > 5) {
                const relPath = relative(ROOT, fullPath);
                changes.push({
                  type: "skill-update",
                  source: "codebase",
                  title: `${prefix}: ${msg.slice(0, 80)}`,
                  description: `Found in ${relPath} at line ${content.slice(0, match.index).split("\n").length}:\n\n${msg}`,
                  priority: "Medium",
                  namespace: "WOMONO",
                  category: "system",
                });
              }
            }
          } catch {}
        }
      }
    } catch {}
  }

  await walk(join(ROOT, "packages"), 0);
  return changes;
}

// --- Platform Adapter ---

async function scanPlatforms(): Promise<DetectedChange[]> {
  const changes: DetectedChange[] = [];
  const harnessDir = join(ROOT, "packages/@aiengineeringharness");

  // Check if platform dirs exist have skills
  const platforms = ["claude", "opencode", "gemini", "pi", "wocoder", "antigravity"];
  for (const platform of platforms) {
    const skillsDir = join(harnessDir, platform, "skills");
    try {
      const count = [...Deno.readDir(skillsDir)].filter((e) => e.isDirectory).length;
      if (count === 0) {
        changes.push({
          type: "skill-update",
          source: "platform",
          title: `Platform ${platform} has no imported skills`,
          description: `The ${platform} platform directory exists but has no skills imported. Run import-ref-skills.ts.`,
          priority: "High",
          namespace: "WOMONO",
          category: "ai-agents",
        });
      }
    } catch {
      // Platform dir doesn't exist yet
    }
  }

  return changes;
}

// --- Main ---

const args = parse(Deno.args, {
  string: ["source"],
  boolean: ["once", "daemon", "dry-run", "status", "help"],
  alias: { h: "help", n: "dry-run" },
});

if (args.help) {
  console.log(`
Auto-Ticket Creator Monitor

Usage:
  monitor.ts                          Single scan (all sources)
  monitor.ts --once                   Single scan (all sources)
  monitor.ts --daemon                 Continuous monitoring
  monitor.ts --source=git,npm,ref     Selective sources
  monitor.ts --dry-run                Preview only
  monitor.ts --status                 Show monitor state
`);
  Deno.exit(0);
}

const state = await loadState();

if (args.status) {
  console.log(`\nMonitor State:\n`);
  console.log(`  Last run: ${state.lastRun || "never"}`);
  console.log(`  Changes tracked: ${state.seenChanges.size}`);
  console.log();
  Deno.exit(0);
}

const dryRun = args["dry-run"] ?? false;
const sourceFilter = args.source ? args.source.split(",").map((s: string) => s.trim()) : null;

const adapters: Array<{ name: string; fn: () => Promise<DetectedChange[]> }> = [
  { name: "git", fn: scanGit },
  { name: "npm", fn: scanNpm },
  { name: "ref", fn: scanRef },
  { name: "codebase", fn: scanCodebase },
  { name: "platform", fn: scanPlatforms },
];

const filtered = sourceFilter
  ? adapters.filter((a) => sourceFilter.includes(a.name))
  : adapters;

console.log(`\n🔍 Scanning sources: ${filtered.map((a) => a.name).join(", ")}${dryRun ? " (dry-run)" : ""}\n`);

let totalNew = 0;
for (const adapter of filtered) {
  const changes = await adapter.fn();
  const newChanges = changes.filter((c) => {
    const key = `${c.source}:${c.title}`;
    return !state.seenChanges.has(key);
  });

  if (newChanges.length > 0) {
    console.log(`  ${adapter.name}: ${newChanges.length} new change(s)`);
    for (const change of newChanges) {
      await createTicket(change, dryRun);
      if (!dryRun) {
        state.seenChanges.add(`${change.source}:${change.title}`);
      }
    }
    console.log();
    totalNew += newChanges.length;
  } else {
    console.log(`  ${adapter.name}: no new changes`);
  }
}

state.lastRun = new Date().toISOString();
if (!dryRun) {
  await saveState(state);
}

console.log(`\n✅ ${totalNew} new ${totalNew === 1 ? "ticket" : "tickets"} ${dryRun ? "would be created" : "created"}`);

// Daemon mode
if (args.daemon) {
  console.log("\n👀 Daemon mode: watching for changes (Ctrl+C to stop)\n");
  const watchers: Deno.FsWatcher[] = [];

  try {
    watchers.push(Deno.watchFs(join(ROOT, "packages/@aiengineeringharness", "skills")));
    watchers.push(Deno.watchFs(join(ROOT, "ref")));

    const poll = async () => {
      for (const adapter of filtered) {
        const changes = await adapter.fn();
        const newChanges = changes.filter((c) => !state.seenChanges.has(`${c.source}:${c.title}`));
        for (const change of newChanges) {
          console.log(`  + ${change.type}: ${change.title}`);
          await createTicket(change, false);
          state.seenChanges.add(`${change.source}:${change.title}`);
        }
      }
      state.lastRun = new Date().toISOString();
      await saveState(state);
    };

    // Initial check
    await poll();

    const interval = setInterval(poll, 60000); // Poll every 60s
    const fsPromise = Promise.race(watchers.map((w) => {
      const iter = w[Symbol.asyncIterator]();
      return iter.next();
    }));
    await fsPromise;
    clearInterval(interval);
  } finally {
    for (const w of watchers) {
      try { w.close(); } catch {}
    }
  }
}
