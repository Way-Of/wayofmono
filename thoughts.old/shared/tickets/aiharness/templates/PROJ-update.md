# Wo — Architecture Reset (2026-05-13)

## Package Roles

```
@wayofmono/wo-ai             50 files from pi/ai/     ← LLM PROVIDERS
@wayofmono/wo-tui            25 files from pi/tui/    ← TERMINAL UI RENDERER
@wayofmono/wo-agent-core     25 files from pi/agent/  ← AGENT RUNTIME CORE
@wayofmono/wo-agent          141 files from pi/coding-agent/ ← USER/CLIENT AGENT SDK ← YOU ARE HERE
@wayofmono/wo-coding-agent   141 files from pi/coding-agent/ ← CLI SHELL (thin wrapper)
@wayofmono/wo-web-ui         0 files                  ← WEB UI (TODO)
@wayofmono/telemetry         5 files (native)          ← OBSERVABILITY
```

## What wo-agent IS

**wo-agent = the user/client adapted agent.** This is the package that external developers install and import in their own projects:

```ts
import { createAgent } from "@wayofmono/wo-agent";

const agent = await createAgent({
  model: { api: "anthropic", modelId: "claude-sonnet-4-20250514" },
  skills: ["docs", "files"],
});

const result = await agent.prompt("summarize this project");
```

It's a **programmable, embeddable agent SDK** built from the full pi/coding-agent source (141 files). It keeps:
- AgentSession (3110 lines) — full session lifecycle, tool loop, events
- All 7 tools — bash, read, write, edit, grep, find, ls
- Interactive TUI mode — for local development use
- Extensions system — plugin loading
- Skills system — SKILL.md discovery + loading
- Settings, auth storage, model registry
- Utilities — shell, git, paths, syntax highlighting
- Print mode, RPC mode

It strips:
- CLI-specific dispatch (`main.ts` → lives in wo-coding-agent)
- Binary entry point (`cli.ts` → lives in wo-coding-agent)
- The `wo` command itself

## What wo-coding-agent IS

**wo-coding-agent = the CLI binary.** It has ALL the same 141 files from pi/coding-agent — the full agent, tools, interactive mode, utilities, everything. The ONLY thing that differs from wo-agent:
- wo-agent strips the CLI entry point (`cli.ts`, `main.ts`) for clean programmatic import
- wo-coding-agent keeps those AND adds the `wo` binary on top

Both packages are FULL pi/coding-agent ports. No features removed from either.

## Status

ALL 382 source files across 4 packages have pi import paths. 0% adapted. Nothing compiles.

## Next Steps

1. Create package.json for all 6 packages
2. Bulk find-and-replace `@earendil-works/pi-*` → `@wayofmono/wo-*`
3. Fix index.ts exports
4. Fix TypeScript errors (build order: wo-ai → wo-tui → wo-agent-core → wo-agent → wo-coding-agent)
5. Trim wo-coding-agent to CLI-only
