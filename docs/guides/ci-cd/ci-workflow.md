# CI Workflow

GitHub Actions CI configuration for WayOfMono.

## Workflow File

`.github/workflows/ci.yml`

## Triggers

- Push to `main`
- Pull requests to `main`

## Environment

- **OS**: ubuntu-latest
- **Node**: 22
- **pnpm**: 10
- **Deno**: 2.x

## Jobs

### ci

```yaml
jobs:
  ci:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [22]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - uses: denoland/setup-deno@v2
        with:
          deno-version: v2.x
      - name: Check canonical skills are in sync
        run: |
          deno run -A packages/@aiengineeringharness/scripts/docs-sync.ts --check | grep -q "Would sync: 0" || (echo "Canonical skills out of sync. Run: deno run -A packages/@aiengineeringharness/scripts/docs-sync.ts" && exit 1)
      - name: Build
        run: pnpm -r build
      - name: Typecheck
        run: pnpm -r --parallel typecheck
      - name: Test
        run: pnpm -r test
```

## Steps Explained

| Step | Purpose |
|------|---------|
| `actions/checkout@v4` | Clone repository |
| `pnpm/action-setup@v4` | Install pnpm 10 |
| `actions/setup-node@v4` | Install Node 22 with pnpm cache |
| `pnpm install --frozen-lockfile` | Install dependencies (exact versions) |
| `denoland/setup-deno@v2` | Install Deno 2.x |
| `docs-sync.ts --check` | Verify skills in sync |
| `pnpm -r build` | Build all packages |
| `pnpm -r --parallel typecheck` | TypeScript type checking |
| `pnpm -r test` | Run all tests |

## Skills Sync Check

The skills sync check ensures canonical skills match all 7 tool directories:

```bash
deno run -A packages/@aiengineeringharness/scripts/docs-sync.ts --check
```

**Output on success:**
```
Would sync: 0
```

**Output on failure:**
```
Would sync: 5
  opencode: create_plan, validate_plan, ...
  claude: create_plan, validate_plan, ...
```

Fix by running:
```bash
deno run -A packages/@aiengineeringharness/scripts/docs-sync.ts
```

## Local CI Equivalent

Run all CI steps locally:

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Check skills sync
deno run -A packages/@aiengineeringharness/scripts/docs-sync.ts --check

# Build all packages
pnpm -r build

# Typecheck all packages
pnpm -r --parallel typecheck

# Run all tests
pnpm -r test
```

## Related

- [CD Workflow](cd-workflow.md)
- [Pre-Deploy Checklist](pre-deploy-checklist.md)
- [Pipeline Tools](../pipeline/tools.md)