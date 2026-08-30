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

---

## v1.7.10 — 2026-06-29 — Subagent Extension Fix + Agent Protocol Rewrite (WOMONO-115, WOMONO-116)

### Bug Fixes
- **Subagent extension import path fixed (WOMONO-115)**: Fixed `packages/@aiengineeringharness/pi/agent/extensions/subagents-index.ts` import from `./agents.js` to `./subagent/agents.ts` — resolves "Cannot find module './agents.js'" error on pi startup.

### Features
- **Worker agent renamed to coder (WOMONO-115, WOMONO-116)**: Renamed `worker.md` → `coder.md` in both:
  - `packages/@aiengineeringharness/pi/agent/agents/`
  - `packages/@aiengineeringharness/pi/agent/extensions/subagent/agents/`
- **Subagent agents rewritten with full operational protocols (WOMONO-116)**: Updated `planner`, `reviewer`, `scout`, `coder` in both main agents folder and subagent extension with:
  - Mandatory workflows with gate/checkpoints
  - File generation requirements (plans → `.pi/planning/`, audits → `.pi/reviews/`, recon → `.pi/recon/`)
  - Directory integrity rules (specific save locations)
  - Completion signals: `[PLAN_COMPLETE]`, `[REVIEW_COMPLETE]`, `[RECON_COMPLETE]`, `[CODE_COMPLETE]`
  - Safety protocols: bash limits, read-only enforcement, git safety, review dispatch
  - Modeled after reference implementation in `/ref/pip/.pi/agents/agents/`

### Files
- `packages/@aiengineeringharness/pi/agent/extensions/subagents-index.ts` (L29: import path fix)
- `packages/@aiengineeringharness/pi/agent/agents/{planner,reviewer,scout,coder}.md` — 4 files rewritten
- `packages/@aiengineeringharness/pi/agent/extensions/subagent/agents/{planner,reviewer,scout,coder}.md` — 4 files rewritten
- `CHANGELOG.md` — v1.7.10 entry added
- `thoughts/wayofmono/shared/tickets/WOMONO-115-fix-subagents-extension-import-path.md` — Status: Done
- `thoughts/wayofmono/shared/tickets/WOMONO-116-improve-subagent-agent-definitions.md` — Status: Done
