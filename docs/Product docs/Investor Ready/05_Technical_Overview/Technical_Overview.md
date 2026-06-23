# WayOfMono — Technical Overview

## System Architecture

WayOfMono is built on an Interface-Agnostic Architecture — core logic and tools are shared across all major AI coding agent platforms.

### Four-Layer Architecture

**Layer 1: Agent Frontends (7 tools)**
- **wocode** — High-performance coding assistant CLI (our flagship)
- **wouser** — General-purpose user agent SDK + CLI
- **Claude Code** — Anthropic's coding agent
- **OpenCode** — Open-source TUI-driven agent
- **Gemini CLI** — Google's multimodal agent
- **Pi** — Pi Agent standard
- **Codex / Antigravity** — OpenAI and autonomous agent platforms

Each tool loads skills from its config directory. The harness installs to all simultaneously.

**Layer 2: AI Engineering Harness (Deno)**
The core installer (`install.ts`) and manifest (`manifest.json`) define 81 canonical skills adapted for all 7 tools. Includes:
- Skill system (SKILL.md frontmatter + instructions + assets)
- 6 subagents (codebase_analyzer, codebase_locator, codebase_pattern_finder, explore, general, thoughts_analyzer)
- 11 slash commands (/create_plan, /implement_plan, /validate_plan, /commit, /debug, etc.)
- 14 pipeline scripts (docs-sync, compliance, migration)

**Layer 3: NPM Packages (13 @wayofmono packages)**
| Package | Lines | Purpose |
|---------|-------|---------|
| @wayofmono/wo-ai | 30,616 | Unified LLM API — 30+ providers |
| @wayofmono/wo-agent-core | 7,218 | Agent runtime with context compaction |
| @wayofmono/wo-agent | 46,295 | General-purpose agent SDK (wouser) |
| @wayofmono/wo-coding-agent | 46,539 | Coding agent CLI (wocode) |
| @wayofmono/wo-tui | 11,160 | Custom zero-dependency TUI framework |
| @wayofmono/web-access | 11,684 | Web search, fetch, PDF/YouTube extraction |
| @wayofmono/lens | 2,460 | Codebase analysis & safety engine |
| @wayofmono/wo-web-ui | 579 | React 19 chat components |
| @wayofmono/telemetry | 188 | OpenTelemetry instrumentation |

**Layer 4: CTO Dashboard (Next.js 16)**
- SQLite read-cache with Markdown file source of truth
- Ticket management, standups, skill health, review queue, ideas board
- File watcher for real-time sync with AI tool edits
- Electron wrapper for desktop deployment

---

## Key Technical Differentiators

### 1. Multi-Provider LLM Abstraction
30+ LLM providers under a single unified API. Supports streaming, tool calling, thinking budgets, and OAuth. Providers include OpenAI, Anthropic, Google Gemini, AWS Bedrock, Mistral, Azure, DeepSeek, xAI, Groq, and more.

### 2. Custom TUI Framework
Built from scratch (not based on Ink/React/Blessed). Features differential rendering, Kitty image protocol, markdown rendering, fuzzy finding, and full keyboard state machine. 11,160 lines, 12 components.

### 3. Context Compaction Engine
Branch summarization and token estimation to manage LLM context windows across long agent sessions. Extensible session backends (JSONL/Memory).

### 4. Observability-Driven Development
OpenTelemetry instrumentation built into every agent interaction. Design traces before features.

### 5. Codebase Analysis Engine (lens)
Combines ast-grep (structural search), tree-sitter (language parsing), and LSP (diagnostics) into a unified safety pipeline with read-before-write guards.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript (ES2024, NodeNext) |
| Runtimes | Node.js 22+, Deno 2.x, Bun |
| Package Manager | pnpm 10 workspaces |
| Build | tsc (TypeScript 6.x) |
| LLM Providers | 30+ (OpenAI, Anthropic, Gemini, Bedrock, etc.) |
| Database | SQLite (Prisma ORM) |
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Container | Podman (Quadlets) / Docker |
| Reverse Proxy | Caddy 2 |
| CI/CD | GitHub Actions |
| Versioning | Changesets |

---

## Deployment

- **Docker multi-stage build**: Node 22 Alpine, Prisma migration, Next.js standalone output
- **Podman Quadlets**: Systemd-managed containers with Caddy reverse proxy
- **Cloudflare Tunnel**: Optional for zero-config HTTPS access
- **Devbox environment**: Reproducible development with Node 22, Deno, Bun, Podman pre-configured
