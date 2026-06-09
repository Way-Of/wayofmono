---
title: "[PROJ-012] Fix pnpm workspace:* protocol for bun compatibility"
type: "Bug"
priority: "High"
status: "Done"
assignee: "@zerwiz"
created: "2026-05-20"
---

## Context

Way of Work (wayofwork) uses **bun** as its package manager. WayOfMono packages (`@wayofmono/wo-agent`, `@wayofmono/wo-agent-core`, `@wayofmono/wo-ai`, `@wayofmono/wo-tui`) declare their internal dependencies using pnpm's `workspace:*` protocol:

```json
// wo-agent/package.json
"dependencies": {
  "@wayofmono/wo-agent-core": "workspace:*",
  "@wayofmono/wo-ai": "workspace:*",
  "@wayofmono/wo-tui": "workspace:*"
}
```

Bun does not understand `workspace:*` and errors with:
```
error: Workspace dependency "@wayofmono/wo-agent-core" not found
```

This means wayofwork cannot install wo-agent from the local cloned repo.

**Note**: also test npm and pnpm as potential package managers for wayofwork instead of bun. The consumer (wayofwork) may need to switch package managers if bun cannot resolve pnpm workspace deps.

## Requirements & Scope

- [ ] Replace `workspace:*` references in all WayOfMono packages with actual version ranges (e.g. `"^1.0.2"`)
- [ ] Verify that `bun install` can resolve all @wayofmono packages from local `file:` paths
- [ ] Ensure the packages still work correctly under pnpm for the WayOfMono monorepo itself

## Technical Notes

- Affected packages: `wo-agent`, `wo-agent-core`, `wo-ai`, `wo-tui`, `wo-coding-agent`
- Alternative: try switching wayofwork to npm or pnpm instead of bun, if they handle `workspace:*` correctly
- Bun supports `file:` protocol — wayofwork would use `"@wayofmono/wo-agent": "file:/path/to/wayofmono/packages/@wayofmono/wo-agent"`
- Option: switch to `"workspace:^1.0.2"` which pnpm treats as a range, but bun might also not support. Alternative: use `"^1.0.2"` and rely on publish — but then local dev requires manual symlink or `file:` path
- Best approach may be to use `"npm:^1.0.2"` or just `"^1.0.2"` and publish regularly, with a `link:` or `file:` override in the consumer's package.json for local development

## Success Criteria

- [ ] `bun install` succeeds when wayofwork points to `file:/home/zerwiz/wayofmono/packages/@wayofmono/wo-agent`
- [ ] `bun run build` passes in wayofwork
- [ ] Server starts without module resolution errors
