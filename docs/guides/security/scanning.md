# Security Scanning

Vulnerability scanning for WayOfMono dependencies.

## Commands

```bash
# Audit all dependencies
pnpm audit

# Audit with fix
pnpm audit --fix

# Audit production only
pnpm audit --prod

# Generate report
pnpm audit --json > audit-report.json
```

## CI Integration

```yaml
# .github/workflows/security.yml
name: Security Audit
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - run: pnpm install --frozen-lockfile
      - run: pnpm audit --prod --audit-level=high
```

## Audit Levels

| Level | Description |
|-------|-------------|
| `low` | Low severity + above |
| `moderate` | Moderate severity + above |
| `high` | High severity + above |
| `critical` | Critical only |

## Interpreting Results

```bash
# Example output
found 3 vulnerabilities (1 low, 2 moderate) in 12456 scanned packages
  run `pnpm audit --fix` to fix 2 of them
```

**Action required for:**
- `high` or `critical` vulnerabilities
- Vulnerabilities in production dependencies (`--prod`)

## Automated Fixes

```bash
# Fix automatically (may update package.json)
pnpm audit --fix

# Review changes
git diff package.json pnpm-lock.yaml
```

## Manual Review

For vulnerabilities that can't be auto-fixed:

1. Check if newer version exists: `pnpm outdated <package>`
2. Check CVE details: `pnpm audit --json | jq '.advisories[] | select(.module_name=="<package>")'`
3. Apply patch or workaround
4. Document in `SECURITY.md`

## Related

- [Security Headers](headers.md)
- [CI Workflow](../ci-cd/ci-workflow.md)
- [pnpm Audit Docs](https://pnpm.io/cli/audit)