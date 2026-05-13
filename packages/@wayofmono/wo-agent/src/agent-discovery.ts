import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import type { AgentMeta } from "./types.js";

function shouldSkipDir(name: string): boolean {
  return name === "node_modules" || name === ".git" || name === ".wo" || name.startsWith(".");
}

function unquote(s: string): string {
  let t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1);
  }
  return t.trim();
}

export function parseAgentMarkdown(raw: string): {
  name: string;
  description: string;
  tools: string;
  skills: string;
  body: string;
} | null {
  const normalized = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;

  const frontmatter: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }

  const name = unquote(frontmatter.name || "");
  if (!name) return null;

  return {
    name,
    description: unquote(frontmatter.description || ""),
    tools: unquote(frontmatter.tools || "read,grep,find,ls"),
    skills: unquote(frontmatter.skills || ""),
    body: match[2].trim(),
  };
}

async function collectMdFiles(absDir: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(d: string) {
    let entries;
    try {
      entries = await readdir(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p = join(d, e.name);
      if (e.isDirectory()) {
        if (shouldSkipDir(e.name)) continue;
        await walk(p);
      } else if (e.isFile() && e.name.endsWith(".md")) {
        out.push(p);
      }
    }
  }
  await walk(absDir);
  return out;
}

const SCAN_DIRS = ["agents", ".claude/agents", ".pi/agents", ".cursor/agents"];

export function getAgentScanRoots(workspaceRoot: string): string[] {
  return SCAN_DIRS.map(d => join(workspaceRoot, d));
}

export interface DiscoveredAgents {
  agents: AgentMeta[];
  byName: Map<string, AgentMeta>;
}

export async function discoverAgents(scanRoots: string[]): Promise<DiscoveredAgents> {
  const byName = new Map<string, AgentMeta>();

  for (const dir of scanRoots) {
    if (!existsSync(dir)) continue;
    const mdFiles = await collectMdFiles(dir);
    for (const abs of mdFiles) {
      let raw: string;
      try {
        raw = await readFile(abs, "utf8");
      } catch {
        continue;
      }
      const parsed = parseAgentMarkdown(raw);
      if (!parsed) continue;
      const key = parsed.name.toLowerCase();
      if (byName.has(key)) continue;
      const relPath = relative(dir, abs).replace(/\\/g, "/");
      byName.set(key, {
        name: parsed.name,
        description: parsed.description,
        tools: parsed.tools,
        skills: parsed.skills,
        relativePath: relPath,
        body: parsed.body,
      });
    }
  }

  return {
    agents: [...byName.values()].sort((a, b) => a.name.localeCompare(b.name)),
    byName,
  };
}

export async function getAgentBody(agentName: string, scanRoots: string[]): Promise<string | null> {
  const want = agentName.trim().toLowerCase();
  if (!want) return null;
  for (const dir of scanRoots) {
    if (!existsSync(dir)) continue;
    const mdFiles = await collectMdFiles(dir);
    for (const abs of mdFiles) {
      let raw: string;
      try {
        raw = await readFile(abs, "utf8");
      } catch {
        continue;
      }
      const parsed = parseAgentMarkdown(raw);
      if (!parsed || parsed.name.toLowerCase() !== want) continue;
      return parsed.body;
    }
  }
  return null;
}

export function extractBody(raw: string): string {
  const p = parseAgentMarkdown(raw);
  if (p) return p.body;
  return raw.trim();
}
