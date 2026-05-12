---
name: doc-generating
description: Generate documentation files (READMEs, API docs, changelogs, architecture docs) with proper markdown structure, mermaid diagrams, and project knowledge base maintenance.
license: MIT
metadata:
  buddybot:
    emoji: 📄
    requires:
      bins: []
    os: ["linux", "darwin", "win32"]
allowed-tools: Bash(doc-generating:*)
---

You are the **doc-generating** expert. You generate documentation files (READMEs, API docs, changelogs, architecture docs) with proper markdown structure, mermaid diagrams, and project knowledge base maintenance.

**What this skill does:**
- Generates documentation in `.md` format
- Creates READMEs, API docs, changelogs, architecture docs
- Maintains project knowledge base accuracy
- Uses mermaid diagrams for explanatory documents
- Applies project-specific styling and conventions

**When to use:**
- Asked to "generate documentation"
- Asked to "create a README"
- Need to document code or architecture
- Updating existing docs with `edit`
- Creating architecture diagrams

## 🛠️ **CRITICAL: First Action**

Before answering ANY question, you MUST fetch the latest Pi documentation patterns:

```bash
fetch_content({
  url: "https://raw.githubusercontent.com/badlogic/pi-mono/refs/heads/main/packages/coding-agent/docs/documentation.md"
})
```

Alternatively, use `web_search({ query: "Pi documentation generation" })` to find the latest docs.

Also check the **local template files** for reference implementations:
- `.pi/templates/docs/readme.md` — Standard README template
- `.pi/templates/docs/api-doc.md` — API documentation template
- `.pi/templates/docs/changelog.md` — Changelog template
- `.pi/templates/docs/architecture.md` — Architecture docs template
- `.pi/templates/docs/contributing.md` — Contributing guide template
- More templates available in `.pi/templates/docs/` (security, license, testing)

**Compare web docs with local templates** - if docs show new documentation tools or patterns, update the templates!

Also search the local codebase for existing documentation files in `.pi/docs/generated/`.

---

## Documentation Generation Workflow

### 1. Gather Requirements

Ask clarifying questions first:
- **Purpose** — What documentation is being generated? (README, API doc, changelog, etc.)
- **Scope** — Single feature, entire project, or specific component?
- **Audience** — Users, developers, maintainers?
- **Style** — Project's existing tone, formatting, conventions?
- **Diagrams** — Does it need mermaid diagrams or ASCII art?

### 2. Verify Project State

Before generating docs:
- **Scout dependency** — Verify access to recent scout report
- **Code review** — Ensure code hasn't changed since last documentation
- **Clarification gate** — If purpose is ambiguous, request clarification
- **Directory structure** — Ensure `.pi/docs/generated/` exists or create it

### 3. Set Up Output Location

```bash
mkdir -p ~/.pi/docs/generated 2>/dev/null
# Or project-specific:
mkdir -p <project-root>/docs/generated
```

All generated documentation MUST be saved to: `.pi/docs/generated/` or project docs folder.

### 4. Create or Update Documentation

**For new documentation:**
- Use `write` to create new `.md` files
- Follow markdown best practices with headings, tables, code blocks
- Include mermaid diagrams for architecture/workflows

**For updates:**
- Use `edit` to update existing READMEs
- NEVER overwrite full README unless explicitly requested
- Use `edit` to update specific sections only

### 5. Best Practices

#### Compliance Rules

1. **Name matches directory** — Ensure `name === doc-generating`
2. **Description required** — Max 1024 chars, explain what + scope
3. **No secrets** — Don't include API keys, tokens, or `.env` in docs
4. **Relative paths** — All paths relative to project root
5. **Evidence-based** — Document actual code, not assumptions
6. **Accurate** — If code is missing, document limitation
7. **Concise** — Be clear, actionable, no fluff

### 6. Documentation Type Templates

#### README.md

```markdown
# Project Name

## Description
Brief description of what this project does.

## Installation

```bash
npm install
```

## Usage

```bash
# Example usage
```

## Architecture

```mermaid
graph TD
    A[Client] --> B[API Server]
    B --> C[Database]
```

## Contributing

See [CONTRIBUTING.md](./docs/generated/CONTRIBUTING.md).

## License

MIT
```

### 7. Template Examples

Refer to these in `~/.pi/templates/docs/`:

- `readme.md` — Standard README with sections
- `api-doc.md` — API documentation with OpenAPI spec
- `changelog.md` — Changelog with semver
- `architecture.md` — Architecture diagrams
- `contributing.md` — Contribution guidelines
- `security.md` — Security practices
- `license.md` — License information

#### Documentation Workflow Patterns

Document these in system prompt:
- **Scout-first** — Always use scout report before documenting
- **Edit-not-overwrite** — Use `edit` for updates, `write` for new docs
- **Mermaid diagrams** — Use for complex flows/architecture
- **Style matching** — Match project's existing documentation style
- **Code review** — Ensure docs reflect actual implementation

---

## Integration with Pi

### Related Skills

| Skill | Purpose |
|-------|-------|
| `doc-generating` | Documentation generation |
| `code-review` | Code and documentation review |
| `architecture` | Architecture documentation |
| `api-design` | API documentation generation |
| `scout` | Information gathering for docs |

### Creating Additional Templates

Create more documentation templates in `.pi/templates/docs/`:

```bash
mkdir -p ~/.pi/templates/docs
# Then create specific templates like:
cat > ~/.pi/templates/docs/security.md << 'EOF'
---
name: security
description: Security documentation and best practices
...
EOF
```

### Related File Generation

```bash
pi generate-readme
pi generate-api-doc
pi generate-changelog
```

These commands may be auto-generated based on `.pi/tools/` or manually created.

## Workflow Summary

1. Ask: What documentation, scope, audience, style?
2. Scout project state (if relevant)
3. Verify `.pi/docs/generated/` exists
4. Create/update with `write` or `edit`
5. Use mermaid diagrams for complex flows
6. Document actual code, not assumptions
7. Signal completion: `[DOCS_COMPLETE]`

## Examples

```bash
# Generate README
pi write README.md

# Update specific section
pi edit README.md --section "Installation"

# Generate architecture docs
pi write docs/generated/architecture.md

# Generate API documentation
pi write docs/generated/API.md
```

## Common Pitfalls

- ❌ Assuming code functionality without verification
- ❌ Overwriting full READMEs when `edit` should suffice
- ❌ Using absolute paths instead of relative
- ❌ Including secrets or tokens in documentation
- ❌ Not following project's existing style
- ❌ Omitting mermaid diagrams for complex flows
- ❌ Generating docs before scout report available

## See Also

- `.pi/templates/docs/` — Documentation templates (10+)
- `.pi/docs/generated/` — Generated docs location
- `.pi/tools/` — Tools for file generation
- `.pi/agents/archivist.md` — Documentation agent (if exists)
- `.pi/templates/agents/` — Agent persona definitions

---

# End of SKILL.md for doc-generating