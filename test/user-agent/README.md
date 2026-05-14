# Test: `@wayofmono/wo-agent` SDK library (Local Install)

Validates the SDK library resolves correctly when installed as a local dependency.

## Prerequisites

The monorepo must be built first so that `dist/` output exists:

```bash
# From wayofmono root
pnpm build
```

Then, install the package locally:

```bash
# From test/user-agent
pnpm init
pnpm add ../../packages/@wayofmono/wo-agent
```

## Smoke tests

The agent automatically detects the local `.wo` directory in this folder for its configuration and models.

```bash
# Run the local launcher
./wouser --version

# Verify main entry import
pnpm exec tsx -e "
import { createAgent } from '@wayofmono/wo-agent';
console.log('createAgent import OK');
"

# Verify subpath export
pnpm exec tsx -e "
import { createAgent } from '@wayofmono/wo-agent';
import { z } from 'zod';
console.log('SDK import OK');
"
```

## What this validates

- `@wayofmono/wo-agent` resolves from local `node_modules`
- `createAgent` and types import without errors
- Subpath exports (`@wayofmono/wo-agent/*`) resolve correctly
- No CLI residue (`cli.ts`, `bun/`) leaks into the SDK package
