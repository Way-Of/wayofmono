# Wo — COMPREHENSIVE STATUS (2026-05-13)

## Architecture

```
wo-ai (providers) — 50 files from pi/ai/src/
  ↑
wo-tui (terminal UI) — 25 files from pi/tui/src/
  ↑
wo-agent-core (runtime) — 25 files from pi/agent/src/
  ↑
wo-agent (USER AGENT SDK) — ~139 files from pi/coding-agent/src/ (no cli.ts, no bun/)
  ↑
wo-coding-agent (CLI BINARY) — ~141 files from pi/coding-agent/src/ (keeps everything)
```

## Package Status

| Package | Files | tsconfig | Imports Fixed | tsc build | Assets copied |
|---------|-------|----------|---------------|-----------|---------------|
| wo-ai | 50 | ✅ | ✅ | ✅ | N/A |
| wo-tui | 25 | ✅ | ✅ | ✅ | N/A |
| wo-agent-core | 25 | ✅ | ✅ | ✅ | N/A |
| wo-agent | ~139 | ✅ | ✅ | ✅ | ✅ |
| wo-coding-agent | ~141 | ✅ | ✅ | ✅ | ✅ |
| telemetry | 5 | ✅ | N/A (native) | ✅ | N/A |
| lens | 14 .ts + 800+ .yml | ✅ | N/A | ✅ (9 missing modules created) | N/A |
| wo-web-ui | 8 files | ✅ | N/A | ✅ (React 19 components) | N/A |

## Key Differences: wo-agent vs wo-coding-agent

| Aspect | wo-agent (SDK) | wo-coding-agent (CLI) |
|--------|---------------|----------------------|
| `cli.ts` | ❌ Removed | ✅ Kept |
| `bun/` dir | ❌ Removed | ✅ Kept |
| `bin` in pkg.json | ❌ None | ✅ `"wo": "src/cli.ts"` |
| Intended use | `import { createAgent } from "@wayofmono/wo-agent"` | `npx wo` |

## Applied Changes (382 source files adapted from pi)

1. **Package renames:** `@earendil-works/pi-*` → `@wayofmono/wo-*`
2. **Config dir:** `.pi` → `.wo`, APP_NAME `"pi"` → `"wo"`, env vars `PI_*` → `WO_*`
3. **Log paths:** `pi-debug`/`pi-crash` → `wo-debug`/`wo-crash`
4. **Display strings:** `~/.pi/agent/` → `User config`, `.pi/` → `.wo/`
5. **Temp files:** `pi-editor-*.pi.md` → `wo-editor-*.wo.md`
6. **Missing deps added:** `@smithy/types`, `@smithy/node-http-handler` (wo-ai); `@types/node` (wo-tui); `@silvia-odwyer/photon-node`, `shx` (wo-agent + wo-coding-agent); `@types/node` (telemetry)
7. **Exports added:** `./bedrock-provider` (wo-ai)
8. **tsconfig.base.json:** ES2022 → ES2024 (+ `/v` regex), `types: ["node"]`
9. **Telemetry fix:** `BasicTracerProvider` type usage, `setAttribute` type cast
10. **Wo-agent files:** moved from package root → `src/`
11. **Build scripts:** `build` → `tsc && npm run copy-assets` for agent packages

## Remaining

- **Tests**: pi reference did not include test files in src/ — none to run
