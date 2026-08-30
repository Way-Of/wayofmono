# Multi-Platform Support

Deno installation across platforms.

## Deno Installation

| Platform | Command | Level |
|----------|---------|-------|
| **Windows** | `irm https://deno.land/install.ps1 | iex` | Full |
| **macOS** | `brew install deno` | Full |
| **Linux** | `curl -fsSL https://deno.land/install.sh | sh` | Full |
| **WSL/Git Bash** | `apt install deno` | Full |

## Verify Installation

```bash
deno --version
# deno 2.x.x
```

## WayOfMono Requirements

- **Deno**: 2.x (for harness CLI)
- **Node.js**: 22 (for NPM packages)
- **pnpm**: 10 (package manager)
- **Bun**: Optional (for dashboard dev)
- **Podman**: For deployment

## Platform-Specific Notes

### Windows

- Use PowerShell for Deno install
- First run needs `--reload`: `deno run --reload -A <url>`
- Path may need restart: `$env:Path += ";$env:USERPROFILE\.deno\bin"`

### macOS

- Homebrew recommended for Deno
- Rosetta 2 may be needed on Apple Silicon for some binaries

### Linux

- Install script works on all distros
- May need to add `~/.deno/bin` to PATH manually
- Podman preferred over Docker for rootless containers

### WSL2

- Use Linux instructions inside WSL
- Windows files accessible at `/mnt/c/`
- Podman works natively in WSL2

## CI/CD Platform

GitHub Actions runs on:
- **ubuntu-latest** (primary)
- **Node 22**, **pnpm 10**, **Deno 2.x**

## Related

- [Installation & Update](../installation-and-update.md)
- [CLI Reference](../installation/cli-reference.md)
- [One-Command Install](../installation/one-command.md)