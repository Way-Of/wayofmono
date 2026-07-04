---
name: fixes_manager
description: "Cross-project fix/release notes manager. Creates, updates, diffs, and migrates fix notes for any Way-Of project. Per-project assets define each project's fix note location, template, and format rules."
allowed-tools: read, write, edit, bash, grep, glob, websearch
---

# fixes-manager — Cross-Project Fix Notes

Creates, updates, diffs, and migrates fix/release notes across all Way-Of projects. Each project has its own assets defining fix note location, template, and format rules.

Fix notes live in `thoughts/<project>/docs/fixes/`. The skill writes to the correct location based on the selected project.

---

## Supported Projects

| Project | Namespace | Assets | Fixes Location |
|---------|-----------|--------|----------------|
| WayOfMono | WOMONO | `assets/womono/` | `thoughts/wayofmono/docs/fixes/` |
| WayOfWork | WOW | `assets/wow/` | `thoughts/wow/docs/fixes/` |
| OptiCat | OPT | `assets/opticat/` | `thoughts/opticat/docs/fixes/` |

New projects: create `assets/<project-slug>/` with the asset structure below.

---

## Core Workflows

### 1. Record a Release

```bash
fixes-manager record --project=<project> --component=<component> --version=<version>
```

Steps:
1. Load `assets/<project>/` for component list and template
2. Read existing fix note file from `thoughts/<project>/docs/fixes/`
3. Append new version entry with standardized format
4. Validate the entry matches project conventions

This is the workflow project-specific version agents call after bumping version files — they delegate the fix note entry to fixes-manager.

### 2. Diff Between Releases

```bash
fixes-manager diff --project=<project> --component=<component> --from=<version> --to=<version>
```

Shows what changed between two releases by comparing fix note entries.

### 3. Validate Fix Note Format

```bash
fixes-manager validate --project=<project>
```

Checks all fix note files in the project for format compliance, ordering, and completeness.

### 4. Migrate Fix Notes

```bash
fixes-manager migrate --project=<project>
```

Moves fix notes from `docs/fixes/` (legacy location) to `thoughts/<project>/docs/fixes/`.

---

## Per-Project Assets

Each project's asset folder defines its fix note system. The skill reads these at runtime.

### Asset Structure

```
assets/<project>/
├── fix-note-config.json       # Fix note location, template reference, format rules
├── components.json            # List of components and their fix note file names
├── fix-note-template.md       # Template for new fix note entries
└── migration-rules.json       # Rules for migrating from legacy locations
```

### Adding a New Project

1. Create `assets/<project-slug>/`
2. Define `fix-note-config.json` with fix note location and format rules
3. Define `components.json` with component names and file names
4. Define `fix-note-template.md` with the project's fix note format
5. The skill automatically discovers the new project

### components.json Example

```json
{
  "components": [
    {
      "name": "Component Name",
      "fix_note_file": "component-fixes.md",
      "description": "What this component tracks"
    }
  ]
}
```

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
| file-exists | All referenced fix note files exist |
| entry-order | Version entries are in reverse chronological order |
| date-format | Dates follow YYYY-MM-DD format |
| no-empty-sections | Fix note entries have content (not just headers) |

---

## Related Skills

- `ticket-manager` — Tickets reference fix notes
