# Dev Dependencies vs Runtime Dependencies

Understanding the difference between `--save-dev` and regular dependencies.

## The Hammer vs. The House

Think of your application as a **house you are building**.

- **dependencies** (runtime): Materials — bricks, glass, wires. Your app cannot live without them.
- **devDependencies** (`--save-dev` / `-D`): Tools — hammers, saws, blueprints. Needed to build, but not shipped inside the walls.

## What It Does

```bash
# Dev dependency — goes to devDependencies in package.json
npm install --save-dev @wayofmono/wo-coding-agent
```

```bash
# Runtime dependency — goes to dependencies in package.json
npm install @wayofmono/wo-agent
```

### package.json Result

```json
{
  "dependencies": {
    "@wayofmono/wo-agent": "^1.0.0"
  },
  "devDependencies": {
    "@wayofmono/wo-coding-agent": "^1.0.0"
  }
}
```

## Production Behavior

```bash
# Production install — skips devDependencies
pnpm install --prod
# or
npm install --production
```

- **Smaller** — No dev tools bundled
- **Faster** — Fewer packages to download
- **More secure** — Reduced attack surface

## Why wocode is a Dev Dependency

The **Coding Assistant (wocode)** is a tool for **you, the engineer**.

- Helps write code, refactor files, analyze architecture
- Runs during development only
- Your **end-users never interact with it**
- Never bundled into user-facing code

```bash
npm install --save-dev @wayofmono/wo-coding-agent
```

## Why wouser is a Runtime Dependency

The **User Assistant (wouser)** is an **SDK**.

- If you're building an AI chatbot or feature using agent logic **inside your app**
- Your app needs that code **at runtime**
- Your **end-users interact with it** (indirectly)
- Must be bundled with your application

```bash
npm install @wayofmono/wo-agent
```

## Quick Decision Guide

| Question | Answer | Install As |
|----------|--------|------------|
| Does your production app import it? | Yes | `dependencies` |
| Is it a tool you run during development? | Yes | `devDependencies` |
| Do end-users need it to run your app? | Yes | `dependencies` |
| Is it a CLI, linter, tester, builder? | Yes | `devDependencies` |
| Is it a library, framework, SDK, SDK? | Yes | `dependencies` |

## Bundle Size Impact

| Package | Type | Bundled in Production? |
|---------|------|------------------------|
| `@wayofmono/wo-coding-agent` | Dev | No (~8MB saved) |
| `@wayofmono/wo-agent` | Runtime | Yes (~8MB included) |
| `@wayofmono/wo-ai` | Runtime | Yes (~4MB included) |
| `@wayofmono/wo-tui` | Runtime | Yes (~1.5MB included) |

## Related

- [Wo Coder Installation](guides/wocoder/#installation)
- [Wo User Installation](guides/wouser/#installation)
- [Packages Overview](packages.md)