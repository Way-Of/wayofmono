# WOW-066 Hardcoded File Path Audit & Removal

## Problem Statement

The codebase contains hardcoded absolute file paths (e.g., `/home/`, `/Users/`, `C:\`) that will **break when the app is installed to a different directory**. This is critical for desktop deployment (WOW-065) where the app may be installed to `C:\Program Files\`, `/opt/wayofwork/`, or a user-chosen location.

Hardcoded paths cause:
1. **Broken installs** — app works on the developer's machine but fails for end users
2. **No OS portability** — paths written for Linux break on macOS/Windows
3. **Failed auto-updates** — update patches write to wrong locations
4. **Data loss risk** — session files, databases, and user data written to unexpected directories

## Desired Outcome

Every file path in the codebase must be derived from:
- `app.getPath('userData')` — Electron runtime data directory
- `process.resourcesPath` — bundled app resources
- `import.meta.dir` — current file's directory (Bun)
- Environment variables (`WOP_WORKSPACE`, `WOP_HOME`)
- Relative paths resolved against a known root

Zero hardcoded absolute paths in committed source code.

## Context & Background

### Known Problem Areas

| File | Likely Issue |
|---|---|
| `electron/electron-main.mjs` | Hardcoded paths to `dist/`, `server/`, Bun binary |
| `server/paths.ts` | `getWorkspaceRoot()` may contain hardcoded fallbacks |
| `server/workspace-state.ts` | `WOP_WORKSPACE` resolution may have hardcoded defaults |
| `server/db.ts` | Database file path resolution |
| `server/index.ts` | Various path setups for static files, sessions |
| `server/claw-workspace-root.ts` | `WOP_CLAW_HOST_ROOT` / `WOP_PLAYGROUND_ROOT` |
| `server/tunnel-gate.ts` | `WOP_HOME` resolution |
| `nginx/` configs | Hardcoded paths in reverse proxy configs |
| Shell scripts (`*.sh`, `*.bat`) | Hardcoded paths to Bun, project directories |

### Why It Matters Now

With WOW-065 (desktop deployment), the app will be:
- Installed to `C:\Program Files\Way of Work\` on Windows
- Installed to `/Applications/Way of Work.app/` on macOS
- Installed to `/opt/wayofwork/` or `/usr/local/lib/wayofwork/` on Linux
- Auto-updated in-place

Any hardcoded path will cause silent data loss or a broken app at install time.

## Requirements

### Audit Phase
- [ ] Scan all `*.ts`, `*.mjs`, `*.cjs`, `*.js` files for:
  - Literal `/home/` paths
  - Literal `/Users/` paths  
  - Literal `C:\` or `D:\` drive letter paths
  - Absolute paths starting with `/` that should be relative
  - `process.cwd()` usage that assumes a specific working directory
  - `__dirname` usage that assumes source tree layout (not applicable in Bun, but check for it)
- [ ] Scan all shell scripts (`*.sh`, `*.bat`) for hardcoded paths
- [ ] Scan `nginx/` and other deployment configs
- [ ] Scan `.env.example` for path defaults

### Fix Phase
- [ ] Replace each hardcoded path with a dynamic resolution:
  - Use `import.meta.dir` for paths relative to the current file
  - Use `app.getPath('userData')` in Electron for user data
  - Use `process.resourcesPath` in Electron for bundled resources
  - Use environment variables with sensible defaults
  - Use `path.join()` or `resolve()` never string concatenation
- [ ] Add a single `server/paths.ts` that exports all canonical path resolvers
- [ ] All runtime data paths must go through `server/workspace-state.ts`
- [ ] Electron main process must not assume `process.cwd()` equals the app root

### Verification Phase
- [ ] Automated test: start the app in a random temp directory, verify no files written outside expected paths
- [ ] Manual test: install on all 3 platforms (Linux, macOS, Windows) from installer
- [ ] Build completes: `bun run build`
- [ ] Review all path changes with a focus on backward compatibility (existing users' data)

## Acceptance Criteria

### Automated Verification
- [ ] Build completes: `bun run build`
- [ ] No test writes files to unexpected locations
- [ ] grep for `/home/`, `/Users/`, `C:\` in source files returns only false positives (comments, documentation)

### Manual Verification
- [ ] App starts and runs from non-standard install directory
- [ ] Database created in correct user data directory
- [ ] Workspace files stored in configured workspace directory
- [ ] Chat sessions persist across restarts
- [ ] Electron app bundle works without source tree present

## Technical Notes

### Affected Components
- `server/paths.ts` — should become the single source of truth for all path resolution
- `server/workspace-state.ts` — ensure no hardcoded fallback paths
- `server/db.ts` — database path resolution
- `server/index.ts` — static file serving, session paths
- `electron/electron-main.mjs` — Bun path, dist path, data directory
- `server/claw-workspace-root.ts` — claw host root
- `server/tunnel-gate.ts` — `WOP_HOME` resolution
- All shell/batch scripts in project root

### Key Principles
1. **Never hardcode a path that contains a username** (`/home/zerviz/`)
2. **Never use string concatenation for paths** — always `path.join()`
3. **Never assume `process.cwd()`** — always resolve from `import.meta.dir` or explicit config
4. **Never hardcode platform-specific separators** — use `path.sep` or `path.join()`
5. **Every path must work when app is installed to**: `/opt/`, `C:\Program Files\`, `/Applications/`, `~/`

### Migration
- For each change, ensure backward compat: if the old path exists (from prior install), use it; otherwise use the new dynamic path
- This allows existing installs to keep their data while new installs use the correct location

---

## Meta

**Created**: 2026-06-06
**Priority**: High
**Estimated Effort**: L
**Depends on**: WOW-065 (desktop deployment pipeline needs clean paths)
