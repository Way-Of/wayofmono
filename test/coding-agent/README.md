# Test: `wocode` CLI binary (Local Install)

Validates the `wocode` CLI works when installed locally in a project.

## Prerequisites

The monorepo must be built first so that `dist/` output exists:

```bash
# From wayofmono root
pnpm build
```

Then, install the package locally:

```bash
# From test/coding-agent
pnpm init
pnpm add ../../packages/@wayofmono/wo-coding-agent
```

## Smoke tests

The agent automatically detects the local `.wo` directory in this folder for its configuration and models.

```bash
# Run the local launcher
./wocode --version
./wocode --help
./wocode --mode plan "write a hello world cli in go"
```

## Launcher Script

A `./wocode` script is provided in this directory. It automatically sets `WO_CODING_AGENT_DIR` to the local `.wo` folder and runs the version installed in `node_modules`.

## What this validates

- Binary resolves from `node_modules/.bin/wocode`
- No missing module errors on launch
- CLI argument parsing works
- Plan mode initialises without crash
- Agent mode initialises without crash
