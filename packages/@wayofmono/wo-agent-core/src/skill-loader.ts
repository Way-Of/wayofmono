import { readdir, readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import type { Skill } from "./types.js";

export function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const frontmatter: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const sepIndex = line.indexOf(":");
    if (sepIndex === -1) continue;
    const key = line.slice(0, sepIndex).trim();
    const value = line.slice(sepIndex + 1).trim();
    frontmatter[key] = value;
  }

  return { frontmatter, body: match[2].trim() };
}

export function stripFrontmatter(content: string): string {
  return content.replace(/^---\n[\s\S]*?\n---\n/, "");
}

export async function loadSkills(opts: { cwd: string }): Promise<{ skills: Skill[] }> {
  const skills: Skill[] = [];
  const agentDirs = [
    join(opts.cwd, "wo", "skills"),
    join(opts.cwd, ".wo", "skills"),
    join(process.env.HOME || "~", ".wo", "agent", "skills"),
  ];

  for (const dir of agentDirs) {
    try {
      await stat(dir);
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const subSkills = await loadSkillsFromDir(join(dir, entry.name));
          skills.push(...subSkills);
        } else if (extname(entry.name) === ".md") {
          const content = await readFile(join(dir, entry.name), "utf-8");
          const { frontmatter, body } = parseFrontmatter(content);
          skills.push({
            name: (frontmatter.name as string) || entry.name.replace(".md", ""),
            description: (frontmatter.description as string) || "",
            content: body,
            frontmatter,
            path: join(dir, entry.name),
          });
        }
      }
    } catch {
      // skip dirs that don't exist
    }
  }

  return { skills };
}

async function loadSkillsFromDir(dir: string): Promise<Skill[]> {
  const skills: Skill[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (extname(entry.name) !== ".md") continue;
      const content = await readFile(join(dir, entry.name), "utf-8");
      const { frontmatter, body } = parseFrontmatter(content);
      skills.push({
        name: (frontmatter.name as string) || entry.name.replace(".md", ""),
        description: (frontmatter.description as string) || "",
        content: body,
        frontmatter,
        path: join(dir, entry.name),
      });
    }
  } catch {
    // skip
  }
  return skills;
}

export function getAgentDir(): string {
  return process.env.WO_CONFIG_DIR || join(process.env.HOME || "~", ".wo", "agent");
}
