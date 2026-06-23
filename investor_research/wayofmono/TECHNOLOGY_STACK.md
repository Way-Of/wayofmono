# WayOfMono Technology Stack

## Core Technologies
| Layer | Technology | Version |
|-------|-----------|---------|
| Language | TypeScript | ES2024 |
| Runtime | Node.js | >=22 |
| Runtime | Deno | 2.x |
| Runtime | Bun | Latest |
| Package Manager | pnpm | 10 |
| Build | tsc (TypeScript) | 6.x |

## AI & LLM
| Component | Technology |
|-----------|-----------|
| LLM Abstraction | @wayofmono/wo-ai |
| Providers | OpenAI, Anthropic, Google Gemini, AWS Bedrock, Mistral, Azure, DeepSeek, xAI, Groq, and 20+ more |
| Local Inference | Ollama (qwen3.5:9b default) |

## Frontend / UI
| Layer | Technology |
|-------|-----------|
| Terminal UI | @wayofmono/wo-tui (custom, zero-dependency) |
| Web UI | @wayofmono/wo-web-ui (React 19) |
| Dashboard | Next.js 16 |
| Dashboard UI | Tailwind CSS 4, Radix UI, shadcn/ui |
| Dashboard State | Zustand, TanStack React Query |
| Dashboard Charts | Recharts |

## Database
| Component | Technology |
|-----------|-----------|
| Ticket storage | Markdown files (source of truth) + SQLite (read cache) |
| ORM | Prisma 6 |
| Auth | NextAuth v4 |

## Infrastructure
| Component | Technology |
|-----------|-----------|
| Container | Podman (Quadlets systemd) |
| Reverse Proxy | Caddy 2 |
| CI | GitHub Actions |
| CD | GitHub Actions (tag push → npm publish) |
| Deployment | Docker (Node 22 Alpine) |
| Dev Environment | Devbox |

## External Integrations
| Integration | Type |
|------------|------|
| Way of Pi | Uses @wayofmono/wo-agent as backend SDK |
| Way of Work | Uses @wayofmono/wo-agent as user agent SDK |
| OptiCat | Uses APIs, AI systems, harness |
| Telegram | First-party bot SDK |
| WhatsApp | First-party Cloud API SDK |
| Perplexity AI | Search provider |
| Exa | Search provider |
| Google Gemini | Search + API |
| GitHub API | Repo cloning + extraction |

## Published NPM Packages (13)
1. @wayofmono/wo-ai — Multi-Provider LLM API
2. @wayofmono/wo-tui — Terminal UI Library
3. @wayofmono/wo-agent-core — Agent Runtime
4. @wayofmono/wo-agent (wouser) — Agent SDK & CLI
5. @wayofmono/wo-coding-agent (wocode) — Coding Agent CLI
6. @wayofmono/wo-skill-docs — Documentation Expert
7. @wayofmono/wo-mermaid — TUI Mermaid Renderer
8. @wayofmono/web-access — Web Intelligence
9. @wayofmono/lens — Codebase Analysis
10. @wayofmono/wo-web-ui — Web UI Components
11. @wayofmono/telemetry — Telemetry
12. @wayofmono/telegram — Telegram Bot
13. @wayofmono/whatsapp — WhatsApp Bot
