# Manifest & Install Architecture

Comprehensive guide to how `install.ts` and `manifest.json` work together, common failure modes, and troubleshooting.

## How Installation Works

### The Two-Phase Flow

1. **CLI install** (`--install-cli`): Downloads `install.ts` from GitHub raw URL, wraps it as `ai-harness` via `deno install`. The wrapper is patched to include `--reload` so future runs always fetch fresh code.

2. **Tool deployment** (`ai-harness --tool=X`): The wrapper runs `deno run --reload <install.ts URL> --tool=X`. The script:
   - Calls `scriptDir()` to get its own base URL (the GitHub raw directory)
   - Fetches `{sd}manifest.json` to get the file manifest
   - Iterates each tool's components and files, fetching sources and writing destinations

### Source Directory Resolution

`scriptDir()` at `install.ts:257`:

```ts
function scriptDir(): string {
  const url = import.meta.url;
  if (url.startsWith("file://")) {
    let p = new URL(".", url).pathname;
    if (Deno.build.os === "windows" && p.startsWith("/")) p = p.slice(1);
    return p;
  }
  return url.slice(0, url.lastIndexOf("/") + 1);
}
```

- **Remote (GitHub)**: `import.meta.url` = `https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts` → `sd` = `https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/`
- **Local**: `import.meta.url` = `file:///path/to/repo/packages/@aiengineeringharness/install.ts` → `sd` = `/path/to/repo/packages/@aiengineeringharness/`

### Manifest Loading

`loadManifest(sd, token)` at `install.ts:267`:
- If remote (`sd` starts with `http`): fetches `{sd}manifest.json` via HTTP
- If local: reads `{sd}manifest.json` from disk

All file operations use `sd` as the base — sources in manifest are relative to `sd`.

### File Deployment Flow

`installTool()` at `install.ts:860` — for each file entry in manifest:

```ts
const destPath = join(targetDir, fileEntry.dest);
const srcPath = join(opts.sd, fileEntry.src);
```

1. **Stat source** — check if source exists locally (local mode) or will be fetched (remote mode)
2. **Copy directory** — if `fileEntry.dest` ends with `/`, recursive copy
3. **Fetch content**:
   - Remote mode: `fetchRemoteFile(sd, src, token)` → `GET {sd}{src}`
   - Local mode: `Deno.readTextFile(srcPath)`
4. **Compare** with existing dest file (checksum / content diff)
5. **NEW** if dest doesn't exist → copy/fetch
6. **UPDATED** if content differs → copy/fetch with conflict prompt
7. **SKIPPED** if source returns 404 (remote) or doesn't exist (local)
8. **OK** if dest content matches source

## Manifest.json Structure

```json
{
  "version": "1.7.10",
  "tools": {
    "<tool-name>": {
      "version": "1.7.10",
      "targetDir": "~/.<tool-config-dir>",
      "components": {
        "<component-name>": {
          "description": "...",
          "files": [
            {
              "src": "wocode/agent/agents/codebase-analyzer.md",
              "dest": "agents/codebase-analyzer.md"
            }
          ]
        }
      }
    }
  }
}
```

Key fields:
- `src`: Relative path from `packages/@aiengineeringharness/` to the source file
- `dest`: Relative path from the tool's target dir to the destination
- `sha256`: Optional integrity hash for remote verification
- `version`: Per-tool version

## Common Failure Modes

### 1. Source Path Mismatch (snake_case vs kebab-case)

**Symptom**: `(skipped - likely a directory, not in remote manifest)`

**Cause**: The manifest `src` path uses different naming convention than the actual file on disk. For example, manifest has `codebase_analyzer.md` but the file is `codebase-analyzer.md`.

**Per-tool naming conventions** (source files in `packages/@aiengineeringharness/`):

| Tool Directory | Convention | Example |
|----------------|------------|---------|
| `pi/` | kebab-case | `codebase-analyzer.md` |
| `wocode/` | kebab-case | `codebase-analyzer.md` |
| `opencode/` | snake_case | `codebase_analyzer.md` |
| `claude/` | snake_case | `codebase_analyzer.md` |
| `antigravity/` | snake_case | `codebase_analyzer.md` |
| `codex/` | snake_case | `codebase_analyzer.md` |
| `gemini/` | snake_case | `codebase_analyzer.md` |

**Fix**: Update manifest `src` and `dest` paths to match actual filenames. Push to main. CDN may take up to 5 minutes to refresh.

### 2. Stale CDN Cache (raw.githubusercontent.com)

**Symptom**: Deploy output shows old paths even after manifest fix was pushed to main.

**Cause**: `raw.githubusercontent.com` serves with `Cache-Control: max-age=300` (5 minutes). The installer fetches the manifest via `fetch()` which respects CDN caching.

**Fix**: Wait 5 minutes after pushing, or add a cache-busting query parameter. Use `curl -sI <url>` to check the `cache-control` header.

The `deno run --reload` flag only affects Deno's module cache, not the HTTP fetch for manifest.json and source files.

### 3. Stale CLI Binary

**Symptom**: Old behavior persists even after `deno run --reload` installs new CLI.

**Cause**: If the CLI wrapper at `~/.deno/bin/ai-harness` wasn't patched with `--reload`, Deno uses its cached copy of install.ts instead of fetching fresh.

**Fix**: Re-run `deno run --reload -A <URL> --install-cli` to force refresh. Check the wrapper at `~/.deno/bin/ai-harness` — it should contain `deno run --reload`.

### 4. Missing Source Files in Repo

**Symptom**: `Source not found: <path>` (local mode) or 404 (remote mode)

**Cause**: File was deleted or renamed in the repo but manifest wasn't updated, or file exists at a different path.

**Fix**: Verify actual file path in repo, update manifest `src` to match.

## How Source Files Are Organized

```
packages/@aiengineeringharness/
├── manifest.json              # Single source of truth for all deployments
├── install.ts                 # Installer script (also deploy CLI logic)
├── pi/agent/agents/           # Pi agent files (kebab-case)
│   ├── codebase-analyzer.md
│   ├── planner.md
│   └── ...
├── wocode/agent/agents/       # Wocode agent files (kebab-case, matching pi)
│   ├── codebase-analyzer.md
│   ├── planner.md
│   └── ...
├── opencode/agents/           # OpenCode agent files (snake_case)
│   ├── codebase_analyzer.md
│   └── ...
├── claude/agents/             # Claude agent files (snake_case)
├── antigravity/agents/        # Antigravity agent files (snake_case)
├── codex/agents/              # Codex agent files (snake_case)
├── gemini/agents/             # Gemini agent files (snake_case)
└── config-manifest/tools/     # YAML configs compiled into manifest.json
    ├── pi.yaml
    ├── wocode.yaml
    ├── opencode.yaml
    └── ...
```

## Deployment Verification

After a deploy, verify the actual installed files match expectations:

```bash
# Check installed agents
ls ~/.wocode/agent/agents/
ls ~/.pi/agent/agents/

# Check for stale files that should have been removed
ls ~/.wocode/agent/extensions/subagent/index.ts  # should NOT exist

# Check manifest on GitHub
curl -s "https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/manifest.json" | grep "wocode/agent/agents"

# Check source file on GitHub
curl -sI "https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/wocode/agent/agents/codebase-analyzer.md"
```

## Quick Reference

| Action | Command |
|--------|---------|
| Install CLI | `deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --install-cli` |
| Force fresh install | Add `--reload` to above |
| Deploy single tool | `ai-harness --tool=wocode --yes` |
| Deploy multiple tools | `ai-harness --tool=pi --tool=wocode --yes` |
| Deploy all tools | `ai-harness --tool=all --yes` |
| Update CLI only | `ai-harness --update` |
| Check manifest paths | `grep '"src"' manifest.json \| sort \| uniq -c` |
| Find 404 errors | Re-run deploy and look for `(skipped - likely a directory)` |
