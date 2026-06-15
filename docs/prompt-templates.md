# Prompt Templates

Reusable prompt templates for common coding tasks.

## Overview

Prompt templates are parameterized prompts that can be invoked with arguments. They're stored as `.md` files with frontmatter.

## Structure

```
prompts/
├── my-template.md
├── react-component.md
├── api-endpoint.md
└── ...
```

## Format

```markdown
---
name: "react-component"
description: "Generate a React component with TypeScript"
arguments:
  - name: "componentName"
    description: "Name of the component"
    required: true
  - name: "props"
    description: "Props interface (optional)"
    required: false
---

Create a React component named `{{componentName}}` with TypeScript.

{{#if props}}
Props interface:
```typescript
interface {{componentName}}Props {
  {{props}}
}
```
{{/if}}

Requirements:
- Use functional component syntax
- Include proper TypeScript types
- Add JSDoc comments
- Export as default
```

## Built-in Templates

| Template | Description | Arguments |
|----------|-------------|-----------|
| `react-component` | React component with TS | componentName, props |
| `api-endpoint` | REST API endpoint | method, path, handler |
| `test-file` | Unit test file | targetFile, framework |
| `dockerfile` | Multi-stage Dockerfile | baseImage, port |
| `github-action` | CI/CD workflow | name, triggers, jobs |

## Usage

### In Wo Coder

```
Wo, use the react-component template for a Button component with onClick and children props
```

### Via CLI

```bash
wocode prompt react-component --componentName=Button --props="onClick: () => void; children: React.ReactNode"
```

### Programmatic

```typescript
import { loadPromptTemplate } from '@wayofmono/wo-agent';

const template = await loadPromptTemplate('react-component');
const prompt = template.render({
  componentName: 'Button',
  props: 'onClick: () => void; children: React.ReactNode'
});
```

## Creating Custom Templates

### 1. Create `.md` file

```markdown
---
name: "my-template"
description: "My custom template"
arguments:
  - name: "param1"
    description: "First parameter"
    required: true
---

Your prompt content with {{param1}} placeholder.
```

### 2. Place in prompts directory

```bash
# Global
cp my-template.md ~/.wocode/agent/prompts/

# Project
cp my-template.md .wo/agent/prompts/
```

### 3. Use it

```
Wo, use my-template with param1="value"
```

## Template Syntax

- `{{variable}}` — Simple variable substitution
- `{{#if condition}}...{{/if}}` — Conditional blocks
- `{{#each array}}...{{/each}}` — Loop over array
- `{{> partial}}` — Include partial template

## Discovery

Templates are loaded from:
1. `~/.wocode/agent/prompts/`
2. `.wo/agent/prompts/`
3. `~/.agents/prompts/`
4. Built-in templates

## Related

- [Wo Coder Guide](guides/wocode/)
- [Skills](skills.md)
- [SDK](sdk.md)