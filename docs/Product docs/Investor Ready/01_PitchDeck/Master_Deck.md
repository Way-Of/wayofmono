---
type: master_deck
version: "2.0"
project: WayOfMono
document_version: "1.0"
last_updated: "June 23, 2026"
status: Active
---

<!-- _class: cover -->

# WayOfMono
## The Universal AI Coding Agent Harness

One intelligence backend, any agent frontend.

**Pre-Seed Pitch Deck**
**June 2026**

---

<!-- _class: section -->

## The Problem

---

### The AI Developer Tools Market Is Fractured

**53% of developers use 2+ AI coding tools** (JetBrains, 2026), but there is no standard way to share skills, configurations, and memory across them.

- Each tool has its own config format, skill system, and agent runtime
- Switching tools means rebuilding everything from scratch
- Enterprise teams have zero visibility into tool adoption or effectiveness
- Every developer session starts with a blank slate — no shared context, memory, or best practices

---

<!-- _class: section -->

## Our Solution

---

### WayOfMono: The Universal Harness

WayOfMono sits above all AI coding tools as a shared intelligence layer. One command installs 81 battle-tested skills, 6 subagents, 11 slash commands, and full configurations across **7 AI coding tools simultaneously**.

- **Single source of truth**: Skills, agents, commands, and configs defined once, deployed everywhere
- **CTO Dashboard**: Real-time visibility into tool adoption, skill health, team velocity
- **Multi-provider LLM**: 30+ LLM providers via unified API — no vendor lock-in
- **Local-first**: Full privacy and offline capability with Ollama
- **Context engineering**: End-to-end workflow from ticket → plan → implementation → validation → commit

---

<!-- _class: feature -->
## Built for the Multi-Tool Reality

| Challenge | WayOfMono Solution |
|-----------|-------------------|
| Skills duplicated across 7 tools | One canonical source → auto-deploys to all tools |
| No team visibility into AI usage | CTO Dashboard: skill health, standups, review queue, analytics |
| Vendor lock-in to one AI tool | Works with all 7 tools + 30+ LLM providers |
| No context across sessions | f-rr-d context engineering: tickets → plans → validation |
| Manual setup on every machine | `ai-harness --tool=all --yes` — 30 seconds, done |

---

<!-- _class: metrics -->
## Product Architecture

```
┌─────────────────────────────────────────────┐
│           7 Agent Frontends                  │
│  wocode │ wouser │ Claude │ OpenCode        │
│  Gemini │ Pi │ Codex │ Antigravity          │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│      AI Engineering Harness (Deno)          │
│  81 Skills │ 6 Subagents │ 11 Commands       │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│       13 @wayofmono NPM Packages             │
│  wo-ai │ wo-agent │ wocode │ wo-tui │ lens  │
│  web-access │ telemetry │ telegram │ ...     │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│        CTO Dashboard (Next.js 16)            │
│  Tickets │ Standups │ Skills │ Reviews       │
└─────────────────────────────────────────────┘
```

---

<!-- _class: section -->

## Why Now

---

<!-- _class: table-slide -->

### The Market Is at an Inflection Point

| Trend | Timeline | Impact |
|-------|----------|--------|
| Agentic workflows replacing autocomplete | 2025-2027 | AI tools need sophisticated skill orchestration |
| 53% of developers use 2+ tools | 2026 | Cross-tool standardization becomes essential |
| Gartner: IDEs will be optional for 65% of teams | 2027 | Terminal-based AI tools need harness infrastructure |
| Enterprise governance becoming primary buying criteria | 2026-2027 | CTO Dashboard addresses gap no competitor fills |
| Market consolidating to 3-5 major tools | 2026-2028 | Harness layer becomes critical for portability |

---

<!-- _class: section -->

## Market Opportunity

---

<!-- _class: table-slide -->

### Massive and Growing

| Metric | Value | Source |
|--------|-------|--------|
| **TAM** (Total Agentic AI Market 2026) | **$40B** | Information Matters Q1 2026 |
| **Enterprise AI Coding Agent Market** | **$10B** | Gartner, May 2026 |
| **AI Code Tools Market 2026** | **$7.9B - $10.1B** | Precedence Research, MarketsandMarkets |
| **Market Growth Rate** | **26-48% CAGR** | Multiple sources |
| **AI Code Tools by 2035** | **$91B** | Precedence Research |
| **Developer Adoption** | **85% use AI tools regularly** | JetBrains 2025 Survey (24,534 respondents) |

WayOfMono's SAM: **$10B** — Enterprise AI coding agent tools market
WayOfMono's SOM: **$500M** — AI tool configuration and governance layer

---

<!-- _class: section -->

## Traction

---

<!-- _class: timeline -->

### Built, Shipped, and Working

**13 NPM packages** published under `@wayofmono` scope — installable today

**2 working CLI tools**: wocode (coding agent) + wouser (user assistant)

**CTO Dashboard**: Deployed at [cto.wayof.work](https://cto.wayof.work) — tickets, standups, skills, reviews

**AI Engineering Harness**: 81 skills across 7 tools, 906 SKILL.md files, 3,027 harness files

**386+ commits** on GitHub, full CI/CD pipeline

**3 external integrations**: Way of Pi, Way of Work, OptiCat

| Metric | Value |
|--------|-------|
| Source lines of code | ~223,697 |
| NPM packages | 13 |
| AI tools supported | 7 |
| Skills deployed | 81 |
| Harness files | 3,027 |
| Team | 2 core + 2 extended |

---

<!-- _class: section -->

## Business Model

---

### Open Core + Enterprise + Services

| Tier | Price | Features |
|------|-------|----------|
| **Community** | Free | Full harness, 81 skills, 7 tool support, local dashboard |
| **Team** | $19/seat/mo | Cloud dashboard, team management, standups, review queue, skill reporting |
| **Enterprise** | $49/seat/mo | SSO, audit logs, custom integrations, SLA, on-premises, dedicated support |

**Revenue Streams:**
- Enterprise licenses (per-seat subscription)
- Managed cloud dashboard (SaaS)
- Consulting & implementation services

---

<!-- _class: section -->

## Competition

---

<!-- _class: table-slide -->

### No One Addresses Cross-Tool Orchestration

| Capability | GitHub Copilot | Cursor | Claude Code | **WayOfMono** |
|-----------|:---:|:---:|:---:|:---:|
| Multi-tool support | ❌ | ❌ | ❌ | **✅ 7 tools** |
| Multi-provider LLM | ❌ | ❌ | ❌ | **✅ 30+ providers** |
| Team management | ❌ | ❌ | ❌ | **✅ CTO Dashboard** |
| Local/offline | ❌ | ❌ | ❌ | **✅ Ollama** |
| Skills system | ❌ | ❌ | Partial | **✅ 81 skills** |
| Context engineering | ❌ | ❌ | ❌ | **✅ f-rr-d** |
| Observability | ❌ | ❌ | ❌ | **✅ OpenTelemetry** |
| Cross-platform | VS Code only | VS Code fork | Terminal | **7 UIs** |

### Our Moat
- **Cross-tool portability**: Only solution that works across all major AI coding tools
- **Enterprise governance**: CTO Dashboard fills a gap no competitor addresses
- **Local-first**: Privacy and offline capability critical for regulated industries
- **Multi-provider**: No vendor lock-in — use any LLM with any tool

---

<!-- _class: section -->

## Team

---

<!-- _class: table-slide -->

| Name | Role | Background |
|------|------|------------|
| **Josef Lindbom** | Founder & CEO | Full-stack AI engineer. Built entire WoM platform: 13 packages, LLM abstraction, TUI framework, harness |
| **Craig Martin** | Co-founder | Engineering leader. Infrastructure, deployment, tooling |

**Extended Team**: Tomas (Engineering), Andre (Engineering)

---

<!-- _class: section -->

## The Ask

---

### $750,000 Pre-Seed at $5M Pre-Money Valuation

| Use | % | Amount |
|-----|---|--------|
| Engineering (2 full-time hires) | 50% | $375,000 |
| Go-to-Market (marketing, community, content) | 25% | $187,500 |
| Operations & Infrastructure | 15% | $112,500 |
| Legal & Admin (US C-Corp, IP, compliance) | 10% | $75,000 |

**18-month runway** to enterprise revenue and Series A metrics

---

<!-- _class: section -->

## Roadmap

---

| Horizon | Focus |
|---------|-------|
| **Short-Term (0-12 mo)** | Enterprise SSO, multi-workspace, skill marketplace, performance optimization |
| **Medium-Term (12-24 mo)** | AI-powered analytics, custom skill builder UI, CI/CD integration, compliance certs |
| **Long-Term (24+ mo)** | Enterprise agent marketplace, autonomous orchestration, governance platform |

---

<!-- _class: vision -->

## Our Vision

A world where every engineering team has a unified AI infrastructure — regardless of which tools, models, or workflows they choose.

WayOfMono: the operating system for AI-augmented software engineering.

---

<!-- _class: contact -->

## Contact

**Josef Lindbom**
Founder & CEO
josef.lindbom@gmail.com
[github.com/Way-Of/wayofmono](https://github.com/Way-Of/wayofmono)

---

**Document Version**: 1.0
**Last Updated**: June 23, 2026
