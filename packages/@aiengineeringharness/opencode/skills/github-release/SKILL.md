---
name: github-release
description: "Create GitHub releases with changelog generation, version tagging, and automated publishing."
allowed-tools: read, write, edit, bash, git, gh
---

# GitHub Release skill

Creates and manages GitHub releases with automated changelog generation, semantic versioning, and publishing.

## Version Strategy

Uses Semantic Versioning (SemVer):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Release Workflow

### 1. Prepare Release

```bash
# Determine version bump from PRs/commits since last release
# conventional commits: feat: -> MINOR, fix: -> PATCH, BREAKING CHANGE: -> MAJOR

# Update version in package.json / pyproject.toml / Cargo.toml
npm version minor --no-git-tag-version
# or
python -c "import toml; d=toml.load('pyproject.toml'); d['project']['version']='1.2.0'; toml.dump(d, open('pyproject.toml','w'))"
```

### 2. Generate Changelog

```bash
# Auto-generate from merged PRs since last tag
gh api repos/:owner/:repo/pulls --state closed --sort updated --direction desc \
  --jq '.[] | select(.merged_at > "2026-01-01") | "- \(.title) (\(.number)) by @\(.user.login)"'
```

### 3. Create Release

```bash
# Create tag and release
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0

gh release create v1.2.0 \
  --title "v1.2.0" \
  --notes-file CHANGELOG.md \
  --generate-notes
```

### 4. Publish Artifacts (if applicable)

```bash
# Upload build artifacts
gh release upload v1.2.0 dist/*
```

## Available Tools

### `prepare_release`
Prepare release by determining version bump and updating version files.
Parameters:
- `version_type` (optional): "major" | "minor" | "patch" | "auto" (default: "auto")
- `dry_run` (optional): Show what would change (default: false)

### `generate_changelog`
Generate changelog from merged PRs/commits since last release.
Parameters:
- `since_tag` (optional): Tag to compare from (default: latest tag)
- `format` (optional): "markdown" | "json" (default: "markdown")
- `group_by` (optional): "type" | "author" | "none" (default: "type")

### `create_release`
Create GitHub release with tag and notes.
Parameters:
- `version` (required): Version string (e.g., "1.2.0")
- `title` (optional): Release title
- `notes` (optional): Release notes (or path to file)
- `draft` (optional): Create as draft (default: false)
- `prerelease` (optional): Mark as pre-release (default: false)

### `upload_artifacts`
Upload build artifacts to release.
Parameters:
- `release_tag` (required): Release tag (e.g., "v1.2.0")
- `files` (required): Array of file paths/globs
- `clobber` (optional): Overwrite existing (default: false)

### `list_releases`
List existing releases.
Parameters:
- `limit` (optional): Max releases to list (default: 10)

## Multi-Machine Awareness

- **Releases happen from main only**: All changes must go through branch → PR → main before a release. Never tag and release from a feature branch.
- **Tags are global**: Once a tag is pushed, all machines see it — coordinate release timing across the team
- **Only one machine should release**: Avoid race conditions — designate one machine/environment to run the release workflow
- **Changelog is cumulative**: Generated from merged PRs, not local state — works from any machine
- **Pull before releasing**: `git pull --ff-only && git fetch --tags` to ensure you have the latest commits and tags before creating a release

## Integration

- Triggered by `womono_version_updater` skill
- Uses conventional commits for version determination
- Links release to tickets via PR references
- Updates ticket statuses to "Done" for included tickets
- Posts release notes to CTO Dashboard news

