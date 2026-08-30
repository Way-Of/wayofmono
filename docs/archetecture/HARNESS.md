# AI Engineering Harness Architecture

The AI Engineering Harness is the central orchestration layer managing skills, agents, and configurations across 7 AI coding tools.

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI ENGINEERING HARNESS                       │
├─────────────────────────────────────────────────────────────────┤
│  manifest.json (Source of Truth)                                │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              skill-adapter (Platform Abstraction)       │   │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │   │
│  │  │ O/C │ │Claud│ │Gem  │ │ Pi  │ │Codex│ │Anti │      │   │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘      │   │
│  └─────────────────────────────────────────────────────────┘   │
│       │                                                         │
│       ▼                                                         │
│  install.ts (Deno CLI) ◄──► setup.sh (GNU Stow)                │
└─────────────────────────────────────────────────────────────────┘
```

## manifest.json Structure

```json
{
  "version": "1.0",
  "skills": [
    {
      "name": "skill-name",
      "description": "What this skill does",
      "category": "development|infrastructure|documentation|utility",
      "platforms": ["opencode", "claude", "gemini", "pi", "codex", "antigravity", "wocoder"],
      "source": "packages/@aiengineeringharness/skills/skill-name/",
      "frontmatter": {
        "name": "skill-name",
        "description": "...",
        "version": "1.0.0",
        "allowed-tools": ["read", "write", "bash", "grep", "glob"]
      }
    }
  ],
  "agents": [...],
  "commands": [...]
}
```

## Platform Adapters (skill-adapter)

Each platform has a dedicated adapter handling:

| Platform | Config Dir | Skill Dir Naming | Frontmatter Format |
|----------|------------|------------------|-------------------|
| OpenCode | `~/.config/opencode/` | snake_case | YAML + Markdown |
| Claude Code | `~/.claude/` | snake_case | YAML + Markdown |
| Gemini CLI | `~/.gemini/` | snake_case | YAML + Markdown |
| Pi | `~/.pi/agent/` | kebab-case | YAML + Markdown |
| Codex | `~/.codex/` | snake_case | YAML + Markdown |
| Antigravity | `~/.antigravity/` | snake_case | YAML + Markdown |
| Wo Coder | `~/.wocoder/` | snake_case | YAML + Markdown |

### Critical Rules

1. **OpenCode**: Skill directory name MUST match frontmatter `name` exactly (regex: `^[a-z0-9]+(-[a-z0-9]+)*$`)
2. **Pi**: Uses kebab-case for skill directories
3. **All**: Frontmatter `name` field is the canonical identifier

## Installer (`install.ts`)

Deno-based CLI with subcommands:

```bash
# Install for specific tool
deno run -A install.ts --tool=opencode

# Install for all tools
deno run -A install.ts --tool=all --yes

# Update existing
deno run -A install.ts --update

# Report skills to CTO Dashboard
deno run -A install.ts --report-skills
```

### Installation Flow

1. Parse `manifest.json` for skills/components
2. For each target platform:
   - Resolve platform-specific paths
   - Apply GNU Stow for dotfile management (via `setup.sh`)
   - Write platform-specific configs (settings.json, keybindings.json, etc.)
   - Register skills/agents/commands per platform conventions
3. Verify installation health

## GNU Stow (`setup.sh`)

Manages dotfile symlinks for:
- Platform configs (settings, keybindings, themes)
- Skills directories
- Agent definitions
- Prompt templates

```bash
# Stow structure
packages/@aiengineeringharness/opencode/  → ~/.config/opencode/
packages/@aiengineeringharness/claude/    → ~/.claude/
# etc.
```

## Pipeline Scripts (`scripts/`)

| Script | Purpose |
|--------|---------|
| `docs-sync.ts` | Fetch latest docs from all AI tool sources, update reference docs |
| `compliance.ts` | Validate skill/agent manifests against platform schemas |
| `migrate.ts` | Migrate legacy formats to current manifest structure |

## Skill Lifecycle

```
Create Skill
     │
     ▼
Add to manifest.json
     │
     ▼
Run install.ts --tool=all
     │
     ▼
skill-adapter writes to each platform
     │
     ▼
Platform-specific validation
     │
     ▼
Available in all 7 tools
```

## Adding a New Skill

1. Create skill directory: `packages/@aiengineeringharness/skills/new-skill/`
2. Add `SKILL.md` with frontmatter
3. Add entry to `manifest.json`
4. Run `ai-harness --tool=all --yes`
5. Verify in each tool

## Adding a New Platform

1. Add platform config directory under `packages/@aiengineeringharness/<platform>/`
2. Implement adapter in `skill-adapter` for the platform
3. Add platform to `manifest.json` skill entries
4. Update installer with platform detection
5. Test end-to-end