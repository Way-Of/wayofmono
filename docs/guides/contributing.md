# Contributing Guidelines

How to contribute to WayOfMono.

## Quick Start

```bash
# 1. Fork the repo
git clone https://github.com/Way-Of/wayofmono.git

# 2. Create feature branch
git checkout -b feat/your-feature

# 3. Install dependencies
pnpm install

# 4. Run tests
pnpm -r test

# 5. Typecheck
pnpm -r --parallel typecheck
```

## Development Workflow

### 1. Branching

```bash
# Feature
git checkout -b feat/description

# Bug fix
git checkout -b fix/description

# Documentation
git checkout -b docs/description

# Chore
git checkout -b chore/description
```

### 2. Making Changes

- Follow [Naming Conventions](../best-practices/naming.md)
- Follow [Git Commits](../best-practices/git-commits.md)
- Follow [File Structure](../best-practices/file-structure.md)
- Add tests for new features
- Update documentation

### 3. Testing

```bash
# All tests
pnpm -r test

# Specific package
pnpm -F @wayofmono/wo-agent test

# Watch mode
pnpm -F @wayofmono/wo-agent test:watch
```

### 4. Typechecking

```bash
# All packages
pnpm -r --parallel typecheck

# Specific package
pnpm -F @wayofmono/wo-agent typecheck
```

### 5. Skills Sync

```bash
# Check sync
ai-harness --sync-docs --check

# Fix sync
ai-harness --sync-docs
```

### 6. Commit & Push

```bash
# Stage changes
git add .

# Commit (follows conventional commits)
git commit -m "feat: add new feature

Closes WOMONO-123"

# Push
git push origin feat/your-feature
```

### 7. Pull Request

- Open PR against `main`
- Fill PR template
- Ensure CI passes
- Request review

## Code Standards

- **TypeScript** strict mode
- **ESLint** + **Prettier** (run via `pnpm lint`)
- **No mock data** in production code
- **Enterprise-grade** error handling
- **Observable** (logging, metrics, traces)

## Skill Development

- Create in `packages/@aiengineeringharness/skills/`
- Follow `SKILL.md` format
- Test across all 7 tools
- Update `manifest.json`

## Adding NPM Packages

1. Create in `packages/@wayofmono/`
2. Add to `pnpm-workspace.yaml`
3. Configure `package.json` with `@wayofmono/` scope
4. Add tests and typecheck
5. Update CD workflow if needed

## Related

- [Git Commits](../best-practices/git-commits.md)
- [Naming Conventions](../best-practices/naming.md)
- [CI Workflow](../ci-cd/ci-workflow.md)
- [CD Workflow](../ci-cd/cd-workflow.md)