---
name: skills-rules
description: >-
  Comprehensive Pi skill rules and conventions for Way of Mono shared workspace. Coordinates all agent
  skills across 7 AI coding tools (Pi, OpenCode, Claude Code, Codex, Antigravity CLI, Wo Coder, Cursor),
  manages lifecycle across packages and ~/.pi/agent directories, handles naming conventions,
  validation rules, and installation synchronization between @aiengineeringharness/wocode
  and all supported tool runtime locations.
allowed-tools: 'read, write, bash, edit, grep, glob, webfetch, websearch, question'
---

# Skills Rules & Conventions (Multi-Tool)

## Purpose

These rules coordinate agent skills across **all 7 AI coding tools** in the Way of Mono shared workspace:

1. **Pi** (`~/.pi/agent/skills/`) — kebab-case naming, Title Case tool names
2. **OpenCode** (`~/.config/opencode/skills/`) — snake_case naming, lowercase tool names  
3. **Claude Code** (`~/.claude/skills/`) — snake_case naming, Markdown commands
4. **Codex** (`~/.codex/skills/`) — snake_case naming, Rust-based fast startup
5. **Antigravity CLI** (`~/.antigravity/skills/`) — snake_case naming, Go runtime
6. **Wo Coder** (`~/.wocode/skills/`) — snake_case naming, kebab-case tool names
7. **Cursor** (IDE) — Full IDE experience with Cloud Agents

Ensures consistency between package-based installations and all runtime agent directories.

## Core Responsibilities

### 1. Tool-Specific Naming Conventions

Each AI coding tool has its own naming convention for skills:

| Tool | Directory Naming | YAML `name` Field | Tool Names in Skills |
|------|------------------|-------------------|---------------------|
| **Pi** | kebab-case (`tdd`) | kebab-case | Title Case (`Read`, `Write`) |
| **OpenCode** | snake_case (`tdd`) | snake_case | lowercase (`read`, `write`) |
| **Claude Code** | snake_case (`tdd`) | snake_case | Markdown commands |
| **Codex** | snake_case (`tdd`) | snake_case | Rust-native tools |
| **Antigravity CLI** | snake_case (`tdd`) | snake_case | Go runtime tools |
| **Wo Coder** | snake_case (`tdd`) | snake_case | kebab-case (`read`, `write`) |
| **Cursor** | IDE-specific | Markdown commands | Full IDE experience |

**Rule of thumb:**
- Pi uses kebab-case (unique among all tools)
- All others use snake_case for directories and YAML names
- Tool name casing varies by tool (Title Case, lowercase, or kebab-case)

### 2. Naming Convention Enforcement by Tool

#### Pi (kebab-case)
```yaml
name: tdd  # kebab-case, matches directory exactly
```
**Valid:** `tdd`, `read-file`, `write-code`  
**Invalid:** `t_dd`, `ReadFile`, `read_file` (underscore)

### 3. YAML Frontmatter Structure by Tool

#### Pi / Wo Coder (YAML frontmatter, kebab-case names)
```yaml
---
name: tdd
description: >-
  Test-driven development with red-green-refactor loop.
allowed-tools: read_file, write_file, run_command
---
```
**Key fields:**
- `name`: Must match directory name exactly (kebab-case for Pi)
- `description`: Multi-line YAML block explaining purpose and usage
- `allowed-tools`: Tool list (Title Case for Pi, lowercase for Wo Coder)

### 4. Directory Structure by Tool

#### Pi / Wo Coder
```bash
~/.pi/agent/skills/tdd/SKILL.md
~/.wocode/skills/tdd/SKILL.md
cwd/.wo/skills/tdd/SKILL.md
```

#### OpenCode / Antigravity CLI / Gemini CLI
```bash
~/.config/opencode/skills/tdd/SKILL.md
~/.antigravity/skills/tdd/SKILL.md
~/.gemini/skills/tdd/SKILL.md
cwd/.opencode/skills/tdd/SKILL.md
```

#### Claude Code
```bash
~/.claude/skills/tdd/SKILL.md
cwd/.claude/skills/tdd/SKILL.md
```

**Rule:** Directory naming must match YAML `name` field exactly for each tool.

### 5. Installation Synchronization by Tool

#### Pi / Wo Coder (`install.ts` manifest sync)
The AI Engineering Harness at `packages/@aiengineeringharness/wocode/` deploys to `~/.wocode/skills/` and `~/.pi/agent/skills/`. The `install.ts` script reads from a manifest and syncs skills between package and agent directories.

**Ensure:**
1. **Manifest entries** reflect actual directory names (kebab-case for Pi)
2. **Physical directories** match YAML `name` fields exactly
3. **Internal references** in SKILL.md content use consistent paths

### 6. Asset Path Conventions by Tool

#### Pi / Wo Coder (kebab-case paths)
When skills reference assets, use kebab-case throughout:

```yaml
# Good - kebab-case paths
- assets/templates/pitch_deck/master_deck.md
- assets/verticals/hvac-optimization/market_reference.yaml

# Bad - underscores in paths  
- assets/templates/pitch_deck/master_deck.md  # OK (underscore only in filename)
- assets/verticals/hvac_optimization/          # BAD! Use hvac-optimization
```

### 7. Validation Checklist Before Commit by Tool

#### Pi / Wo Coder
Before committing a skill change:

1. ✅ YAML `name` field uses kebab-case only
2. ✅ Directory name matches YAML `name` exactly  
3. ✅ All internal path references use consistent naming
4. ✅ No underscores in directory names or YAML fields
5. ✅ Manifest.json (if applicable) reflects new/updated skill
6. ✅ Test the skill manually to verify it loads correctly

### 8. Common Pitfalls & Fixes by Tool

#### Pi / Wo Coder: Underscore → Hyphen Conversion
```bash
# Rename directories with underscores
mv ~/.pi/agent/skills/investor_ready_doc_gen ~/.pi/agent/skills/investor-ready-doc-gen

# Update YAML name field
sed -i 's/name: investor_ready_doc_gen/name: investor-ready-doc-gen/' SKILL.md

# Fix internal path references in content
sed -i 's/hvac_optimization/hva c-optimization/g' SKILL.md  # Use proper escaping
```

#### OpenCode / Antigravity CLI / Gemini CLI: Checkpointing & Rewind
Some tools support automatic snapshots before file edits (opt-in). Use `/rewind` or `/undo` to revert changes.

```bash
# Enable checkpointing in settings.json
gemini config set general.checkpointing true
```

### 9. Auto-Discovery & Activation by Tool
#### Pi / Wo Coder
Skills are discovered automatically in the `skills/` directory. To explicitly activate:

```bash
/pi skill <skill-name>
```

Or via context keywords that match the YAML description.

#### OpenCode / Antigravity CLI / Gemini CLI
Skills auto-activate on matching task (via description). Management commands:

```bash
opencode skills list --all
gemini skills list --all
antigravity skills list --all
```

#### Claude Code
Skills in `.claude/skills/` are loaded automatically. Use `/skills enable <name>` to activate.

### 10. Testing Workflow by Tool
#### Pi / Wo Coder
After creating/updating a skill:

1. **Manual test:** Trigger the skill and verify it executes correctly
2. **Manifest check:** Ensure `install.ts` can find and load it
3. **Path validation:** Confirm all internal references work with new naming
4. **Integration test:** Verify it works alongside other skills in same directory

## Related Documentation by Tool

### Pi / Wo Coder (Primary)
- [README.md](./README.md) - General skill documentation overview  
- [../../pi/skills/](../../pi/skills/) - Pi-specific skill implementations  
- [../../packages/@aiengineeringharness/wocode/skills/](../../packages/@aiengineeringharness/wocode/skills/) - Package-based skills  
- [manifest.json](../..//packages/@aiengineeringharness/manifest.json) - Installation manifest

### OpenCode / Antigravity CLI / Gemini CLI

## OpenCode Usage Examples:

### Create a Plan (Read-Only Mode):
1. Switch to plan mode using **Tab** key
2. Describe what you want in plain language
3. Iterate on the plan with feedback or additional details
4. Attach images by dragging and dropping into terminal
5. Switch back to build mode with **Tab** again

```bash
<TAB>  # Enter plan mode
"Add authentication to /settings route, following the pattern from /notes route"
<TAB>  # Exit plan mode, enter build mode
"Sounds good! Go ahead and make the changes."
```

### Make Direct Changes:
For straightforward tasks, skip planning and go straight to implementation.

```bash
"We need to add authentication to the /settings route. Take a look at how this is
handled in the /notes route in @packages/functions/src/notes.ts and implement
the same logic in @packages/functions/src/settings.ts"
```

### Undo/Redo Changes:
If changes aren't what you wanted, use `/undo` or `/redo`.

```bash
/undo  # Revert last set of changes
/redo  # Re-apply reverted changes
```

### Share Conversations:
```bash
/share  # Creates a link to the current conversation and copies it to clipboard
```

### Customize OpenCode:
- [Pick a theme](https://opencode.ai/docs/themes)
- [Customize keybinds](https://opencode.ai/docs/keybinds)
- [Configure code formatters](https://opencode.ai/docs/formatters)
- [Create custom commands](https://opencode.ai/docs/commands)
- [OpenCode config](https://opencode.ai/docs/config)

### Directory naming:** snake_case (`tdd`)
### YAML `name`:** snake_case  
### Tool names in skills:** lowercase (`read`, `write`)
### Installation sync:** Via `install.ts` manifest or tool-specific installers
### Management commands:** `opencode/gemini/antigravity skills list --all`
### Key features:** Plan mode (Tab key), undo/redo, checkpointing & rewind, token caching, model routing, sandboxing, telemetry, custom commands, themes, keybinds, formatters

### Antigravity CLI Status:

Antigravity CLI appears to be in **early development** based on current documentation. The official docs at [antigravity.google/docs/cli-overview](https://antigravity.google/docs/cli-overview) show minimal content beyond the title and a Google Tag Manager script.

### Installation (from curl script):
```bash
curl -fsSL https://antigravity.google/install | bash
```

Check back for more comprehensive documentation as it matures.

### Directory naming:** snake_case (`tdd`)
### YAML `name`:** snake_case  
### Tool names in skills:** lowercase (`read`, `write`)
### Installation sync:** Via `install.ts` manifest or tool-specific installers
### Management commands:** `antigravity skills list --all`
### Key features:** (Early development, check back for updates)

### Gemini CLI Advanced Features:

### Checkpointing & Rewind:
Some tools support automatic snapshots before file edits (opt-in). Use `/rewind` or `/undo` to revert changes.

```bash
# Enable checkpointing in settings.json
gemini config set general.checkpointing true
```

### Token Caching:
Performance optimization for faster responses on repeated queries.

### Model Routing:
Automatic fallback resilience when primary model is unavailable.

### Sandboxing:
Isolate tool execution for safer operations.

### Telemetry:
Usage and performance metric details for monitoring.

### Directory naming:** snake_case (`tdd`)
### YAML `name`:** snake_case  
### Tool names in skills:** lowercase (`read`, `write`)
### Installation sync:** Via `install.ts` manifest or tool-specific installers (npm install -g @google/gemini-cli)
### Management commands:** `gemini skills list --all`
### Key features:** Checkpointing & rewind, token caching, model routing, sandboxing, telemetry, custom commands, enterprise configuration, ignore files (.geminiignore), project context (GEMINI.md), system prompt override, themes, trusted folders

### Claude Code Advanced Features:

### Agent Teams & Sub-agents:
Spawn multiple Claude Code agents that work on different parts of a task simultaneously. A lead agent coordinates the work, assigns subtasks, and merges results.

To run several full sessions in parallel and watch them from one screen, use [background agents](https://code.claude.com/docs/en/agent-view). For fully custom workflows, the [Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview) lets you build your own agents powered by Claude Code's tools and capabilities.

### Remote Control:
Sessions aren't tied to a single surface. Move work between environments as your context changes:

- Step away from your desk and keep working from your phone or any browser with [Remote Control](https://code.claude.com/docs/en/remote-control)
- Message `@Claude` in Slack with a bug report and get a pull request back
- Kick off a long-running task on the web, then pull it into your terminal with `claude --teleport`

### Desktop Scheduled Tasks:
Run Claude on a schedule to automate work that repeats: morning PR reviews, overnight CI failure analysis, weekly dependency audits.

### Chrome Debugging:
Debug live web applications directly in the browser environment.

### Directory naming:** snake_case (`tdd`)
### YAML `name`:** snake_case  
### Tool names in skills:** Markdown commands
### Installation sync:** Via `install.ts` manifest or tool-specific installers (Homebrew, WinGet, etc.)
### Management commands:** `/skills enable <name>` to activate skills
### Key features:** Agent teams & sub-agents, remote control, desktop scheduled tasks, Chrome debugging, inline diffs, @-mentions, plan review, conversation history

### Agent Teams & Sub-agents:
Spawn multiple Claude Code agents that work on different parts of a task simultaneously. A lead agent coordinates the work, assigns subtasks, and merges results.

To run several full sessions in parallel and watch them from one screen, use [background agents](https://code.claude.com/docs/en/agent-view). For fully custom workflows, the [Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview) lets you build your own agents powered by Claude Code's tools and capabilities.

### Remote Control:
Sessions aren't tied to a single surface. Move work between environments as your context changes:

- Step away from your desk and keep working from your phone or any browser with [Remote Control](https://code.claude.com/docs/en/remote-control)
- Message `@Claude` in Slack with a bug report and get a pull request back
- Kick off a long-running task on the web, then pull it into your terminal with `claude --teleport`

### Desktop Scheduled Tasks:
Run Claude on a schedule to automate work that repeats: morning PR reviews, overnight CI failure analysis, weekly dependency audits.

### Chrome Debugging:
Debug live web applications directly in the browser environment.

### Directory naming:** snake_case (`tdd`)
### YAML `name`:** snake_case  
### Tool names in skills:** Markdown commands
### Installation sync:** Via `install.ts` manifest or tool-specific installers (Homebrew, WinGet, etc.)
### Management commands:** `/skills enable <name>` to activate skills
### Key features:** Agent teams & sub-agents, remote control, desktop scheduled tasks, Chrome debugging, inline diffs, @-mentions, plan review, conversation history

### Cursor (IDE)
- IDE-specific skill documentation in project root
- Cloud Agent marketplace integration  

## Example: Creating a New Skill by Tool

### Pi / Wo Coder (Primary)

```bash
# 1. Create directory with kebab-case name
mkdir ~/.pi/agent/skills/my-new-skill

# 2. Create SKILL.md with proper structure
cat > ~/.pi/agent/skills/my-new-skill/SKILL.md << 'EOF'
---
name: my-new-skill
description: >-
  This is a new skill that does something...
allowed-tools: read_file, write_file, run_command
---

# My New Skill

Description of what it does...
EOF

# 3. Update manifest.json if needed
echo '{"name": "my-new-skill", ...}' >> /home/zerwiz/wayofmono/packages/@aiengineeringharness/manifest.json

# 4. Test the skill
/pi skill my-new-skill
```

### OpenCode / Antigravity CLI / Gemini CLI

```bash
mkdir ~/.config/opencode/skills/my-new-skill
cat > ~/.config/opencode/skills/my-new-skill/SKILL.md << 'EOF'
---
name: my_new_skill  # snake_case for these tools
description: >-
  This is a new skill that does something...
allowed-tools: read_file, write_file
---

# My New Skill

Description of what it does...
EOF
```

### Claude Code

```bash
mkdir ~/.claude/skills/my-new-skill
cat > ~/.claude/skills/my-new-skill/SKILL.md << 'EOF'
---
name: my_new_skill  # snake_case for these tools
description: >-
  This is a new skill that does something...
allowed-tools: read_file, write_file
---

# My New Skill

Description of what it does...
EOF
```

## See Also by Tool

### Pi / Wo Coder (Primary)
- [Pi Skill Schema](../../pi/skills/tdd/SKILL.md) - Example Pi skill implementation  
- [Build Tool Skill](../../packages/@aiengineeringharness/wocode/skills/build_tool/SKILL.md) - Build tool integration example  
- [Auto Ticket Creator](../../packages/@aiengineeringharness/wocode/skills/auto-ticket-creator/SKILL.md) - Auto-discovery example  

---

## Tool-Specific Metadata

### Pi / Wo Coder (Primary)

## Pi Philosophy: Primitives, Not Features

Pi is designed as a minimal, extensible foundation where features can be built yourself through [extensions](https://github.com/earendil-works/pi#extensions), [skills](https://github.com/earendil-works/pi#skills), or third-party packages. This keeps the core minimal while letting you shape Pi to fit your workflow.

### What We Didn't Build (Pi):
- **No MCP** — Build CLI tools with READMEs, or build an extension that adds MCP support
- **No sub-agents** — Spawn Pi instances via tmux, or build your own with extensions
- **No permission popups** — Run in a container, or build your own confirmation flow inline
- **No plan mode** — Write plans to files, or build it with extensions
- **No built-in to-dos** — Use a TODO.md file, or build your own with extensions
- **No background bash** — Use tmux. Full observability, direct interaction

### Pi Extensions Examples:
- [Sub-agents](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions/subagent/)
- [Plan mode](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions/plan-mode/)
- [Permission gates](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions/permission-gate.ts)
- [Path protection](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions/protected-paths.ts)
- [SSH execution](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions/ssh.ts)
- [Sandboxing](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions/sandbox/)

### Extension API:
See the official [ExtensionAPI docs](https://badlogic-pi-mono.mintlify.app/api/coding-agent/extension-api) for details on:
- `registerTool()` — Register a custom tool that the agent can invoke
- `registerCommand()` — Register a slash command users can invoke
- `on()` — Subscribe to extension events (agent_start, tool_call, session_start, etc.)
- `exec()` — Execute a bash command
- `showDialog()` / `showWidget()` — Display dialogs and widgets in the TUI

### Directory naming:** kebab-case (`tdd`)
### YAML `name`:** kebab-case  
### Tool names in skills:** Title Case (`Read`, `Write`)
### Installation sync:** Via `install.ts` manifest
### Management commands:** `/pi skill <skill-name>` to activate skills explicitly
### Key features:** Primitives, not features philosophy; extensions for sub-agents, plan mode, permission gates, path protection, SSH execution, sandboxing, MCP integration, custom editors, status bars, overlays

### OpenCode / Antigravity CLI / Gemini CLI

## OpenCode Usage Examples:

### Create a Plan (Read-Only Mode):
1. Switch to plan mode using **Tab** key
2. Describe what you want in plain language
3. Iterate on the plan with feedback or additional details
4. Attach images by dragging and dropping into terminal
5. Switch back to build mode with **Tab** again

```bash
<TAB>  # Enter plan mode
"Add authentication to /settings route, following the pattern from /notes route"
<TAB>  # Exit plan mode, enter build mode
"Sounds good! Go ahead and make the changes."
```

### Make Direct Changes:
For straightforward tasks, skip planning and go straight to implementation.

```bash
"We need to add authentication to the /settings route. Take a look at how this is
handled in the /notes route in @packages/functions/src/notes.ts and implement
the same logic in @packages/functions/src/settings.ts"
```

### Undo/Redo Changes:
If changes aren't what you wanted, use `/undo` or `/redo`.

```bash
/undo  # Revert last set of changes
/redo  # Re-apply reverted changes
```

### Share Conversations:
```bash
/share  # Creates a link to the current conversation and copies it to clipboard
```

### Customize OpenCode:
- [Pick a theme](https://opencode.ai/docs/themes)
- [Customize keybinds](https://opencode.ai/docs/keybinds)
- [Configure code formatters](https://opencode.ai/docs/formatters)
- [Create custom commands](https://opencode.ai/docs/commands)
- [OpenCode config](https://opencode.ai/docs/config)

### Directory naming:** snake_case (`tdd`)
### YAML `name`:** snake_case  
### Tool names in skills:** lowercase (`read`, `write`)
### Installation sync:** Via `install.ts` manifest or tool-specific installers
### Management commands:** `opencode/gemini/antigravity skills list --all`
### Key features:** Plan mode (Tab key), undo/redo, checkpointing & rewind, token caching, model routing, sandboxing, telemetry, custom commands, themes, keybinds, formatters

### Claude Code Advanced Features:

### Agent Teams & Sub-agents:
Spawn multiple Claude Code agents that work on different parts of a task simultaneously. A lead agent coordinates the work, assigns subtasks, and merges results.

To run several full sessions in parallel and watch them from one screen, use [background agents](https://code.claude.com/docs/en/agent-view). For fully custom workflows, the [Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview) lets you build your own agents powered by Claude Code's tools and capabilities.

### Remote Control:
Sessions aren't tied to a single surface. Move work between environments as your context changes:

- Step away from your desk and keep working from your phone or any browser with [Remote Control](https://code.claude.com/docs/en/remote-control)
- Message `@Claude` in Slack with a bug report and get a pull request back
- Kick off a long-running task on the web, then pull it into your terminal with `claude --teleport`

### Desktop Scheduled Tasks:
Run Claude on a schedule to automate work that repeats: morning PR reviews, overnight CI failure analysis, weekly dependency audits.

### Chrome Debugging:
Debug live web applications directly in the browser environment.

### Directory naming:** snake_case (`tdd`)
### YAML `name`:** snake_case  
### Tool names in skills:** Markdown commands
### Installation sync:** Via `install.ts` manifest or tool-specific installers (Homebrew, WinGet, etc.)
### Management commands:** `/skills enable <name>` to activate skills
### Key features:** Agent teams & sub-agents, remote control, desktop scheduled tasks, Chrome debugging, inline diffs, @-mentions, plan review, conversation history

### Cursor Advanced Features:

### Agent Mode:
Full IDE experience with Cloud Agents integrated directly into the editor.

### Rules for AI:
Custom instructions that guide AI behavior within your project context. See [Rules for AI](https://docs.cursor.com/context/rules-for-ai).

### MCP Servers:
Connect to external data sources and tools through Model Context Protocol (MCP) integration.

### Skills:
Package repeatable workflows your team can share, like `/review-pr` or `/deploy-staging`.

### Models:
Multiple model options including Claude, Gemini, GPT, and Cursor Composer variants. See [Models](https://docs.cursor.com/docs/agent/models).

### Teams & Enterprise:
Collaboration features for teams and enterprise deployments. See [Teams & Enterprise](https://docs.cursor.com/docs/teams/enterprise).

### Directory naming:** IDE-specific
### YAML `name`:** Markdown commands  
### Tool names in skills:** Full IDE experience
### Installation sync:** Via `install.ts` manifest or tool-specific installers
### Management commands:** N/A (IDE-based, uses Cloud Agents)
### Key features:** Agent mode, rules for AI, MCP servers, skills (e.g., `/review-pr`, `/deploy-staging`), multiple model options (Claude, Gemini, GPT, Cursor Composer), teams & enterprise collaboration

---

## Official Homepages & Documentation

### Pi / Wo Coder
- **Pi (origin):** https://pi.dev/
- **Wo Coder (monorepo fork):** Custom docs in `./wo-coder.md`
- **Extension API:** https://badlogic-pi-mono.mintlify.app/api/coding-agent/extension-api
- **GitHub:** https://github.com/earendil-works/pi

### OpenCode / Antigravity CLI / Gemini CLI

## OpenCode Usage Examples:

### Create a Plan (Read-Only Mode):
1. Switch to plan mode using **Tab** key
2. Describe what you want in plain language
3. Iterate on the plan with feedback or additional details
4. Attach images by dragging and dropping into terminal
5. Switch back to build mode with **Tab** again

```bash
<TAB>  # Enter plan mode
"Add authentication to /settings route, following the pattern from /notes route"
<TAB>  # Exit plan mode, enter build mode
"Sounds good! Go ahead and make the changes."
```

### Make Direct Changes:
For straightforward tasks, skip planning and go straight to implementation.

```bash
"We need to add authentication to the /settings route. Take a look at how this is
handled in the /notes route in @packages/functions/src/notes.ts and implement
the same logic in @packages/functions/src/settings.ts"
```

### Undo/Redo Changes:
If changes aren't what you wanted, use `/undo` or `/redo`.

```bash
/undo  # Revert last set of changes
/redo  # Re-apply reverted changes
```

### Share Conversations:
```bash
/share  # Creates a link to the current conversation and copies it to clipboard
```

### Customize OpenCode:
- [Pick a theme](https://opencode.ai/docs/themes)
- [Customize keybinds](https://opencode.ai/docs/keybinds)
- [Configure code formatters](https://opencode.ai/docs/formatters)
- [Create custom commands](https://opencode.ai/docs/commands)
- [OpenCode config](https://opencode.ai/docs/config)

### Directory naming:** snake_case (`tdd`)
### YAML `name`:** snake_case  
### Tool names in skills:** lowercase (`read`, `write`)
### Installation sync:** Via `install.ts` manifest or tool-specific installers
### Management commands:** `opencode/gemini/antigravity skills list --all`
### Key features:** Plan mode (Tab key), undo/redo, checkpointing & rewind, token caching, model routing, sandboxing, telemetry, custom commands, themes, keybinds, formatters

### Antigravity CLI Status:

Antigravity CLI appears to be in **early development** based on current documentation. The official docs at [antigravity.google/docs/cli-overview](https://antigravity.google/docs/cli-overview) show minimal content beyond the title and a Google Tag Manager script.

### Installation (from curl script):
```bash
curl -fsSL https://antigravity.google/install | bash
```

Check back for more comprehensive documentation as it matures.

### Directory naming:** snake_case (`tdd`)
### YAML `name`:** snake_case  
### Tool names in skills:** lowercase (`read`, `write`)
### Installation sync:** Via `install.ts` manifest or tool-specific installers
### Management commands:** `antigravity skills list --all`
### Key features:** (Early development, check back for updates)

### Gemini CLI Advanced Features:

### Checkpointing & Rewind:
Some tools support automatic snapshots before file edits (opt-in). Use `/rewind` or `/undo` to revert changes.

```bash
# Enable checkpointing in settings.json
gemini config set general.checkpointing true
```

### Token Caching:
Performance optimization for faster responses on repeated queries.

### Model Routing:
Automatic fallback resilience when primary model is unavailable.

### Sandboxing:
Isolate tool execution for safer operations.

### Telemetry:
Usage and performance metric details for monitoring.

### Directory naming:** snake_case (`tdd`)
### YAML `name`:** snake_case  
### Tool names in skills:** lowercase (`read`, `write`)
### Installation sync:** Via `install.ts` manifest or tool-specific installers (npm install -g @google/gemini-cli)
### Management commands:** `gemini skills list --all`
### Key features:** Checkpointing & rewind, token caching, model routing, sandboxing, telemetry, custom commands, enterprise configuration, ignore files (.geminiignore), project context (GEMINI.md), system prompt override, themes, trusted folders

### Claude Code Advanced Features:

### Agent Teams & Sub-agents:
Spawn multiple Claude Code agents that work on different parts of a task simultaneously. A lead agent coordinates the work, assigns subtasks, and merges results.

To run several full sessions in parallel and watch them from one screen, use [background agents](https://code.claude.com/docs/en/agent-view). For fully custom workflows, the [Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview) lets you build your own agents powered by Claude Code's tools and capabilities.

### Remote Control:
Sessions aren't tied to a single surface. Move work between environments as your context changes:

- Step away from your desk and keep working from your phone or any browser with [Remote Control](https://code.claude.com/docs/en/remote-control)
- Message `@Claude` in Slack with a bug report and get a pull request back
- Kick off a long-running task on the web, then pull it into your terminal with `claude --teleport`

### Desktop Scheduled Tasks:
Run Claude on a schedule to automate work that repeats: morning PR reviews, overnight CI failure analysis, weekly dependency audits.

### Chrome Debugging:
Debug live web applications directly in the browser environment.

### Directory naming:** snake_case (`tdd`)
### YAML `name`:** snake_case  
### Tool names in skills:** Markdown commands
### Installation sync:** Via `install.ts` manifest or tool-specific installers (Homebrew, WinGet, etc.)
### Management commands:** `/skills enable <name>` to activate skills
### Key features:** Agent teams & sub-agents, remote control, desktop scheduled tasks, Chrome debugging, inline diffs, @-mentions, plan review, conversation history
- **Docs:** https://code.claude.com/docs/en/overview
- **Tools Reference:** https://code.claude.com/docs/en/tools-reference
- **CLI Reference:** https://code.claude.com/docs/en/cli-reference
- **Agent SDK:** https://code.claude.com/docs/en/agent-sdk

### Codex Advanced Features:

### Image Inputs & Generation:
Attach screenshots or design specs so Codex reads them alongside your prompt. Generate or edit images directly in the CLI, and attach references when you want Codex to iterate on an existing asset.

### Local Code Review:
Get your code reviewed by a separate Codex agent before you commit or push your changes.

### Cloud Tasks:
Launch a Codex Cloud task, choose environments, and apply the resulting diffs without leaving your terminal.

### Windows Setup:
On Windows, run Codex natively in PowerShell with the Windows sandbox, or use WSL2 when you need a Linux-native environment. See the [Windows setup guide](https://developers.openai.com/codex/windows).

### Directory naming:** snake_case (`tdd`)
### YAML `name`:** snake_case  
### Tool names in skills:** Rust-native tools
### Installation sync:** Via `install.ts` manifest or tool-specific installers (curl script for macOS/Linux, Windows setup guide)
### Management commands:** N/A (interactive TUI session)
### Key features:** Image inputs & generation, local code review, cloud tasks, scripting with exec command, Model Context Protocol (MCP), approval modes, control model and reasoning (`/model`)

### Wo Coder (Monorepo Native)

## Wo Coder Usage Examples:

### Create a Plan (Read-Only Mode):
1. Switch to plan mode using **Tab** key
2. Describe what you want in plain language
3. Iterate on the plan with feedback or additional details
4. Attach images by dragging and dropping into terminal
5. Switch back to build mode with **Tab** again

```bash
<TAB>  # Enter plan mode
"Add authentication to /settings route, following the pattern from /notes route"
<TAB>  # Exit plan mode, enter build mode
"Sounds good! Go ahead and make the changes."
```

### Make Direct Changes:
For straightforward tasks, skip planning and go straight to implementation.

```bash
"We need to add authentication to the /settings route. Take a look at how this is
handled in the /notes route in @packages/functions/src/notes.ts and implement
the same logic in @packages/functions/src/settings.ts"
```

### Undo/Redo Changes:
If changes aren't what you wanted, use `/undo` or `/redo`.

```bash
/undo  # Revert last set of changes
/redo  # Re-apply reverted changes
```

### Share Conversations:
```bash
/share  # Creates a link to the current conversation and copies it to clipboard
```

### Customize Wo Coder:
- [Pick a theme](https://opencode.ai/docs/themes)
- [Customize keybinds](https://opencode.ai/docs/keybinds)
- [Configure code formatters](https://opencode.ai/docs/formatters)
- [Create custom commands](https://opencode.ai/docs/commands)
- [Wo Coder config](https://opencode.ai/docs/config)

### Directory naming:** kebab-case (`tdd`)
### YAML `name`:** kebab-case  
### Tool names in skills:** snake_case (read_file, write_file)
### Installation sync:** Via `install.ts` manifest or tool-specific installers
### Management commands:** `/pi skill <skill-name>` to activate skills explicitly
### Key features:** Primitives, not features philosophy; extensions for sub-agents, plan mode, permission gates, path protection, SSH execution, sandboxing, MCP integration, custom editors, status bars, overlays

### Cursor Advanced Features:

### Agent Mode:
Full IDE experience with Cloud Agents integrated directly into the editor.

### Rules for AI:
Custom instructions that guide AI behavior within your project context. See [Rules for AI](https://docs.cursor.com/context/rules-for-ai).

### MCP Servers:
Connect to external data sources and tools through Model Context Protocol (MCP) integration.

### Skills:
Package repeatable workflows your team can share, like `/review-pr` or `/deploy-staging`.

### Models:
Multiple model options including Claude, Gemini, GPT, and Cursor Composer variants. See [Models](https://docs.cursor.com/docs/agent/models).

### Teams & Enterprise:
Collaboration features for teams and enterprise deployments. See [Teams & Enterprise](https://docs.cursor.com/docs/teams/enterprise).

### Directory naming:** IDE-specific
### YAML `name`:** Markdown commands  
### Tool names in skills:** Full IDE experience
### Installation sync:** Via `install.ts` manifest or tool-specific installers
### Management commands:** N/A (IDE-based, uses Cloud Agents)
### Key features:** Agent mode, rules for AI, MCP servers, skills (e.g., `/review-pr`, `/deploy-staging`), multiple model options (Claude, Gemini, GPT, Cursor Composer), teams & enterprise collaboration

---

## Installation Scripts & Verification

### `install.ts` (Cross-Platform, Deno-based)
The primary installation script at [`packages/@aiengineeringharness/install.ts`](../../packages/@aiengineeringharness/install.ts) uses **Deno** to:

1. **Read manifest.json** — Loads component definitions from the monorepo
2. **Fetch source files** — Downloads skill/agent/command files from GitHub or local paths
3. **Sync to target directories** — Deploys to `~/.pi/`, `~/.claude/`, `~/.opencode/`, etc.
4. **Handle conflicts** — Prompts before overwriting existing files (unless `--yes`)
5. **Clean stale files** — Removes non-manifest files from target directories
6. **Track versions** — Writes `.harness-version` for future update detection
7. **Patch Deno wrapper** — Embeds `--reload` flag to bypass cache on updates
8. **Report skills** — Sends skill inventory to CTO dashboard telemetry API
9. **Interactive picker** — Checkbox UI for selecting specific components
10. **Compliance check** — Validates all tools match manifest (no missing/stale/dangling)

**Key Features:**
- **LCS-based diffing** — Computes unified diffs using longest common subsequence algorithm
- **Multi-tool support** — Installs configs for all 7 AI coding tools in one command
- **Dry-run mode** — Preview changes without writing files (`--dry-run`)
- **Local install** — Install to project-local directories instead of home (e.g., `./pi/agent/skills/`)
- **Repo mode** — Clone repository + GNU Stow symlinks for power users

**Usage Examples:**
```bash
# Quick start: install CLI with Matrix output
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --install-cli

# Install all tool configs at once
deno run -A ...install.ts --tool=all --yes

# Install specific tool (e.g., Claude)
deno run -A ...install.ts --tool=claude

# Full harness sync: CLI + docs + all tools + compliance check
deno run -A ...install.ts --update

# Preview without writing files
deno run -A ...install.ts --dry-run

# Interactive checkbox picker for component selection
deno run -A ...install.ts --interactive
```

### `install.ps1` (Windows PowerShell)
The Windows-specific installer at [`packages/@aiengineeringharness/install.ps1`](../../packages/@aiengineeringharness/install.ps1) wraps the Deno script:

**Key Features:**
- **Auto-detects Deno** — Checks if Deno is installed; prompts to install via winget/official script
- **PowerShell-native UI** — Uses `Read-Host` for interactive input, colored output
- **Same functionality as `install.ts`** — All flags (`--tool`, `--update`, `--compliance`, etc.) work identically
- **Cross-platform CLI** — After installation, use `ai-harness` from any terminal (PowerShell, CMD, WSL)

**Usage Examples:**
```powershell
# Install CLI binary
.\install.ps1 -InstallCli

# Install all tool configs
.\install.ps1 -Tool all -Yes

# Full harness sync
.\install.ps1 -Update

# Compliance check
.\install.ps1 -Compliance
```

### Verification Workflow
To verify skills are correctly installed and synced:

```bash
# 1. Check installed versions against manifest
deno run -A ...install.ts --check

# 2. Validate all tools match manifest (no missing/stale/dangling)
deno run -A ...install.ts --compliance

# 3. Review compliance report
# Output shows:
#   ✓ tool_name: /path/to/dir  (all OK)
#   ✗ tool_name: 2 stale file(s) in target  (needs cleanup)
#   ⚠ tool_name: 1 missing src file(s)  (manifest needs update)

# 4. Interactive prune of non-manifest files
deno run -A ...install.ts --prune
```

### Manifest-Driven Architecture
Both scripts use a **single source of truth** manifest at [`packages/@aiengineeringharness/manifest.json`](../../packages/@aiengineeringharness/manifest.json):

```json
{
  "version": "1.2.3",
  "tools": {
    "claude": {
      "target": "/home/user/.claude",
      "components": {
        "skills": {"description": "Auto-triggered skills", "files": [{"src": "../skills/tdd/SKILL.md", "dest": "skills/tdd/SKILL.md"}]}
      }
    },
    ...
  }
}
```

**Manifest entries define:**
- **Source paths** — Where files live in the monorepo (`../skills/...`)
- **Destination paths** — Where they deploy to user's home (e.g., `~/.claude/skills/`)
- **Component descriptions** — Human-readable labels for interactive selection
- **Version tracking** — `.harness-version` file stores current version for update detection

### Tool-Specific Installation Paths

| Tool | Global Path | Project Path |
|------|-------------|--------------|
| **Pi / Wo Coder** | `~/.pi/agent/skills/` | `<cwd>/.wo/skills/` |
| **OpenCode / Antigravity / Gemini** | `~/.config/opencode/skills/` | `<cwd>/.opencode/skills/` |
| **Claude Code** | `~/.claude/skills/` | `<cwd>/.claude/skills/` |
| **Codex** | `~/.codex/skills/` | `<cwd>/.codex/skills/` |
| **Wo Coder (native)** | `~/.wocode/skills/` | `<cwd>/.wo/skills/` |

---

**Last Updated:** 2026-06-13  
**Version:** 1.0.0  
**Maintained by:** Way of Mono Shared Workspace Team