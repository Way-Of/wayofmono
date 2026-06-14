# Skills Guide

> Reusable instruction sets that teach Wo new capabilities

## What Are Skills?

Skills are modular instruction packages that extend Wo with specific capabilities. The AI Engineering Harness manages **81 canonical skills** and syncs them to all 7 tools.

## Skill Categories

| Category | Examples |
|----------|----------|
| **Planning** | `create_plan`, `implement_plan`, `validate_plan` |
| **Code Quality** | `tdd`, `improve_codebase_architecture`, `research_codebase` |
| **Git/Workflow** | `git_commit_helper`, `pr_description_generator`, `experimental_pr_workflow` |
| **Documentation** | `document_generation`, `investor_ready_doc_gen`, `docs_sync_updater` |
| **Observability** | `otel_instrument`, `otel_collector`, `validate_telemetry`, `observability_driven_development` |
| **Debugging** | `debug`, `debug_k8s` |
| **Kubernetes** | `validate_podman` |
| **Team/Project** | `team_setup`, `ticket_manager`, `backlog_groomer`, `cto_dashboard` |
| **Build Tools** | `build_tool`, `build_tool_skill`, `build_tool_agent`, `build_tool_config`, `build_tool_extension`, `build_tool_prompts`, `build_tool_themes`, `build_tool_tui`, `build_tool_keybindings`, `build_tool_cli`, `build_tool_orchestrate` |
| **Platform-Specific** | `wow_*`, `opticat_*`, `customize-opencode` |

## Using Skills

### In Wo Coder / Other Tools
Skills auto-load from tool-specific directories:
```
~/.wocoder/agent/skills/        # Wo Coder
~/.config/opencode/skills/      # OpenCode
~/.claude/skills/               # Claude Code
~/.gemini/skills/               # Gemini CLI
~/.pi/agent/skills/             # Pi
~/.codex/skills/                # Codex
~/.antigravity/skills/          # Antigravity
~/.agents/skills/               # Shared cross-tool location
```

### Loading a Skill
```bash
# In any tool, just mention the skill name
# Wo will auto-load it if relevant to your task

# Or explicitly invoke:
# "Use the create_plan skill to plan this feature"
```

## Skill Structure

Each skill is a directory with:
```
skill-name/
├── SKILL.md          # Frontmatter + instructions (required)
├── references/       # Optional reference files
├── scripts/          # Optional helper scripts
└── assets/           # Optional templates, data files
```

### SKILL.md Frontmatter
```yaml
---
name: "skill-name"
description: "What this skill does and when to use it"
version: "1.0.0"
allowed-tools: ["read", "write", "bash", "edit", "grep", "glob", "task", "skill"]
---
```

## Managing Skills

### Sync All Skills
```bash
# Via harness (updates all 7 tools)
ai-harness --sync-docs

# Check what would change
ai-harness --sync-docs --check
```

### Compliance Check
```bash
# Validate all skill files across all tools
ai-harness --compliance
```

### Install Specific Skills
```bash
# For a specific tool
ai-harness --tool=opencode --skill=skills,agents --yes

# Preview only
ai-harness --tool=opencode --skill=skills --dry-run
```

## Creating Custom Skills

1. Add to canonical location: `packages/@aiengineeringharness/skills/your-skill/`
2. Create `SKILL.md` with frontmatter and instructions
3. Run `ai-harness --sync-docs` to propagate to all tools

## Key Skills for Daily Use

| Skill | Purpose |
|-------|---------|
| `create_plan` | Generate implementation plans from tickets |
| `implement_plan` | Execute approved plans phase-by-phase |
| `validate_plan` | Verify implementation matches plan |
| `git_commit_helper` | Create well-structured commits |
| `debug` | Investigate issues during testing |
| `tdd` | Test-driven development workflow |
| `research_codebase` | Comprehensive codebase analysis |
| `ticket_manager` | Manage tickets across namespaces |
| `validate_telemetry` | Check observability against narrative |

## References

- [AI Engineering Harness Guide](ai-harness/) — Core skill management
- [Wo Coder Guide](wocoder/) — Using skills in Wo Coder
- [Wo User Guide](wouser/) — Using skills in your app