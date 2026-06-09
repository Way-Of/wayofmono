#!/usr/bin/env bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
deno run --allow-read --allow-write "$SCRIPT_DIR/adapter.ts" "$@"
