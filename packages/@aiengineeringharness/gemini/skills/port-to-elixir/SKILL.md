---
name: port-to-elixir
description: Port an existing system (especially TypeScript/Node) to the Way-Of stack, Elixir, Phoenix, LiveView, Ash, Jido, Oban, Rustler. Use when migrating an app off TS/Node/Next/Express/Prisma, planning a port, building the port inventory or parity matrix, or executing phased cutover and decommission. Includes the TS-to-Elixir mapping table.
allowed-tools: read, write, edit, bash, grep, glob
---

# Port to Elixir

Port by **concern and vertical slice**, never by walking the source tree top to bottom. A port is not a rewrite of files; it is the re-expression of behaviour, proven by parity tests, then the removal of the old system.

## Phases (artifact and exit for each)

0. **Toolchain.** Elixir 1.18 / OTP 27 / Phoenix 1.8 / Ash 3 / Jido pinned / Postgres 16 (+ pgvector if search). Exit: versions verified, `mix.exs` skeleton, dev DB up.
1. **Inventory and gap matrix.** Every route, page, table, endpoint, job, external call. Exit: catalogued, no unknowns, each row classified port / retire / replace. Use `assets/port-inventory-template.md`.
2. **Test infrastructure FIRST.** `DataCase`, `ConnCase`, factories, tenancy helper, one smoke test. Exit: `mix test` green on an empty app. WoWx proved the cost of the reverse order: it has no suite at all.
3. **Ash modeling.** TS types/Prisma to resources, attributes, identities, relationships, actions, policies, migrations. Exit: `mix ash.generate_migrations` clean; a tenant-isolation test when multitenant.
4. **Core vertical slices.** Port the core domain first, one slice end to end (Ash action to LiveView to test) before widening. Exit: the smoke path works in the new system.
5. **HTTP/API.** Express/Next routes to Phoenix router and contexts; JSON APIs to AshJsonApi. Exit: every consumed endpoint answers and its shape is asserted.
6. **Frontend.** React/Next to LiveView pages, components, and forms; client state to assigns plus PubSub. Exit: `mount` and `handle_event` parity on the ported pages.
7. **Background and realtime.** trigger.dev/Bull to Oban workers (plus Oban cron); SSE/WebSocket to Phoenix.PubSub/Channels; long-running services to Jido agents/actions. Exit: each job runs and is observable.
8. **Cutover and decommission.** Run old and new in parallel where data allows; migrate data; delete the Node service, its deploy, and its config. Exit: the old system is OFF, not merely unused.

## Mapping table (TypeScript/Node to us)

| TS/Node | Target | Notes and project evidence |
|---|---|---|
| Express/Next routes | Phoenix router plus contexts/controllers | WoWx skipped HTTP and read Ash directly in `mount`; fine early, add AshJsonApi for external consumers |
| Prisma/Drizzle | Ash resources/actions plus AshPostgres | `@unique` to `identity`; `@relation` to `belongs_to`/`has_many` |
| Zod validation | Ash constraints (`allow_nil?`, `one_of`, `strict_length`, `format`) plus Ash validations; Ecto.Changeset for the complex | WOMONO-073: do NOT port Zod |
| Auth (NextAuth) | AshAuthentication plus Ash.Policy.Authorizer | wayofteams: GitHub OAuth2; WoWx: JWT/`wo_collab`, 18 roles |
| REST/JSON API | AshJsonApi | plus the MCP bridge (`wo_mcp`) where an agent surface is needed |
| React/Next UI | LiveView pages/components plus AshPhoenix forms | prefer domain calls over ad-hoc queries in `mount` |
| Redux/Zustand | LiveView assigns plus PubSub (server holds state) | WOTEAMS-062: Zustand to PubSub on Ash mutations |
| trigger.dev / Bull | Oban 2 workers plus Oban cron | eight workers in wayofteams; replaces trigger.dev |
| Long-running workers | Jido 2 agents/actions (AgentServer, signals) | store IDs in agent state, never Ash records |
| SSE / WebSocket | Phoenix.PubSub / Channels | |
| Search | AshPostgres / pgvector | verify the dep is real before claiming it |
| Perf kernel | Rustler NIF | only with a benchmark and a thin wrapper |
| Money/time | Ash types, `Decimal`, `timestamps()` always UTC | |

## Agnostic carve-outs

The stack here is the default target, not a blanket instruction. For each bounded decision inside the port (datastore, search, realtime, auth, jobs, and above all any Rust boundary or any component that would be better kept in another technology), run `assets/technology-selection.md` and record an ADR. Three outcomes are legitimate: port it to our stack, keep it in the source technology behind an interface, or retire it. What is not legitimate is porting something by reflex that the requirements say should be retired, or forcing a requirement into our stack that the binding factors say it cannot meet.

## Laws and pitfalls

- **Test infra first.** The reverse order cost WoWx its suite.
- **Ash.Changeset is not Ecto.Changeset.** Use `ash_field/2`; `Ecto.Changeset.get_field` crashes.
- **Use `assigns.foo`, not `@foo`, inside `def render(assigns)`** (warnings-as-errors).
- **Elixir 1.18 cons parser:** `[x | for y <- z]` fails; write `[x] ++ Enum.map(...)`.
- **Ash 3:** `uuid_primary_key` not `primary_key:`; `:ci_string` for email; `defaults [:read, :destroy]` plus explicit `create`/`update`; `identity` not `unique_constraint`; never `multitenancy :global` (use `:context` with explicit `tenant_id`); UTC timestamps.
- **Config:** never set Repo defaults in `config.exs`; zero `Application.compile_env`; fail fast in prod.
- **Policies:** `authorize_if always()` on every action is not RBAC. Policies are 100% tested.
- **Do not leave Node behind.** A "ported" system that still runs a Node chat server is not ported.

## Exit

The old system is removed, the parity tests are green, and the retro has recorded what the port taught (`engineering-retro-loop`).
