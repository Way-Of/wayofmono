# GitHub + Deno: CDN Caching & Stale Deployments

## The Problem

When `ai-harness` deploys tools, it fetches `manifest.json` and source files from `raw.githubusercontent.com`. This CDN caches aggressively with `Cache-Control: max-age=300` (5 minutes). After pushing a fix to GitHub `main`, the CDN continues serving the OLD version for up to 5 minutes.

This causes:
- Deploy output showing old file paths even after manifest fix pushed
- `(skipped - likely a directory, not in remote manifest)` for files that should exist
- Confusion when `deno run --reload` seems to have no effect

## Why `--reload` Doesn't Help

Deno's `--reload` flag only affects **module imports** (what's loaded via `import`/`export`). The installer fetches `manifest.json` and source files via **`fetch()`** at runtime (line 267-284 of `install.ts`):

```ts
async function loadManifest(sd, token) {
  const manifestUrl = `${sd}manifest.json`;
  const resp = await fetchWithAuth(manifestUrl, token);  // <-- HTTP fetch, NOT import
  return resp.json();
}
```

The `fetch()` response is subject to the CDN's `Cache-Control` header. Deno's HTTP client respects this caching.

## The Two Cache Layers

### 1. Deno Module Cache
- **What**: Cached `.ts` / `.js` files loaded via `import`
- **How to clear**: `deno run --reload` or `deno cache --reload`
- **Affects**: `install.ts` itself, any imported modules

### 2. GitHub Raw CDN Cache
- **What**: Files served by `raw.githubusercontent.com`
- **How to clear**: Wait 5 minutes (`max-age=300`) or use a unique query parameter
- **Affects**: `manifest.json`, all source files fetched via `fetch()` at runtime

The CLI wrapper is patched to include `--reload` (layer 1 cleared). But the manifest and source file fetches (layer 2) still get cached CDN responses.

## How to Verify

### Check if CDN is serving stale content

Compare the local repo's manifest with what GitHub serves:

```bash
# What GitHub CDN is serving (may be stale)
curl -s "https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/manifest.json" | grep "wocode/agent/agents"

# What's actually in the repo
grep "wocode/agent/agents" /home/zerwiz/CodeP/wayofmono/packages/@aiengineeringharness/manifest.json
```

If they differ, the CDN is stale.

### Check cache headers

```bash
curl -sI "https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/manifest.json"
```

Look for `cache-control: max-age=300` — that's the 5-minute TTL.

## How to Force Fresh Content

### Option 1: Wait (most reliable)

Wait 5+ minutes after pushing before deploying. The CDN TTL is 300 seconds.

### Option 2: Add cache-busting query parameter (recommended)

Modify `loadManifest()` and `fetchRemoteFile()` in `install.ts` to append a timestamp to URLs:

```ts
const cacheBuster = `?t=${Date.now()}`;
const manifestUrl = `${sd}manifest.json${cacheBuster}`;
const srcUrl = `${baseUrl}${src}${cacheBuster}`;
```

This bypasses CDN caching entirely.

### Option 3: Verify with curl after push

```bash
# Force fresh fetch from CDN edge
curl -s -H "Cache-Control: no-cache" "https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/manifest.json" | grep '"version"'
```

### Option 4: Use commit SHA instead of branch name

Instead of `main` in the URL, use a specific commit SHA:
```
https://raw.githubusercontent.com/Way-Of/wayofmono/<SHA>/packages/@aiengineeringharness/manifest.json
```

Commit-SHA URLs bypass CDN cache because each SHA is unique. But this requires updating the install URL in the wrapper on every commit.

## The Deployment Flow (with cache layers)

```
User runs: ai-harness --tool=wocode --yes
  ↓
Wrapper: deno run --reload <GitHub URL>
  ├── Layer 1: Deno cache cleared by --reload
  │   └── install.ts fetched fresh from GitHub
  ↓
install.ts: scriptDir() → GitHub URL
  ↓
install.ts: fetch({sd}manifest.json)
  ├── Layer 2: CDN may return STALE manifest
  │   └── If pushed < 5 min ago, old manifest served
  ↓
install.ts: for each file, fetch({sd}{src})
  └── Layer 2: CDN may return STALE results per file
```

## Current Fix Applied

We fixed the wocode agent paths in `manifest.json` and `wocode.yaml` (snake_case → kebab-case). The CDN should clear within 5 minutes of the push commit `686db43b`.

Until cache clears, the installer will:
- Show old snake_case dest paths in output
- Report `(skipped - likely a directory, not in remote manifest)` for 6 files
- Actually deploy correctly once cache expires (no code changes needed after)

## Related

- [Manifest & Install Architecture](./manifest-install-architecture.md) — How the installer resolves paths
- `install.ts:267-288` — `loadManifest()` HTTP fetch
- `install.ts:298-318` — `fetchRemoteFile()` HTTP fetch
