#!/bin/bash
# Documentation Sync - Unix/Linux/macOS wrapper
# Usage: ./docs-sync.sh [--once|--watch|--status] [--source=pi,gemini,opencode,claude,codex,antigravity]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo "🔄 Running documentation sync..."
deno run --allow-read --allow-write --allow-net --allow-run --allow-env "$SCRIPT_DIR/docs-sync.ts" "$@"

echo "✅ Documentation sync complete"