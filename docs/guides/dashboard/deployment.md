# CTO Dashboard — Deployment

## Architecture

```
Internet → Cloudflare Tunnel [cto.wayof.work]
              → Host server:
                  → Podman/Caddy container (:81)
                      → Next.js container (:3000)
                          ├── Bind mount: thoughts/ (RW)
                          └── Volume: db_data/ (SQLite)
```

## Stack

- **Podman** + `podman-compose` on the server
- **Devbox** (reproducible shell environment)
- **cloudflared** tunnel for `cto.wayof.work`
- **Caddy** reverse proxy
- **Next.js** application server

## Deploy

```bash
# One-command deploy
./scripts/deploy-dashboard.sh

# Or manual:
cd ui && podman-compose up --build -d
curl https://cto.wayof.work/api/health
podman-compose logs -f

# Systemd service (production)
sudo cp ui/docker/wayofmono-dashboard.service /etc/systemd/system/
sudo systemctl enable --now wayofmono-dashboard
```

## Deploy Script Details

The `deploy-dashboard.sh` script (55 lines):

1. **Detects compose**: `podman-compose` > `podman compose` > `docker-compose` > `docker compose`
2. **Runs `git pull`** for latest code
3. **Creates `.env`** if missing (default: `DATABASE_URL=file:../db/custom.db`)
4. **Runs `$COMPOSE_CMD up --build -d`**
5. **Polls `http://localhost:81/api/health`** every 5s for 60s
6. **Shows last 5 log lines** from `nextjs` on success

## Environment Variables

```bash
# .env file (auto-created if missing)
DATABASE_URL=file:../db/custom.db
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://cto.wayof.work
```

## Docker Compose

```yaml
# ui/docker/docker-compose.yml
version: '3.8'
services:
  caddy:
    image: caddy:2
    ports:
      - "81:80"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ../thoughts:/app/thoughts:rw
    depends_on:
      - nextjs

  nextjs:
    build:
      context: ..
      dockerfile: ui/docker/Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ../thoughts:/app/thoughts:rw
    environment:
      - DATABASE_URL=file:/app/db/custom.db
    volumes:
      - db_data:/app/db

volumes:
  db_data:
```

## Caddyfile

```caddyfile
# ui/docker/Caddyfile
:80 {
    reverse_proxy nextjs:3000
}
```

## Systemd Service

```ini
# ui/docker/wayofmono-dashboard.service
[Unit]
Description=WayOfMono CTO Dashboard
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/wayofmono/ui
ExecStart=/usr/bin/podman-compose up
Restart=always
RestartSec=10
User=deploy

[Install]
WantedBy=multi-user.target
```

## Health Check

```bash
curl https://cto.wayof.work/api/health
# Response: {"status":"ok","timestamp":"..."}
```

## Related

- [Dashboard Overview](overview.md)
- [Dashboard Scripts](scripts.md)
- [Dev Script](scripts.md#dev-script-details)