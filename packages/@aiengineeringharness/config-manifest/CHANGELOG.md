# Config Manifest Changelog

## v1.0.0 — 2026-06-15

Initial modular manifest system replacing the monolithic `manifest.json`.

### Added

- **Modular YAML architecture**: Per-tool YAML files under `tools/` (7 tools) + `base_manifest.yaml` for global metadata
- **compile.py**: YAML → manifest.json compiler with path validation, naming checks, and source file existence verification
- **validate.py**: Per-tool format validation that checks naming conventions, path prefixes, cross-contamination, and manifest consistency
- **Per-tool format enforcement**: Each tool's YAML validated against its spec from `docs/ai-coding-tools/`
- **Cross-contamination detection**: Blocks any tool from referencing another tool's source paths

### Fixed

- **OpenCode cross-contamination**: 28 paths in `opencode.yaml` referenced `claude/` prefix instead of `opencode/`
- **Claude command flags**: Added `disable-model-invocation: true` to `git-commit-helper` and `worktree` skills; removed incorrect flag from 4 `otel-*` skills
- **Per-tool spec accuracy**: Replaced generic table with authoritative format specs from `docs/ai-coding-tools/`

### Changed

- Source of truth shifted from `manifest.json` to `tools/*.yaml`
- `manifest.json` is now a compiled artifact (regenerated via `compile.py`)
- Pi skills/prompts verified: all 11 prompt files exist on disk

### Notes

- Gemini CLI deprecated (stops serving June 18, 2026) — Antigravity CLI is the replacement
- Claude uses `disable-model-invocation: true` for slash commands (no separate commands/ dir)
- Pi, OpenCode, and Wo Coder use kebab-case dir naming; all others use snake_case
- Codex uses dual-file format (`skill.yaml` + `prompt.md`) — unique
