# wouser (wo-agent) Fixes & Release Notes

## v1.0.4 — 2026-06-14

### Fixed: npm workspace dependencies
- **Changed**: `workspace:*` → explicit versions (`^1.0.4`)
- **Dependencies**: `@wayofmono/wo-agent-core`, `@wayofmono/wo-ai`, `@wayofmono/wo-tui`
- **Reason**: npm doesn't support pnpm's `workspace:*` protocol

### Published: First working npm global install
- `npm install -g @wayofmono/wo-agent` now works

---

## v1.0.3 and earlier — Pre-fixes

### Known Issues (now fixed)
- ❌ `workspace:*` in npm-published package (npm incompatible)
- ❌ CONFIG_DIR_NAME `.wo` shared with wocode (wrong)

---

## Installation Verification

### ✅ Working (v1.0.4+)
```bash
npm install -g @wayofmono/wo-agent
wouser --init
# Creates .wo/agent/ with models.json (Ollama), settings.json
```

### ✅ Config Directory Structure
```
~/.wo/
├── agent/
│   ├── models.json      # Ollama default: qwen3.5:9b
│   ├── settings.json    # Default provider: ollama
│   ├── bin/             # fd, rg binaries
│   ├── skills/          # Harness skills (when installed)
│   ├── prompts/         # Prompt templates
│   ├── themes/          # Custom themes
│   └── extensions/      # Extensions (subagent, open-editor, theme-cycler)
└── ...
```

### Key Distinction: wouser vs wocode
| Tool | Package | Config Dir | Purpose |
|------|---------|------------|---------|
| **wouser** | `@wayofmono/wo-agent` | `~/.wo/` | General-purpose user agent (SDK + CLI) |
| **wocode** | `@wayofmono/wo-coding-agent` | `~/.wocoder/` | Coding-specific CLI assistant |

These are SEPARATE tools with separate configs - do NOT conflate them.