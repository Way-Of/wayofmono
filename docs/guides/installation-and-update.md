# Installation & Update Guide

## Quick Install

### Step 1: Prerequisites — Deno

**Windows (PowerShell):**
```powershell
irm https://deno.land/install.ps1 | iex
```

**macOS (Homebrew):**
```bash
brew install deno
```

**Linux/Unix:**
```bash
curl -fsSL https://deno.land/install.sh | sh
```

Verify: `deno --version`

### Step 2: Install Harness CLI

**macOS / Linux:**
```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --install-cli
```

**Windows (PowerShell):**
```powershell
deno run --reload -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --install-cli
```

> First-time Windows users need `--reload` to bypass Deno cache. After install the CLI is patched — subsequent updates work without it.

**Windows (PowerShell wrapper — no clone needed):**
```powershell
iex (iwr https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ps1 -useb)
install.ps1 -InstallCli
```

### Step 3: Install All Tools & Skills

**macOS / Linux:**
```bash
ai-harness --tool=all --yes
```

**Windows (PowerShell):**
```powershell
ai-harness --tool=all --yes
```

**Windows (PowerShell wrapper):**
```powershell
install.ps1 -Tool all -Yes
```

Or install per-tool:

```bash
ai-harness --tool=claude
ai-harness --tool=opencode
ai-harness --tool=gemini
ai-harness --tool=pi
ai-harness --tool=codex
ai-harness --tool=antigravity
ai-harness --tool=wocoder
```

### Direct Run (No CLI install)

Use this for CI or one-shot setups:

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --tool=all --yes
```

---

## Updating

### Standard Update

```bash
ai-harness --update
```

This runs a 4-step sync:
1. Update the CLI binary (`deno install` + wrapper patch)
2. Sync canonical skills to all tools
3. Install/update all tools + remove stale files
4. Compliance validation

### First-Time Bootstrap (Deno Cache Issue)

If `ai-harness --update` fails with:

```
Integrity check failed for remote specifier.
```

This means Deno's cached hash of `install.ts` no longer matches (because we pushed changes). Run once:

```bash
deno run --reload -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --update
```

The `--reload` flag forces Deno to bypass its cache and fetch the latest code fresh. After this one-time command, the binary wrapper is patched to always embed `--reload`, so all subsequent `ai-harness --update` calls work automatically.

### Why This Happens

Deno 2.x checks integrity of cached remote modules. When `install.ts` changes on `main`, the cached hash doesn't match the new content at the URL — even `--no-lock` doesn't bypass this. The fix is baked into the wrapper post-install step (`patchDenoWrapperReload()`), which edits the generated wrapper at `~/.deno/bin/ai-harness` to include `--reload` permanently.

### Major Update / Full Refresh

For a complete refresh after a major harness overhaul:

```bash
deno run --reload -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --update
```

Or, to wipe and reinstall everything:

```bash
ai-harness --uninstall=all --yes
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --install-cli
ai-harness --tool=all --yes
```

### Compliance Check

Validate all installed files match the manifest:

```bash
ai-harness --compliance
```

Checks for missing source files, stale files in target directories, and dangling manifest entries. Exit code 0 if compliant.

---

## Windows Tips

- **Unicode display**: Run `chcp 65001` before the installer if box-drawing characters show as `?`.
- **PATH**: The installer adds `$env:USERPROFILE\.deno\bin` to your PATH. Restart your terminal if `ai-harness` isn't found.
- **PowerShell wrapper**: The `install.ps1` script handles Deno detection + auto-install for you. Run it from any PowerShell session.

---

## GNU Stow Mode (Symlink-based, macOS/Linux only)

For symlink-based installation from a cloned repo:

```bash
sudo apt install stow          # Debian/Ubuntu
brew install stow              # macOS
./packages/@aiengineeringharness/setup.sh all
```

After pulling new commits:

```bash
git pull
./packages/@aiengineeringharness/setup.sh all --restow
```

---

## Project-Local npm Packages

Core Wo agents are published as npm packages under `@wayofmono`:

```bash
npm install @wayofmono/wo-agent
npm install --save-dev @wayofmono/wo-coding-agent
```

Packages install to `node_modules/`, binaries to `node_modules/.bin/`, accessed via `npx` or `pnpm` — no global install needed.

---

## CLI Reference

| Command | Description |
|---------|-------------|
| `ai-harness --tool=all --yes` | Install all tools non-interactively |
| `ai-harness --tool=claude` | Install Claude Code config only |
| `ai-harness --update` | Full 4-step sync (binary + docs + tools + validate) |
| `ai-harness --compliance` | Validate all installed files match manifest |
| `ai-harness --prune` | Interactive non-manifest file remover |
| `ai-harness --check` | Version diff against manifest |
| `ai-harness --sync-docs` | Sync canonical skills to per-tool copies |
| `ai-harness --uninstall=all` | Remove all installed files |
| `ai-harness --help` | Full usage |

## PowerShell Wrapper Reference

Run from a cloned repo:

```powershell
.\packages\@aiengineeringharness\install.ps1 -InstallCli
.\packages\@aiengineeringharness\install.ps1 -Tool all -Yes
.\packages\@aiengineeringharness\install.ps1 -Update
.\packages\@aiengineeringharness\install.ps1 -Compliance
```

Parameters: `-InstallCli`, `-Tool <name>`, `-Update`, `-Compliance`, `-Check`, `-Yes`, `-DryRun`.
