---
name: validate-podman
description: Validate Podman/Quadlet configurations on Fedora. Checks .container, .volume, .network files for syntax, security best practices, systemd integration, and dependency ordering.
allowed-tools: read, write, bash, glob, grep
---

# Validate Podman skill

Validates Podman Quadlet configurations for Fedora-based deployments.

## Reference Assets

- `assets/FEDORA-PODMAN-GUIDE.md` - Fedora Podman & Quadlet Deep Dive
- `assets/INFRASTRUCTURE.md` - WayOfMono Infrastructure Overview

## Validation Checks

### 1. Quadlet File Syntax
- `.container` files: Image, Environment, Ports, Volumes, Networks, Healthchecks
- `.volume` files: Volume definitions, persistence
- `.network` files: Bridge networks, CNI plugins

### 2. Systemd Integration
- Generated unit files via `podman quadlet --dry-run`
- `systemctl --user daemon-reload` handling
- Service enable/start ordering

### 3. Security Best Practices
- Rootless mode enforcement
- SELinux labels (`:Z`, `:z`)
- Capability dropping (`CapabilityBoundingSet=`)
- No privileged containers

### 4. Network & Dependencies
- `After=` and `Requires=` ordering (DB before App)
- Network bridging validation
- Port conflict detection

### 5. Troubleshooting Commands
```bash
# Check generated systemd units
/usr/libexec/podman/quadlet --user --dry-run

# View service logs
journalctl --user -u <service-name>.service -e

# Manual container logs
podman logs <container-name>
```

## Usage

This skill auto-activates when working with Podman Quadlet files in `infra/quadlets/` or similar directories.

## Assets

| Asset | Description |
|-------|-------------|
| `scripts/` | Test suite and skill update scripts: `test-yamls.py`, `test-manifest.py`, `test-skills.py`, `run-all-tests.py`, plus 7 per-tool skill update scripts |
| `scripts/compliance-check.ts` | Compliance checker for all 7 tools |
| `scripts/compliance-fix.ts` | Auto-fix script for cross-tool compliance issues |
| `scripts/run-all-tests.py` | Test suite orchestrator with `--tool=<name>` support |