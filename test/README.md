# Wo — Deployment Test

Validates that `wo` installs and runs from the local monorepo build, simulating what a user would experience after downloading from GitHub.

## Installation

```bash
# From monorepo root:
# 1. Install dependencies
pnpm install

# 2. Build all packages
pnpm build
```

## Test use cases

### coding-agent/ — `wocode` CLI binary

Tests the `wocode` CLI as a locally installed binary in a fresh environment.

```bash
cd test/coding-agent
pnpm init
pnpm add ../../packages/@wayofmono/wo-coding-agent
export WO_CODING_AGENT_DIR=$PWD/.wo
pnpm exec wocode --version
pnpm exec wocode --help
pnpm exec wocode --mode plan "write a hello world cli in go"
```

Validates that the binary resolves from `node_modules/.bin/wocode`, and that plan/agent modes launch without import errors.

### user-agent/ — `wouser` CLI and SDK library

Tests consuming `@wayofmono/wo-agent` as both a library and a CLI (`wouser`).

```bash
cd test/user-agent
pnpm init
pnpm add ../../packages/@wayofmono/wo-agent
export WO_CODING_AGENT_DIR=$PWD/.wo
pnpm exec wouser --version
pnpm exec tsx -e "import { createAgent } from '@wayofmono/wo-agent'; console.log('SDK import OK')"
```

Validates that the library entry points (`createAgent`, types) resolve correctly when installed as a dependency.

## Notes

- Requires **Node.js >= 22** and **pnpm >= 10**
- `wo` binary ships from `packages/@wayofmono/wo-coding-agent`
- SDK library ships from `packages/@wayofmono/wo-agent`
- Local install via `pnpm add ./packages/@wayofmono/wo-coding-agent`; run with `pnpm exec wo`
