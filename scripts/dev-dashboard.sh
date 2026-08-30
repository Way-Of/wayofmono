#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UI_DIR="$(dirname "$SCRIPT_DIR")/ui"
PORT="${1:-3000}"

echo "==> Installing UI dependencies..."
cd "$UI_DIR"
bun install --frozen-lockfile 2>/dev/null || bun install

echo "==> Starting dashboard dev server on http://localhost:$PORT ..."

# Start server in background, wait for it, then open browser
PORT="$PORT" bun run dev &
SERVER_PID=$!

# Wait for the server to start accepting connections
echo "    Waiting for server to be ready..."
for i in $(seq 1 30); do
  if curl -s "http://localhost:$PORT" >/dev/null 2>&1; then
    echo "    Server is ready!"
    break
  fi
  sleep 1
done

echo "    Opening browser..."
xdg-open "http://localhost:$PORT" 2>/dev/null || sensible-browser "http://localhost:$PORT" 2>/dev/null || echo "    Open http://localhost:$PORT manually"

# Bring server to foreground
wait "$SERVER_PID"
