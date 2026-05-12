# Rules Lookup Skill

## Purpose

The **Rules Lookup** skill provides the Pi agent with tools to read and follow the official Pi.dev developer rules. The agent uses this skill to:

1. **Consult rules** before creating new extensions, skills, or packages
2. **Verify compliance** with system architecture standards
3. **Check specifications** for TypeScript-based assets
4. **Avoid hard-coded secrets** per security policy
5. **Follow permission scoping** rules

## Available Tools

### `list_developer_rules`

**Purpose**: List all available rule documents in `.pi/rules/`

**Returns**: Array of `{filename, location}` objects

**Example output**:
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
    },
    {
      "filename": "securitypolicy.md",
      "location": "global"
    }
  ]
}
```

---

### `get_rule_content`

**Purpose**: Read content of specific rule document

**Parameters**:
- `filename` (required): Name of rule file
- `location` (optional): `global` or `workspace`

**Example**:
```json
{
  "filename": "securitypolicy.md",
  "location": "global"
}
```

**Returns**: Full markdown content of the rule file

---

## When to Use This Skill

Use this skill when:

- User asks to create new extension/skill
- User modifies system configuration
- You're unsure about architecture rules
- Need to verify compliance
- Building new package/extension

**Before creating any asset**:

1. **Call `list_developer_rules`** → see what rules are available
2. **Call `get_rule_content`** → read relevant rule (extensions.md, skills.md, securitypolicy.md)
3. **Verify against rules** → ensure compliance
4. **Create asset** → following proper format

---

## Compliance Rules

### Rule M1.1: Model Constraints
- Never generate TypeScript without explicit declaration

### Rule P1.1: Package Manifest
- Extensions/skills must declare dependencies in `package.json`

### Rule S1.1.1: Permission Scoping
- Extensions must declare `package.permissions`

### Rule S1.1.2: Secret Management
- Never hardcode secrets, use `process.env`

### Rule S1.1.3: Sandbox Execution
- Post-install hooks must run in sandbox

### Rule E1.1: Error Codes
- Exit codes must be 0-7 per specification

---

## Usage Examples

```bash
# Show all available rules
pi run --skill ./rules-lookup/ "list developer rules"

# Read extensions rule
pi run --skill ./rules-lookup/ "read extensions.md"

# Read security policy
pi run --skill ./rules-lookup/ "read securitypolicy.md"

# Check architecture
pi run --skill ./rules-lookup/ "read architecture.md"
```

---

## Architecture Rules

See the official rules at:

```
~/.pi/rules/
├── architecture.md
├── extensions.md
├── skills.md
├── securitypolicy.md
├── models.json.md
├── modes.md
├── packages.md
├── errors.md
└── external-links.md
```

**Priority**: Follow rules in order:
1. **Critical** (must follow) - security, validation
2. **High** (should follow) - architecture, packages
3. **Medium** (nice to follow) - documentation
4. **Low** (reference) - examples, guides

---

## License

MIT License