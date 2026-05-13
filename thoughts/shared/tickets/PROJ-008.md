---
title: "[PROJ-008] Port pi packages → @wayofmono/* — batch-copy remaining modules"
type: "Task"
priority: "High"
status: "In Progress"
assignee: "@zerwiz"
created: "2026-05-13"
---

## Context
Pi reference at `ref/pi/` has 4 packages (ai, agent, coding-agent, tui) with ~190 source files. Wo has 7 packages with partial stubs. The goal is to copy pi modules that have no Wo equivalent, adapting imports/paths as needed. This avoids rewriting what pi already has working.

## Copy Plan — What to Copy Where

### 1. pi/coding-agent/src/utils/ → wo-coding-agent/src/utils/
22 files. Self-contained utilities with minimal deps.

| File | Deps | Status | Notes |
|------|------|--------|-------|
| `sleep.ts` | none | ✅ COPIED | |
| `paths.ts` | node:fs, node:path | ✅ COPIED | |
| `ansi.ts` | none | ✅ COPIED | |
| `html.ts` | none | ✅ COPIED | |
| `mime.ts` | node:fs/promises | ✅ COPIED | |
| `fs-watch.ts` | node:fs | ✅ COPIED | |
| `child-process.ts` | node:child_process | ✅ COPIED | |
| `frontmatter.ts` | `yaml` | ✅ COPIED | Added yaml dep |
| `changelog.ts` | node:fs | ✅ COPIED | Removed pi config re-export |
| `shell.ts` | node:fs, child_process | ✅ COPIED | Removed pi config import |
| `git.ts` | `hosted-git-info` | ✅ COPIED | Added dep |
| `syntax-highlight.ts` | `highlight.js`, html.ts | ✅ COPIED | Added dep |
| `tools-manager.ts` | node:fs, child_process, stream | ✅ COPIED | Replaced pi config → inline |
| `pi-user-agent.ts` | none | ✅ COPIED | Renamed to getUserAgent |
| `clipboard.ts` | native addon + platform tools | ❌ SKIP | Requires `@mariozechner/clipboard` native addon |
| `clipboard-image.ts` | photon-node + native addon | ❌ SKIP | Requires `@silvia-odwyer/photon-node` |
| `clipboard-native.ts` | `@mariozechner/clipboard` | ❌ SKIP | Native module |
| `photon.ts` | `@silvia-odwyer/photon-node` | ❌ SKIP | Native WASM module |
| `exif-orientation.ts` | photon-node | ❌ SKIP | Depends on photon |
| `image-convert.ts` | photon-node | ❌ SKIP | Depends on photon |
| `image-resize.ts` | pi-ai types, photon-node | ❌ SKIP | Depends on pi types + photon |
| `version-check.ts` | pi-user-agent, pi-specific API | ❌ SKIP | pi.dev API endpoint |

### 2. pi/coding-agent/src/core/tools/ → wo-coding-agent/src/tools/ ✅ DONE
15 files. 7 tool implementations + infrastructure (truncation, path utils, mutation queue). All copied and adapted May 13.

| File | Deps | Status | Notes |
|------|------|--------|-------|
| `bash.ts` | child_process, shell.ts | ✅ DONE | Core bash exec with streaming |
| `read.ts` | fs, paths.ts, mime.ts | ✅ DONE | File read with line range/truncation |
| `write.ts` | fs, mutation queue | ✅ DONE | File create/overwrite |
| `edit.ts` | fs, mutation queue | ✅ DONE | Surgical line edits |
| `edit-diff.ts` | fs, mutation queue | ✅ DONE | Unified-diff editing |
| `grep.ts` | child_process, tools-manager | ✅ DONE | ripgrep wrapper |
| `find.ts` | child_process, tools-manager | ✅ DONE | fd wrapper |
| `ls.ts` | fs | ✅ DONE | Directory listing |
| `output-accumulator.ts` | none | ✅ DONE | |
| `path-utils.ts` | node:path | ✅ DONE | Workspace-bound path resolution |
| `truncate.ts` | none | ✅ DONE | Head/tail/line truncation |
| `file-mutation-queue.ts` | none | ✅ DONE | Serialize file writes |
| `render-utils.ts` | none | ❌ SKIP | TUI rendering stripped |
| `tool-definition-wrapper.ts` | types | ❌ SKIP | Wo uses ToolDefinition directly |
| `index.ts` | all of the above | ✅ DONE | Barrel + factory |

### 3. pi/agent/src/harness/compaction/ → wo-agent-core/src/compaction/
3 files. Session compaction (cut-point, LLM summarization, branch summarization).

| File | Deps | Status | Notes |
|------|------|--------|-------|
| `compaction.ts` | ~26KB | ❌ PENDING | Core algorithm |
| `utils.ts` | ~5.7KB | ❌ PENDING | File ops, serialization |
| `branch-summarization.ts` | ~11KB | ❌ PENDING | Branch summaries |

### 4. pi/coding-agent/src/core/ → wo-coding-agent/src/core/session/
The central session from pi is ~3110 lines. Wo has a ~50 line stub that needs real implementation.

### 4a. pi/coding-agent/src/core/agent-session.ts → wo-coding-agent/src/core/session/
3110 line file — the central session class.

| Component | Lines | Status | Notes |
|-----------|-------|--------|-------|
| Session state + config | ~300 | ❌ PENDING | |
| Tool registry + system prompt | ~400 | ❌ PENDING | |
| Agent loop (prompt/steer/followUp/sendCustom) | ~600 | ❌ PENDING | |
| Auto-compaction + overflow recovery | ~300 | ❌ PENDING | |
| Event system (subscribe/emit) | ~200 | ❌ PENDING | |
| Session persistence I/O | ~400 | ❌ PENDING | |
| Bash execution | ~200 | ❌ PENDING | |
| Extension hooks | ~200 | ❌ PENDING | |
| Custom message types | ~500 | ❌ PENDING | |

### 5. pi/agent/src/ → wo-agent-core/src/
Core agent runtime (Agent, agent-loop, proxy).

| File | Size | Status | Notes |
|------|------|--------|-------|
| `agent.ts` | 17KB | ❌ PENDING | |
| `agent-loop.ts` | 19KB | ❌ PENDING | |
| `types.ts` | 16KB | ❌ PENDING | |
| `proxy.ts` | 10KB | ❌ PENDING | |

### 6. pi/agent/src/harness/session/ → wo-agent-core/src/session/
Session management (JSONL/memory storage, branching).

| File | Status | Notes |
|------|--------|-------|
| `session.ts` | ❌ PENDING | Session class |
| `repo/jsonl-storage.ts` | ❌ PENDING | JSONL persistence |
| `repo/memory-storage.ts` | ❌ PENDING | In-memory storage |
| `uuid.ts` | ❌ PENDING | UUID generation |

### 7. pi/tui/src/ → wo-tui/src/
TUI components (Inline, overlay, ProcessTerminal, editor).

| Component | Status | Notes |
|-----------|--------|-------|
| `Inline` | ❌ PENDING | Rich text composition |
| Overlay system | ❌ PENDING | Widget overlay |
| `ProcessTerminal` | ❌ PENDING | Raw terminal I/O |
| Footer/status bar | ❌ PENDING | Tokens, model |
| `ui.input()` | ❌ PENDING | Interactive prompt |
| `SelectItem` | ❌ PENDING | Keyboard nav picker |
| `CustomEditor` | ❌ PENDING | Multi-line editor |

---

## Project-Local Architecture (FIRST CLASS — NOT FALLBACK)

`wo` is a **project-local agent**. Everything lives in the project tree. There is NO global `~/.wo/` fallback for project operations.

### Discovery
- Walk up from CWD to find project root (has `package.json`)
- If no project found, print error: "Run `wo` from a project directory with package.json"
- Sessions, config, tools, auth all go in `<project-root>/.wo/`

### Session Storage
- `<project-root>/.wo/sessions/` — period. No global fallback.

### Config
- `<project-root>/.wo/config.json` — project-specific config
- No global ~/.wo/config.json — use env vars for cross-project settings (API keys, etc.)

### Tools (fd/rg)
- Lookup order: `.wo/bin/` in project → system PATH (not global)
- Download target: `<project-root>/.wo/bin/`
- Binary tools are project-scoped

### CLI
- `npx wo` or `./node_modules/.bin/wo` — no global install
- Must detect project context; refuses to run outside a project tree
- `WO_PROJECT_DIR` env var can override project detection

### package.json additions
- `"bin"` entry stays for node_modules/.bin symlink
- Recommend `.wo/` in `.gitignore` unless user opts to track

### Source of this monorepo
This monorepo (`@wayofmono/*` packages) IS the dependency — other systems install `@wayofmono/wo-coding-agent` from npm and get the full agent. The monorepo is the single source of truth for all wo packages. No pi packages are imported at runtime — they are copied reference only.
