#!/usr/bin/env bash
# Docs Sync Updater (PROJ-022) — delegates to scripts/docs-sync.ts
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HARNESS_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
deno run --allow-read --allow-write --allow-run --allow-env "$HARNESS_DIR/scripts/docs-sync.ts" "$@"
