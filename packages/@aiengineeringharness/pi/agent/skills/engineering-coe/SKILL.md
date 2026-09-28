---
name: engineering-coe
description: The Way-Of Engineering Center of Excellence, the company method for architecting original systems and porting to our stack (Elixir, Phoenix, LiveView, Ash, Jido, Oban, Rust). Use when starting a new build, planning or executing a port (especially from TypeScript/Node), weighing an architecture decision, or deciding which CoE skill applies.
allowed-tools: read, write, edit, bash, grep, glob
---

# Engineering Center of Excellence

The method. Two tracks, one set of gates, one feedback loop.

## Route first

| If the task is | Use |
|---|---|
| Designing a new system | `architect-new-system` |
| Porting an existing system to our stack | `port-to-elixir` |
| Writing Ash / LiveView / Jido / Oban / Rustler code | `elixir-ash-liveview-jido-cookbook` |
| Proving a port or a feature is equivalent | `port-parity-verification` |
| Closing work, recording lessons, pruning the playbook | `engineering-retro-loop` |

Do not start a large build or port without loading the track skill. The chest of templates and mapping tables is in this skill's siblings and in `assets/`.

## The stack (one answer)

Elixir 1.18 / OTP 27 / Phoenix 1.8 / LiveView / Ash 3 / Jido 2 (pinned minor) / Oban 2 / Rustler (Rust) / PostgreSQL 16 (+ pgvector for search). Rust only where a profile says it earns the boundary; the default NIF host is Rustler.

## Non-negotiables

1. **Choose the best tool for the job; be agnostic.** The default stack is a strong prior, never a mandate. Name the binding factors, enumerate options (including non-obvious ones), prototype the risk, and record an ADR. Method and scorecard: `assets/technology-selection.md`.
2. **Model by concern, not by file.** Ports proceed by domain and package, not by walking the source tree top to bottom.
3. **Test infrastructure first.** Before porting resources, stand up `DataCase`, `ConnCase`, factories, and a tenancy helper. WoWx proved the cost of the reverse order.
4. **Parity is a test, never an opinion.** See `port-parity-verification`.
5. **No mock in shipped code.** Mocks are confined to test files.
6. **Every consequential decision is an ADR.** One page: context, decision, alternatives rejected, and the reversal condition.
7. **Every engagement ends in a retro.** Rules live and die by measured outcome (`engineering-retro-loop`).
8. **Do not overclaim.** A README that advertises a dependency the `mix.exs` does not carry is a defect. The gate is the build, not the prose.

## Quality gates (a phase is not done until these pass)

- `mix compile --warnings-as-errors` clean; `mix format --check-formatted`.
- The track's exit criteria for the current phase (see `port-to-elixir`).
- Coverage floors: unit 80% (critical 90%), integration 70%, end-to-end 50%, **policies 100%**.
- Applied migrations generate cleanly (`mix ash.generate_migrations`); tenant isolation verified when multitenant.
- The parity/verification suite for the phase is green, or the gap is named as an open debt.

## Technology is chosen, not assumed

The stack above is where we start, not what we must use. For each binding requirement (runtime, datastore, realtime, jobs, search, any kernel, any external system) run the selection method in `assets/technology-selection.md`: requirements, options, binding factors, a risk prototype, then an ADR with the reversal condition. A measured case for a different tool is a good outcome, not a deviation to hide.

## When to reach for Rust

Only when a profile, a benchmark, or a hard dependency demands it: CPU-bound kernels (solvers, tokenizers, codecs), bytes on the wire, or an existing Rust crate that must not be rewritten. Everything else stays in Elixir. The boundary is a Rustler NIF with a thin, well-typed Elixir wrapper and a benchmark that justifies it.

## The loop

Close with `engineering-retro-loop`: record outcomes to Anchor, score playbook rules, retire the ones that cannot move the outcome. Then feed the surviving lessons back into these skills.
