# CTO Dashboard — Scripts

## Dev Script (`dev-dashboard.sh`)

Quick start for local development (32 lines):

```bash
#!/bin/bash
# Usage: ./scripts/dev-dashboard.sh [PORT]
PORT=${1:-3000}

cd ui
bun install
bun run dev &
SERVER_PID=$!

# Wait for server ready (up to 30s)
for i in {1..30}; do
  if curl -s http://localhost:$PORT/api/health > /dev/null; then
    echo "Server ready at http://localhost:$PORT"
    xdg-open http://localhost:$PORT 2>/dev/null || sensible-browser http://localhost:$PORT 2>/dev/null
    wait $SERVER_PID
    exit 0
  fi
  sleep 1
done

echo "Server failed to start"
kill $SERVER_PID
exit 1
```

### What It Does

1. **Optional PORT argument** (default 3000)
2. **`bun install`** in `ui/`
3. **Starts `bun run dev`** in background
4. **Waits up to 30s** for server ready
5. **Opens browser** via `xdg-open` / `sensible-browser`

### Usage

```bash
# Default port 3000
./scripts/dev-dashboard.sh

# Custom port
./scripts/dev-dashboard.sh 4000
```

## Deploy Script (`deploy-dashboard.sh`)

Production deployment script (55 lines):

```bash
#!/bin/bash
set -e

# 1. Detect compose command
if command -v podman-compose &> /dev/null; then
  COMPOSE="podman-compose"
elif podman compose version &> /dev/null; then
  COMPOSE="podman compose"
elif command -v docker-compose &> /dev/null; then
  COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
  COMPOSE="docker compose"
else
  echo "No compose command found"
  exit 1
fi

# 2. Pull latest code
git pull

# 3. Create .env if missing
if [ ! -f ui/.env ]; then
  echo "DATABASE_URL=file:../db/custom.db" > ui/.env
fi

# 4. Build and start
cd ui
$COMPOSE up --build -d

# 5. Health check polling
for i in {1..12}; do
  if curl -s http://localhost:81/api/health | grep -q '"status":"ok"'; then
    echo "Dashboard deployed successfully"
    $COMPOSE logs --tail=5 nextjs
    exit 0
  fi
  sleep 5
done

echo "Health check failed"
$COMPOSE logs --tail=20 nextjs
exit 1
```

### What It Does

1. **Detects compose**: `podman-compose` > `podman compose` > `docker-compose` > `docker compose`
2. **Runs `git pull`** for latest code
3. **Creates `.env`** if missing (default: `DATABASE_URL=file:../db/custom.db`)
4. **Runs `$COMPOSE_CMD up --build -d`**
5. **Polls `http://localhost:81/api/health`** every 5s for 60s (12 attempts)
6. **Shows last 5 log lines** from `nextjs` on success, 20 on failure

### Usage

```bash
./scripts/deploy-dashboard.sh
```

## Manual Commands

```bash
# Start dev
cd ui && pnpm dev

# Build for production
cd ui && pnpm build

# Run production build
cd ui && pnpm start

# Database commands
cd ui && npx prisma migrate dev
cd ui && npx prisma generate
cd ui && npx prisma studio

# View logs
podman-compose logs -f
podman-compose logs --tail=100 nextjs

# Stop
podman-compose down

# Restart
podman-compose restart
```

## Related

- [Dashboard Overview](overview.md)
- [Dashboard Deployment](deployment.md)