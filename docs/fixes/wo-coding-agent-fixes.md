# wo-coding-agent Fixes & Release Notes

## v1.0.9 — 2026-06-14

### Added: docs folder to npm package
- **Files**: `docs/providers.md`, `docs/models.md`
- **Reason**: Users need configuration guidance for providers and models
- **Impact**: Global install now includes documentation for troubleshooting

### Fixed: Ollama default configuration
- **Files**: `src/main.ts` (create default models.json)
- **Default**: Ollama provider with `qwen3.5:9b` model
- **Settings**: Default provider = ollama, default model = qwen3.5:9b

---

## v1.0.8 — 2026-06-14

### Fixed: CONFIG_DIR_NAME separation
- **Changed**: `.wo` → `.wocoder`
- **Reason**: Separate config directories for different tools:
  - **wouser** (user agent): `~/.wo/agent/`
  - **wocode** (coding agent): `~/.wocoder/agent/`
- **Impact**: Windows user was getting `.wo` (wouser config) instead of `.wocoder`

### Updated: Environment variables
- `WOCODE_CODING_AGENT_DIR` (was `WO_CODING_AGENT_DIR`)
- `WOCODE_CODING_AGENT_SESSION_DIR` (was `WO_CODING_AGENT_SESSION_DIR`)

---

## v1.0.7 — 2026-06-14

### Fixed: npm workspace dependencies
- **Changed**: `workspace:*` → explicit versions (`^1.0.4`)
- **Dependencies**: `@wayofmono/wo-agent-core`, `@wayofmono/wo-ai`, `@wayofmono/wo-tui`
- **Reason**: npm doesn't support pnpm's `workspace:*` protocol

### Published: First working npm global install
- `npm install -g @wayofmono/wo-coding-agent` now works

---

## v1.0.6 — 2026-06-14

### Fixed: Link protocol removal
- **Problem**: `npm error Unsupported URL Type "link:"`
- **Root Cause**: pnpm workspace used `link:` protocol in package.json
- **Fix**: Removed `link:` dependencies, use pnpm workspace syntax

### Updated: Package version bump
- Version: 1.0.5 → 1.0.6

---

## v1.0.5 and earlier — Pre-fixes

### Known Issues (now fixed)
- ❌ `link:` protocol in dependencies (npm incompatible)
- ❌ `workspace:*` in npm-published package (npm incompatible)
- ❌ CONFIG_DIR_NAME `.wo` shared with wouser (wrong)
- ❌ No docs folder in npm package
- ❌ No default Ollama models.json

---

## Quick Reference: Version Timeline

| Version | Date | Key Fix |
|---------|------|---------|
| 1.0.9 | 2026-06-14 | Added docs folder, Ollama defaults |
| 1.0.8 | 2026-06-14 | CONFIG_DIR_NAME: .wo → .wocoder |
| 1.0.7 | 2026-06-14 | npm workspace deps → explicit versions |
| 1.0.6 | 2026-06-14 | Removed link: protocol |
| 1.0.5 | 2026-06-10 | Pre-fix baseline |

---

## Installation Verification

### ✅ Working (v1.0.9+)
```bash
npm install -g @wayofmono/wo-coding-agent
wocode --init
# Creates .wocoder/ with models.json (Ollama), settings.json
wocode --no-skills --print "test"
```

### ✅ Config Directory Structure
```
~/.wocoder/
├── agent/
│   ├── models.json      # Ollama default: qwen3.5:9b
│   ├── settings.json    # Default provider: ollama
│   ├── bin/             # fd, rg binaries
│   ├── skills/          # Harness skills (when installed)
│   ├── prompts/         # Prompt templates
│   ├── themes/          # Custom themes
│   └── extensions/      # Extensions
└── ...
```

### ❌ Still Missing (Future Work)
- Harness skills installation via `ai-harness --tool=wocoder` (only 25/81 skills in manifest)
- Extensions, prompts, themes from harness
- Skills in `/skill:` commands and system prompt

---

## Related Documentation

- [CHANGELOG.md](../../CHANGELOG.md) - Full changelog
- [Providers Guide](../guides/providers.md) - Provider configuration
- [Models Configuration](../guides/models-json.md) - models.json schema
- [WOMONO-074 Ticket](../../thoughts/wayofmono/zerwiz/WOMONO-074-fix-npm-installation-in-pnpm-workspace.md) - Full ticket history