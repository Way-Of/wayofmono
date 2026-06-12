#!/usr/bin/env -S deno run -A
/**
 * Generate all 10 unified build_tool_* skills for all 7 tools.
 *
 * Each skill gets a SKILL.md with tool-appropriate frontmatter
 * and the same body content (knows all 7 tool formats).
 */
import { join } from "jsr:@std/path@1/join";
import { relative } from "jsr:@std/path@1/relative";

const TOOLS = ["opencode", "claude", "gemini", "pi", "antigravity", "codex", "wocoder"] as const;

type ToolConfig = {
  dirName: string;
  name: string;
  allowedTools: string;
  allowedToolsArray: string[];
};

type ToolName = typeof TOOLS[number];

const TOOL_CONFIGS: Record<ToolName, ToolConfig> = {
  opencode: { dirName: "opencode", name: "build_tool_skill", allowedTools: "'read, write, edit, bash, grep, glob, websearch'", allowedToolsArray: ["read", "write", "edit", "bash", "grep", "glob", "websearch"] },
  claude:   { dirName: "claude",   name: "build_tool_skill", allowedTools: "'Read, Write, Edit, Bash, Grep, Glob, WebSearch'", allowedToolsArray: ["Read", "Write", "Edit", "Bash", "Grep", "Glob", "WebSearch"] },
  gemini:   { dirName: "gemini",   name: "build_tool_skill", allowedTools: "'read_file, write_file, run_shell_command, glob, grep'", allowedToolsArray: ["read_file", "write_file", "run_shell_command", "glob", "grep"] },
  pi:       { dirName: "pi",       name: "build-tool-skill", allowedTools: "'Read, Write, Edit, Bash, Grep, Glob, WebSearch'", allowedToolsArray: ["Read", "Write", "Edit", "Bash", "Grep", "Glob", "WebSearch"] },
  antigravity: { dirName: "antigravity", name: "build_tool_skill", allowedTools: "'read, write, edit, bash, grep, glob, websearch'", allowedToolsArray: ["read", "write", "edit", "bash", "grep", "glob", "websearch"] },
  codex:    { dirName: "codex",    name: "build_tool_skill", allowedTools: "'read_file, write_file, run_shell_command, glob, grep'", allowedToolsArray: ["read_file", "write_file", "run_shell_command", "glob", "grep"] },
  wocoder:  { dirName: "wocoder",  name: "build_tool_skill", allowedTools: "'Read, Write, Edit, Bash, Grep, Glob, WebSearch'", allowedToolsArray: ["Read", "Write", "Edit", "Bash", "Grep", "Glob", "WebSearch"] },
};

function cfgFor(tool: ToolName, skillId: string, piId: string): ToolConfig {
  return {
    dirName: tool,
    name: tool === "pi" ? piId : skillId,
    allowedTools: TOOL_CONFIGS[tool].allowedTools,
    allowedToolsArray: TOOL_CONFIGS[tool].allowedToolsArray,
  };
}

interface SkillDef {
  id: string;
  piId: string;
  description: string;
  body: string;
}

const TOOL_REF = `## Tool Format Reference

### OpenCode
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **allowed-tools**: lowercase (\`read, write, edit, bash, grep, glob\`)
- **Config**: \`~/.config/opencode/\`
- **Docs**: https://opencode.ai/docs/

### Claude Code
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **allowed-tools**: PascalCase (\`Read, Write, Edit, Bash, Grep, Glob\`)
- **Config**: \`~/.claude/skills/\`
- **Docs**: https://code.claude.com/docs/en/overview

### Gemini CLI
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **Format**: TOML files (not YAML frontmatter)
- **allowed-tools**: lowercase (\`read_file, write_file, run_shell_command, glob, grep\`)
- **Config**: \`~/.gemini/skills/\`
- **Docs**: https://cloud.google.com/gemini-cli/docs

### Pi
- **Directory naming**: kebab-case
- **Name field**: kebab-case, matches directory name
- **allowed-tools**: PascalCase (\`Read, Write, Edit, Bash, Grep, Glob\`)
- **Config**: \`~/.pi/agent/skills/\`
- **Docs**: https://pi.dev/

### Antigravity
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **allowed-tools**: lowercase (\`read, write, edit, bash, grep, glob\`)
- **Config**: \`~/.antigravity/skills/\`
- **Docs**: https://antigravity.sh/docs

### Codex
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **Format**: skill.yaml + prompt.md (two files per skill)
- **allowed-tools**: lowercase (\`read_file, write_file, run_shell_command, glob, grep\`)
- **Config**: \`~/.codex/skills/\`
- **Docs**: https://github.com/openai/codex

### Wo Coder
- **Directory naming**: snake_case
- **Name field**: snake_case, matches directory name
- **allowed-tools**: PascalCase (\`Read, Write, Edit, Bash, Grep, Glob\`)
- **Config**: \`~/.wocoder/skills/\`
- **Docs**: Internal (WayOfMono monorepo)
`;

const ONLINE_SOURCES = `## Online Sources
Always fetch the latest docs before building:
- OpenCode: https://opencode.ai/docs/
- Claude Code: https://code.claude.com/docs/en/overview
- Gemini CLI: https://cloud.google.com/gemini-cli/docs
- Pi: https://pi.dev/
- Antigravity: https://antigravity.sh/docs
- Codex: https://github.com/openai/codex
- Wo Coder: packages/@wayofmono/wo-agent/
`;

const SKILLS: SkillDef[] = [
  {
    id: "build_tool_skill",
    piId: "build-tool-skill",
    description: "Build skills for all 7 AI coding tools — knows SKILL.md format, frontmatter, naming conventions, allowed-tools, directory rules.",
    body: `# build_tool_skill — Unified Skill Builder

You are a cross-tool skill builder. You know how to create SKILL.md files for ALL 7 AI coding tools. Load this skill when the user wants to create or modify a skill for any tool.

${TOOL_REF}
## Common Tasks

### Create a New Skill
1. Determine target tool (or cross-tool)
2. Create directory: \`<tool>/skills/<name>/\`
3. Create \`SKILL.md\` with frontmatter matching tool's format
4. Body: markdown with instructions, references, examples
5. For Codex: create \`skill.yaml\` + \`prompt.md\`

### Validate Skill Format
- Name must match directory name
- allowed-tools must use correct casing for target tool
- Frontmatter must be valid YAML (or TOML for Gemini)
- Pi names must be kebab-case

${ONLINE_SOURCES}`,
  },
  {
    id: "build_tool_agent",
    piId: "build-tool-agent",
    description: "Build agent definitions for all 7 AI coding tools — knows frontmatter format, subagents, teams, and agent directory structure.",
    body: `# build_tool_agent — Unified Agent Builder

You are a cross-tool agent builder. You know how to create agent definitions for ALL 7 AI coding tools. Load this skill when the user wants to create or modify an agent for any tool.

${TOOL_REF}
## Agent Formats Per Tool

### OpenCode / Claude / Antigravity / Wo Coder
- Format: Markdown with YAML frontmatter
- Fields: name (snake_case), description, type (agent/subagent), tools
- Location: \`agents/\` directory
- Invocation: via task tool or subagent dispatch

### Pi
- Format: Markdown with YAML frontmatter
- Fields: name (kebab-case), description, tools, system prompt
- Location: \`agents/\` directory
- Teams: \`teams.yaml\` for agent-team orchestration

### Gemini CLI
- Format: TOML files
- Location: \`agents/\` directory
- Fields match TOML schema

### Codex
- Format: YAML agent definitions
- Location: \`agents/\` directory

${ONLINE_SOURCES}`,
  },
  {
    id: "build_tool_extension",
    piId: "build-tool-extension",
    description: "Build extensions/plugins for all 7 AI coding tools — knows extension API, lifecycle hooks, custom tools, event handlers.",
    body: `# build_tool_extension — Unified Extension Builder

You are a cross-tool extension builder. You know how to create extensions and plugins for ALL 7 AI coding tools. Load this skill when the user wants to build an extension for any tool.

${TOOL_REF}
## Extension Systems Per Tool

### Pi
- Format: TypeScript/JavaScript modules
- Extension API: tools, event handlers, commands, shortcuts, state management, custom rendering, tool overrides
- Location: \`extensions/\` directory
- Docs: https://badlogic-pi-mono.mintlify.app/api/coding-agent/extension-api

### Antigravity
- Format: Folder-based plugins
- Lifecycle hooks: \`hooks.json\` (pre/post)
- Background sidecars: \`sidecar.json\`
- Location: \`extensions/\` directory

### Claude Code
- Format: plugin.json manifest
- Custom commands, hook interceptors
- Location: \`.claude/plugins/\` or marketplace
- Marketplace deployment supported

### OpenCode / Wo Coder
- Extensibility via MCP Servers and LSP
- Skills + commands + rules
- No plugin manifest system

### Codex
- Rules-based extensibility
- No formal plugin system

### Gemini CLI
- Folder-based plugins
- Lifecycle hooks

${ONLINE_SOURCES}`,
  },
  {
    id: "build_tool_tui",
    piId: "build-tool-tui",
    description: "Build TUI components for all 7 AI coding tools — knows React Ink, built-in components, custom rendering, overlays, keyboard input.",
    body: `# build_tool_tui — Unified TUI Builder

You are a cross-tool TUI builder. You know how to create terminal UI components for ALL 7 AI coding tools. Load this skill when the user wants to build TUI components for any tool.

${TOOL_REF}
## TUI Systems Per Tool

### OpenCode / Claude Code / Wo Coder
- **Framework**: React Ink
- **Components**: ThemedBox, ThemedText, Pane, Divider, Dialog, FuzzyPicker, Tabs, LoadingState, ProgressBar
- **Hooks**: useInput, useApp, useTerminalViewport, useTerminalFocus, useAnimationFrame
- **Theming**: ThemeProvider wraps Ink components, semantic color variables

### Pi / Antigravity
- **Framework**: Custom component system
- **Components**: Text, Box, Container, Markdown, Image, SelectList, SettingsList, DynamicBorder, BorderedLoader, CustomEditor
- **Interface**: \`render(width: number): string[]\`, \`handleInput?(data)\`, \`invalidate()\`
- **Keyboard**: \`matchesKey(data, Key.up/down/enter/escape)\`, \`Key.ctrl("c")\`
- **UI Patterns**: Status bar, widgets, footer, overlays, custom editors

### Gemini CLI / Codex
- Terminal UI via framework conventions
- Less extensive TUI system than others

${ONLINE_SOURCES}`,
  },
  {
    id: "build_tool_cli",
    piId: "build-tool-cli",
    description: "CLI reference for all 7 AI coding tools — knows flags, subcommands, environment variables, output modes, non-interactive usage.",
    body: `# build_tool_cli — Unified CLI Reference

You are a cross-tool CLI expert. You know the command line interface for ALL 7 AI coding tools. Load this skill when the user needs help running any tool from the command line.

${TOOL_REF}
## CLI Patterns Per Tool

### OpenCode
- Binary: \`opencode\`
- Flags: \`--model\`, \`--provider\`, \`--dir\`, \`--yes\`, \`--help\`

### Claude Code
- Binary: \`claude\`
- Flags: \`-p\` (prompt), \`--model\`, \`--resume\`, \`--print\`

### Gemini CLI
- Binary: \`gemini\`
- Flags: \`--model\`, \`--context\`, \`--stream\`

### Pi
- Binary: \`pi\`
- Flags: \`--mode\` (agent/chat/pipe/apply), \`--model\`, \`--provider\`

### Antigravity
- Binary: \`agy\`
- Flags: \`--model\`, \`--context-size\`, \`--mode\`

### Codex
- Binary: \`codex\`
- Flags: \`--model\`, \`--sandbox\`, \`--eval\`

### Wo Coder
- Binary: \`wocode\`
- Flags: \`--mode\`, \`--model\`, \`--provider\`

${ONLINE_SOURCES}`,
  },
  {
    id: "build_tool_themes",
    piId: "build-tool-themes",
    description: "Build themes for all 7 AI coding tools — knows JSON format, color tokens, vars system, hex/256-color values, hot reload.",
    body: `# build_tool_themes — Unified Theme Builder

You are a cross-tool theme builder. You know how to create themes for ALL 7 AI coding tools. Load this skill when the user wants to create or modify themes for any tool.

${TOOL_REF}
## Theme Systems Per Tool

### Pi / Antigravity
- **Format**: JSON with 51 color tokens
- **Vars system**: templates with \`{{var}}\` substitution
- **Values**: hex (#fff) or 256-color (\`38;5;208m\`)
- **Hot reload**: themes apply instantly
- **Distribution**: single JSON file

### Claude Code
- **Presets**: 7 built-in themes
- **Colors**: RGB true color definitions
- **Fallback**: ANSI-only mode
- **Daltonized**: color-blind friendly options
- **Switching**: interactive \`/theme\` picker

### OpenCode / Wo Coder / Codex / Gemini CLI
- Theme support via config files
- Color customization in settings

${ONLINE_SOURCES}`,
  },
  {
    id: "build_tool_prompts",
    piId: "build-tool-prompts",
    description: "Build prompt templates for all 7 AI coding tools — knows single-file .md format, frontmatter, positional arguments, discovery locations.",
    body: `# build_tool_prompts — Unified Prompt Template Builder

You are a cross-tool prompt template builder. You know how to create prompt templates for ALL 7 AI coding tools. Load this skill when the user wants to create prompt templates for any tool.

${TOOL_REF}
## Prompt Systems Per Tool

### Pi
- **Format**: Single-file .md with YAML frontmatter
- **Arguments**: \`$1\`, \`$@\`, \`\${@:N}\` positional arguments
- **Discovery**: \`prompts/\` directory
- **Invocation**: \`/template <name>\`
- **Frontmatter**: name (kebab-case), description

### Claude Code
- **Format**: CLAUDE.md and modular \`.claude/rules/\`
- **Referencing**: \`@\` file references in conversation
- **Output styles**: XML tags, markdown sections

### Antigravity / OpenCode / Wo Coder
- Prompt templates via skills and commands
- Markdown-based with frontmatter

### Gemini CLI
- Templates via TOML format commands
- Slash command invocation

${ONLINE_SOURCES}`,
  },
  {
    id: "build_tool_keybindings",
    piId: "build-tool-keybindings",
    description: "Build keybindings for all 7 AI coding tools — knows registerShortcut(), Key IDs, modifier combos, reserved keys, terminal compatibility.",
    body: `# build_tool_keybindings — Unified Keybinding Builder

You are a cross-tool keybinding expert. You know how to configure keyboard shortcuts for ALL 7 AI coding tools. Load this skill when the user wants to customize keybindings for any tool.

${TOOL_REF}
## Keybinding Systems Per Tool

### Pi / Antigravity
- **API**: \`registerShortcut()\`
- **Key IDs**: \`Key.up\`, \`Key.down\`, \`Key.enter\`, \`Key.escape\`
- **Modifiers**: \`Key.ctrl("c")\`, \`Key.shift("tab")\`, \`Key.alt("left")\`, \`Key.ctrlShift("p")\`
- **Config**: \`keybindings.json\` in tool config directory
- **Terminal compatibility**: macOS/Kitty/legacy

### Claude Code
- **Context scopes**: command mode, insert mode, watch mode
- **Rebindable**: most keys can be remapped
- **Reserved**: OS-level shortcuts (Ctrl+C, Ctrl+D)
- **Config**: \`keybindings.json\`

### OpenCode / Wo Coder
- Keybindings via config file
- Standard terminal key handling

${ONLINE_SOURCES}`,
  },
  {
    id: "build_tool_config",
    piId: "build-tool-config",
    description: "Configure all 7 AI coding tools — knows settings.json, providers, models, packages, keybindings, all configuration options.",
    body: `# build_tool_config — Unified Configuration Reference

You are a cross-tool configuration expert. You know how to configure ALL 7 AI coding tools. Load this skill when the user needs help configuring any tool.

${TOOL_REF}
## Config Systems Per Tool

### OpenCode
- **Main config**: \`~/.config/opencode/opencode.json\`
- **TUI config**: \`~/.config/opencode/tui.json\`
- **Project config**: \`.opencode/opencode.json\`
- **MCP servers**: opencode.json

### Claude Code
- **Global**: \`~/.claude/settings.json\`
- **MCP**: \`.claude/.mcp.json\` or embedded in settings.json
- **Project**: \`.claude/settings.json\`
- **Local**: \`.claude/settings.local.json\` (gitignored)

### Pi
- **Config**: \`~/.pi/agent/config.json\`
- **Project**: \`.agents/config.json\`
- **Providers**: OpenAI, Anthropic, Google, custom
- **Models**: configurable per provider

### Antigravity
- **Config**: \`~/.antigravity/antigravity.json\`
- **Providers**: Google, OpenAI, Anthropic
- **Sidecars**: sidecar.json
- **Hooks**: hooks.json

### Gemini CLI
- **Config**: \`~/.gemini/config.json\`
- **Providers**: Google

### Codex
- **Config**: \`~/.codex/config.yaml\`
- **Providers**: OpenAI

### Wo Coder
- **Config**: \`~/.wocoder/wocoder.json\`
- **Providers**: OpenAI, Anthropic, Google

${ONLINE_SOURCES}`,
  },
  {
    id: "build_tool_orchestrate",
    piId: "build-tool-orchestrate",
    description: "Orchestrate domain experts to research and build components for all 7 AI coding tools — knows team coordination, domain expert dispatch, research workflows.",
    body: `# build_tool_orchestrate — Unified Orchestration Skill

You are a cross-tool orchestration coordinator. You know how to coordinate domain experts to research documentation and build extensions, themes, skills, settings, prompt templates, and TUI components for ALL 7 AI coding tools.

${TOOL_REF}
## Orchestration Pattern

### Research Phase
1. Identify which tool(s) the user wants to build for
2. Fetch latest online docs for those tools (see sources below)
3. Cross-reference with local docs at \`thoughts/wayofmono/docs/tools/ai-coding-tools/\`
4. Identify format requirements (frontmatter, naming, allowed-tools)

### Build Phase
1. Coordinate domain experts (use task/subagent tools):
   - Skill builder for SKILL.md creation
   - Extension builder for plugin work
   - TUI builder for component work
   - Theme builder for theme work
2. Validate output against tool format specs
3. Run compliance checks

${ONLINE_SOURCES}`,
  },
];

function buildFrontmatter(name: string, description: string, allowedTools: string, tool: string): string {
  return `---
name: ${name}
description: >-
  ${description}
allowed-tools: ${allowedTools}
---

`;
}

function generateFile(tool: ToolName, skill: SkillDef): string {
  const cfg = cfgFor(tool, skill.id, skill.piId);
  const frontmatter = buildFrontmatter(cfg.name, skill.description, cfg.allowedTools, tool);
  return frontmatter + skill.body;
}

const ROOT = join(import.meta.dirname!, "..");

for (const skill of SKILLS) {
  console.log(`\nGenerating skill: ${skill.id}`);
  for (const tool of TOOLS) {
    const dirName = tool === "pi" ? skill.piId : skill.id;
    const targetDir = join(ROOT, tool, "skills", dirName);
    const targetFile = join(targetDir, "SKILL.md");
    Deno.mkdirSync(targetDir, { recursive: true });
    const content = generateFile(tool, skill);
    Deno.writeTextFileSync(targetFile, content);
    console.log(`  ✓ ${tool}/skills/${dirName}/SKILL.md`);
  }
}

console.log("\nDone.");
