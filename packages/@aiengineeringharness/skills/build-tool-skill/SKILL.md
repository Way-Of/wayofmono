---
name: build-tool-skill
version: "2.0"
tools: [read, write, edit, bash, grep, glob, websearch]
platforms: [opencode, claude, pi, wocode, antigravity, codex]
allowed-tools: read, write, edit, bash, grep, glob, websearch
---

# build-tool-skill — Unified Skill Builder, Validator & Lifecycle Manager

Unified skill management for all 7 AI coding tools. Covers creation, validation, platform adaptation, lifecycle sync, and config-manifest registration.

## Tool Format Reference (Source: AGENTS.md Naming Conventions Table)

| Tool | Skill/Dir Naming | `allowed-tools` Casing | Config Dir |
|------|-----------------|------------------------|------------|
| OpenCode | **kebab-case** | lowercase | `~/.config/opencode/` |
| Claude Code | **snake_case** | PascalCase (`Read`, `Write`) | `~/.claude/` |
| Pi | **kebab-case** | Title Case | `~/.pi/agent/` |
| Codex CLI | **snake_case** | lowercase_snake | `~/.codex/` |
| Antigravity CLI | **snake_case** | lowercase | `~/.antigravity/` |
| Wo Coder | **kebab-case** | lowercase | `~/.wocode/` |

## Online Sources
Always fetch latest docs before building:
- OpenCode: https://opencode.ai/docs/
- Claude Code: https://code.claude.com/docs/en/overview
- Pi: https://pi.dev/
- Antigravity: https://antigravity.sh/docs
- Codex: https://github.com/openai/codex
- Wo Coder: packages/@wayofmono/wo-agent/

---

## Section 1: Skill Creation

### Create a New Skill
1. Determine target tool (or cross-tool for all 7)
2. Create directory: `<tool>/skills/<name>/` using tool's naming convention
3. Create `SKILL.md` with frontmatter matching tool's format
4. Body: markdown with instructions, references, examples
5. For Codex: create `skill.yaml` + `prompt.md`
6. Register in `config-manifest/tools/<tool>.yaml`
7. Run `config-manifest/compile.py` to regenerate manifest.json

### Naming Rules
- OpenCode: kebab-case directory, name matches directory
- Claude/Gemini/Codex/Antigravity: snake_case directory
- Pi/Wo Coder: kebab-case directory
- Pi: kebab-case directory
- Codex: also needs `skill.yaml` + `prompt.md` (two-file format)

---

## Section 2: Skill Validation

Validate all skill files against per-tool format specs:

### Validation Checks
| Check | What It Validates |
|-------|-------------------|
| Directory naming | snake_case for most tools, kebab-case for OpenCode and Pi |
| Frontmatter fields | Only fields supported by each tool |
| allowed-tools casing | Must match each tool's case requirement |
| Body tool name casing | Tool names in markdown body match convention |
| Deprecated patterns | Avoids deprecated tool names |
| name matches dir | Frontmatter `name` field matches directory name |

### Config-Manifest Validation Pipeline
```bash
# Validate per-tool YAML configs
python3 packages/@aiengineeringharness/config-manifest/validate.py

# Validate a single tool
python3 packages/@aiengineeringharness/config-manifest/validate.py --tool=opencode

# Run full test suite
python3 packages/@aiengineeringharness/config-manifest/scripts/run-all-tests.py

# CI/CD gate — must pass before merging PRs
python3 packages/@aiengineeringharness/config-manifest/scripts/run-all-tests.py --skip-skills
```

### Installer Compliance
```bash
ai-harness --compliance
```
Checks: manifest source files exist, no stale files, no dangling entries.

### Platform-Aware Install Paths
| Tool | Linux | macOS | Windows |
|------|-------|-------|---------|
| OpenCode | `~/.config/opencode/` | `~/.config/opencode/` | `%USERPROFILE%\.config\opencode\` |
| Claude Code | `~/.claude/` | `~/.claude/` | `%USERPROFILE%\.claude\` |
| Pi | `~/.pi/agent/` | `~/.pi/agent/` | `%USERPROFILE%\.pi\agent\` |
| Antigravity | `~/.antigravity/` | `~/.antigravity/` | `%USERPROFILE%\.antigravity\` |
| Codex | `~/.codex/` | `~/.codex/` | `%USERPROFILE%\.codex\` |
| Wo Coder | `~/.wocode/` | `~/.wocode/` | `%USERPROFILE%\.wocode\` |

---

## Section 3: Platform Adaptation

Each skill has a canonical format in `skills/<skill>/`:
- `SKILL.md` — Canonical spec with YAML frontmatter
- `tools.json` — JSON-RPC tool definitions (optional)
- `platform/` — Platform-specific overrides (optional)

Adapt canonical skills to per-tool output via the config-manifest:
1. Deploy skill files to each tool's `skills/` directory using tool's naming
2. Add entry to `config-manifest/tools/<tool>.yaml`
3. Run `compile.py` to produce `manifest.json`
4. `install.ts` reads `manifest.json` for deployment

---

## Section 4: Lifecycle Sync

### Commands
| Command | Description |
|---------|-------------|
| `/sync skills` | Sync all skills to all frontends |
| `ai-harness --sync-skills` | CLI equivalent |
| `ai-harness --watch-skills` | Watch for changes and auto-sync |

### Sync Process
1. Scan `skills/` for all skill directories
2. Generate platform-specific format via adapter
3. Install/update via direct file copy
4. Recompile manifest from config-manifest YAMLs via `compile.py`
5. Run `validate.py` for post-sync integrity

### Docs Sync
| Command | Description |
|---------|-------------|
| `/sync-docs` | Sync canonical docs from `docs/skills/` |
| `/sync-docs --check` | Preview changes before applying |
| `ai-harness --sync-docs` | CLI equivalent |

### Conflict Resolution
- Preserve user modifications (`.wo/` files)
- Update harness-specific SKILL.md
- Sync only canonical changes

### Checksum Validation
After each update:
- Verify SHA256 checksums
- Check version bump
- Validate syntax
- Ensure tool mapping is correct

---

## Section 5: Config-Manifest Integration

The `config-manifest/` directory at `packages/@aiengineeringharness/config-manifest/` is the source of truth:
- **`base_manifest.yaml`** — Global metadata and shared configuration anchors
- **`tools/<tool>.yaml`** — Per-tool config (skills, commands, prompts, extensions, agents)
- **`compile.py`** — Merges base + per-tool YAMLs into `manifest.json`
- **`validate.py`** — Validates per-tool YAMLs against format specs
- **`scripts/`** — Test suite: `test-yamls.py`, `test-manifest.py`, `test-skills.py`, `run-all-tests.py`

### Adding a Skill to All Tools
1. Deploy skill files to each tool's `skills/` directory with correct naming
2. Add YAML entry in each `config-manifest/tools/<tool>.yaml`
3. Run `compile.py` to regenerate `manifest.json`
4. Validate: `python3 config-manifest/scripts/run-all-tests.py`

### Assets Reference
| Asset | Description |
|-------|-------------|
| `assets/skill-example-opencode.md` | Example SKILL.md for OpenCode |
| `assets/skill-example-claude.md` | Example SKILL.md for Claude |
| `assets/skill-example-pi.md` | Example SKILL.md for Pi |
| `assets/skill-example-codex.md` | Example skill.yaml + prompt.md for Codex |
| `assets/config-manifest-example.yaml` | Example per-tool YAML entry |
| `assets/compliance-check.py` | Simplified compliance check script |
| `scripts/` | Test suite and update scripts (see config-manifest/) |
