# Git Commit Messages

Conventional commit format for WayOfMono.

## Format

```
<type>: <description>

[optional body]

[optional footer]
```

## Types

| Type | Description |
|------|-------------|
| `feat` | Add feature |
| `fix` | Fix bug |
| `docs` | Add/update documentation |
| `chore` | Update dependencies, build config |
| `refactor` | Refactor code (no behavior change) |
| `test` | Add/update tests |
| `perf` | Improve performance |

## Examples

```bash
feat: Add create_plan slash command
fix: Resolve skill sync race condition
docs: Update Wo Coder installation guide
chore: Update Deno to 2.x
refactor: Extract skill loading to separate module
test: Add integration tests for wocode
perf: Optimize TUI render loop
```

## Scope (Optional)

```bash
feat(harness): Add --sync-docs --check flag
fix(wocode): Handle empty session tree
docs(guides): Add dashboard deployment guide
```

## Breaking Changes

```bash
feat: Change skill manifest format

BREAKING CHANGE: manifest.json v2 requires new 'tools' array format
```

## Body Guidelines

- Explain **what** and **why**, not how
- Reference tickets: `Closes WOMONO-123`
- Keep under 72 characters per line

## Footer

```
Closes WOMONO-123
Refs WOW-456
Co-authored-by: Name <email>
```

## Related

- [Naming Conventions](naming.md)
- [File Structure](file-structure.md)
- [Ticket Format](../getting-started.md#tickets)