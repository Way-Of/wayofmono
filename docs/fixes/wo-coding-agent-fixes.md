# wo-coding-agent Fixes & Release Notes

## v1.0.11 — 2026-06-14

### Enhanced: Init command success message
- **Files**: `src/main.ts` (init command)
- **Added**: Clear guidance showing config file locations and Ollama setup steps
- **Output**: Shows `.wocode/models.json`, `.wocode/settings.json` locations
- **Added**: Step-by-step Ollama installation instructions

### Fixed: Wocoder skill directories renamed to kebab-case (matches Pi convention)
- **Files**: 
  - `packages/@aiengineeringharness/wocode/agent/skills/` - all 81 directories renamed
  - `packages/@aiengineeringharness/manifest.json` - all skill entries updated
  - `packages/@aiengineeringharness/wocode/agent/skills/*/SKILL.md` - name fields updated
- **Change**: snake_case → kebab-case (e.g., `auto_ticket_creator` → `auto-ticket-creator`)
- **Reason**: Matches Pi's kebab-case convention; fixes "name contains invalid characters" validation errors
- **Impact**: All 81 skills now use consistent kebab-case naming across Pi and wocode

---

## v1.0.10 — 2026-06-14

### Fixed: Extension loading errors no longer crash wocode
- **Files**: `src/main.ts` (runtime creation)
- **Change**: Extension load errors changed from `type: "error"` → `type: "warning"`
- **Impact**: wocode starts even if extensions fail to load (e.g., web-access missing deps)
- **User sees**: Warning message instead of crash

---

## v1.0.9 — 2026-06-14

### Fixed: CONFIG_DIR_NAME separation
- **Changed**: `.wo` → `.wocode`
- **Reason**: Separate config directories for different tools:
  - **wouser** (user agent): `~/.wo/agent/`
  - **wocode** (coding agent): `~/.wocode/agent/`
- **Impact**: Windows user was getting `.wo` (wouser config) instead of `.wocode`

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
| 1.0.8 | 2026-06-14 | CONFIG_DIR_NAME: .wo → .wocode |
| 1.0.7 | 2026-06-14 | npm workspace deps → explicit versions |
| 1.0.6 | 2026-06-14 | Removed link: protocol |
| 1.0.5 | 2026-06-10 | Pre-fix baseline |

---

## Installation Verification

### ✅ Working (v1.0.9+)
```bash
npm install -g @wayofmono/wo-coding-agent
wocode --init
# Creates .wocode/ with models.json (Ollama), settings.json
wocode --no-skills --print "test"
```

### ✅ Config Directory Structure
```
~/.wocode/
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
- Harness skills installation via `ai-harness --tool=wocode` (only 25/81 skills in manifest)
- Extensions, prompts, themes from harness
- Skills in `/skill:` commands and system prompt

---

## Related Documentation

- [CHANGELOG.md](../../CHANGELOG.md) - Full changelog
- [Providers Guide](../guides/providers.md) - Provider configuration
- [Models Configuration](../guides/models-json.md) - models.json schema
- [WOMONO-074 Ticket](../../thoughts/wayofmono/zerwiz/WOMONO-074-fix-npm-installation-in-pnpm-workspace.md) - Full ticket history