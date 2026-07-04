---
name: womonodeploy
description: >-
  Release and update npm packages across the WoM ecosystem. Handles version
  bumping, README/docs updates, npm publish, git commit/push, permission
  workarounds (EACCES), and production mode configuration. Knows the full
  release workflow for @wayofmono/* packages.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, TodoWrite, Task, Question
---

# womonodeploy — Package Release & Deploy skill

Releases and updates npm packages across the WayOfMono ecosystem. Covers the
full lifecycle: version bump → docs → npm publish → git → permissions fix.

## WOMONO Ecosystem Knowledge

### Fixes Docs
Release notes go in `docs/fixes/`. The relevant file depends on the component:
- `ai-engineering-harness-fixes.md` — harness changes (skills, agents, installer)
- `wocode-fixes.md` — wocode changes
- `wouser-fixes.md` — wouser changes
- `cto-dashboard-fixes.md` — dashboard changes (current focus)

### Canonical Skill Architecture
Skills use the config-manifest pattern: `skills/<name>/SKILL.md` + `compile.py` + `tools/<tool>.yaml`. Reference `skills/init-harness/` and `skills/standup/`. When releasing skill updates, recompile with `python3 skills/<name>/compile.py`.

### Config-Manifest
When adding new skills or components, update `config-manifest/tools/*.yaml` and run `python3 config-manifest/compile.py` to regenerate `manifest.json`.

### Manifest.json Safety
Never use string replacement on `manifest.json`. Use Python:
```python
with open('manifest.json') as f: data = json.load(f)
# modify
with open('manifest.json', 'w') as f: json.dump(data, f, indent=2, ensure_ascii=False)
```

### Creating Scripts for Tasks
When automating release workflows, create Python scripts in the harness `scripts/` directory. Use `json.dump` with `ensure_ascii=False` for JSON operations.

## Supported Packages

| Package | Location | npm Name | Standalone Repo |
|---------|----------|----------|-----------------|
| CTO Dashboard | `ui/` | `@wayofmono/wo-cto-dashboard` | `github.com/Way-Of/wayofdev` |

## Release Workflow

### Step 1 — Determine Version Bump

Ask the user what version to bump to (SemVer: `MAJOR.MINOR.PATCH`).

read current version from `ui/package.json` `"version"` field.

### Step 2 — Update package.json

edit `ui/package.json` → set `"version": "X.Y.Z"`.

### Step 3 — Update READMEs

Update version references in:

- `ui/README.md` — any hardcoded version strings
- `README.md` (monorepo root) — CTO Dashboard version in stats table and
  repo structure listing (`ui/ # CTO Dashboard (vX.Y.Z, ...)`)

### Step 4 — Update docs/fixes/

Add a release notes entry to `docs/fixes/cto-dashboard-fixes.md`:

- New `## vX.Y.Z (YYYY-MM-DD) — <Title>` section at the top
- Subsections: `### Features`, `### Fixes`, `### Breaking Changes`,
  `### Known Issues`, `### Migration from vX.Y.Z`
- Include install / update commands

### Step 5 — Update Ticket

If a ticket tracks this work (e.g. WOMONO-084), update its checklist and
status.

### Step 6 — npm Publish

```bash
cd ui && npm publish
```

Check output for `+ @wayofmono/wo-cto-dashboard@X.Y.Z` to confirm.

### Step 7 — Push to Standalone Repo (if applicable)

For dashboard releases, also sync to the standalone wayofdev repo:

```bash
# From ui/ directory
git init                            # if standalone checkout
git remote add origin git@github.com:Way-Of/wayofdev.git
git add . && git commit -m "vX.Y.Z"
git push -u origin main --force
```

### Step 8 — Commit & Push Monorepo Changes

```bash
git add -A
git commit -m "docs: cto-dashboard vX.Y.Z release notes"
git push origin HEAD
```

## EACCES / Permission Handling

When users hit `npm install -g` permission errors:

| Problem | Solution |
|---------|----------|
| `EACCES: mkdir /usr/lib/node_modules/` | Use `npx` instead, or `sudo npm install -g`, or `npm config set prefix ~/.npm-global` |
| `EACCES: .next/dev` after sudo install | `sudo wodev --build` once, then `wodev` as user |
| Windows permissions | Run terminal as Administrator |

**Recommendation**: `npm config set prefix ~/.npm-global` then add to PATH
avoids sudo entirely and keeps `.next/` user-owned.

## Production Mode

After `sudo npm install -g`:
```
sudo wodev --build     # one-time build (needs root for .next/)
wodev                   # production server (read-only, as normal user)
```

| `wodev` flag | Mode | Description |
|--------------|------|-------------|
| `wodev` | production | `next start` — read-only, requires build first |
| `wodev --dev` | development | `next dev --turbopack` — hot reload, writes .next/ |
| `wodev --build` | build | `next build` — one-time build |
| `wodev --update` | — | `npm update -g @wayofmono/wo-cto-dashboard` |
| `wodev --version` | — | Print version |
| `wodev --help` | — | Show help |

## Port Convention

Default port is **6969** (uncommon, avoids conflicts with 3000/8080/5173).

Override: `PORT=8080 wodev`

## Relevant Files

| File | Purpose |
|------|---------|
| `ui/package.json` | npm package version + config |
| `ui/bin/wodev.js` | CLI entry point |
| `ui/README.md` | Standalone package README |
| `README.md` | Monorepo root README (CTO Dashboard section) |
| `docs/fixes/cto-dashboard-fixes.md` | Dashboard release notes |
| `docs/fixes/ai-engineering-harness-fixes.md` | Harness release notes |
| `docs/fixes/wocode-fixes.md` | Wocode release notes |
| `docs/fixes/wouser-fixes.md` | Wouser release notes |
| `thoughts/wayofmono/shared/tickets/WOMONO-084-EXTRACT-UI-TO-WAYOFDEV-REPO.md` | Dashboard extraction ticket |
