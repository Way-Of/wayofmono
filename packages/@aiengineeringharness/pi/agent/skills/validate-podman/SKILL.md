---
name: validate-podman
description: Validate Podman/Quadlet configurations on Fedora. Checks .container, .volume, .network files for syntax, security best practices, systemd integration, and dependency ordering.
allowed-tools: Read, Write, Bash, Glob, Grep
---

# Validate Podman Skill

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
```Bash
# Check generated systemd units
/usr/libexec/podman/quadlet --user --dry-run

# View service logs
journalctl --user -u <service-name>.service -e

# Manual container logs
podman logs <container-name>
```

## Usage

This Skill auto-activates when working with Podman Quadlet files in `infra/quadlets/` or similar directories.