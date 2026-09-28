---
name: architect_new_system
description: Design a NEW Way-Of system on the Elixir/Phoenix/LiveView/Ash/Jido stack. Use when planning original development, defining contexts and domains, modeling Ash resources, choosing boundaries and deployment shape, slicing the build, or writing the architecture blueprint and ADRs. Not for porting an existing system (use port-to-elixir).
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Architect a new system

Produce a blueprint a stranger could execute, plus the issue slices to start.

## Steps

1. **Frame.** One paragraph: the problem, the user, the smallest demoable outcome. Capture as `docs/blueprint.md`.
2. **Contexts, then domains.** List the bounded contexts (for example Accounts, Catalog, Billing). Each becomes an Ash **domain**; each domain owns its resources. Draw the boundaries before any resource.
3. **Model the Ash layer.** For each domain: resources, attributes (typed, constrained), identities (not unique_constraint), relationships, and the actions (defaults plus explicit `create`/`update`/`destroy`). Multitenancy is `strategy :context` with an explicit `tenant_id` when the data is tenant-scoped.
4. **Decide the shape.** Umbrella (`apps/<core>`, `apps/<web>`) when there are two or more deployable concerns or a shared core; a single app otherwise. Record the reason. Choose where Rust, Jido, and Oban enter, and why.
5. **Slice vertically.** Each slice is demoable end to end (Ash action to LiveView to test). Order by dependency depth; the core domain package is first.
6. **Write ADRs** for each consequential choice (shape, tenancy, auth, realtime, Rust boundary, external service). One page each.
7. **Exit.** `mix compile --warnings-as-errors` on the skeleton, migrations generate, the first slice has a passing test.

## Choose the technology, agnostically

Before fixing the shape, run the selection method in `assets/technology-selection.md` for each binding requirement: runtime, datastore, realtime transport, background jobs, search, any performance kernel, and any external system. Enumerate standard and best-in-class options plus "use what we already run", score on the factors that bind for THIS job, prototype the risky part, and record an ADR. The Way-Of default stack is the prior; a measured deviation is an expected outcome, not a failure.

## Templates

### Blueprint

```markdown
# <System> blueprint
## Problem and smallest outcome
## Users and jobs to be done
## Bounded contexts  (one Ash domain each)
## Data model        (resources, key attributes, identities, tenancy)
## Boundaries        (umbrella or single app; what talks to what; Rust/Jido/Oban)
## Slices            (each: outcome, resources touched, test that proves it, dependency)
## Open questions and risks
```

### ADR

```markdown
# ADR-000N: <decision>
Status: proposed | accepted | superseded by ADR-000M
## Context
## Decision
## Alternatives rejected (and why)
## Consequences (good, bad, reversibility)
```

## Laws

- A context that has no resource is not a context, it is a folder. Justify or merge it.
- Do not let the web layer own logic; LiveViews call domains, domains own Ash actions.
- Design the test that proves each slice before writing the slice.
- Anything you cannot demo in one slice is two slices.
