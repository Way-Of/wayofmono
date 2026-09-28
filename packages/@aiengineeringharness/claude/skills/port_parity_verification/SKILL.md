---
name: port_parity_verification
description: Prove a port is equivalent, not merely present. Use when building the parity matrix, writing differential or golden tests, asserting API response shapes, verifying tenant isolation, or setting coverage and telemetry gates for a migration.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Parity verification

"The port exists" is not a fact until a test says so. Every parity claim names its test.

## The parity matrix

One row per behaviour: item (route, endpoint, job, rule), source (file/behaviour), target (module), test (the test that proves equivalence), status (verified / pending / retired), notes. A row without a test is `pending`, never `verified`.

```markdown
| Item | Source | Target | Test | Status | Notes |
|---|---|---|---|---|---|
| POST /tickets | src/routes/tickets.ts | AppWeb.TicketsController | Api.TicketsShapeTest | verified | envelope and camelCase->snake |
```

Use `assets/parity-matrix-template.md` for the full file.

## Kinds of proof

1. **Shape parity** (cheap, first): response envelope and field naming match (`sourceInfo`, camelCase to snake, frontmatter round-trip). Assert at the boundary, not on internals.
2. **Behavioural parity**: same input, same output, over a table of cases. Prefer property-based tests where the domain has invariants.
3. **Golden/differential**: capture the source system's output for a corpus; assert the target reproduces it. Where no corpus exists, build one before the port, not after.
4. **Tenant isolation**: for every multitenant resource, a test that tenant A cannot read or write tenant B's row.
5. **Observability**: emit spans for ported flows and check them against a written narrative (`validate_telemetry`), gen_ai conventions, OTLP to the local collector.

## Gates

- Coverage: unit 80% (critical 90%), integration 70%, e2e 50%, **policies 100%**.
- `mix compile --warnings-as-errors`; `mix format --check-formatted`.
- No mock data in shipped code; mocks only in `test/`.
- No `pending` rows for the phase being declared done. Remaining `pending` rows are named open debts.

## Discipline

- Write the proving test **before** the ported code; it is the slice's exit criterion.
- A test that cannot fail is not a test (the Runa MUA lesson). Assert the failure mode too.
- Count things: routes, endpoints, tables, fields, jobs. Numbers expose overclaiming faster than prose.
