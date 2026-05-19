# Test: `wocode` CLI binary (Local Install)

Validates the `wocode` CLI works when installed locally in a project using the flawless installation flow.

## Prerequisites

The monorepo must be built first so that `dist/` output exists:

```bash
# From wayofmono root
pnpm build
```

## Flawless Installation Test

```bash
# From test/coding-agent
pnpm init
pnpm add ../../packages/@wayofmono/wo-coding-agent
pnpm exec wocode --init
./wocode --version
```

## What this validates

- **Launcher Creation**: `--init` successfully creates the `./wocode` script.
- **Config Initialization**: `--init` successfully creates `.wo/models.json`.
- **Binary Resolution**: Binary resolves from local `node_modules`.
- **No Global Pollution**: Configuration stays within the `test/coding-agent/` directory.

---
*Testing the next generation of AI-native engineering tools.*
