---
title: "[PROJ-007] Implement @wayofmono/wo-coding-agent — CLI Coding Agent"
type: "Feature"
priority: "Critical"
status: "In Progress"
assignee: "@zerwiz"
created: "2026-05-13"
---

## Context
The `@wayofmono/wo-coding-agent` package is the CLI application that ties together `wo-ai`, `wo-agent-core`, and `wo-tui` into a working coding assistant. It corresponds to `@earendil-works/pi-coding-agent` (93 source files, ~15k lines) which provides the `pi` CLI binary.

The reference implementation at `ref/pi/coding-agent/` has 4 run modes (interactive, print, JSON, RPC), a full session system, 7 built-in tools, extension/skill/theme systems, context compaction, package management, and many utilities.

### Architecture: Project-Local (NOT global)
`wo` is a **project-local agent** — it lives in your project's `node_modules`, stores sessions/config/tools in `<project-root>/.wo/`, and runs via `npx wo`. No global install required. The `.wo/` directory is version-control-friendly (gitignorable but tracked if desired). This is a deliberate divergence from pi's `~/.wo/` global approach.

## Requirements & Scope

### Phase 1: Scaffold (DONE)
- [x] Package scaffold with dual CJS/ESM output
- [x] Core stubs: AgentSession, SettingsManager, AuthStorage, ModelRegistry, SessionManager
- [x] Tool definition stubs (bash, read, write, edit, grep, find, ls)
- [x] CLI entry: `src/cli.ts` (shebang), `src/main.ts` (mode dispatch), `src/cli/args.ts` (parser)
- [x] Print mode: `wo -p "prompt"` echo response

### Phase 2: Real AgentSession
- [ ] Wire wo-ai `complete()` / `completeSimple()` into AgentSession.prompt()
- [ ] Message queue: steering + follow-up during streaming
- [ ] onStream chunk forwarding via AgentSession events
- [ ] Abort signal propagation from session to provider fetch
- [ ] Model switching during session
- [ ] Thinking level configuration

### Phase 3: Real Tool Implementations
- [ ] `bash` tool — child_process.spawn with streaming output, cancellation
- [ ] `read` tool — file reading with line range, image reading
- [ ] `write` tool — file creation/overwrite
- [ ] `edit` tool — find/replace editing with mutation queue
- [ ] `grep` tool — content search with glob patterns
- [ ] `find` tool — glob-based file discovery
- [ ] `ls` tool — directory listing
- [ ] Tool output truncation (line/byte limits)

### Phase 4: Interactive Mode
- [ ] TUI framework integration with wo-tui components
- [ ] Chat container: assistant messages, tool calls, results
- [ ] Editor: multi-line input with history
- [ ] Footer: model, tokens, cost, git branch
- [ ] Slash commands: /model, /settings, /help, /compact, etc.
- [ ] Keyboard shortcuts
- [ ] Session picker for --resume
- [ ] Pending message queue display

### Phase 5: Session Persistence
- [ ] JSONL session file format
- [ ] Session save to ` <project-root>/.wo/sessions/` (project-local, NOT `~/.wo/`)
- [ ] Session restoration on --continue
- [ ] Session branching / tree navigation (--fork, /tree)

### Phase 6: Compaction
- [ ] Cut-point algorithm
- [ ] LLM-based summarization
- [ ] Auto-compaction on threshold
- [ ] Overflow recovery + auto-retry

### Phase 7: Settings & Auth
- [ ] Project-local file-based settings (`<project-root>/.wo/config.json`)
- [ ] Settings merge semantics (project config overrides defaults)
- [ ] Auth storage in `.wo/auth/` with file locking
- [ ] OAuth flow support
- [ ] API key resolution chain: env vars → `.wo/config.json` → system keychain

### Phase 8: Extensions & Skills
- [ ] Extension discovery from dirs
- [ ] Extension runtime with typed events
- [ ] Skill loading from .md files
- [ ] Context files (AGENTS.md/CLAUDE.md)

### Phase 9: Package Manager
- [ ] `wo install` from npm/git
- [ ] `wo remove`, `wo update`, `wo list`
- [ ] Extension registry

### Phase 10: RPC Mode & Export
- [ ] JSON-RPC over stdin/stdout
- [ ] HTML session export

## Progress

### Completed
- Package scaffold (package.json, tsconfigs, directory structure)
- Core stubs (AgentSession, SettingsManager, AuthStorage, ModelRegistry with 8 built-in models)
- Tool stubs (7 tool definitions with TypeBox schemas)
- CLI entry with full arg parser (--mode, --model, --print, --session, --fork, --tools, etc.)
- Print mode with echo response
- SessionManager (in-memory)
- MessageConverter

### In Progress
- Detailed gap analysis against pi/coding-agent (80 files missing)

## Dependencies
- `@wayofmono/wo-ai` (workspace)
- `@wayofmono/wo-agent-core` (workspace)
- `@wayofmono/wo-tui` (workspace)
- `@wayofmono/telemetry` (workspace)
- `typebox` (tool parameter schemas)

## Success Criteria
- [ ] `wo` binary runs with full arg parsing
- [ ] `wo -p "hello"` returns LLM response
- [ ] Interactive mode renders TUI with working editor, chat, footer
- [ ] All 7 built-in tools execute real operations
- [ ] Sessions persist across restarts
- [ ] Compaction keeps context within window
- [ ] Extensions load and register commands/tools
- [ ] Skills load from .md files
- [ ] `npm run build` produces dual CJS/ESM
- [ ] `npm run test` passes
