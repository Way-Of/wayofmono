# Wo User Agent (wouser) — Resource Management

## Overview

`@wayofmono/wo-agent` (wouser) loads skills, agents, and extensions from npm packages as **project dependencies**. No file copying, no global state. Everything is tracked in `.wo/manifest.json`.

## Architecture

```
Project/
├── node_modules/
│   ├── @wayofmono/
│   │   ├── skill-investor-ready-doc-gen/   # SKILL.md lives here
│   │   ├── agent-expert-coder/             # AGENTS.md lives here
│   │   └── extension-web-search/           # index.js lives here
├── .wo/
│   ├── manifest.json                       # Tracks registered resources
│   ├── settings.json
│   └── models.json
└── package.json                            # npm dependencies
```

## Resource Types

| Type | Marker File | Purpose | Example Package |
|------|------------|---------|----------------|
| `skill` | `SKILL.md` | Specialized instructions for the agent | `@wayofmono/skill-investor-ready-doc-gen` |
| `agent` | `AGENTS.md` | Agent persona / context definition | `@wayofmono/agent-expert-coder` |
| `extension` | `index.js` | Custom tools and runtime extensions | `@wayofmono/extension-web-search` |

## CLI Commands

All three types share the same subcommand structure.

### Install

```bash
# Install the npm package first
npm install @wayofmono/skill-investor-ready-doc-gen

# Register it with wouser
wouser skill install npm:@wayofmono/skill-investor-ready-doc-gen

# Short form (auto-resolves under @wayofmono scope)
wouser skill install investor-ready-doc-gen
```

Same pattern for agents and extensions:

```bash
wouser agent install npm:@wayofmono/agent-expert-coder
wouser extension install npm:@wayofmono/extension-web-search
```

### List

```bash
wouser skill list
wouser agent list
wouser extension list
```

### Discover

Scan `node_modules/` for packages not yet registered:

```bash
wouser skill discover
wouser agent discover
wouser extension discover
```

### Update

Re-read marker files after `npm update`:

```bash
wouser skill update
wouser agent update expert-coder
wouser extension update
```

### Remove

```bash
wouser skill remove investor-ready-doc-gen
wouser agent remove expert-coder
wouser extension remove web-search
```

## Manifest File (`.wo/manifest.json`)

```json
{
  "entries": [
    {
      "source": "npm:@wayofmono/skill-investor-ready-doc-gen",
      "name": "investor-ready-doc-gen",
      "path": "./node_modules/@wayofmono/skill-investor-ready-doc-gen",
      "type": "skill"
    }
  ]
}
```

Commit this file to share resource configuration across the team.

## Auto-Loading

On startup, `loadSkills()` reads `.wo/manifest.json` and loads all registered skills automatically. No `--skill` flags needed.

Agents and extensions from manifest require explicit `--agent` / `--extension` flags or `--skill` paths until auto-loading is integrated for those types.

## Programmatic SDK Usage

```typescript
import { loadSkillsFromDir, formatSkillsForPrompt, readManifest } from '@wayofmono/wo-agent';

// Load skills from manifest
const manifest = readManifest(process.cwd());
for (const entry of manifest.entries.filter(e => e.type === 'skill')) {
  const result = loadSkillsFromDir({ dir: entry.path, source: 'project' });
  // Use result.skills...
}

// Format for LLM prompt
const prompt = formatSkillsForPrompt(result.skills);
```

## Source Formats

| Format | Example | Description |
|--------|---------|-------------|
| `npm:@scope/package` | `npm:@wayofmono/skill-foo` | Full npm package ref |
| `short-name` | `investor-ready-doc-gen` | Auto-resolves to `@wayofmono/skill-<name>` |
| `github:user/repo` | (future) | GitHub source |
| `https://...` | (future) | Cloud registry |

## InvestReady Example

```bash
cd /path/to/investready

# Install the skill package
npm install @wayofmono/skill-investor-ready-doc-gen

# Register it
npx wouser skill install npm:@wayofmono/skill-investor-ready-doc-gen

# Verify
npx wouser skill list
# → Registered skills (1):
# →   ✓ investor-ready-doc-gen
# →      source: npm:@wayofmono/skill-investor-ready-doc-gen
# →      path:   .../node_modules/@wayofmono/skill-investor-ready-doc-gen
# →      version: 0.1.0
```

## Relationship to AI Engineering Harness

| | Wo User (wouser) | AI Engineering Harness |
|---|---|---|
| **Scope** | Your app's agent features | 7 coding tool frontends |
| **Skills** | npm deps via `wouser skill install` | Harness CLI (`ai-harness --tool=...`) |
| **Config** | `.wo/manifest.json` | `~/.config/opencode/`, `~/.claude/`, etc. |
| **Install** | `npm install @wayofmono/wo-agent` | `deno run -A install.ts` |
| **Users** | End-users of your app | Developers using AI tools |

