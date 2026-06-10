---
name: doc-generator
description: Generate documentation from code. Use when asked to create README, API docs, or inline documentation.
---

# Documentation Generator Skill

## Types of Documentation

### README.md
- Project overview and purpose
- Installation instructions
- Usage examples
- Configuration options
- Contributing guidelines

### API Documentation
- Function/method signatures
- Parameter descriptions
- Return value documentation
- Usage examples
- Error conditions

### Inline Documentation
- JSDoc/TSDoc/docstrings
- Complex logic explanations
- Parameter purpose notes

## Generation Process

1. **Analyze code** — use `read` to understand the codebase
2. **Identify exports** — find public API surface
3. **Extract types** — understand function signatures and types
4. **Write documentation** — use `write` to create docs
5. **Review** — read back to verify accuracy

## Templates

### README Template
```markdown
# Project Name

[One-line description]

## Installation
\```bash
[installation commands]
\```

## Usage
\```[language]
[usage examples]
\```

## Configuration
[configuration options table]

## Contributing
[pull request guidelines]
```

### API Doc Template
```markdown
### functionName(param1, param2)

[Description of what the function does]

**Parameters:**
- `param1` (Type): Description
- `param2` (Type): Description

**Returns:** (Type) Description

**Example:**
\```[language]
[usage example]
\```
```

## Notes
- Match existing documentation style in the project
- Include practical, runnable examples
- Document edge cases and error conditions
