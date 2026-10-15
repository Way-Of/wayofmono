#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
echo "Starting WayOfMono dashboard dev server..."
bun dev &
DEV_PID=$!
sleep 3
xdg-open http://localhost:3000 2>/dev/null || open http://localhost:3000 2>/dev/null || echo "Open http://localhost:3000 in your browser"
wait $DEV_PID
