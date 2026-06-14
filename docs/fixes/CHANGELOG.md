# Fix: Incorrect Skill Paths in Manifest causing 404s

## Issue
Several woCoder skills in `packages/@aiengineeringharness/manifest.json` were incorrectly referenced using underscore-based paths (e.g., `build-tool_agent`) while the actual file structure on GitHub and the local repository used hyphen-based paths (e.g., `build-tool-agent`). This mismatch caused the `ai-harness` installer to attempt to fetch non-existent remote URLs, resulting in 404 errors during installation.

## Affected Components
The issue primarily affected the following woCoder skill paths in `manifest.json`:
- `build-tool_agent`
- `build-tool_extension`
- `build-tool_tui`
- `build-tool_cli`
- `build-tool_themes`
- `build-tool_prompts`
- `build-tool_keybindings`
- `build-tool_config`
- `build-tool_orchestrate`

## Resolution
The `src` and `dest` paths for all affected skills were updated in `packages/@aiengineeringharness/manifest.json` to use hyphens instead of underscores, aligning the manifest with the actual file structure.

## Prevention & Troubleshooting
If you encounter 404 or fetch errors during tool installation, use the `--reload` flag with the installation command to force Deno to bypass any stale local caches and fetch the latest `manifest.json` from GitHub.

Example:
```bash
deno run -A --reload https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --tool=all --yes
```
