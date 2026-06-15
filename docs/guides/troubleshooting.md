# Troubleshooting Guide

> Common issues and solutions for Wo Coder, Wo User, and AI Engineering Harness

## Quick Diagnostics

```bash
# Check harness version
ai-harness --check

# Validate installation
ai-harness --compliance

# Check skill sync status
ai-harness --sync-docs --check

# View logs
DEBUG=* wocode
DEBUG=* wouser
```

## Installation Issues

### Deno Cache / Integrity Errors

**Error**: `Integrity check failed for remote specifier`

**Solution**:
```bash
deno run --reload -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --update
```
The `--reload` flag bypasses Deno's cache. After first run, the wrapper is patched to always include `--reload`.

### Command Not Found: `ai-harness`

**Solution**:
```bash
# Ensure Deno bin is in PATH
export PATH="$HOME/.deno/bin:$PATH"

# Or reinstall CLI
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --install-cli
```

### PowerShell Unicode Issues

**Error**: Box-drawing characters show as `?`

**Solution**:
```powershell
chcp 65001
```

## Wo Coder (wocode) Issues

### Won't Start / Blank Screen

```bash
# Check Node version (needs 20+)
node --version

# Rebuild
cd your-project
pnpm rebuild @wayofmono/wo-coding-agent

# Check for port conflicts
lsof -i :3000
```

### Skills Not Loading

```bash
# Check skill directories exist
ls ~/.wocode/agent/skills/
ls .wo/agent/skills/

# Sync from harness
ai-harness --sync-docs

# Verify compliance
ai-harness --compliance
```

### Web Access Packet Not Working

```bash
# Ensure packet is installed
ls ~/.wocode/packets/web-access/

# Reinstall harness
ai-harness --tool=wocode --yes
```

### TUI Rendering Issues

- **SSH**: Ensure terminal supports true color (`TERM=xterm-256color`)
- **tmux**: Add `set -g default-terminal "tmux-256color"` to `.tmux.conf`
- **Windows Terminal**: Use "Command Prompt" or "PowerShell" profile, not "Git Bash"

## Wo User (wouser) Issues

### SDK Import Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Check package.json has correct dependency
cat package.json | grep wo-agent
```

### Model Connection Failed

```bash
# Check Ollama is running
ollama list

# Pull default model
ollama pull qwen3.5:9b

# Verify models.json
cat .wo/models.json
```

## AI Engineering Harness Issues

### Skills Out of Sync

```bash
# Check what's out of sync
ai-harness --sync-docs --check

# Force sync
ai-harness --sync-docs

# Full update
ai-harness --update
```

### Compliance Failures

```bash
# See details
ai-harness --compliance

# Common fixes:
# 1. Remove stale files
ai-harness --prune

# 2. Re-sync
ai-harness --sync-docs

# 3. Full reinstall
ai-harness --uninstall=all --yes
ai-harness --tool=all --yes
```

### Manifest Version Mismatch

```bash
# Check current vs manifest
ai-harness --check

# Update to manifest version
ai-harness --update
```

## Git / Ticket Issues

### Can't Create Ticket

```bash
# Ensure thoughts repo is cloned
ls thoughts/

# Pull latest
git -C thoughts/ pull --ff-only

# Check branch naming
# Format: <project>/<namespace>/<ticket-id>-<short-desc>
```

### Push Rejected

```bash
# Never push directly to main
# Use feature branches:
git checkout -b wayofmono/womono/WOMONO-077-fix-docs
git push origin wayofmono/womono/WOMONO-077-fix-docs
```

## Dashboard Issues

### Dashboard Won't Start

```bash
cd ui
pnpm install
pnpm dev

# Or use dev script
./scripts/dev-dashboard.sh

# Check port 3000 free
lsof -i :3000
```

### Database Errors

```bash
cd ui
npx prisma migrate reset
npx prisma db push
```

### Can't Reach https://cto.wayof.work

- Check Cloudflare tunnel status
- Verify `cloudflared` running on server
- Check Caddy config

## Performance Issues

### Slow Startup

```bash
# Disable unused tools in settings.json
# Reduce skill count
ai-harness --prune
```

### High Memory Usage

```bash
# Check for runaway processes
pkill -f "wocode|wouser"

# Restart with fresh session
./wocode --new-session
```

## Getting Help

| Resource | Command/URL |
|----------|-------------|
| Built-in help | `/help` in any tool |
| Harness help | `ai-harness --help` |
| GitHub Issues | https://github.com/Way-Of/wayofmono/issues |
| Dashboard | https://cto.wayof.work |
| Discord/Slack | (internal) |

## Debug Mode

```bash
# Wo Coder
DEBUG=* ./wocode

# Wo User
DEBUG=* ./wouser

# Harness
DEBUG=* ai-harness --tool=wocode --yes
```

---

*Yo! I'm Wo — if you're stuck, just ask me: "Wo, help me debug this..." 🚀*