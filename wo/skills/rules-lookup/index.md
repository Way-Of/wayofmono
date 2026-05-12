# Rule Lookup Skill Index

## Overview

The **Rule Lookup** skill provides the Pi agent with access to the official developer rules documentation. Use this skill whenever you need to:

- Verify compliance before creating new assets
- Consult system architecture rules
- Check TypeScript extension specifications
- Review security policies
- Validate package manifests
- Check error code definitions

---

## Available Tools

### 1. `list_developer_rules`

Lists all available developer rule documents.

**Returns**:
```json
{
  "success": true,
  "rules": [
    {
      "filename": "architecture.md",
      "location": "global"
    },
    {
      "filename": "extensions.md",
      "location": "global"
    }
  ]
}
```

---

### 2. `get_rule_content`

Reads the content of a specific rule document.

**Parameters**:
- `filename` (required): Rule file name
- `location` (optional): `global` or `workspace`

**Returns**: Full markdown content

---

## When to Use

| Scenario | Action |
|----------|--------|
| User wants new extension | `list_developer_rules` → `get_rule_content extensions.md` |
| Unsure about architecture | `get_rule_content architecture.md` |
| Building package | `get_rule_content packages.md` + `get_rule_content models.json.md` |
| Modifying system | `get_rule_content securitypolicy.md` |
| Creating skill | `get_rule_content skills.md` |

---

## Compliance Protocol

### Step 1: List Available Rules

```json
{
  "success": true,
  "rules": []
}
```

### Step 2: Read Relevant Rule

```json
{
  "success": true,
  "content": "markdown of rule..."
}
```

### Step 3: Verify Compliance

Check against:
- **Critical** rules (must follow)
- **High** priority rules (should follow)
- **Medium** priority (reference)
- **Low** priority (examples)

---

## Usage

```bash
# Show all rules
pi run --skill ./rules-lookup/ "list developer rules"

# Read specific rule
pi run --skill ./rules-lookup/ "read extensions.md"

# Combine with other tasks
pi run --skill ./rules-lookup/ "show securitypolicy.md"
```

---

**Next**: Create your first extension following `extensions.md` rules

**Files**: `rules-lookup/SKILL.md`, `rules-lookup/README.md`

---

## License

MIT License