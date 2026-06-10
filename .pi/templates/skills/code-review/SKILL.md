---
name: code-review
description: Review code for bugs, security issues, and best practices. Use when asked to review PRs, commits, or code changes.
---

# Code Review Skill

## Review Checklist

### Security
- [ ] SQL injection vulnerabilities
- [ ] XSS vulnerabilities
- [ ] Authentication/authorization gaps
- [ ] Hardcoded secrets or credentials
- [ ] Input validation and sanitization

### Code Quality
- [ ] Bug potential and logic errors
- [ ] Error handling completeness
- [ ] Resource leaks (connections, files, memory)
- [ ] Performance issues
- [ ] Dead or unreachable code

### Best Practices
- [ ] Naming clarity
- [ ] Function length and complexity
- [ ] Code duplication (DRY)
- [ ] Comments for non-obvious logic
- [ ] Consistent style with project

## Review Process

1. **Read the changes** — use `read` to understand modified files
2. **Check against checklist** — systematically review each area
3. **Run static analysis** — use `bash` for linters and type checkers
4. **Test if possible** — run relevant tests
5. **Report findings** — categorize by severity

## Output Format

```markdown
### Code Review: [feature/bug-name]

## Summary
[Brief overview of changes and overall assessment]

## Critical Issues
- [ ] **Security**: [Description] in `file.ts:123`
- [ ] **Bug**: [Description] in `file.ts:456`

## Warnings
- [ ] **Performance**: [Description]
- [ ] **Practice**: [Description]

## Suggestions
- [ ] [Improvement suggestion]

## Verdict
[APPROVE / REQUEST CHANGES / REJECT]
```
