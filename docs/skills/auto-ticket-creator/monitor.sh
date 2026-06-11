#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
deno run --allow-read --allow-write --allow-run --allow-env --allow-net "$SCRIPT_DIR/monitor.ts" "$@"
