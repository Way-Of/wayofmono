# Pre-Deploy Checklist

Run these commands before deploying to ensure everything is working.

## Commands

```bash
# 1. Run all tests
pnpm -r test
```

```bash
# 2. Check skills sync
ai-harness --sync-docs --check
```

```bash
# 3. Typecheck all packages
pnpm -r --parallel typecheck
```

```bash
# 4. Verify dashboard health
curl https://cto.wayof.work/api/health
```

```bash
# 5. Build dashboard
cd ui && pnpm build
```

## Detailed Checks

### 1. Tests

```bash
pnpm -r test
```

Runs test suites for all 13 packages. Must pass completely.

### 2. Skills Sync

```bash
ai-harness --sync-docs --check
```

Verifies canonical skills match all 7 tool directories.

**Expected output:**
```
Would sync: 0
```

If non-zero, run:
```bash
ai-harness --sync-docs
```

### 3. TypeScript Typecheck

```bash
pnpm -r --parallel typecheck
```

Runs `tsc --noEmit` on all packages. No errors allowed.

### 4. Dashboard Health

```bash
curl https://cto.wayof.work/api/health
```

**Expected response:**
```json
{"status":"ok","timestamp":"2026-06-14T..."}
```

### 5. Dashboard Build

```bash
cd ui && pnpm build
```

Builds Next.js 16 app for production. Must complete without errors.

## Full Checklist Script

```bash
#!/bin/bash
set -e

echo "🔍 Running pre-deploy checks..."

echo "1/5 Running tests..."
pnpm -r test

echo "2/5 Checking skills sync..."
ai-harness --sync-docs --check

echo "3/5 Typechecking..."
pnpm -r --parallel typecheck

echo "4/5 Checking dashboard health..."
curl -sf https://cto.wayof.work/api/health | grep -q '"status":"ok"'

echo "5/5 Building dashboard..."
cd ui && pnpm build

echo "✅ All checks passed! Ready to deploy."
```

Save as `scripts/pre-deploy-check.sh` and run:
```bash
chmod +x scripts/pre-deploy-check.sh
./scripts/pre-deploy-check.sh
```

## CI/CD Integration

The CI workflow runs tests, typecheck, and skills sync automatically on every PR.

The CD workflow runs on tag push and publishes to npm.

## Related

- [CI Workflow](ci-workflow.md)
- [CD Workflow](cd-workflow.md)
- [Dashboard Deployment](../dashboard/deployment.md)
- [Pipeline Tools](../pipeline/tools.md)