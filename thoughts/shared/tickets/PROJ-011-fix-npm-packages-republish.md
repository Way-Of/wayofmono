---
title: "[PROJ-011] Fix NPM package contents and republish"
type: "Bug"
priority: "Critical"
status: "Done"
assignee: "@gemini-cli"
created: "2026-05-19"
---

## Context
The previous attempt to publish the `@wayofmono/*` packages to npm resulted in incomplete packages. Specifically, the `files` field in many `package.json` files was set to `["src", "README.md"]`, which excluded the compiled `dist/` directory from the npm tarball. While `bin` and `main` entry points were auto-included, their transitive imports (e.g., `main.js`, `config.js`) were missing, causing the CLI tools (`wouser`, `wocode`) to fail with `ERR_MODULE_NOT_FOUND`.

## Requirements & Scope
- [x] Update `package.json` for all `@wayofmono/*` packages to include `"dist"` in the `files` array.
- [x] Rebuild all packages locally to ensure fresh `dist/` content (`pnpm -r build`).
- [x] Republish all packages to npm (`pnpm -r publish --access public --no-git-checks`).
- [x] Verify that `npm install @wayofmono/wo-agent` and `@wayofmono/wo-coding-agent` work in a clean directory and the binaries are functional.

## Technical Notes
- `lens` has no `files` field, which is fine (includes everything by default).
- `wo-web-ui` and others were updated to point to `dist/` in `exports` for consistency.
- `telemetry` skipped due to custom registry auth.

## Success Criteria
- [x] `npx wouser --help` runs without ESM resolution errors after npm install.
- [x] `npx wocode --help` runs without ESM resolution errors after npm install.
- [x] All 9 packages are successfully updated on npm (v1.0.1).
