import type { ToolDefinition } from "@wayofmono/wo-agent-core";
import { documentationSkill } from "./skills/documentation.js";
import { fileOperationsSkill } from "./skills/file-operations.js";
import { searchSkill } from "./skills/search.js";
import { summarizationSkill } from "./skills/summarization.js";
import type { AgentSkill } from "./types.js";

export interface SkillDefinition {
  name: string;
  description: string;
  tools: ToolDefinition[];
  systemPrompt?: string;
  prompts?: string[];
}

const BUILT_IN_SKILLS: Record<string, () => AgentSkill> = {
  documentation: documentationSkill,
  "file-operations": fileOperationsSkill,
  search: searchSkill,
  summarization: summarizationSkill,
};

export class SkillManager {
  private loaded = new Map<string, AgentSkill>();
  private loadedTools: ToolDefinition[] = [];

  async load(name: string, context: unknown): Promise<void> {
    const factory = BUILT_IN_SKILLS[name];
    if (!factory) {
      // Try loading from .md skill files
      const loaded = await this.loadFromFile(name);
      if (loaded) {
        this.loaded.set(name, loaded);
        this.loadedTools.push(...loaded.tools);
      }
      return;
    }

    const skill = factory();
    this.loaded.set(name, skill);
    this.loadedTools.push(...skill.tools);
  }

  private async loadFromFile(_name: string): Promise<AgentSkill | null> {
    // TODO: load .md skill files from <project>/.wo/skills/
    return null;
  }

  getTools(): ToolDefinition[] {
    return this.loadedTools;
  }

  getSystemPrompt(): string {
    const parts: string[] = [];
    for (const skill of this.loaded.values()) {
      if (skill.systemPrompt) parts.push(skill.systemPrompt);
    }
    return parts.join("\n\n");
  }

  getLoadedSkills(): string[] {
    return [...this.loaded.keys()];
  }
}
