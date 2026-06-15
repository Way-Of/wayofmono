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
| **Harness** | `@aiengineeringharness` | v1.7.0 | `~/.wocode/`, `~/.pi/agent/`, etc. |

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

**Quick Summary (v1.7.0):**
- Config-Manifest modularization: per-tool YAMLs + compile/validate pipeline
- 7 per-tool skill update scripts with format enforcement
- Test suite (4 scripts): YAML, manifest, on-disk skill validation
- Sidecar support documented per tool
- New skills: self-documentation, validate-manifest (deployed to all 7 tools)

**Previous (v1.6.1):**
- Command/skill conflicts resolved (run- prefix for Gemini, Antigravity)
- WoCoder cleanup (removed duplicate commands dir)
- New skill: womono_version_updater
- Extension dependency installation (fixes web-access missing deps)

---

## Full Changelog

For full changelog, see [CHANGELOG.md](../../CHANGELOG.md).