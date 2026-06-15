# Support

Resources for getting help with WayOfMono.

## Official Links

| Resource | URL |
|----------|-----|
| **GitHub Issues** | https://github.com/Way-Of/wayofmono/issues |
| **CTO Dashboard** | https://cto.wayof.work |
| **Documentation** | https://github.com/Way-Of/wayofmono/tree/main/docs |
| **NPM Packages** | https://www.npmjs.com/settings/wayofmono/packages |

## Getting Help

### Bug Reports

1. Check [existing issues](https://github.com/Way-Of/wayofmono/issues)
2. Create new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (OS, Deno/Node versions)
   - Logs/error messages

### Feature Requests

1. Check [existing issues](https://github.com/Way-Of/wayofmono/issues)
2. Create new issue with:
   - Clear use case
   - Proposed solution
   - Alternatives considered

### Questions

- GitHub Discussions (if enabled)
- Create issue with `question` label

## Common Issues

### Deno Not Found

```bash
# Verify
deno --version

# Reinstall
# Windows: irm https://deno.land/install.ps1 | iex
# macOS: brew install deno
# Linux: curl -fsSL https://deno.land/install.sh | sh
```

### Skills Not Syncing

```bash
# Check sync
ai-harness --sync-docs --check

# Force sync
ai-harness --sync-docs

# Full update
ai-harness --update
```

### Dashboard Not Starting

```bash
# Check health
curl https://cto.wayof.work/api/health

# Rebuild
cd ui && pnpm build

# Check logs
podman-compose logs -f nextjs
```

### Permission Errors

```bash
# Fix script permissions
chmod +x packages/@aiengineeringharness/setup.sh
chmod +x scripts/*.sh
```

## Community

- **Discord**: (if available)
- **Twitter/X**: @WayOfMono
- **Blog**: (if available)

## Enterprise Support

For enterprise support, contact via GitHub Issues or email.

## Related

- [Contributing](../contributing.md)
- [Security Policy](../SECURITY.md)
- [Troubleshooting](../troubleshooting.md)