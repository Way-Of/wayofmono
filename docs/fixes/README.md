# Release Notes & Fixes

## Index

- [wo-coding-agent Fixes](./wo-coding-agent-fixes.md) — CLI coding agent (wocode) v1.0.6+
- [wouser (wo-agent) Fixes](./wo-agent-fixes.md) — General-purpose user agent v1.0.4+
- [CTO Dashboard Fixes](./cto-dashboard-fixes.md) — Dashboard (Next.js) v0.2.1+
- [AI Engineering Harness Fixes](./ai-engineering-harness-fixes.md) — Core harness v1.7.0+

---

## Quick Summary

| Component | Package | Current Version | Config Dir |
|-----------|---------|----------------|------------|
| **wocode** | `@wayofmono/wo-coding-agent` | v1.0.11 | `~/.wocode/` |
| **wouser** | `@wayofmono/wo-agent` | v1.0.4 | `~/.wo/` |
| **Harness** | `@aiengineeringharness` | v1.7.7 | `~/.wocode/`, `~/.pi/agent/`, etc. |
| **Dashboard** | `@wayofmono/wo-cto-dashboard` | v0.6.3 | `~/.config/wodev/` |

---

## wo-coding-agent Fixes

See [wo-coding-agent-fixes.md](./wo-coding-agent-fixes.md) for detailed release notes.

**Quick Summary:**
- v1.0.11: Enhanced init message + skill directories kebab-case (matches Pi)
- v1.0.10: Extension errors → warnings (wocode won't crash on missing deps)
- v1.0.9: Added docs folder, Ollama defaults
- v1.0.8: CONFIG_DIR_NAME `.wo` → `.wocode` (separate from wouser)
- v1.0.7: npm workspace deps → explicit versions
- v1.0.6: Removed `link:` protocol (npm incompatible)

---

## wouser (wo-agent) Fixes

See [wo-agent-fixes.md](./wo-agent-fixes.md) for detailed release notes.

**Quick Summary:**
- v1.0.4: npm workspace deps → explicit versions, working npm global install
- CONFIG_DIR_NAME: `~/.wo/` (separate from wocode's `~/.wocode/`)

---

## AI Engineering Harness Fixes

See [ai-engineering-harness-fixes.md](./ai-engineering-harness-fixes.md) for detailed release notes.

**Quick Summary (v1.7.8):**
- `--purge` flag: nuclear cleanup of harness config dirs (no manifest needed)
- 5 skills consolidated into build-tool-skill (WOMONO-083): validation, adaptation, lifecycle, config-manifest integration
- Wo Coder naming: snake_case→kebab-case (72 skill dirs renamed, matches Pi)

**Previous (v1.7.7):**
- Per-tool naming compliance: researched online docs, fixed OpenCode (snake→kebab), converted 841 manifest paths kebab→snake for 5 tools, deleted 72 kebab dirs, fixed AGENTS.md table
- investor-ready-doc-gen enhanced: brand color detection, Marp CLI platform install, Mermaid charts, anti-overflow QA

**Previous (v1.7.6):**
- Full skill compliance: 981→0 errors across 845 skills / 7 tools
- Pi frontmatter fixed: 72 files name: snake→kebab
- Claude tools casing: 105 files allowed-tools lowercase→PascalCase
- Broken YAML frontmatter fixed: 50 files repaired
- Wocode spec corrected: kebab→snake

**Previous (v1.7.5):**
- Stale lock detection: auto-recovers from crashed installer processes
- System deps auto-installed when `--yes` is passed (e.g., `libwebkit2gtk-4.1-dev`)
- Multi-Machine Awareness: 6 GitHub skills synced across 6 tools with "never push directly to main" workflow
- init_harness skills: multi-machine f-rr-d sync, GitHub auth prerequisites, `.gitignore` warnings, always-create dev folders + enforcement-ticket
- Enforcement ticket priority: all 3 ticket skills check enforcement tickets before work
- README `--reload` section: dedicated install command for cache-busting

**Previous (v1.7.1–v1.7.3):**
- Ticket skill notification integration + deprecated skill cleanup (v1.7.3)
- Platform-aware harness installer (v1.7.2): 11 detection + 4 adaptation modules
- Config-Manifest modularization: per-tool YAMLs + compile/validate pipeline (v1.7.1)
- 7 per-tool skill update scripts with format enforcement (v1.7.1)
- Test suite (4 scripts): YAML, manifest, on-disk skill validation (v1.7.1)
- Sidecar support documented per tool (v1.7.1)
- New skills: self-documentation, validate-manifest (deployed to all 7 tools) (v1.7.1)

**Previous (v1.6.1):**
- Command/skill conflicts resolved (run- prefix for Gemini, Antigravity)
- WoCoder cleanup (removed duplicate commands dir)
- New skill: womono_version_updater
- Extension dependency installation (fixes web-access missing deps)

---

## Full Changelog

For full changelog, see [CHANGELOG.md](../../CHANGELOG.md).