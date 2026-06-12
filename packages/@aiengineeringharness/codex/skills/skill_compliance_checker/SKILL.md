---
name: skill_compliance_checker
description: Validate all skill SKILL.md files across all 7 tool harnesses for correct frontmatter, naming, allowed-tools casing, and format compliance. Use when the user asks to check compliance, validate skills, run compliance check, or verify skill formatting.
allowed-tools: read, write, bash
---

# Skill Compliance Checker

Validate all skill files across the AI Engineering Harness against per-tool format specifications.

## Tool

Run the compliance check script:

```bash
deno run -A packages/@aiengineeringharness/scripts/compliance-check.ts
```

## Per-Tool Check

Check a single tool:

```bash
deno run -A packages/@aiengineeringharness/scripts/compliance-check.ts --tool=opencode
```

Replace `opencode` with: `claude`, `gemini`, `pi`, `antigravity`, `codex`, `wocoder`.

## Auto-Fix Mode

Some issues can be auto-fixed:

```bash
deno run -A packages/@aiengineeringharness/scripts/compliance-check.ts --fix
```

## Installer Compliance (`--compliance`)

The installer also has a built-in `--compliance` flag that validates manifest integrity:

```bash
ai-harness --compliance
```

This checks:
- All manifest source files exist on disk
- No stale files in managed tool directories
- No dangling manifest entries pointing to missing files
- Reports per-tool summary: ok / missing / stale
- Exit code 0 if compliant, 1 if issues found

## Platform-Aware Install Paths

The installer detects the OS at runtime (`Deno.build.os`) and resolves per-tool target directories accordingly.
Canonical install path reference docs for all 7 tools across Linux/macOS/Windows:

| Tool | Linux | macOS | Windows |
|------|-------|-------|---------|
| OpenCode | `~/.config/opencode/` | `~/.config/opencode/` | `%USERPROFILE%\.config\opencode\` |
| Claude Code | `~/.claude/` | `~/.claude/` | `%USERPROFILE%\.claude\` |
| Gemini CLI | `~/.gemini/` | `~/.gemini/` | `%USERPROFILE%\.gemini\` |
| Pi | `~/.pi/agent/` | `~/.pi/agent/` | `%USERPROFILE%\.pi\agent\` |
| Antigravity | `~/.antigravity/` | `~/.antigravity/` | `%USERPROFILE%\.antigravity\` |
| Codex | `~/.codex/` | `~/.codex/` | `%USERPROFILE%\.codex\` |
| Wo Coder | `~/.wocoder/` | `~/.wocoder/` | `%USERPROFILE%\.wocoder\` |

Full reference docs at `thoughts/wayofmono/docs/tools/ai-coding-tools/`.

## What Is Validated

The script checks every `SKILL.md` in `packages/@aiengineeringharness/<tool>/skills/` against its tool's spec:

| Check | Code | What It Validates |
|-------|------|-------------------|
| Directory naming | `WRONG_NAMING_CONVENTION` | snake_case for 6 tools, kebab-case for Pi |
| Frontmatter fields | `UNSUPPORTED_FRONTMATTER` | Only fields supported by each tool (e.g., `disable-model-invocation` only for opencode/claude/antigravity/wocoder) |
| allowed-tools casing | `WRONG_TOOL_CASE` | PascalCase for claude/pi/wocoder, lowercase for others |
| Body tool name casing | `BODY_WRONG_TOOL_CASE` | Tool names in markdown body match tool's convention |
| Deprecated patterns | `DEPRECATED_PATTERN` | Avoids deprecated tool names (e.g., `TodoWrite` for claude) |
| name matches dir | `NAME_MISMATCH` | Frontmatter `name` field matches directory name |

## Spec Reference

Tool specs are defined in `scripts/compliance-check.ts` at lines 60-138. Key rules:

- **opencode/gemini/antigravity/codex**: lowercase allowed-tools (`read, write, bash`), snake_case dirs
- **claude/pi/wocoder**: PascalCase allowed-tools (`Read, Write, Bash`), snake_case dirs (claude/wocoder) or kebab-case (pi)
- **codex**: lowercase allowed-tools (`read_file, write_file, run_shell_command`)
