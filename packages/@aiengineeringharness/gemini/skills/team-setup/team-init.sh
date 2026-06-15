#!/usr/bin/env bash
# Team Setup - Unix wrapper
# Usage: ./team-init.sh init|list|add|assign
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HARNESS_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$HARNESS_DIR" || exit 1
deno run --allow-read --allow-write --allow-run --allow-env "$SCRIPT_DIR/team-init.ts" "$@"
