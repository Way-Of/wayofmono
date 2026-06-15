# Config Manifest — Modular Manifest System

Source of truth for the AI Engineering Harness manifest across all 7 AI coding tools. Modular YAML files replace the monolithic `manifest.json`, with per-tool format enforcement and zero cross-contamination.

## Structure

```
config-manifest/
├── base_manifest.yaml   # Global metadata, version, shared asset templates
├── compile.py           # YAML → manifest.json compiler
├── validate.py          # Per-tool format validation (naming, paths, frontmatter)
├── tools/               # Per-tool YAML definitions
│   ├── antigravity.yaml
│   ├── claude.yaml
│   ├── codex.yaml
│   ├── gemini.yaml
│   ├── opencode.yaml
│   ├── pi.yaml
│   └── wocoder.yaml
└── README.md
```

## Tools

| Tool | Dir Naming | allowed-tools Case | Skill Format | Config Dir |
|------|-----------|-------------------|-------------|------------|
| OpenCode | snake_case | lowercase | SKILL.md + commands/ | `~/.config/opencode/` |
| Claude Code | snake_case | PascalCase | SKILL.md (`disable-model-invocation` for commands) | `~/.claude/` |
| Gemini CLI | snake_case | lowercase | SKILL.md + TOML commands/ | `~/.gemini/` |
| Pi | kebab-case | lowercase | SKILL.md + prompts/ | `~/.pi/agent/` |
| Wo Coder | snake_case | lowercase | SKILL.md + commands/ | `~/.wocoder/` |
| Codex CLI | snake_case | lowercase | skill.yaml + prompt.md | `~/.codex/` |
| Antigravity | snake_case | lowercase | SKILL.md + TOML commands/ | `~/.antigravity/` |

## Usage

```bash
# Compile all YAMLs into manifest.json
python3 compile.py

# Validate without compiling
python3 compile.py --validate-only

# Validate all tools against their format specs
python3 validate.py

# Validate a single tool
python3 validate.py --tool=opencode

# JSON output for automation
python3 validate.py --json
```

## Validation Checks

- **Path prefixes**: Every `src` path must use its own tool's directory prefix
- **Cross-contamination**: No tool references another tool's paths
- **File existence**: All referenced source files exist on disk
- **Naming conventions**: Component keys follow per-tool naming rules
- **Target consistency**: Deploy target matches tool spec

## Integration

- **compile.py**: Called during deploy to produce `manifest.json`
- **validate.py**: Extends skill-compliance-checker, consumable by skill-adapter and skill-auto-update
- **CI/CD**: All scripts return non-zero exit codes on failure

## Test Suite

Automated tests validate configuration, compilation, and skill formatting across all 7 tools.

```
scripts/
├── test-yamls.py       # Validate all per-tool YAML configs
├── test-manifest.py    # Validate compiled manifest.json
├── test-skills.py      # Validate on-disk skill files (per-tool format)
└── run-all-tests.py    # Orchestrator — runs all tests
```

### Run All Tests

```bash
python3 scripts/run-all-tests.py
```

### Individual Tests

```bash
# Validate all tool YAMLs (cross-contamination, naming, paths)
python3 scripts/test-yamls.py
python3 scripts/test-yamls.py --tool=opencode
python3 scripts/test-yamls.py --json

# Validate compiled manifest.json (structure, completeness, cross-contamination)
python3 scripts/test-manifest.py
python3 scripts/test-manifest.py --no-src-check  # skip disk file checks
python3 scripts/test-manifest.py --verbose

# Validate on-disk skill files (frontmatter, naming, allowed-tools case)
python3 scripts/test-skills.py
python3 scripts/test-skills.py --tool=claude
python3 scripts/test-skills.py --verbose

# Orchestrator options
python3 scripts/run-all-tests.py --skip-skills   # skip skill validation (fast)
python3 scripts/run-all-tests.py --tool=opencode # single tool across all suites
python3 scripts/run-all-tests.py --verbose
```

### test-yamls.py — YAML Config Validation

Checks each tool's YAML in `tools/*.yaml` for:

| Check | Description |
|-------|-------------|
| **YAML syntax** | File parses as valid YAML |
| **Cross-contamination** | All `src` paths use correct tool prefix (no `claude/` in `opencode.yaml`) |
| **Path validity** | `src` starts with an allowed prefix for that tool |
| **Structural keys** | Required keys: `name`, `version`, `target`, `components` |
| **Duplicate components** | No duplicate component keys |
| **Target match** | Deploy target matches tool spec |
| **Source file existence** | Every referenced `src` file exists on disk (warning) |

### test-manifest.py — manifest.json Validation

Validates the compiled `manifest.json` for:

| Check | Description |
|-------|-------------|
| **JSON structure** | Valid JSON, has `version` + `tools` keys |
| **Tool completeness** | All 7 expected tools present, no extra tools |
| **Per-tool structure** | Each tool has `name`, `version`, `target`, `components` |
| **Cross-contamination** | Same path prefix check against manifest paths |
| **Source file existence** | All referenced files exist on disk (warning) |
| **Component count** | File entry count matches YAML source definitions |

### test-skills.py — On-Disk Skill Format Validation

Ensures every skill in every tool's `skills/` directory follows the correct format for that tool. This is the most critical test — it validates what users actually download.

| Check | OpenCode | Claude | Gemini | Pi | WoCoder | Codex | Antigravity |
|-------|----------|--------|--------|----|---------|-------|-------------|
| **Skill file** | SKILL.md | SKILL.md | SKILL.md | SKILL.md | SKILL.md | skill.yaml+prompt.md | SKILL.md |
| **name convention** | snake_case | snake_case | snake_case | kebab-case | kebab-case | snake_case | snake_case |
| **allowed-tools case** | lowercase | PascalCase | lowercase | lowercase list | lowercase | snake_case list | lowercase |
| **disable-model-invocation** | commands only | commands only | unsupported | unsupported | commands only | unsupported | commands only |

Format checks per skill file:

1. **File existence**: Skill file exists (e.g., SKILL.md or skill.yaml+prompt.md)
2. **Frontmatter syntax**: YAML frontmatter is valid
3. **Name convention**: `name` field matches directory name in correct case
4. **allowed-tools case**: Values use correct case for the tool (PascalCase for Claude, lowercase for others)
5. **disable-model-invocation**: Command skills have the flag set; tools that don't support it don't have it
6. **Codex dual-file**: Both `skill.yaml` and `prompt.md` exist

## Skill Integration

Three key skills reference the config-manifest system:

| Skill | Role | Interaction |
|-------|------|-------------|
| **skill-compliance-checker** | Validates skill format compliance | Can invoke `validate.py` and `scripts/run-all-tests.py` for config-level checks beyond SKILL.md format |
| **skill-adapter** | Generates per-tool config from canonical format | YAMLs in `tools/` are the source of truth; `compile.py` generates `manifest.json` consumed by `install.ts` |
| **skill-auto-update** | Syncs skills across all tools | After sync, recompiles `manifest.json` via `compile.py` and runs `validate.py` for post-sync integrity |

All three skills are deployed to all 7 tools (8 copies each, including pi/extensions). Every copy was updated (2026-06-15) to reference the config-manifest pipeline: `compile.py`, `validate.py`, and `scripts/run-all-tests.py`.
