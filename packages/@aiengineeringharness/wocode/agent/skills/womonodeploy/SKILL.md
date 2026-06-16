---
name: womonodeploy
description: >-
  Release and update npm packages across the WoM ecosystem. Handles version
  bumping, README/docs updates, npm publish, git commit/push, permission
  workarounds (EACCES), and production mode configuration.
allowed-tools:
  - read
  - write
  - edit
  - bash
  - grep
  - glob
  - todowrite
  - task
  - question
---

# womonodeploy — Package Release & Deploy

Releases and updates npm packages across the WayOfMono ecosystem. Full lifecycle:
version bump → docs → npm publish → git → permissions fix.

## Supported Packages

| Package | Location | npm Name | Standalone Repo |
|---------|----------|----------|-----------------|
| CTO Dashboard | `ui/` | `@wayofmono/wo-cto-dashboard` | `github.com/Way-Of/wayofdev` |

## Release Workflow

1. Determine version bump (SemVer) — ask user
2. Update `ui/package.json` `"version"` field
3. Update READMEs (`ui/README.md`, monorepo `README.md` — all version refs)
4. Add release notes to `docs/fixes/cto-dashboard-fixes.md`
5. Update ticket checklist (e.g. WOMONO-084)
6. `cd ui && npm publish` — publish to npm
7. Sync standalone repo if needed (`github.com/Way-Of/wayofdev`)
8. `git add/commit/push` monorepo changes

## EACCES / Permissions

- `npx` preferred — no install needed
- `npm config set prefix ~/.npm-global` — no sudo, everything writable
- `sudo npm install -g` → then `sudo wodev --build` once, then `wodev` as user

## wodev Modes

| Command | Mode | Description |
|---------|------|-------------|
| `wodev` | production | `next start` — read-only, needs build first |
| `wodev --dev` | dev | `next dev --turbopack` — hot reload |
| `wodev --build` | build | `next build` — one-time build |
| `wodev --update` | — | `npm update -g` |
| `wodev --version` | — | Print version |
| `wodev --help` | — | Help |

Port: **6969** (`PORT=8080 wodev` to override)
