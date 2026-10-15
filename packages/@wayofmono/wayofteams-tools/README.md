<div align="center">

# @wayofmono/wayofteams-tools

**WayOfTeams MCP + REST tools, as a pi extension**

Connect the [pi](https://pi.dev) coding agent to your **WayOfTeams** workspace — tickets,
plans, docs, standups, kanban, knowledge, memory and more — over the internet, for any
tenant, with a single install.

[Install](#install) · [Configure](#configure) · [Commands](#commands) · [How it works](#how-it-works) · [Development](#development)

`pi-package` · MCP · REST · client-first

</div>

---

## Why this extension

pi doesn't ship a built-in MCP client, and generic MCP bridges can't do WayOfTeams' Bearer
auth. `wayofteams-tools` is **ours**: a first-class MCP client *and* a direct REST client,
built client-first so your whole team can drive WayOfTeams from pi.

- **Full surface** — the WayOfTeams MCP exposes **~269 tools across 12 domains**:
  tickets, plans, docs, standups, kanban, ideas, skills, templates, thoughts, knowledge,
  rules, memory/anchor, agents (orchestration + multi-agent), versions, and more.
- **MCP + REST dual path** — talks MCP first; falls back to the REST adapter
  (`/api/v1/tools`) and direct REST endpoints when MCP is unavailable, so the chat keeps
  working.
- **Both endpoint families** — supports the legacy `/mcp` monolith and the v2
  `/mcp/v2` domain-split surfaces, auto-probing the healthiest.
- **Client-first auth** — per-user JWT, resolved from env → pi settings → token file.
  Never hardcoded, never shared.
- **Entitlement-aware** — access denials surface as recoverable messages
  ("access expired", "tier missing"), not cryptic network errors.
- **Multi-agent ready** — registers your agent identity on startup and exposes the
  coordinator / work-registry / messaging tools (WOTEAMS-322).

---

## Requirements

- [pi](https://pi.dev) (0.84+) — loads this extension via [jiti](https://github.com/unjs/jiti),
  no build step.
- A **WayOfTeams account** and an **MCP token** (get it from your
  **WayOfTeams → Settings → MCP** dashboard).

---

## Install

```bash
pi install npm:@wayofmono/wayofteams-tools
```

That's it. pi discovers the package, loads `src/index.ts`, and the tools appear in the
session (new sessions auto-load it; run `/reload` to pick up changes in an existing one).

From this monorepo during development:

```bash
pi install ./packages/@wayofmono/wayofteams-tools
```

---

## Configure

The extension resolves a token in this order (first hit wins) — **never hardcoded**:

1. **Environment variable** — `WAYOFTEAMS_MCP_TOKEN`
2. **pi settings.json** (`~/.pi/agent/settings.json`):

   ```jsonc
   {
     "wayofteams": {
       "token": "<your-jwt>",
       "endpoint": "auto"          // "auto" | "v2" | "legacy" | "rest"
     }
   }
   ```

3. **Token file** — `~/.config/opencode/.wayofteams-mcp-token`

The easiest way is the `/wayofteams-login` command (see below) — it verifies the token live
against the server, then persists it to `settings.json` for you.

> **Security:** tokens are per-user JWTs. A WayOfTeams founders/superadmin token would
> bypass all entitlements by design — always use a token scoped to your own profile.

---

## Commands

| Command | What it does |
|---------|--------------|
| `/wayofteams status` | Active surface, endpoint, tool count, token state |
| `/wayofteams endpoint` | Re-probe surfaces (v2 → legacy → REST) and reconnect |
| `/wayofteams-login <token>` | Verify a token live, save it, reconnect |

---

## How it works

```
pi session
   │
   ├─ load @wayofmono/wayofteams-tools (via jiti)
   │    └─ register control-plane + discovery tools (safe during load)
   │    └─ resolve token (env → settings → file)  [no hardcode]
   │    └─ probe surfaces: v2 gateway → legacy /mcp → REST adapter
   │         └─ pick healthiest, register its tool set
   │    └─ register /wayofteams commands
   │
   └─ session_start
        ├─ activate discovery/status tools (runtime is now bound)
        ├─ register agent identity (update_my_work)
        └─ ready: model calls tools; matching tools activate on demand
```

- **Dynamic tool loading** — only the discovery/status tools start active; when the model
  needs a specific tool, `search_tools`/`get_tool_schema` results activate it additively
  via `pi.setActiveTools` (keeps the prompt small instead of flooding 269 schemas).
- **Multi-agent** — registers `update_my_work` on start and exposes
  `agent_register`, `agent_list`, `agent_claim_files`, `agent_check_conflicts`,
  `agent_send_message`, `agent_coordinator_status` so pi agents cooperate with others.

---

## What the model can do

After setup you can ask pi things like:

- "List my open tickets and their priorities."
- "Create a feature ticket about `…` — write the description as markdown."
- "Show today's standups for the team."
- "Search the knowledge base for `…` ."
- "What cards are on the kanban board?"
- "Download the latest published version notes."

The model discovers the exact tools via `search_tools` and calls them directly.

---

## Development

Requires Node 22+, and (optionally) pi for the live-load smoke test.

```bash
# from the womono monorepo root
pnpm install
pnpm --filter @wayofmono/wayofteams-tools test     # vitest (28 tests)
pnpm --filter @wayofmono/wayofteams-tools typecheck
pnpm --filter @wayofmono/wayofteams-tools build    # tsc -> dist/

# smoke-load the extension exactly as pi does (must print "... loaded ...")
cd packages/@wayofmono/wayofteams-tools
echo "list connected tools" | pi -p -e ./src/index.ts
```

Tests cover the pure modules (`src/schema.ts`, `src/token.ts`, `src/server.ts`,
`src/client/*`) — no pi runtime required. Rebuild `dist/` before publishing.

---

## Package layout

| Area | Files | Notes |
|------|-------|-------|
| Entry | `src/index.ts` | registration-only during load; activation deferred to `session_start` (pi's runtime-not-initialized contract) |
| Clients | `src/client/mcp.ts`, `src/client/rest.ts` | pure JSON-RPC / REST, unit-testable |
| Surface | `src/server.ts` | legacy + v2 catalog, auto-probe order |
| Auth | `src/token.ts`, `src/config.ts` | JWT resolution + settings I/O |
| Registry | `src/registry.ts` | `registerTool` bridge + dynamic activation |
| Tools | `src/tools/{router,control,fallbacks}.ts` | discovery, control-plane, REST fallbacks |
| Schema | `src/schema.ts` | JSON Schema → TypeBox (pure) |

---

## License

MIT © WayOf / WayOfMono