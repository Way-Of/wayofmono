---
name: fixes_manager
description: "Cross-project fix/release notes and version manager. Creates, updates, bumps versions, validates, and diffs fix notes for any Way-Of project (WOMONO, WOW, OPT, etc.). Per-project assets define each project's version fields, file paths, and fix note format."
allowed-tools: Read Write Edit Bash Grep Glob Websearch
---

# fixes-manager — Cross-Project Fix Notes & Version Manager

Manages fix/release notes and version bumps across all Way-Of projects. Each project has its own assets defining version fields, file paths, and fix note format.

Fix notes live in `thoughts/<project>/docs/fixes/`. The skill writes to the correct location based on the selected project.

---

## Supported Projects

| Project | Namespace | Assets | Fixes Location |
|---------|-----------|--------|----------------|
| WayOfMono | WOMONO | `assets/womono/` | `thoughts/wayofmono/docs/fixes/` |
| WayOfWork | WOW | `assets/wow/` | `thoughts/wow/docs/fixes/` |
| OptiCat | OPT | `assets/opticat/` | `thoughts/opticat/docs/fixes/` |

---

## Core Workflows

### 1. Create a New Fix Note Entry

```bash
# Using the skill directly (interactive)
fixes-manager create --project=womono --component=harness --version=1.8.0

# Or via slash command
/fixes create project=womono component=harness version=1.8.0
```

Steps:
1. Load `assets/<project>/` for version fields and component list
2. Read existing fix note file from `thoughts/<project>/docs/fixes/`
3. Append new version entry with standardized format
4. Validate the entry matches project conventions

### 2. Bump Version Across All Project Files

```bash
fixes-manager bump --project=womono --version=1.8.0
```

For WOMONO, this updates:
- `packages/@aiengineeringharness/manifest.json` — version + 7 per-tool versions
- `packages/@aiengineeringharness/config-manifest/base_manifest.yaml` — manifest_version
- `packages/@aiengineeringharness/install.ts` — version string
- `CHANGELOG.md` — root changelog
- `README.md` — version references
- `thoughts/wayofmono/docs/fixes/*.md` — fix notes

For other projects, the `assets/<project>/` config specifies which files to bump.

### 3. Validate Version Consistency

```bash
fixes-manager validate --project=womono
```

Reads all version fields defined in `assets/<project>/` and checks they match. Reports mismatches.

### 4. Diff Between Releases

```bash
fixes-manager diff --project=womono --from=1.7.7 --to=1.8.0
```

Shows what changed between two versions across fix notes, CHANGELOG, and version files.

### 5. Migrate Fix Notes

```bash
fixes-manager migrate --project=womono
```

Moves fix notes from `docs/fixes/` (legacy location) to `thoughts/<project>/docs/fixes/`.

---

## Per-Project Assets

Each project's asset folder defines its versioning system. The skill reads these at runtime.

### Asset Structure

```
assets/<project>/
├── version-config.json       # Version fields, files, and bump order
├── components.json           # List of components in this project
├── fix-note-template.md      # Template for new fix note entries
├── migration-rules.json      # Rules for migrating from legacy locations
└── validate-rules.json       # Validation rules for version consistency
```

### Adding a New Project

1. Create `assets/<project-slug>/`
2. Define `version-config.json` with all version fields
3. Define `components.json` with component names and file paths
4. Define `fix-note-template.md` with the project's fix note format
5. The skill automatically discovers the new project

---

## WOMONO Asset Reference

### Components

| Component | Fix Note File | Version Source |
|-----------|--------------|----------------|
| AI Engineering Harness | `ai-engineering-harness-fixes.md` | `manifest.json`, `base_manifest.yaml`, `install.ts` |
| Wo Coding Agent (wocode) | `wo-coding-agent-fixes.md` | `packages/@wayofmono/wo-coding-agent/package.json` |
| Wo Agent (wouser) | `wo-agent-fixes.md` | `packages/@wayofmono/wo-agent/package.json` |
| CTO Dashboard | `cto-dashboard-fixes.md` | `ui/package.json` |

### Version Files

| File | Field(s) |
|------|----------|
| `packages/@aiengineeringharness/manifest.json` | `version` (top-level) + 7 per-tool `version` fields |
| `packages/@aiengineeringharness/config-manifest/base_manifest.yaml` | `manifest_version` |
| `packages/@aiengineeringharness/install.ts` | Version string at top of file |
| `CHANGELOG.md` | Version header in WOMONO section |
| `README.md` | Version references |
| `thoughts/wayofmono/docs/fixes/*.md` | Version headers |

---

## Fix Note Format

All projects use the same base format:

```markdown
## vX.X.X — YYYY-MM-DD — Short Title

### Features
- Bullet list of features or fixes

### Files
- `path/to/file` — Description of change
```

Per-project assets may extend this with additional sections.

---

## Validation Checks

| Check | Description |
|-------|-------------|
| version-consistency | All version fields across files match the expected version |
| file-exists | All referenced fix note files exist |
| entry-order | Version entries are in reverse chronological order |
| date-format | Dates follow YYYY-MM-DD format |
| no-empty-sections | Fix note entries have content (not just headers) |

---

## Deployment

This skill deploys to all 7 AI coding tools via config-manifest:

1. Canonical source: `skills/fixes-manager/`
2. Per-tool copies: `<tool>/skills/fixes-manager/` (kebab) or `<tool>/skills/fixes_manager/` (snake)
3. Register in `config-manifest/tools/<tool>.yaml` with all assets
4. Run `compile.py` to regenerate manifest.json

---

## Related Skills

- `build-tool-skill` — Config-manifest YAML updates, skill deployment
- `womono-version-updater` — Legacy version bump logic (may merge into this skill)
- `ticket-manager` — Tickets reference fix notes
