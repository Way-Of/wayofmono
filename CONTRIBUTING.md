# Contributing to WayOfMono

Welcome! Thank you for your interest in contributing to **WayOfMono** — the ultimate monorepo consolidation for high-performance coding agents.

## Table of Contents

- [Getting Started](#getting-started)
- [Code Style & Best Practices](#code-style--best-practices)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Commit Guidelines](#commit-guidelines)
- [Issue Guidelines](#issue-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Git](https://git-scm.com/)
- Optional: Deno for CLI development

### Setup

```bash
# Clone the repository
git clone https://github.com/Way-Of/wayofmono.git

# Install dependencies
npm install

# Run dev server
npm run dev
```

### Pull Before Reading

Always pull changes before working with the repository:

```bash
git pull --ff-only
```

## Code Style & Best Practices

### TypeScript

- Use strict TypeScript configuration
- No mock data in application code
- Enterprise-grade error handling
- Observable (logging, metrics, traces)
- Secure (input validation, auth, rate limiting)
- Handle edge cases (empty states, timeouts, duplicates)

### Testing

- Write tests for failure modes, not just happy paths
- Aim for high code coverage on critical paths
- Use existing testing frameworks in the project

### Error Handling

```typescript
// ✅ Good
try {
  await operation();
} catch (error) {
  logError(error);
  throw new OperationFailedError(error.message);
}

// ❌ Bad
try {
  await operation();
} catch (error) {
  console.error(error); // Don't just log, handle properly
}
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feat/descriptive-name
```

### 2. Make Changes

- Keep changes focused and minimal
- Follow existing code style
- Update related tests
- Document non-obvious decisions

### 3. Run Tests

```bash
npm test
```

### 4. Validate

```bash
npm run lint
npm run build
```

### 5. Commit

See [Commit Guidelines](#commit-guidelines) below.

## Testing

### Requirements

- No mock data in application code
- Enterprise-grade error handling
- Observable (logging, metrics, traces)
- Secure (input validation, auth, rate limiting)
- Edge cases handled (empty states, timeouts, duplicates)

### Best Practices

```typescript
// Test failure modes
describe('operation', () => {
  it('handles empty input gracefully', async () => {
    expect(await operation({})).toBeNull();
  });

  it('handles timeout correctly', async () => {
    await expect(
      operation({ timeout: 10 })
    ).rejects.toThrow('operation timed out');
  });

  it('handles duplicates correctly', async () => {
    const results = await operation({ items: [1, 1, 2] });
    expect(results.duplicates).toBe(1);
  });
});
```

## Commit Guidelines

Use semantic commit messages:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes

### Examples

```bash
git commit -m "feat(ui): add dark mode toggle

- Implement dark mode color palette
- Add toggle button to header
- Persist preference in localStorage

Fixes #123
"
```

See [AGENTS.md](./AGENTS.md) for detailed commit structure.

## Issue Guidelines

### Issue Template

When creating an issue:

1. **Clear Title**: Concise description of the problem
2. **Reproduction Steps**: How to reproduce the issue
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, browser, Node version

### Issue Types

- **Bug Report**: Something isn't working
- **Feature Request**: Missing functionality
- **Documentation**: Improvements needed
- **Question**: Need help or clarification

### Linking to GitHub Issues

Refer to issues in your PRs and commits:

```bash
# Link to issue in commit message
git commit -m "Fix: handle edge case [WOMONO-123]"

# Or inline
This change fixes issue #123
```

## Pull Request Process

### Before Submitting

- [ ] Self-review complete
- [ ] All tests pass
- [ ] Code follows style guide
- [ ] No linting errors
- [ ] Changes tested locally
- [ ] Documentation updated (if needed)

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

Describe testing performed

## Screenshots (if applicable)

## Checklist

- [ ] Self-reviewed code
- [ ] Added/updated tests
- [ ] Updated documentation
- [ ] No linting errors
- [ ] Ready for review
```

## Project Structure

```
./
├── packages/@aiengineeringharness/   # AI Engineering Harness (core)
├── ui/                              # CTO Dashboard (Next.js 16)
├── docs/                            # Documentation
├── thoughts/                        # Context engineering (f-rr-d)
│   ├── global/                      # Cross-project
│   ├── wayofmono/                   # WOMONO-XXX tickets
│   ├── wow/                         # WOW-XXX tickets
│   └── opticat/                     # OPT-XXX tickets
└── .github/workflows/               # CI/CD
```

### Key Files

- `packages/@aiengineeringharness/manifest.json` — Source of truth for skills
- `packages/@aiengineeringharness/install.ts` — Installer logic
- `thoughts/wayofmono/shared/tickets/ticket-template.md` — Canonical ticket template
- `thoughts/wayofmono/docs/best-practices/` — Production-ready standards

## Questions?

- See [AGENTS.md](./AGENTS.md) for detailed workflow
- Check [Thoughts](thoughts/) for context engineering
- Open an issue for questions

---

**Thank you for contributing!**
