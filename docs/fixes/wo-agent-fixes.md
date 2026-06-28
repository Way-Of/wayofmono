# wouser (wo-agent) Fixes & Release Notes

## v1.0.6 — 2026-06-28

### Added: Short-Form Auto-Resolution for Skill/Agent/Extension Install
- **New feature**: `wouser skill install investor-ready-doc-gen` auto-resolves to `npm:@wayofmono/skill-investor-ready-doc-gen`
- **Applies to**: `skill install`, `agent install`, `extension install` — all three resource types
- **No npm: prefix needed**: Users can just type the skill name
- **Auto-resolves under @wayofmono scope**: Short form → `npm:@wayofmono/skill-<name>`, `npm:@wayofmono/agent-<name>`, `npm:@wayofmono/extension-<name>`

### Added: Complete Update Flow for Dependency Consumers
- **After npm update**: `npm update @wayofmono/skill-investor-ready-doc-gen`
- **Re-register skills**: `wouser skill update` — Re-reads SKILL.md from updated packages
- **Bulk update all**: `wouser skill update` (no args) updates all registered skills
- **Single update**: `wouser skill update investor-ready-doc-gen` for specific skill

### Files modified
- `src/skill-cli.ts` — Added short-form auto-resolution in `handleInstall()`
- `src/skill-cli.ts` — Added `isLocalPath` import for proper source detection
- Auto-resolution logic handles: npm:, git:, http(s):, local paths, and short forms

### Complete User Update Workflow
```bash
# 1. Update npm packages to latest versions
npm update @wayofmono/skill-investor-ready-doc-gen @wayofmono/skill-tdd

# 2. Re-register skills from updated packages
wouser skill update

# 3. Verify updated skills are loaded
wouser skill list

# 4. Skills automatically available in next chat session
```

---

## v1.0.5 — 2026-06-28

### Added: Resource Management CLI (skills, agents, extensions as npm deps)
- **New command**: `wouser skill install <source>` — Register a skill from npm package
- **New command**: `wouser skill remove <source>` — Unregister a skill
- **New command**: `wouser skill discover` — Scan node_modules for unregistered skills
- **New command**: `wouser skill list` — List registered skills
- **New command**: `wouser skill update [source]` — Refresh after npm update
- **Same CLI**: `wouser agent <command>` and `wouser extension <command>` for agents/extensions
- **New file**: `.wo/manifest.json` — tracks registered resources (skills, agents, extensions)
- **Auto-loading**: Skills from manifest are loaded automatically on startup
- **Source formats**: `npm:@wayofmono/skill-foo` or short `foo` (auto-resolves)

### How to use
```bash
npm install @wayofmono/skill-investor-ready-doc-gen
wouser skill install npm:@wayofmono/skill-investor-ready-doc-gen
wouser skill list
```

### Files added
- `src/core/skill-manifest.ts` — Manifest read/write + discovery for all 3 types
- `src/skill-cli.ts` — Generic resource CLI handler

### Files modified
- `src/main.ts` — Added routing for `skill`/`agent`/`extension` subcommands
- `src/core/skills.ts` — Manifest-based skill loading in `loadSkills()`
- `src/cli/args.ts` — Updated help text
- `src/index.ts` — New exports for manifest types

### Constraints
- Skills auto-load from manifest; agents and extensions require manual `--skill`/`--extension` for now (auto-loading in future iteration)
- Only `npm:` source type currently; `github:` and `https:` planned

---

## v1.0.4 — 2026-06-14

### Fixed: npm workspace dependencies
- **Changed**: `workspace:*` → explicit versions (`^1.0.4`)
- **Dependencies**: `@wayofmono/wo-agent-core`, `@wayofmono/wo-ai`, `@wayofmono/wo-tui`
- **Reason**: npm doesn't support pnpm's `workspace:*` protocol

### Published: First working npm global install
- `npm install -g @wayofmono/wo-agent` now works

---

## v1.0.3 and earlier — Pre-fixes

### Known Issues (now fixed)
- ❌ `workspace:*` in npm-published package (npm incompatible)
- ❌ CONFIG_DIR_NAME `.wo` shared with wocode (wrong)

---

## Installation Verification

### ✅ Working (v1.0.4+)
```bash
npm install -g @wayofmono/wo-agent
wouser --init
# Creates .wo/agent/ with models.json (Ollama), settings.json
```

### ✅ Config Directory Structure
```
~/.wo/
├── agent/
│   ├── models.json      # Ollama default: qwen3.5:9b
│   ├── settings.json    # Default provider: ollama
│   ├── bin/             # fd, rg binaries
│   ├── skills/          # Harness skills (when installed)
│   ├── prompts/         # Prompt templates
│   ├── themes/          # Custom themes
│   └── extensions/      # Extensions (subagent, open-editor, theme-cycler)
└── ...
```

### Key Distinction: wouser vs wocode
| Tool | Package | Config Dir | Purpose |
|------|---------|------------|---------|
| **wouser** | `@wayofmono/wo-agent` | `~/.wo/` | General-purpose user agent (SDK + CLI) |
| **wocode** | `@wayofmono/wo-coding-agent` | `~/.wocode/` | Coding-specific CLI assistant |

These are SEPARATE tools with separate configs - do NOT conflate them.