# Deployment Architecture

WayOfMono deployment strategy combining container-native design, CI/CD pipelines, and robust operational procedures for high availability and maintainability.

## Overview

The deployment architecture follows modern DevOps practices with:
- **Container-first approach**: Podman/Docker for consistent environments
- **CI/CD automation**: GitHub Actions for automated builds and deployments
- **Immutable infrastructure**: Infrastructure as Code
- **Zero-downtime deployments**: Blue-green and canary strategies
- **Comprehensive observability**: Health checks, logging, and monitoring

## Deployment Models

### Production Deployment

**Traditional Manual Deployment**

```bash
# scripts/deploy-dashboard.sh
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
  echo "✗ No compose command found"
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
```

**GitHub Actions CI/CD**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [22]

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - uses: denoland/setup-deno@v2
        with:
          deno-version: v2.x

      - name: Check canonical skills are in sync
        run: deno run -A packages/@aiengineeringharness/scripts/docs-sync.ts --check | grep -q "Would sync: 0" || (echo "Canonical skills out of sync. Run: deno run -A packages/@aiengineeringharness/scripts/docs-sync.ts" && exit 1)

      - name: Build
        run: pnpm -r build

      - name: Typecheck
        run: pnpm -r --parallel typecheck

      - name: Test
        run: pnpm -r test

# .github/workflows/cd.yml
name: CD

on:
  push:
    tags:
      - "v*"

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: pnpm
          registry-url: "https://registry.npmjs.org"

      - run: pnpm install --frozen-lockfile

      - run: pnpm build

      - run: pnpm -r publish --access public --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Development Deployment

**Local Development**

```bash
# scripts/dev-dashboard.sh
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
bun run dev -- -p "$PORT" &
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
```

## Container Architecture

### Podman-based Production

```dockerfile
# ui/Dockerfile (production)
FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g bun@latest

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY prisma ./prisma
RUN bunx prisma generate

COPY . .
RUN bun run build

FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl ca-certificates && \
    npm install -g prisma@^6.11.1

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV THOUGHTS_ROOT=/thoughts

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY docker/entrypoint.sh ./entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
```

### docker/entrypoint.sh

```bash
#!/bin/sh
set -e

echo "→ Applying database schema..."
npx prisma db push --skip-generate 2>&1 || echo "⚠ db push failed (non-fatal)"

echo "→ Starting server..."
exec node server.js
```

### Container Orchestration

**Podman Compose Configuration**

```yaml
# ui/podman-compose.yml
version: '3.8'

services:
  nextjs:
    build: .
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOSTNAME=0.0.0.0
      - THOUGHTS_ROOT=/thoughts
    volumes:
      - ./thoughts:/thoughts:rw
      - db_data:/app/db_data
    ports:
      - "3000:3000"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  caddy:
    image: caddy:latest
    ports:
      - "81:81"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - nextjs
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=wayofmono
      - POSTGRES_USER=wayofmono
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  db_data:
  postgres_data:
  redis_data:
  caddy_data:
  caddy_config:
```

## Infrastructure as Code

### Terraform Configuration

```hcl
# terraform/
provider "aws" {
  region = "us-west-2"
}

module "ecs" {
  source  = "terraform-aws-modules/ecs/aws"
  version = "5.6.0"

  cluster_name = "wayofmono-cto"
  
  fargate_submit_service_role_arn = aws_iam_role.fargate.arn

  task_definition = {
    container_definitions = jsonencode([
      {
        name         = "nextjs"
        image        = "wayofmono/cto-dashboard:latest"
        essential    = true
        portMappings  = [
          {
            containerPort = 3000
            protocol      = "tcp"
          }
        ]
        environment = [
          { name = "NODE_ENV", value = "production" }
          { name = "PORT", value = "3000" }
          { name = "THOUGHTS_ROOT", value = "/mnt/thoughts" }
        ]
        mountPoints = [
          {
            containerPath = "/mnt/thoughts"
            sourceVolume  = "thoughts_volume"
          }
        ]
      }
    ])
  }

  service = {
    name            = "nextjs"
    cluster_arn     = module.ecs.cluster_arn
    task_definition_arn = module.ecs.task_definition_arn
    desired_count  = 2
    launch_type     = "FARGATE"
    load_balancer = {
      target_groups = [
        {
          port     = 80
          protocol = "HTTP"
          target_type = "IP"
        }
      ]
    }
  }
}

resource "aws_ecs_task_definition" "nextjs" {
  family                   = "wayofmono-nextjs"
  requires_compatibilities = ["FARGATE"]
  network_mode            = "awsvpc"
  runtime_platform        = {
    operating_system_family = "LINUX"
  }

  container_definitions = jsonencode([
    {
      name      = "nextjs"
      image     = "wayofmono/cto-dashboard:latest"
      essential = true
      portMappings = [
        {
          containerPort = 3000
          protocol      = "http"
        }
      ]
      environment = [
        { name = "NODE_ENV", value = "production" }
        { name = "PORT", value = "3000" }
        { name = "THOUGHTS_ROOT", value = "/mnt/thoughts" }
        { name = "AWS_REGION", value = "us-west-2" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group = aws_cloudwatch_log_group.ecs_logs.name
          awslogs-region = "us-west-2"
          awslogs-stream-prefix = "wayofmono"
        }
      }
    }
  ]

  cpu    = "512"
  memory = "1024"
}
```

## Edge Environments

### Staging Environment

```yaml
# docker-compose.staging.yml
version: '3.8'

services:
  nextjs:
    build: .
    environment:
      - NODE_ENV=development
      - PORT=3000
      - THOUGHTS_ROOT=/thoughts
    volumes:
      - ./thoughts:/thoughts:rw
      - ./ui/src:/app/src:ro
    ports:
      - "3000:3000"
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=wayofmono_staging
      - POSTGRES_USER=wayofmono
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD_STAGING}
    ports:
      - "5432:5432"
```

### Development Environment

```bash
# docker-compose.dev.yml
version: '3.8'

services:
  app:
    build: .
    environment:
      - NODE_ENV=development
      - PORT=3000
      - THOUGHTS_ROOT=/thoughts
    volumes:
      - ./ui/src:/app/src
      - ./thoughts:/thoughts
    ports:
      - "3000:3000"
      - "9229:9229"  # Node.js debugger
    command: >
      sh -c "npm install && npm run dev -- --turbopack --port 3000"
```

## Security Architecture

### SSL/TLS Termination

**Caddy Configuration**

```caddyfile
# Caddyfile (production)
:81 {
  @transform_port_query {
    query XTransformPort=*
  }

  handle @transform_port_query {
    reverse_proxy localhost:{query.XTransformPort} {
      header_up Host {host}
      header_up X-Forwarded-For {remote_host}
      header_up X-Forwarded-Proto {scheme}
      header_up X-Real-IP {remote_host}
    }
  }

  handle {
    reverse_proxy localhost:3000 {
      header_up Host {host}
      header_up X-Forwarded-For {remote_host}
      header_up X-Forwarded-Proto {scheme}
      header_up X-Real-IP {remote_host}
    }
  }
}
```

**Cloudflare Tunnel**

```bash
# scripts/setup-tunnel.sh
#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

cat > tunnel.yml <<EOF
name: cto-dashboard
tunnel_id: your-tunnel-id
services:
  - hostname: cto.wayof.work
    service: http://localhost:81
EOF

cloudflared tunnel route dns cto-dashboard cto.wayof.work
```

### Authentication & Authorization

**JWT Authentication**

```typescript
// lib/auth.ts
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  
  if (!token) {
    return null
  }
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch {
    return null
  }
}
```

### Network Security

**Firewall Rules**

```bash
# scripts/setup-firewall.sh
#!/bin/bash
set -euo pipefail

# Allow HTTPS and HTTP
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Allow established connections
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Deny all other traffic
iptables -A INPUT -j DROP
```

## Observability Architecture

### Health Checks

**API Health Endpoint**

```typescript
// app/api/health/route.ts
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  const checks = {
    database: await checkDatabase(),
    cache: await checkCache(),
    storage: await checkStorage(),
    external: await checkExternalServices()
  }
  
  const isHealthy = Object.values(checks).every(check => check.status === 'pass')
  const responseTime = Date.now() - startTime
  
  return NextResponse.json({
    status: isHealthy ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    checks,
    responseTime
  }, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  })
}
```

**Liveness and Readiness Probing**

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wayofmono-nextjs
  labels:
    app: wayofmono
    component: nextjs
    environment: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: wayofmono
      component: nextjs
  template:
    metadata:
      labels:
        app: wayofmono
        component: nextjs
        environment: production
    spec:
      containers:
      - name: nextjs
        image: wayofmono/cto-dashboard:1.2.3
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        - name: THOUGHTS_ROOT
          value: "/thoughts"
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 60
          periodSeconds: 30
          failureThreshold: 3
snatch.stanza </argument>
```

### Logging Infrastructure

**Structured Logging**

```typescript
// lib/logger.ts
interface LogEntry {
  timestamp: string
  level: 'error' | 'warn' | 'info' | 'debug'
  message: string
  correlationId?: string
  userId?: string
  requestId?: string
  metadata?: Record<string, any>
}

class Logger {
  private correlationId?: string
  private userId?: string

  info(message: string, metadata?: Record<string, any>) {
    this.log('info', message, metadata)
  }

  error(message: string, error?: Error, metadata?: Record<string, any>) {
    this.log('error', message, { ...metadata, error: error?.message })
  }

  private log(level: LogEntry['level'], message: string, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId: this.correlationId,
      userId: this.userId,
      ...metadata
    }

    // Send to structured logging system
    console.log(JSON.stringify(entry))
  }

  withCorrelationId(id: string): Logger {
    const newLogger = new Logger()
    newLogger.correlationId = id
    return newLogger
  }

  withUserId(id: string): Logger {
    const newLogger = new Logger()
    newLogger.userId = id
    return newLogger
  }
}
```

**Centralized Logging**

```yaml
# fluentd-config.xml
<Config>
  <source>
    @type tail
    path /var/log/wayofmono
    pos_file /var/log/wayofmono.pos
    tag wayofmono.* 
    format json
    time_key timestamp
    read_from_head true
  </source>

  <match wayofmono.**>
    @type elasticsearch
    host elasticsearch.internal
    port 9200
    index wayofmono-logs-{time}
    type fluentd
    logstash_format true
  </match>

  <match wayofmono.error>
    @type copy
    <store>
      @type slack
      webhook_url ${SLACK_WEBHOOK_URL}
      channel "#alerts"
    </store>
    <store>
      @type file
      path /var/log/wayofmono/errors
      append true
      time_slice_format %Y%m%d
      time_slice_wait 10m
      chunk_limit_size 1m
    </store>
  </match>
</Config>
```

### Metrics and Monitoring

**Prometheus Metrics**

```typescript
// lib/metrics.ts
import { Registry, Gauge, Counter, Histogram } from 'prom-client'

const registry = new Registry()

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
})

const activeRequests = new Gauge({
  name: 'http_requests_active',
  help: 'Number of active HTTP requests'
})

const databaseConnections = new Gauge({
  name: 'db_connections_total',
  help: 'Number of database connections'
})

const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_name']
})

registry.register(httpRequestDuration)
registry.register(activeRequests)
registry.register(databaseConnections)
registry.register(cacheHits)

export { registry }
```

**Exporter Configuration**

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'wayofmono'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

rule_files:
  - "alerting.rules.yml"

 alerting:
   - name: 'WayOfMono Alerts'
     rules:
     - alert: HighErrorRate
       expr: rate(http_requests_total{status_code="500"}[5m]) > 0.1
       for: 5m
       labels:
         severity: critical
       annotations:
         summary: "High error rate detected"
         description: "Error rate is {{ $value }} per second"

     - alert: HighResponseTime
       expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1.0
       for: 10m
       labels:
         severity: warning
       annotations:
         summary: "High response time detected"
         description: "95th percentile response time is {{ $value }}s"
```

## CI/CD Pipeline Optimization

### Pipeline Stages

```yaml
# .github/workflows/ci.yml
stages:
  - validate
  - security
  - test
  - build
  - deploy

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Code quality checks
        run: pnpm run lint && pnpm run typecheck
      - name: Security scan
        run: pnpm run security:check

  test:
    needs: validate
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: pnpm install --frozen-lockfile
      - run: pnpm run test:ci

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.current }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Get version
        id: version
        run: echo "current=$(git describe --tags --always --dirty)" >> $GITHUB_OUTPUT
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: pnpm install --frozen-lockfile
      - name: Build application
        run: pnpm run build
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-artifacts-${{ strategy.job }}
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: build-artifacts-build
          path: dist/
      - name: Deploy to production
        run: |
          ./scripts/deploy-dashboard.sh
          ./scripts/verify-deployment.sh
```

### Deployment Strategies

**Blue-Green Deployment**

```bash
# scripts/blue-green-deploy.sh
#!/bin/bash
set -euo pipefail

BLUE_ENV="wayofmono-prod-blue"
GREEN_ENV="wayofmono-prod-green"
CURRENT_ENV="$BLUE_ENV"
TARGET_ENV="$GREEN_ENV"

# Deploy to target environment
echo "Deploying to $TARGET_ENV..."
# Deploy steps...

# Swap DNS records
aws route53 change-resource-record-sets --hosted-zone-id Z1EXAMPLE --change-batch file://change-batch.xml

# Verify health
./scripts/verify-deployment.sh $TARGET_ENV

# Update load balancer
./scripts/update-load-balancer.sh $TARGET_ENV

# Cleanup old environment
./scripts/cleanup-environment.sh $CURRENT_ENV
```

**Canary Deployment**

```yaml
# k8s-canary.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wayofmono-nextjs
  labels:
    app: wayofmono
    component: nextjs
spec:
  replicas: 5
  selector:
    matchLabels:
      app: wayofmono
      component: nextjs
  template:
    metadata:
      labels:
        app: wayofmono
        component: nextjs
    spec:
      containers:
      - name: wayofmono
        image: wayofmono/cto-dashboard:1.2.3
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 60
          periodSeconds: 30

  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2
      maxUnavailable: 1
    
  postActions:
    - name: health-check
      command: ["/bin/bash", "-c", "curl -f http://localhost:81/api/health"]
      timeout: 30s
```

## Disaster Recovery

### RTO/RPO Objectives

- **RTO** (Recovery Time Objective): 4 hours
- **RPO** (Recovery Point Objective): 15 minutes

### Recovery Procedures

**Phase 1: Detection & Isolation**
1. Automated health check failures trigger alert
2. Podman compose stops affected services
3. Load balancer removes unhealthy nodes

**Phase 2: Recovery**
1. Restore from latest backup (within 15 minutes)
2. Podman compose brings services back
3. Health checks verify system is operational

**Phase 3: Verification**
1. Load tests validate system performance
2. Data consistency checks
3. User acceptance testing

### Backup Strategy

**Daily Backups**
- thoughts/ directory snapshots (Git LFS)
- Application configuration
- Database exports (custom.db)

**Weekly Backups**
- Full infrastructure state
- All monitoring data
- Performance metrics

**Retention Policy**
- Daily: 7 days
- Weekly: 4 weeks
- Monthly: 12 months
- Archive: Indefinite

### Backup Implementation

```bash
# scripts/backup.sh
#!/bin/bash
set -euo pipefail

setup_backup() {
  local backup_type=$1
  local timestamp=$(date +%Y%m%d_%H%M%S)
  
  case $backup_type in
    thoughts)
      mkdir -p /backups/thoughts/$timestamp
      tar -czf /backups/thoughts/$timestamp/thoughts.tar.gz \
        -C /home/zerwiz/wayofmono thoughts/
      ;;
    database)
      mkdir -p /backups/database/$timestamp
      sqlite3 /home/zerwiz/wayofmono/ui/db_data/custom.db \
        ".backup '/backups/database/$timestamp/custom.db'"
      ;;
    configuration)
      mkdir -p /backups/config/$timestamp
      cp -r /home/zerwiz/wayofmono/ui/.env* /backups/config/$timestamp/
      cp -r /home/zerwiz/wayofmono/scripts/ /backups/config/$timestamp/
      ;;
  esac
}

# Create daily backups
for backup_type in thoughts database configuration; do
  setup_backup $backup_type &
done

wait

# Clean up old backups
find /backups/thoughts -name "*.tar.gz" -mtime +7 -delete
find /backups/database -name "*.db" -mtime +30 -delete
find /backups/config -name ".env*" -mtime +90 -delete
```

## Cost Optimization

### Resource Optimization

**Compute Optimization**
- Use Fargate Spot instances for CI/CD
- Autoscaling based on metrics
- Right-size container instances

**Storage Optimization**
- Compress container images
- Use SSD storage for frequently accessed data
- Implement lifecycle policies for logs

**Network Optimization**
- Use VPC endpoints for AWS services
- Implement CDN for static assets
- Compress responses with Brotli/Gzip

### Monitoring Tooling

**Cost Monitoring**
- AWS Cost Explorer integration
- Kubernetes resource metrics
- Cost allocation tags

**Automated Scaling**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: wayofmono-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: wayofmono-nextjs
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

## Security Hardening

### Container Security

**Image Security**
```dockerfile
FROM node:22-alpine AS runner
RUN apk add --no-cache dumb-init && \
    adduser -D appuser && \
    chown -R appuser:appuser /app
USER appuser
```

**Network Policies**
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: wayofmono-network-policy
spec:
  podSelector:
    matchLabels:
      app: wayofmono
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - ipBlock:
        cidr: 10.0.0.0/8
  egress:
  - to: []
    ports:
    - protocol: TCP
      port: 443
    - protocol: TCP
      port: 80
```

### Compliance

**SOC 2 Controls**
- Access logging and monitoring
- Encryption at rest and in transit
- Regular security assessments
- Backup and recovery procedures

**GDPR Compliance**
- Data classification and labeling
- Right to be forgotten implementation
- Data processing agreements
- Privacy by design

## Future Enhancements

### Q4 2026
- Multi-region deployment
- Serverless functions for API endpoints
- Advanced anomaly detection

### Q1 2027
- AI-powered auto-scaling
- Self-healing infrastructure
- Digital twin for testing

This deployment architecture provides a solid foundation for scaling WayOfMono while maintaining security, observability, and operational excellence. The combination of container-native deployment, comprehensive CI/CD pipelines, and robust monitoring ensures reliable and efficient operation of the CTO Dashboard.