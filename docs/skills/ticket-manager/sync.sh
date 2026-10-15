#!/usr/bin/env bash
# Ticket Manager Sync - Unix wrapper
# Usage: ./sync.sh --list
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HARNESS_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$HARNESS_DIR" || exit 1
deno run --allow-read --allow-write --allow-run --allow-env "$SCRIPT_DIR/sync.ts" "$@"
