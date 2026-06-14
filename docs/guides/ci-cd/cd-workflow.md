# CD Workflow

GitHub Actions CD configuration for publishing packages to npm.

## Workflow File

`.github/workflows/cd.yml`

## Triggers

- Tag push matching `v*` (e.g., `v1.3.0`, `v2.0.0-beta.1`)

## Environment

- **OS**: ubuntu-latest
- **Node**: 22
- **pnpm**: 10
- **Registry**: npmjs.org

## Jobs

### publish

```yaml
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

## Steps Explained

| Step | Purpose |
|------|---------|
| `actions/checkout@v4` | Clone repository |
| `pnpm/action-setup@v4` | Install pnpm 10 |
| `actions/setup-node@v4` | Install Node 22, configure npm registry |
| `pnpm install --frozen-lockfile` | Install dependencies |
| `pnpm build` | Build all packages |
| `pnpm -r publish` | Publish all packages to npm |

## Publishing Process

1. **Create version bump**:
   ```bash
   # Update version in manifest.json, package.json files
   # Update CHANGELOG.md
   ```

2. **Create and push tag**:
   ```bash
   git tag v1.3.0
   git push origin v1.3.0
   ```

3. **CD workflow runs automatically**:
   - Builds all 13 packages
   - Publishes to npm with `--access public`
   - Uses `NPM_TOKEN` secret for authentication

## Version Bumping

Use the version updater skill:

```bash
# Via harness (when implemented)
ai-harness --version-bump

# Or manually:
# 1. Update manifest.json version
# 2. Update all package.json versions
# 3. Update CHANGELOG.md
# 4. Commit and tag
```

## NPM Packages Published

All 13 packages under `@wayofmono` scope:

| Package | Description |
|---------|-------------|
| `@wayofmono/wo-ai` | Multi-Provider LLM API |
| `@wayofmono/wo-tui` | Terminal UI Library |
| `@wayofmono/wo-agent-core` | Agent Runtime |
| `@wayofmono/wo-agent` | User Agent SDK (wouser) |
| `@wayofmono/wo-coding-agent` | Coding Agent (wocode) |
| `@wayofmono/wo-skill-docs` | Documentation Expert |
| `@wayofmono/wo-mermaid` | Mermaid Renderer |
| `@wayofmono/web-access` | Web Tools Packet |
| `@wayofmono/lens` | Codebase Analysis |
| `@wayofmono/wo-web-ui` | Web UI Components |
| `@wayofmono/telemetry` | Telemetry & Metrics |
| `@wayofmono/telegram` | Telegram Bot |
| `@wayofmono/whatsapp` | WhatsApp Bot |

## Required Secrets

| Secret | Description |
|--------|-------------|
| `NPM_TOKEN` | npm automation token with publish access |

Configure in GitHub: Settings → Secrets and variables → Actions → New repository secret

## Related

- [CI Workflow](ci-workflow.md)
- [Pre-Deploy Checklist](pre-deploy-checklist.md)
- [Packages Overview](../packages.md)
- [Version Updater Skill](../../skills/womono_version_updater/)