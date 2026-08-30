#!/usr/bin/env bash
# AI Harness /help Command — POSIX shell wrapper
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
deno run --allow-read "$SCRIPT_DIR/help.ts" "$@"
