#!/bin/bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_DIR="$REPO_DIR/ui"

# Detect compose command
if command -v podman-compose &>/dev/null; then
  COMPOSE_CMD="podman-compose"
elif podman compose version &>/dev/null 2>&1; then
  COMPOSE_CMD="podman compose"
elif command -v docker-compose &>/dev/null; then
  COMPOSE_CMD="docker-compose"
elif docker compose version &>/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
else
  echo "✗ No compose command found (podman-compose, docker-compose, or docker compose)"
  exit 1
fi

echo "=== Deploying WayOfMono CTO Dashboard (using $COMPOSE_CMD) ==="

cd "$REPO_DIR"
echo "→ Pulling latest code..."
git pull

cd "$COMPOSE_DIR"

# Ensure .env exists
if [ ! -f .env ]; then
  echo "→ Creating .env from .env.example..."
  if [ -f .env.example ]; then
    cp .env.example .env
  else
    echo 'DATABASE_URL=file:../db/custom.db' > .env
  fi
fi

echo "→ Rebuilding and restarting containers..."
$COMPOSE_CMD up --build -d

echo "→ Waiting for health check (up to 60s)..."
for i in $(seq 1 12); do
  sleep 5
  if curl -sf http://localhost:81/api/health > /dev/null 2>&1; then
    echo "✓ Dashboard is healthy!"
    $COMPOSE_CMD logs --tail=5 nextjs 2>/dev/null || true
    exit 0
  fi
  echo "  (attempt $i/12)"
done

echo "⚠ Health check did not pass within 60s"
echo "  Check logs: $COMPOSE_CMD logs"
exit 1
