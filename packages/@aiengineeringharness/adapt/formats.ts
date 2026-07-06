import type { ToolsInfo } from "../detect/types.ts";

export interface SkillFormat {
  naming: "snake_case" | "kebab-case";
  frontmatterFormat: string;
  skillDir: string;
}

const FORMAT_MAP: Record<string, SkillFormat> = {
  opencode: { naming: "kebab-case", frontmatterFormat: "opencode", skillDir: "skills" },
  claude: { naming: "snake_case", frontmatterFormat: "claude", skillDir: "skills" },
  pi: { naming: "kebab-case", frontmatterFormat: "pi", skillDir: "skills" },
  codex: { naming: "snake_case", frontmatterFormat: "codex", skillDir: "skills" },
  antigravity: { naming: "snake_case", frontmatterFormat: "antigravity", skillDir: "skills" },
  wocode: { naming: "kebab-case", frontmatterFormat: "wocode", skillDir: "skills" },
};

export function getToolFormat(toolName: string): SkillFormat {
  return FORMAT_MAP[toolName] || { naming: "snake_case", frontmatterFormat: "opencode", skillDir: "skills" };
}

export function selectToolsToInstall(tools: ToolsInfo): string[] {
  return tools.installed.length > 0 ? tools.installed : ["opencode", "claude", "pi", "codex", "antigravity", "wocode"];
}

export function validateSkillName(name: string, format: SkillFormat): boolean {
  if (format.naming === "kebab-case") {
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name);
  }
  return /^[a-z0-9]+(_[a-z0-9]+)*$/.test(name);
}
