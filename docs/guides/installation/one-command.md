# One-Command Agent Install

Run directly without installing the CLI first — pick one per need.

## Install All Tools

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --tool=all --yes
```

## Install Specific Tool

```bash
# OpenCode
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --tool=opencode --yes

# Claude Code
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --tool=claude --yes

# Pi Agent
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --tool=pi --yes

# Gemini CLI
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --tool=gemini --yes

# Codex
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --tool=codex --yes

# Antigravity
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --tool=antigravity --yes

# Wo Coder
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --tool=wocode --yes
```

## Update Harness

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --update
```

## Sync Documentation

```bash
# Sync canonical skills to all tools
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --sync-docs

# Check what would be synced (dry run)
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --sync-docs --check
```

## Validate & Maintenance

```bash
# Check installed versions against manifest
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --check

# Validate all installed files match manifest
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --compliance

# Prune stale skills interactively
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --prune
```

## Report & Import

```bash
# Report skills to dashboard
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --report-skills

# Custom dashboard URL
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --report-skills --report-url https://cto.wayof.work

# Import reference skills
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --import-ref
```

## Repo Mode & Uninstall

```bash
# Show clone + stow instructions
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --mode=repo

# Custom clone destination
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --mode=repo --dest=~/.ai-engineering-harness

# Uninstall tool configs
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --uninstall=claude
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --uninstall=all
```

## Help

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --help
```

## Windows (PowerShell)

```powershell
# First-time users need --reload to bypass Deno cache
deno run --reload -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --install-cli

# Or use PowerShell wrapper
iex (iwr https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ps1 -useb)
# Then inside session:
install.ps1 -InstallCli
install.ps1 -Tool all -Yes
```

## Notes

- `--yes` / `-y` skips confirmation prompts
- Project-local packages install to `node_modules/`, not globally
- Binaries land in `node_modules/.bin/` accessed via `npx`/`pnpm`
- After first install, use `ai-harness` CLI for subsequent operations

## Related

- [CLI Reference](../installation/cli-reference.md)
- [Stow Mode](../installation/stow-mode.md)
- [Installation & Update](../installation-and-update.md)