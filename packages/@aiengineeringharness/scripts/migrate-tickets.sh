#!/bin/bash
# Ticket Migration Script - Unix/Linux/macOS wrapper
# Usage: ./migrate-tickets.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

echo "🔄 Running ticket migration..."
deno run --allow-read --allow-write --allow-run "$SCRIPT_DIR/migrate-tickets.ts"

echo "✅ Migration complete"