# WayOfMono Codebase Analysis

## Overview
WayOfMono (Wo) is a monorepo consolidation for high-performance AI coding agents. It provides a shared Intelligence Backend (Packages, Tools, Memory) serving 7 distinct Agent Frontends.

## Repository Stats
- **Total files**: 51,033 (excluding node_modules)
- **Source files**: ~987 TS/TSX files (~223,697 lines)
- **AI Engineering Harness**: 3,027 files
- **Thoughts (f-rr-d)**: 70,444 files
- **NPM packages published**: 13
- **SKILL.md files**: 906 (81 canonical × 7 tools + doc copies)
- **AI coding tools supported**: 7
- **Subagents**: 6
- **Active developers**: 4 (craig, tomas, andre, zerwiz)
- **Active tickets**: 29+
- **Harness version**: 1.7.6
- **Git commits**: 386+

## Architecture
- **Interface-Agnostic**: Core logic and tools shared across all major coding agent platforms
- **7 tool frontends**: wocode, wouser, Claude Code, OpenCode, Gemini CLI, Pi, Codex, Antigravity
- **81 battle-tested skills** deployed across all tools
- **6 subagents**: codebase_analyzer, codebase_locator, codebase_pattern_finder, explore, general, thoughts_analyzer

## Technology Stack
- **Runtime**: Node.js >=22, Deno 2.x, Bun
- **Package Manager**: pnpm 10 workspaces
- **Language**: TypeScript (ES2024, NodeNext), React 19 (TSX)
- **Frameworks**: Next.js 16 (dashboard), Tailwind CSS 4, Radix UI, Prisma/SQLite
- **LLM Providers**: 30+ providers via `@wayofmono/wo-ai` (OpenAI, Anthropic, Gemini, AWS Bedrock, Mistral, etc.)
- **Build**: TypeScript 6.x + tsc, Changesets for versioning
- **CI/CD**: GitHub Actions
- **Deployment**: Podman Quadlets (systemd), Docker, Caddy reverse proxy

## Key Packages
| Package | Lines | Purpose |
|---------|-------|---------|
| @wayofmono/wo-ai | 30,616 | Multi-Provider LLM API (30+ providers) |
| @wayofmono/wo-agent-core | 7,218 | Central Agent Runtime & Extension API |
| @wayofmono/wo-agent (wouser) | 46,295 | General-Purpose Agent SDK & CLI |
| @wayofmono/wo-coding-agent (wocode) | 46,539 | CLI Coding Agent |
| @wayofmono/wo-tui | 11,160 | High-Performance Terminal UI Library |
| @wayofmono/telemetry | 188 | OpenTelemetry instrumentation |
| @wayofmono/wo-web-ui | 579 | React 19 Web UI Components |
| @wayofmono/lens | 2,460 | Codebase Analysis & Safety Engine |
| @wayofmono/web-access | 11,684 | Web search, URL fetching, PDF/YouTube extraction |
| @wayofmono/telegram | 192 | Telegram bot SDK |
| @wayofmono/whatsapp | 185 | WhatsApp bot SDK |
