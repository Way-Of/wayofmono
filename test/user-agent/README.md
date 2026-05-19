# Test: `wouser` CLI & SDK (Local Install)

Validates that `@wayofmono/wo-agent` works correctly as a local dependency using the flawless installation flow.

## Prerequisites

The monorepo must be built first so that `dist/` output exists:

```bash
# From wayofmono root
pnpm build
```

## Flawless Installation Test

```bash
# From test/user-agent
pnpm init
pnpm add ../../packages/@wayofmono/wo-agent
pnpm exec wouser --init
./wouser --version
```

## SDK Import Test

```bash
pnpm exec tsx -e "import { createAgent } from '@wayofmono/wo-agent'; console.log('SDK import OK')"
```

## What this validates

- **Launcher Creation**: `--init` successfully creates the `./wouser` script.
- **Config Initialization**: `--init` successfully creates `.wo/models.json`.
- **Binary Resolution**: Binary resolves from local `node_modules`.
- **SDK Exports**: `createAgent` and types resolve correctly from compiled `dist/`.

---
*Testing the next generation of AI-native engineering tools.*
