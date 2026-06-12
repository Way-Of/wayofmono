#!/usr/bin/env -S deno run -A
/**
 * Add 10 unified build_tool_* skills to manifest.json for all 7 tools.
 */

const manifestPath = `${import.meta.dirname}/../manifest.json`;
const manifest = JSON.parse(Deno.readTextFileSync(manifestPath));

interface SkillEntry {
  name: string;
  piName: string;
  description: string;
}

const UNIFIED_SKILLS: SkillEntry[] = [
  { name: "build_tool_skill", piName: "build-tool-skill", description: "Unified skill builder for all 7 tools" },
  { name: "build_tool_agent", piName: "build-tool-agent", description: "Unified agent builder for all 7 tools" },
  { name: "build_tool_extension", piName: "build-tool-extension", description: "Unified extension/plugin builder for all 7 tools" },
  { name: "build_tool_tui", piName: "build-tool-tui", description: "Unified TUI component builder for all 7 tools" },
  { name: "build_tool_cli", piName: "build-tool-cli", description: "Unified CLI reference for all 7 tools" },
  { name: "build_tool_themes", piName: "build-tool-themes", description: "Unified theme builder for all 7 tools" },
  { name: "build_tool_prompts", piName: "build-tool-prompts", description: "Unified prompt template builder for all 7 tools" },
  { name: "build_tool_keybindings", piName: "build-tool-keybindings", description: "Unified keybinding reference for all 7 tools" },
  { name: "build_tool_config", piName: "build-tool-config", description: "Unified configuration reference for all 7 tools" },
  { name: "build_tool_orchestrate", piName: "build-tool-orchestrate", description: "Unified orchestration coordinator for all 7 tools" },
];

const TOOLS = ["claude", "opencode", "gemini", "pi", "antigravity", "codex", "wocoder"];

const TOOL_NAMES: Record<string, string> = {
  opencode: "OpenCode",
  claude: "Claude Code",
  gemini: "Gemini CLI",
  pi: "Pi",
  antigravity: "Antigravity",
  codex: "Codex",
  wocoder: "Wo Coder",
};

for (const tool of TOOLS) {
  const components = manifest.tools[tool].components;
  for (const skill of UNIFIED_SKILLS) {
    const skillName = tool === "pi" ? skill.piName : skill.name;
    const key = `skill/${skillName}`;
    if (components[key]) {
      console.log(`  ~ ${tool}: ${key} already exists, skipping`);
      continue;
    }
    components[key] = {
      description: `${skill.description} — deployed to ${TOOL_NAMES[tool]}`,
      files: [
        {
          src: `${tool}/skills/${skillName}/SKILL.md`,
          dest: `skills/${skillName}/SKILL.md`,
        },
      ],
    };
    console.log(`  ✓ ${tool}: added ${key}`);
  }
}

Deno.writeTextFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log("\nManifest updated.");
