# WayOfMono (Wo)

> Built as a unified toolset for the next generation of AI engineering.

The ultimate monorepo consolidation for high-performance coding agents. WayOfMono provides a shared Intelligence Backend (Packages, Tools, Memory) that serves **6** distinct Agent Frontends, with Wo (Way of Coding) as our primary synthesized interface. (Gemini CLI was removed June 2026 — Google ended support.)

## 👟 Quick Install

### What You're About to Do

This guide will install **6 AI coding tools** with shared skills, agents, and configurations. You'll get:
- **wocode** (Wo Coder) — our primary coding agent
- **wouser** — general-purpose AI assistant
- **Claude Code**, **OpenCode**, **Pi**, **Codex**, **Antigravity** — all configured with the same skills

Each tool will have access to **shared skills** for tasks like debugging, planning, code review, and more. Project-specific skills (OptiCat, WoW, WOMONO) are delivered via npm packages — add `@wayofmono/delivery-<project>` to your project's dependencies for skills relevant to that project.

---

### Step 1: Prerequisites — Deno

**What is Deno?**
Deno is a modern JavaScript/TypeScript runtime (similar to Node.js but more secure by default). Our installer is written in TypeScript and runs on Deno.

**Why Deno?**
- Secure by default (no file/network access unless explicitly allowed)
- Built-in TypeScript support (no compilation step needed)
- Single executable, no `node_modules` folder
- Our installer uses Deno's built-in tools to fetch and set up everything

**Windows (PowerShell) — run as Administrator:**
```powershell
irm https://deno.land/install.ps1 | iex
```
> This downloads and runs the official Deno installer script. `irm` = Invoke-RestMethod, `iex` = Invoke-Expression.

**macOS (Homebrew):**
```bash
brew install deno
```
> Homebrew is the standard package manager for macOS. If you don't have it, install from https://brew.sh first.

**Linux/Unix:**
```bash
curl -fsSL https://deno.land/install.sh | sh
```
> `curl` downloads the script, `| sh` pipes it to the shell to execute. `-fsSL` = fail silently, show errors, follow redirects.

**Verify it works:**
```bash
deno --version
```
You should see something like `deno 2.x.x`. 

**⚠️ If you get "command not found":**
- **Windows**: Restart PowerShell/terminal, or run `refreshenv` if using Chocolatey
- **macOS/Linux**: Restart your terminal, or run `source ~/.bashrc` (or `~/.zshrc`)
- Make sure Deno's install directory is in your PATH (usually `~/.deno/bin`)

---

### Step 2: Install the CLI (One-time)

**What is the CLI?**
The `ai-harness` command is your main interface for managing all tools and skills.

**macOS / Linux:**
```bash
deno run -A https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ts --install-cli
```

**Windows (PowerShell):**
```powershell
deno run --reload -A https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ts --install-cli
```

**Alternative (PowerShell wrapper — easier for Windows):**
```powershell
iwr https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ps1 -useb -OutFile "$env:TEMP\ai-harness-install.ps1"; & "$env:TEMP\ai-harness-install.ps1" -InstallCli
```
> Downloads a wrapper script that provides a friendlier interface. `-useb` = UseBasicParsing.

**Reinstalling / Updating the CLI**

Deno caches remote scripts after the first download. To force re-download of the latest version, add `--reload`:

**macOS / Linux / Windows (bash with Deno):**
```bash
deno run --reload -A https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ts --install-cli
```

**Windows (PowerShell wrapper):**
```powershell
iwr https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ps1 -useb -OutFile "$env:TEMP\ai-harness-install.ps1"; & "$env:TEMP\ai-harness-install.ps1" -InstallCli
```

- Always use `--reload` on Windows (required even on first install)
- Use `--reload` on macOS / Linux when re-installing to pick up changes
- Subsequent updates via `ai-harness --update` do **not** need `--reload`

**Verify CLI works:**
```bash
ai-harness --help
```
You should see the help output with all available commands.

---

### Step 3: Install All 6 Tools at Once (Recommended)

**What does this do?**
One command sets up configurations for **all 6 AI coding tools** with shared skills, agents, prompts, and settings. This is the fastest way to get started.

**What are the 6 tools?**
1. **wocode** (Wo Coder) — our primary coding agent
2. **wouser** — general-purpose AI assistant  
3. **Claude Code** — Anthropic's coding agent
4. **OpenCode** — Open-source TUI-driven agent
5. **Antigravity** — Autonomous agent platform
6. **Codex** — OpenAI's coding agent

> **Gemini CLI was removed** — Google ended support June 18, 2026.

**macOS / Linux / Windows (bash):**
```bash
ai-harness --tool=all --yes
```
> `--tool=all` = install all 6 tools. `--yes` = skip confirmation prompts.

**Windows (PowerShell wrapper):**
```powershell
.\install.ps1 -Tool all -Yes
```

**What happens (takes 30-60 seconds):**
Creates config folders in your home directory:
- `~/.config/opencode/` — OpenCode config + 50 skills
- `~/.claude/` — Claude Code config + 50 skills
- `~/.pi/agent/` — Pi config + 50 skills
- `~/.codex/` — Codex config + 50 skills
- `~/.antigravity/` — Antigravity config + 50 skills
- `~/.wocode/` — Wo Coder config + 50 skills

Each folder contains: `skills/`, `agents/`, `prompts/`, `commands/`, `settings.json`

**After this step:** Each AI tool will automatically load all skills when you start it. No further configuration needed!

### Step 3b: Install Individual Tools (one copy-paste per tool)

**Use this if you only want specific tools instead of all 6.**

**What each tool does:**
- **wocode** — Wo Coder, our primary high-performance coding agent (recommended)
- **pi** — Pi Agent, lightweight agent standard
- **opencode** — Open-source TUI (terminal UI) coding agent
- **claude** — Anthropic's Claude Code (requires Anthropic API key)
- **antigravity** — Autonomous agent platform
- **codex** — OpenAI's Codex agent (requires OpenAI API key)

**macOS / Linux / Windows (bash) — pick one tool per copy-paste:**

```bash
# Wo Coder — our primary coding agent (recommended starting point)
ai-harness --tool=wocode --yes
```

```bash
# Pi Agent — lightweight agent standard
ai-harness --tool=pi --yes
```

```bash
# OpenCode — open-source terminal UI coding agent
ai-harness --tool=opencode --yes
```

```bash
# Claude Code — Anthropic's coding agent (needs ANTHROPIC_API_KEY)
ai-harness --tool=claude --yes
```

```bash
```

```bash
# Antigravity — autonomous agent platform
ai-harness --tool=antigravity --yes
```

```bash
# Codex — OpenAI's coding agent (needs OPENAI_API_KEY)
ai-harness --tool=codex --yes
```

**Windows (PowerShell wrapper) — pick one tool per copy-paste:**

```powershell
# Wo Coder
.\install.ps1 -Tool wocode -Yes
```

```powershell
# Pi Agent
.\install.ps1 -Tool pi -Yes
```

```powershell
# OpenCode
.\install.ps1 -Tool opencode -Yes
```

```powershell
# Claude Code
.\install.ps1 -Tool claude -Yes
```

```powershell
```

```powershell
# Antigravity
.\install.ps1 -Tool antigravity -Yes
```

```powershell
# Codex
.\install.ps1 -Tool codex -Yes
```

### Step 3c: Install Specific Components (--skill)

Install only specific components (skills, agents, commands, etc.) for a tool — **each command is a separate copy-paste**:

**macOS / Linux / Windows (bash):**

```bash
# Install only skills and agents for OpenCode
ai-harness --tool=opencode --skill=skills,agents --yes
```

```bash
# Install only commands for Claude Code
ai-harness --tool=claude --skill=commands --yes
```

```bash
# Preview what would be installed (dry run)
ai-harness --tool=opencode --skill=skills,agents --dry-run
```

```bash
# Other common components: skills, agents, commands, prompts, extensions, themes, keybindings, settings
ai-harness --tool=opencode --skill=skills,commands,themes --yes
```

**Windows (PowerShell wrapper):**

```powershell
.\install.ps1 -Tool opencode -Skill "skills,agents" -Yes
```

```powershell
.\install.ps1 -Tool claude -Skill "commands" -Yes
```

```powershell
.\install.ps1 -Tool opencode -Skill "skills,agents" -DryRun
```

---

## Install wocode via npm/pnpm

**Use this if you want to install wocode directly as an npm package in your project, without the harness CLI.**

**What's the difference?**
- **Harness CLI method (Steps 1-3)**: Installs configs globally to `~/.wocode/` — shared across all projects
- **npm/pnpm method**: Installs wocode as a dependency in your project's `node_modules/` — project-specific

**When to use which?**
- **Harness CLI**: You want the same setup across all projects, easy updates with `ai-harness --update`
- **npm/pnpm**: You want wocode bundled with your project, version-locked in `package.json`, CI/CD friendly

---

**Local (project) install — npm:**
> `--save-dev` adds it to `devDependencies` (tools for developers, not shipped to users)

```bash
npm install --save-dev @wayofmono/wo-coding-agent
```

```bash
npx wocode --init
```
> Creates `.wo/` folder in your project with config files

```bash
./wocode
```
> Starts the wocode agent

```bash
# Update later: pnpm update @wayofmono/wo-coding-agent
```

```bash
# Uninstall: npm uninstall @wayofmono/wo-coding-agent
```

**Local (project) install — pnpm:**
> `-D` = `--save-dev` (shorthand)

```bash
pnpm add -D @wayofmono/wo-coding-agent
```

```bash
pnpm wocode --init
```

```bash
./wocode
```

```bash
# Update later: pnpm update @wayofmono/wo-coding-agent
```

```bash
# Uninstall: pnpm remove @wayofmono/wo-coding-agent
```

**Global install (cross-project):**
> Installs to global npm prefix, available everywhere as `wocode` command

```bash
npm install -g @wayofmono/wo-coding-agent
```

```bash
wocode --init
```

```bash
wocode
```

```bash
# Update later: npm update -g @wayofmono/wo-coding-agent
```

```bash
# Uninstall: npm uninstall -g @wayofmono/wo-coding-agent
```

**Install wouser (User Assistant) via npm/pnpm:**
> wouser is a standard dependency (not dev) because it's an SDK your app might use at runtime

```bash
# Local project install
npm install @wayofmono/wo-agent
```

```bash
npx wouser --init
```

```bash
./wouser
```

```bash
# Or pnpm
pnpm add @wayofmono/wo-agent
```

```bash
pnpm wouser --init
```

```bash
./wouser
```

### Step 3c: Install to Project-Local (Dev Mode)

**Use this to install tool configs directly in your project folder (not globally).**

**Why use `--local`?**
- **Global install (default)**: Configs go to `~/.claude/`, `~/.wocode/`, etc. — shared across all projects
- **Local install (`--local`)**: Configs go to `./.claude/`, `./.wo/`, etc. in your current project folder
- **Use case**: Team sharing (commit `.claude/` to git), project-specific settings, CI/CD pipelines

**What gets created:**
```
your-project/
├── .wo/
│   ├── agent/skills/      # shared skills for wocode
│   ├── settings.json      # wocode settings
│   └── models.json        # LLM provider config
├── .claude/
│   ├── skills/            # 50 skills for Claude Code
│   └── settings.json
├── .config/opencode/
│   ├── skills/            # 50 skills for OpenCode
│   └── opencode.json
└── ... (other tools)
```

**macOS / Linux / Windows (bash):**

```bash
# Install wocode config locally
ai-harness --tool=wocode --local --yes
```

```bash
# Install Pi config locally
ai-harness --tool=pi --local --yes
```

```bash
# Install ALL 6 tools locally
ai-harness --tool=all --local --yes
```
> Creates `./.wo/agent/`, `./.pi/agent/`, `./.config/opencode/`, etc. in your project folder.

**Windows (PowerShell wrapper):**

```powershell
# Install wocode config locally
.\install.ps1 -Tool wocode -Local -Yes
```

```powershell
# Install Pi config locally
.\install.ps1 -Tool pi -Local -Yes
```

```powershell
# Install ALL 6 tools locally
.\install.ps1 -Tool all -Local -Yes
```

**Tip**: Commit the generated folders (`.wo/`, `.claude/`, etc.) to git so your team gets the same setup!

---

## Interactive Component Selection (--interactive / -i)

Pick components via interactive checkbox picker — **each command is a separate copy-paste**:

**macOS / Linux / Windows (bash):**

```bash
ai-harness --tool=claude --interactive
```

```bash
# Short form:
ai-harness --tool=claude -i
```

**Windows (PowerShell wrapper):**

```powershell
.\install.ps1 -Tool claude -Interactive
```

### Update

**Run this regularly to get the latest skills, agents, and tool configs.**

**What `--update` does:**
1. Updates the `ai-harness` CLI binary to latest version
2. Syncs all 6 tool configs with latest skills/agents/prompts from GitHub
3. Removes stale/obsolete skill files (cleanup)
4. Runs compliance validation (checks all files match manifest)
5. Shows a summary of what changed

**macOS / Linux / Windows (bash):**

```bash
# Standard update — run this regularly (weekly or before starting work)
ai-harness --update
```

```bash
# Skip compliance validation after update (faster, use if you're in a hurry)
ai-harness --update --no-validate
```

```bash
# Skip CLI binary update (only sync tools/docs, keep current CLI version)
ai-harness --update --skip-binary
```

```bash
# Preview without writing (see what would change — safe to run anytime)
ai-harness --update --dry-run
```

**Windows (PowerShell wrapper):**

```powershell
# Standard update
.\install.ps1 -Update
```

```powershell
# Skip compliance validation
.\install.ps1 -Update -NoValidate
```

```powershell
# Skip CLI binary update
.\install.ps1 -Update -SkipBinary
```

```powershell
# Preview only
.\install.ps1 -Update -DryRun
```

**How often should you update?**
- **Weekly** for active development
- **Before starting a new project/feature**
- **When you see "UPDATE AVAILABLE" in `ai-harness --check` output**

### Major Update (full refresh after a breaking overhaul)

**Each command is a separate copy-paste:**

**macOS / Linux / Windows (bash):**

```bash
# Option 1: Full refresh from source
deno run --reload -A https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ts --update
```

```bash
# Option 2: Wipe everything and reinstall from scratch (nuclear option)
ai-harness --uninstall=all --yes
```

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ts --install-cli
```

```bash
ai-harness --tool=all --yes
```

That's it — project-local packages install to `node_modules/`, not globally. Binaries land in `node_modules/.bin/` accessed via `npx`/`pnpm`.

### Compliance Check

Validate that all installed files match the manifest — **each command is a separate copy-paste**:

**macOS / Linux / Windows (bash):**

```bash
ai-harness --compliance
```
> Exit code 0 if compliant (no issues found).

### Prune Stale Skills (--prune)

Interactively review and remove non-manifest skill files across all tools — **each command is a separate copy-paste**:

**macOS / Linux / Windows (bash):**

```bash
ai-harness --prune
```

**Windows (PowerShell wrapper):**

```powershell
.\install.ps1 -Prune
```

### Uninstall (--uninstall)

Remove harness files for a specific tool or all tools — files that match the current manifest are removed. Leaves non-manifest files in place.

**macOS / Linux / Windows (bash):**

```bash
ai-harness --uninstall=claude
ai-harness --uninstall=all --yes
```

**Windows (PowerShell wrapper):**

```powershell
.\install.ps1 -Uninstall claude
.\install.ps1 -Uninstall all -Yes
```

### Purge All Harness Files (--purge)

**⚠ Nuclear option.** Recursively wipes ALL harness files (skills, agents, commands, prompts, extensions, themes, keybindings) from tool config directories, regardless of what's in the manifest. Use when you have duplicates, wrong-format files, or want a completely clean reinstall.

**macOS / Linux / Windows (bash):**

```bash
# Purge a single tool
ai-harness --purge=opencode --yes

# Purge all 6 tools
ai-harness --purge=all --yes

# Preview what would be removed
ai-harness --purge=all --dry-run
```

**Windows (PowerShell wrapper):**

```powershell
.\install.ps1 -Purge opencode -Yes
.\install.ps1 -Purge all -Yes
```

> After purge, reinstall with `ai-harness --tool=all --yes` for a clean slate.

### Sync Documentation (--sync-docs)

**Syncs canonical skills from the harness to all 6 tool directories.**

**When to use:**
- After editing skills in `aiharness/` (the source of truth)
- To verify all tools have the latest skill versions
- Part of the `--update` process (runs automatically)

**macOS / Linux / Windows (bash):**

```bash
# Sync all skills to all 6 tools
ai-harness --sync-docs
```

```bash
# Preview only (no changes) — safe to run anytime to check status
ai-harness --sync-docs --check
```
> Output shows: "Would sync: X files" or "All skills in sync"

**Windows (PowerShell wrapper):**

```powershell
.\install.ps1 -SyncDocs
```

```powershell
.\install.ps1 -SyncDocs -Check
```

---

### Report Skills to Dashboard (--report-skills / --report-url)

**Sends your local skills inventory to the CTO Dashboard for team visibility.**

**What it reports:**
- Which skills are installed for each tool
- Skill versions (from manifest)
- Tool versions
- Timestamp

**Used by:** CTO Dashboard at https://cto.wayof.work to show skill health across all machines/developers.

**macOS / Linux / Windows (bash):**

```bash
# Report to default dashboard (cto.wayof.work)
ai-harness --report-skills
```

```bash
# Custom dashboard URL (self-hosted)
ai-harness --report-skills --report-url https://cto.wayof.work
```

**Windows (PowerShell wrapper):**

```powershell
.\install.ps1 -ReportSkills
```

```powershell
.\install.ps1 -ReportSkills -ReportUrl "https://cto.wayof.work"
```

---

### Import Reference Skills (--import-ref)

**Imports reference skills/agents from the docs/ folder to all 6 tool platforms.**

**What are reference skills?**
Skills that live in `docs/skills/` and `docs/agents/` as documentation/examples. This command converts them to the proper format for each tool and installs them.

**When to use:**
- After adding new reference skills to `docs/`
- To bootstrap a new tool with documented skills

**macOS / Linux / Windows (bash):**

```bash
ai-harness --import-ref
```

**Windows (PowerShell wrapper):**

```powershell
.\install.ps1 -ImportRef
```

---

### Repo / Stow Mode (--mode / --dest)

**Shows instructions for GNU Stow-based installation (symlink approach).**

**What is GNU Stow?**
A symlink farm manager. Instead of copying files, it creates symlinks from your home directory to the repo. Benefits:
- **Single source of truth**: Edit files in the repo, changes reflect immediately
- **Easy updates**: `git pull` updates everything
- **Clean uninstall**: `stow -D` removes all symlinks

**macOS / Linux / Windows (bash):**

```bash
# Show stow instructions for all tools
ai-harness --mode=repo
```

```bash
# Custom clone destination (default: ~/.ai-engineering-harness)
ai-harness --mode=repo --dest=~/.ai-engineering-harness
```

**Windows (PowerShell wrapper):**

```powershell
.\install.ps1 -Mode repo
```

```powershell
.\install.ps1 -Mode repo -Dest "~/.ai-engineering-harness"
```

**After getting instructions, run:**
```bash
# Example: install all tools via stow
./setup.sh all
```

### Quick Reference: All PowerShell Flags

| Parameter | Description |
|-----------|-------------|
| `-InstallCli` | Install/update CLI binary |
| `-Tool <name>` | Install tool config (claude, opencode, pi, wocode, antigravity, codex, all) |
| `-Update` | Full harness sync: CLI + docs + all tools + compliance |
| `-Compliance` | Validate all installed files match manifest |
| `-Check` | Compare installed versions against manifest |
| `-Yes` | Skip confirmation prompts |
| `-DryRun` | Preview without writing files |
| `-Skill <name>` | Specific components to install (comma-separated) |
| `-Interactive` | Interactive checkbox picker |
| `-Local` | Install to project-local directories |
| `-Uninstall <name>` | Remove installed files (claude, opencode, all, ...) |
| `-NoValidate` | Skip compliance validation after --update |
| `-Prune` | Interactive: review & remove non-manifest skills |
| `-SyncDocs` | Sync canonical skills to all tool directories |
| `-ReportSkills` | Report local skills to dashboard telemetry API |
| `-ReportUrl <url>` | Dashboard URL for skill reporting |
| `-ImportRef` | Import ref skills/agents to all platforms |
| `-Mode <mode>` | Show clone + stow instructions (repo) |
| `-Dest <path>` | Clone destination for --mode=repo |
| `-SkipBinary` | Skip CLI binary update in --update |
| `-Detect` | Print platform-aware system report (OS, tools, runtime, hardware, terminal) |
| `-Tool auto` | Auto-detect installed AI tools and install only to those |
| `-NoReport` | Disable telemetry/dashboard reporting |
| `-Debug` | Enable verbose debug logging to `~/.local/state/womono/install.log` |
| `-Help` | Show help |

> **Note**: PowerShell uses full parameter names (no single-letter aliases). The underlying Deno script supports `-y`, `-n`, `-i`, `-l`, `-h` as aliases.

### Platform-Aware Installation (New in v1.7.2)

The installer now auto-detects your environment and adapts:

**Auto-detect tools:**
```bash
# Install only to AI tools that are actually installed on this machine
ai-harness --tool=auto --yes
```
Detects: OpenCode, Claude Code, Pi, Codex, Antigravity, Wo Coder — by checking config dirs and PATH.

**System report (`--detect`):**
```bash
# Print full platform detection results
ai-harness --detect
```
Shows: OS/distro/WSL/container, CPU/arch/RAM/GPU/disk, desktop env/display server/Nerd Fonts, terminal/shell/color/locale, runtime versions (Deno/Node/Python/Git), network/proxy/registry, security (SSH/GPG/SELinux), permissions (root/Admin/Gatekeeper).

**Privacy controls:**
```bash
# Disable dashboard reporting for this run
ai-harness --report-skills --no-report

# Or persistently via env var
export WOMONO_DO_NOT_TRACK=1
```

**Debug logging:**
```bash
# Verbose output + persistent log file
ai-harness --tool=all --debug
```
Log written to `~/.local/state/womono/install.log` (Linux), `~/Library/Logs/com.wayofmono.harness/install.log` (macOS), `%LOCALAPPDATA%\WayOfMono\Harness\Logs\install.log` (Windows). Safe to share in bug reports — secrets are redacted.

**Supply-chain security (SHA-256):**
```bash
# Manifest entries can now include sha256 for remote files
# Installer verifies checksum before writing downloaded content
```
Add `"sha256": "..."` to any file entry in `manifest.json` for binary downloads.

### GNU Stow (Optional — symlink-based updates, macOS/Linux only)

**Each command is a separate copy-paste:**

```bash
# Ubuntu/Debian
sudo apt install stow
```

```bash
# macOS
brew install stow
```

```bash
./setup.sh all
```

### Step 4: Install CTO Dashboard (Optional)

**Quick one-liner (no install):**
```bash
npx @wayofmono/wo-cto-dashboard
```

**Global CLI (use `wodev` anywhere) — choose one:**

**Option A: Local prefix (recommended — no sudo, everything works)**
```bash
npm config set prefix ~/.npm-global
```

```bash
echo 'export PATH="$PATH:~/.npm-global/bin"' >> ~/.bashrc
```

```bash
source ~/.bashrc
```

```bash
npm install -g @wayofmono/wo-cto-dashboard
```

```bash
wodev
```

**Option B: Sudo global install (run --build once with sudo)**
```bash
sudo npm install -g @wayofmono/wo-cto-dashboard
```

```bash
sudo wodev --build    # one-time build
```

```bash
wodev                 # launch dashboard
```

**Update to latest version:**
```bash
wodev --update
```
```bash
# or manually:
sudo npm update -g @wayofmono/wo-cto-dashboard && sudo wodev --build
```

**Windows (PowerShell — run as Administrator):**
```powershell
# Install globally
npm install -g @wayofmono/wo-cto-dashboard
```

```powershell
# One-time build
wodev --build
```

```powershell
# Launch dashboard
wodev
```

```powershell
# Update later
wodev --update
```
```powershell
# or manually:
npm update -g @wayofmono/wo-cto-dashboard && wodev --build
```

| Command | What it does |
|---------|-------------|
| `wodev` | Production server |
| `wodev --dev` | Dev server with hot reload |
| `wodev --build` | One-time build |
| `wodev --update` | Update npm package |

Opens at **http://localhost:6969**

## 📊 Real Stats

| Metric | Value |
|--------|-------|
| Total repo files | **51,033** (excluding node_modules) |
| SKILL.md files | **~750** (shared skills across 6 tools + delivery packages) |
| NPM packages published | **29** |
| AI coding tools supported | **6** (Gemini CLI removed — Google ended support) |
| Delivery packages | **3** (`@wayofmono/delivery-opticat`, `-wow`, `-womono`) |
| Subagents | **6** |
| Active developers | **4** (craig, tomas, andre, zerwiz) |
| Active tickets | **29+** (WOMONO, WOW, OPT namespaces) |
| Harness version | **1.7.17** |
| Files in harness | **1,226** |
| Files in docs | **173** |
| Files in thoughts | **115** |
| Dashboard package | [@wayofmono/wo-cto-dashboard](https://www.npmjs.com/package/@wayofmono/wo-cto-dashboard) |
| Total repo size | **1.4 GB** (excluding node_modules) |

## 🎛️ Multi-Interface Architecture

WayOfMono is built on an **Interface-Agnostic Philosophy** — core logic and tools are shared across all major coding agent platforms. Pick your preferred interaction model:

| Interface | Type | Source |
|-----------|------|--------|
| **wocode** | High-performance coding assistant (CLI) | [@wayofmono/wo-coding-agent](https://www.npmjs.com/package/@wayofmono/wo-coding-agent) |
| **wouser** | General-purpose user agent (SDK + CLI) | [@wayofmono/wo-agent](https://www.npmjs.com/package/@wayofmono/wo-agent) |
| **Claude Code** | Agentic AI coding from Anthropic | [docs.anthropic.com](https://docs.anthropic.com/en/docs/claude-code) |
| **Pi** | Pi Agent standard | [github.com/earendil-works/pi](https://github.com/earendil-works/pi) |
| **OpenCode** | Open-source TUI-driven coding agent | [github.com/opencode-ai/opencode](https://github.com/opencode-ai/opencode) |
| **Antigravity** | Agent-first autonomous platform (replaces deprecated Gemini CLI) | [antigravity.io](https://antigravity.io) |

### What's Inside

```
aiharness/     → ~1,100 files
├── manifest.json                   # Source of truth (v1.7.17)
├── install.ts                      # Deno CLI installer
├── setup.sh                        # GNU Stow installer
├── scripts/                        # 14 pipeline scripts
├── opencode/    → ~/.config/opencode/  # skills, agents, commands
├── claude/      → ~/.claude/           # skills, agents, commands
├── pi/          → ~/.pi/agent/         # skills, agents, prompts
├── codex/       → ~/.codex/            # skills, agents
├── antigravity/ → ~/.antigravity/      # skills, agents, commands
└── wocode/     → ~/.wocode/          # skills, agents, prompts

packages/delivery-*/               # Per-project skill delivery packages
├── delivery-opticat/               # 3 OptiCat skills (6 tools × 3 = 18 SKILL.md)
├── delivery-wow/                   # 9 WoW skills (6 tools × 9 = 54 SKILL.md)
└── delivery-womono/                # 6 WOMONO skills (6 tools × 6 = 36 SKILL.md)
```

### Shared Resources

- **Shared + delivery SKILL.md files** — shared skills adapted for all 6 tools, plus per-project delivery packages
- **6 subagents** — codebase_analyzer, codebase_locator, codebase_pattern_finder, explore, general, thoughts_analyzer
- **29 NPM packages** — `@wayofmono/*` scope on [npmjs.com](https://www.npmjs.com/settings/wayofmono/packages) (14 core + 1 extension + 14 skill packages)
- Ticket templates — WOW, OPT, WOMONO, GLOBAL namespaces
- TUI dashboard components
- Multi-format documentation (MDX, HTML, PDF, JSON)
- Mermaid TUI renderer (ASCII art diagrams)

### Skill Loading Paths

### Delivery Packages

Project-specific skills are distributed via npm packages, not bundled in the main harness:

```bash
# Install OptiCat skills in your OptiCat project
npm install @wayofmono/delivery-opticat
ai-harness --update  # auto-discovers delivery packages in node_modules

# Install WoW skills in your WoW project
npm install @wayofmono/delivery-wow

# Install WOMONO skills (this repo)
npm install @wayofmono/delivery-womono
```

The harness auto-discovers `node_modules/@wayofmono/delivery-*/` on every install/update.

Skills can be loaded from three sources:
- **Harness-installed** — global skill directories per tool (below)
- **Project-local** — `.wo/agents/<name>/skills/SKILL.md` files, discovered by `loadSkillsFromDir()`
- **npm packages** — `node_modules/@wayofmono/skill-*/SKILL.md` if bundled (WOMONO-107)

Each agent frontend loads skills from specific directories. The AI Engineering Harness installs skills to these locations:

| Tool | Global Skill Directory | Project-Local Skill Directory |
|------|------------------------|-------------------------------|
| **Wo Coder (wocode)** | `~/.wocode/agent/skills/` | `.wo/agent/skills/` |
| **Pi** | `~/.pi/agent/skills/` | `.pi/agent/skills/` |
| **OpenCode** | `~/.config/opencode/skills/` | `.config/opencode/skills/` |
| **Claude Code** | `~/.claude/skills/` | `.claude/skills/` |
| **Codex** | `~/.codex/skills/` | `.codex/skills/` |
| **Antigravity** | `~/.antigravity/skills/` | `.antigravity/skills/` |

**Additional skill discovery:**
- All tools also discover skills from `~/.agents/skills/` (shared cross-tool location)
- Pi and wocode support adding custom paths via `settings.json` skills array
- Project-specific skills from `node_modules/@wayofmono/delivery-*/` are auto-installed
- CLI flags like `--skill <path>` allow ad-hoc skill loading

**Skill format:** Each skill is a directory containing `SKILL.md` (frontmatter + instructions) plus optional scripts, references, and assets.

### Per-Tool Skill Counts

Main harness skills are shared across all 6 tools (~60 each). Project-specific skills come from delivery packages:

| Delivery Package | Skills | Per-tool copies | Install via |
|-----------------|--------|-----------------|-------------|
| **@wayofmono/delivery-opticat** | 3 OptiCat skills | 18 SKILL.md | `npm install @wayofmono/delivery-opticat` |
| **@wayofmono/delivery-wow** | 9 WoW skills | 54 SKILL.md | `npm install @wayofmono/delivery-wow` |
| **@wayofmono/delivery-womono** | 6 WOMONO skills | 36 SKILL.md | `npm install @wayofmono/delivery-womono` |

### Why Use the Harness

- **Interface-agnostic**: Core logic works everywhere
- **Zero duplication**: One codebase, infinite frontends
- **Easy updates**: `ai-harness --update` pulls the latest from upstream
- **GNU Stow ready**: Symlink-based installation for clean git updates

## 🦙 Prerequisites: Ollama

**WayOfMono defaults to using Ollama for local-first AI.** This means your code and data never leave your machine — no API keys, no cloud costs, full privacy.

**What is Ollama?**
A tool that runs LLMs (Large Language Models) locally on your computer. Think of it as "Docker for AI models."

**Why Ollama?**
- **Private**: Your code never sent to external APIs
- **Free**: No per-token costs
- **Fast**: Runs on your GPU/CPU
- **Offline**: Works without internet

**Install Ollama — each command is a separate copy-paste:**

```bash
curl -fsSL https://ollama.com/install.sh | sh
```
> Downloads and runs the official Ollama installer. Creates `ollama` command and starts background service.

```bash
ollama pull qwen3.5:9b
```
> Downloads the **qwen3.5:9b** model (~5GB). This is our default model — excellent for coding, reasoning, and general tasks. Runs on most modern laptops (needs ~8GB RAM).

**Verify Ollama works:**
```bash
ollama list
```
Should show `qwen3.5:9b` in the list.

```bash
ollama run qwen3.5:9b "Hello, write a hello world in Python"
```
Should respond with code.

**Alternative models you can use:**
```bash
# Smaller/faster (4GB RAM)
ollama pull qwen2.5:7b

# Better coding (needs 16GB+ RAM)
ollama pull codellama:13b

# Best quality (needs 32GB+ RAM)
ollama pull qwen3.5:32b
 ```
```

### llama.cpp Docker (GPU-Optimized Alternative)

For GPU-accelerated local inference with Docker containers, see the [llama.cpp Setup Guide for wo-ai](thoughts/global/docs/guides/llama-setup-for-wo-ai.md). Supports Qwen3.5 9B, 35B-A3B, and custom GGUF models with full GPU offload.

**Configure a different model:**
Edit `~/.wocode/agent/settings.json` or `.wo/settings.json`:
```json
{
  "model": "codellama:13b"
}
```

## 📦 Zero-Pollution Installation

WayOfMono agents are **project-local and folder-contained**. Packages install to `node_modules/` in your project (not globally). Binaries land in `node_modules/.bin/` and are accessed via `npx`/`pnpm` without any global setup.

### 🎭 Custom Personas (AGENTS.md)

Create an `AGENTS.md` file in your project root to customize the agent's persona:

```markdown
# AGENTS.md
You are a Senior React Developer specializing in Next.js and TypeScript.
Prefer server components, use Tailwind for styling, and write tests first.
```

The agent automatically discovers this file on startup — no configuration needed.

### Contained Environment (.wo/)

The `--init` command creates a `.wo/` folder in your project:

```
.wo/
├── models.json       # LLM providers (default: Ollama + qwen3.5:9b)
├── settings.json     # Agent behavior & themes
└── launcher          # ./wouser or ./wocode startup script
```

## 🚀 Installation

**⚠️ Troubleshooting (Windows/Mac/Linux):** If you encounter 404 errors or fetch failures during installation or updates, add the `--reload` flag to your command. This forces Deno to bypass its cache and fetch the latest files from GitHub:

```bash
# Example for installing all tools:
deno run -A --reload https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ts --tool=all --yes
```

### One-Command Agent Install (CI/scripts/one-time)

Run any of these directly without installing the CLI first — pick one per need:

**Install all tools:**
```bash
deno run -A https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ts --tool=all --yes
```

**Install specific tool:**
```bash
deno run -A https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ts --tool=claude --yes
```

**Update harness:**
```bash
deno run -A https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ts --update
```

**Sync documentation:**

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ts --sync-docs
```

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ts --sync-docs --check
```

**Validate & maintenance:**

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ts --check
```

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ts --compliance
```

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ts --prune
```

**Report & import:**

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ts --report-skills
```

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ts --import-ref
```

**Repo mode & uninstall:**

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ts --mode=repo
```

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ts --uninstall=claude
```

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ts --uninstall=all
```

**Help:**
```bash
deno run -A https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ts --help
```

### Global CLI Install (Recommended for repeated use)

**Best for**: Developers who use WayOfMono regularly across multiple projects.

**Workflow**: Install CLI once → use `ai-harness` command for everything else.

---

**Step 1: Install CLI** (run once)
```bash
deno run -A https://raw.githubusercontent.com/Way-Of/aiharness/main/install.ts --install-cli
```
> Creates `ai-harness` binary in `~/.deno/bin/`. Adds to PATH automatically.

**Verify:**
```bash
ai-harness --help
```

---

**Step 2: Install tools** (pick one tool per copy-paste)

```bash
# OpenCode — open-source terminal UI agent
ai-harness --tool=opencode
```

```bash
# Claude Code — Anthropic's agent (needs ANTHROPIC_API_KEY)
ai-harness --tool=claude
```

```bash
# Pi Agent — lightweight standard
ai-harness --tool=pi
```

```bash
```

```bash
# Codex — OpenAI's agent (needs OPENAI_API_KEY)
ai-harness --tool=codex
```

```bash
# Antigravity — autonomous platform
ai-harness --tool=antigravity
```

```bash
# Wo Coder — our primary agent (recommended)
ai-harness --tool=wocode
```

```bash
# ALL 6 tools at once
ai-harness --tool=all --yes
```

---

**Step 3: Update & maintenance** — **each command is a separate copy-paste**

```bash
# Standard update — run weekly
ai-harness --update
```

```bash
# Skip compliance validation (faster)
ai-harness --update --no-validate
```

```bash
# Skip CLI binary update (only sync tools/docs)
ai-harness --update --skip-binary
```

```bash
# Check for updates without installing
ai-harness --check
```
> Shows: `wocode: UPDATE AVAILABLE v1.1.0 → v1.2.0`

```bash
# Validate all installed files match manifest
ai-harness --compliance
```

```bash
# Interactive removal of non-manifest skills
ai-harness --prune
```

---

**Step 4: Reporting & sync** — **each command is a separate copy-paste**

```bash
# Report skills to CTO Dashboard
ai-harness --report-skills
```

```bash
# Custom dashboard URL
ai-harness --report-skills --report-url https://cto.wayof.work
```

```bash
# Sync canonical skills to all tools
ai-harness --sync-docs
```

```bash
# Preview sync (no changes)
ai-harness --sync-docs --check
```

```bash
# Import reference skills from docs/
ai-harness --import-ref
```

---

**Step 5: Repo mode & uninstall** — **each command is a separate copy-paste**

```bash
# Show GNU Stow instructions
ai-harness --mode=repo --dest=~/.ai-engineering-harness
```

```bash
# Uninstall one tool (e.g., Claude)
ai-harness --uninstall=claude
```

```bash
# Uninstall ALL tools (nuclear option)
ai-harness --uninstall=all
```

---

**Step 6: Component selection** — **each command is a separate copy-paste**

```bash
# Preview what would be installed for Claude
ai-harness --tool=claude --dry-run
```

```bash
# Interactive component picker for Claude
ai-harness --tool=claude --interactive
```

```bash
# Install only agents for Claude
ai-harness --tool=claude --skill=agents
```

```bash
# Show all CLI help
ai-harness --help
```

```bash
# Install Claude locally in current project
ai-harness --tool=claude --local --yes
```

### Quick Reference: All CLI Flags

| Flag | Alias | Description |
|------|-------|-------------|
| `--install-cli` | | Install/update CLI binary |
| `--tool=<name>` | | Install tool config (claude, opencode, pi, wocode, antigravity, codex, all, auto) |
| `--update` | | Full harness sync: CLI + docs + all tools + compliance |
| `--compliance` | | Validate all installed files match manifest |
| `--check` | | Compare installed versions against manifest |
| `--yes` | `-y` | Skip confirmation prompts |
| `--dry-run` | `-n` | Preview without writing files |
| `--skill=<name>` | | Specific components to install (comma-separated) |
| `--interactive` | `-i` | Interactive checkbox picker |
| `--local` | `-l` | Install to project-local directories |
| `--uninstall=<name>` | | Remove installed files (claude, opencode, all, ...) |
| `--no-validate` | | Skip compliance validation after --update |
| `--prune` | | Interactive: review & remove non-manifest skills |
| `--purge[=<name>]` | | Nuclear cleanup: wipe ALL harness files from tool config (no manifest) |
| `--purge=all` | | Purge all 6 tool config directories at once |
| `--sync-docs` | | Sync canonical skills to all tool directories |
| `--report-skills` | | Report local skills to dashboard telemetry API |
| `--report-url=<url>` | | Dashboard URL for skill reporting |
| `--import-ref` | | Import ref skills/agents to all platforms |
| `--mode=<mode>` | | Show clone + stow instructions (repo) |
| `--dest=<path>` | | Clone destination for --mode=repo |
| `--skip-binary` | | Skip CLI binary update in --update |
| `--detect` | | Print platform-aware system report |
| `--no-report` | | Disable telemetry/dashboard reporting |
| `--debug` | | Enable verbose debug logging |
| `--help` | `-h` | Show help |

### GNU Stow Mode (Symlink-based)

Each command separate copy-paste:

```bash
./setup.sh all
```

```bash
./setup.sh claude
```

```bash
./setup.sh opencode
```

```bash
```

```bash
./setup.sh pi
```

```bash
./setup.sh wocode
```

```bash
./setup.sh antigravity
```

```bash
./setup.sh --restow
```

```bash
./setup.sh --delete
```

```bash
./setup.sh --dry-run
```

## 💻 Coding Assistant (wocode)

**What is wocode?**
A high-performance CLI coding agent for automated engineering, refactoring, and code analysis. Think of it as an AI pair programmer that lives in your terminal.

**Key features:**
- Shared skills (debugging, planning, code review, architecture analysis, etc.) + per-project delivery packages
- 6 subagents for parallel codebase research
- Local-first with Ollama (private, free, offline)
- Project-aware (reads your AGENTS.md for persona)
- TUI (Terminal UI) with syntax highlighting, diffs, file tree

**Installation methods:**
| Method | Best for | Config location |
|--------|----------|-----------------|
| **Harness CLI** (Steps 1-3) | Shared config across projects | `~/.wocode/` |
| **npm/pnpm** (below) | Per-project, version-locked, CI/CD | `./.wo/` |

---

**Local (project) install — npm:**
> `--save-dev` = devDependency (tool for you, not shipped to users)

```bash
npm install --save-dev @wayofmono/wo-coding-agent
```
> Adds to `package.json` devDependencies. Installs to `node_modules/`.

```bash
npx wocode --init
```
> Creates `.wo/` folder in your project with config, models, settings.

```bash
./wocode
```
> Starts the wocode agent. Opens TUI interface.

```bash
# Update later: pnpm update @wayofmono/wo-coding-agent
```

```bash
# Uninstall: npm uninstall @wayofmono/wo-coding-agent
```

**Local (project) install — pnpm:**
> `-D` = `--save-dev` (shorthand). Faster, stricter dependency resolution.

```bash
pnpm add -D @wayofmono/wo-coding-agent
```

```bash
pnpm wocode --init
```

```bash
./wocode
```

```bash
# Update later: pnpm update @wayofmono/wo-coding-agent
```

```bash
# Uninstall: pnpm remove @wayofmono/wo-coding-agent
```

**Global install (cross-project):**
> Available as `wocode` command everywhere. Good for quick one-off use.

```bash
npm install -g @wayofmono/wo-coding-agent
```

```bash
wocode --init
```

```bash
wocode
```

```bash
# Update later: npm update -g @wayofmono/wo-coding-agent
```

```bash
# Uninstall: npm uninstall -g @wayofmono/wo-coding-agent
```

**First run:**
1. `wocode` starts the TUI
2. Select a skill (press `/` for help)
3. Or just chat: "Help me refactor this function"
4. Press `Ctrl+C` to exit

**Config files created:**
```
.wo/
├── models.json       # LLM providers (default: Ollama + qwen3.5:9b)
├── settings.json     # Agent behavior, theme, keybindings
└── launcher          # Executable startup script
```

## 🤖 User Assistant (wouser)

**What is wouser?**
A general-purpose AI assistant SDK + CLI. Unlike wocode (which is for coding), wouser is designed for:
- Building AI chatbots and assistants into your applications
- General conversation, research, analysis tasks
- SDK integration (your code calls wouser programmatically)
- End-user facing features (it's a runtime dependency)

**Key differences from wocode:**
| Aspect | wocode | wouser |
|--------|--------|--------|
| Purpose | Coding agent for engineers | General assistant + SDK |
| Install type | `--save-dev` (devDependency) | `--save` (dependency) |
| Bundled in app? | No | Yes, if you use SDK |
| Interface | TUI (terminal UI) | CLI + programmatic API |
| Skills | Shared coding-focused skills | Same skills, general use |

---

**Local (project) install — npm:**
> Standard dependency (not dev) because your app may need it at runtime

```bash
npm install @wayofmono/wo-agent
```
> Adds to `package.json` dependencies. Installs to `node_modules/`.

```bash
npx wouser --init
```
> Creates `.wo/` folder with config (shared with wocode if both installed).

```bash
./wouser
```
> Starts the wouser CLI. Chat interface for general tasks.

**Local (project) install — pnpm:**

```bash
pnpm add @wayofmono/wo-agent
```

```bash
pnpm wouser --init
```

```bash
./wouser
```

**Using as SDK (in your code):**
```typescript
import { createAgent } from '@wayofmono/wo-agent';

const agent = createAgent({
  model: 'qwen3.5:9b',
  skills: ['debug', 'create_plan', 'research_codebase']
});

const result = await agent.run('Analyze this codebase for security issues');
console.log(result);
```

**Loading skills programmatically:**

`@wayofmono/wo-agent` provides `loadSkillsFromDir()` and `loadSkills()` for discovering SKILL.md files at runtime:

```js
import { loadSkillsFromDir, formatSkillsForPrompt } from '@wayofmono/wo-agent';

// Load agent persona from project folder
const agent = loadSkillsFromDir({
  dir: '.wo/agents/investready',
  source: 'agent'
});

// Load skills from local project folder (no npm package needed)
const skills = loadSkillsFromDir({
  dir: '.wo/agents/investready/skills',
  source: 'project'
});

// Load skills from an npm package's SKILL.md (if bundled)
const npmSkills = loadSkillsFromDir({
  dir: './node_modules/@wayofmono/skill-investor-ready-doc-gen',
  source: 'npm'
});

// Merge and format for LLM system prompt
const all = [...agent.skills, ...skills.skills, ...npmSkills.skills];
const prompt = agent.skills[0]?.body + '\n\n' + formatSkillsForPrompt(all);
```

SKILL.md is just a markdown file with YAML frontmatter:
```markdown
---
name: investor-ready-doc-gen
description: Generate investor-ready docs for any project
---

# Instructions
...
```

Place it in your project's `.wo/agents/<name>/skills/` folder and `loadSkillsFromDir()` discovers it automatically — no npm publish needed.

**Or use the CLI to register skills from npm packages** (no file copying):

```bash
npm install @wayofmono/skill-investor-ready-doc-gen
wouser skill install npm:@wayofmono/skill-investor-ready-doc-gen
wouser skill list
```

Same pattern for agents and extensions. Tracked in `.wo/manifest.json`.

**Config files created (same .wo/ folder as wocode):**
```
.wo/
├── models.json       # LLM providers (default: Ollama + qwen3.5:9b)
├── settings.json     # Agent behavior, theme, keybindings
└── launcher          # Executable startup script
```

## 💡 Understanding Dev-Dependencies (`--save-dev` / `-D`)

### 1. "The Hammer vs. The House"

Think of your application as a house you are building.

- **dependencies**: Materials (bricks, glass, wires). Your app cannot live without them.
- **devDependencies** (`--save-dev` / `-D`): Tools (hammers, saws, blueprints). Needed to build, but not shipped inside the walls.

### 2. What it does

```bash
npm install --save-dev @wayofmono/wo-coding-agent   # → devDependencies in package.json
```

```bash
npm install @wayofmono/wo-agent                      # → dependencies in package.json
```

- **package.json**: Places under `"devDependencies"` key instead of `"dependencies"`
- **Production**: `pnpm install --prod` skips devDeps — smaller, faster, more secure
- **Bundle size**: wocode never bundled into user-facing code

### 3. Why wocode is dev-dependency

The Coding Assistant (wocode) is a tool for **you, the engineer**. It helps write code, refactor files, analyze architecture. Your end-users never interact with it.

### 4. Why wouser is different

The User Assistant (wouser) is an **SDK**. If you're building an AI chatbot or feature that uses agent logic inside your app, your app needs that code at runtime — so it's a standard dependency.

## 📦 Wo Packages

All **29** packages published under `@wayofmono` scope at [npmjs.com/settings/wayofmono](https://www.npmjs.com/settings/wayofmono/packages) (14 core + 1 extension + 14 skill packages).

### Install from npm (each package separate copy-paste)

```bash
npm install @wayofmono/wo-agent
```

```bash
npm install @wayofmono/wo-coding-agent
```

```bash
npm install @wayofmono/wo-ai
```

```bash
npm install @wayofmono/wo-tui
```

```bash
npm install @wayofmono/wo-agent-core
```

```bash
npm install @wayofmono/wo-skill-docs
```

```bash
npm install @wayofmono/wo-mermaid
```

```bash
npm install @wayofmono/web-access
```

```bash
npm install @wayofmono/lens
```

```bash
npm install @wayofmono/wo-web-ui
```

```bash
npm install @wayofmono/telemetry
```

```bash
npm install @wayofmono/telegram
```

```bash
npm install @wayofmono/whatsapp
```

### Install from cloned repo (each command separate copy-paste)

```bash
git clone https://github.com/Way-Of/wayofmono.git ~/wayofmono
```

```bash
pnpm add ~/wayofmono/packages/@wayofmono/wo-agent
```

```bash
pnpm add ~/wayofmono/packages/@wayofmono/wo-coding-agent
```

### Package Details

All 29 packages published under `@wayofmono` scope at [npmjs.com/settings/wayofmono](https://www.npmjs.com/settings/wayofmono/packages) (14 core + 1 extension + 14 skill packages).

| Package | Description | When to Use | npm |
|---------|-------------|-------------|-----|
| **@wayofmono/wo-ai** | Multi-Provider LLM API (OpenAI, Anthropic, Gemini, Ollama, llama.cpp, LM Studio) | Need unified interface for multiple LLM providers | `npm install @wayofmono/wo-ai` |
| **@wayofmono/wo-tui** | High-Performance Terminal UI Library (React Ink based) | Building terminal apps with React-like components | `npm install @wayofmono/wo-tui` |
| **@wayofmono/wo-agent-core** | Central Agent Runtime & Extension API | Building custom agents, need core runtime | `npm install @wayofmono/wo-agent-core` |
| **@wayofmono/wo-agent** | General-Purpose Agent SDK & CLI (**wouser**) | Building AI features in your app, chatbots | `npm install @wayofmono/wo-agent` |
| **@wayofmono/wo-coding-agent** | CLI Coding Agent (**wocode**) | Automated coding, refactoring, code analysis | `npm install @wayofmono/wo-coding-agent` |
| **@wayofmono/wo-skill-docs** | Multi-format Documentation Expert | Auto-generating docs from code/comments | `npm install @wayofmono/wo-skill-docs` |
| **@wayofmono/wo-mermaid** | TUI Mermaid Renderer (ASCII art diagrams) | Rendering diagrams in terminal | `npm install @wayofmono/wo-mermaid` |
| **@wayofmono/web-access** | Web search, URL fetching, GitHub cloning, PDF/YouTube extraction | Agents need web access, research tasks | `npm install @wayofmono/web-access` |
| **@wayofmono/lens** | Codebase Analysis & Safety Engine | Static analysis, security scanning, architecture | `npm install @wayofmono/lens` |
| **@wayofmono/wo-web-ui** | Web UI Components (React 19) | Building web dashboards for agents | `npm install @wayofmono/wo-web-ui` |
| **@wayofmono/telemetry** | Telemetry and metrics (OpenTelemetry) | Observability, tracing, metrics collection | `npm install @wayofmono/telemetry` |
| **@wayofmono/telegram** | Telegram bot integration | Building Telegram bots with agent logic | `npm install @wayofmono/telegram` |
| **@wayofmono/whatsapp** | WhatsApp bot integration | Building WhatsApp bots with agent logic | `npm install @wayofmono/whatsapp` |

**Core packages** (most commonly used): `wo-ai`, `wo-agent`, `wo-coding-agent`, `wo-agent-core`, `telemetry`

**Specialized packages** (specific use cases): `wo-tui`, `wo-mermaid`, `wo-skill-docs`, `web-access`, `lens`, `wo-web-ui`, `telegram`, `whatsapp`

### Skill Packages (14 published)

Each skill is available as a standalone `@wayofmono/skill-*` npm package — install only the skills you need:

```bash
# Install individual skills
npm install @wayofmono/skill-auto-ticket-creator
npm install @wayofmono/skill-backlog-groomer
npm install @wayofmono/skill-docs-sync-updater
npm install @wayofmono/skill-document-generation
npm install @wayofmono/skill-experimental-pr-workflow
npm install @wayofmono/skill-interview
npm install @wayofmono/skill-investor-ready-doc-gen
npm install @wayofmono/skill-prd-to-issues
npm install @wayofmono/skill-research-codebase
npm install @wayofmono/skill-runbook-manager
npm install @wayofmono/skill-self-documentation
npm install @wayofmono/skill-session-export
npm install @wayofmono/skill-tdd
npm install @wayofmono/skill-write-a-prd
```

Then register them with wouser:
```bash
npx wouser skill install auto-ticket-creator
npx wouser skill install backlog-groomer
npx wouser skill install tdd
# ... or install all at once via wo-user-extra bundle
```

### Extension Package

| Package | Description | Install |
|---------|-------------|---------|
| **@wayofmono/wo-user-extra** | Bundle of 36 skills + 14 agent/skills + 7 agents + 2 extensions + 12 themes + prompts | `npm install @wayofmono/wo-user-extra` |

## 🔄 Keeping Updated — Automatic Skill & Package Updates

### Update to Latest Package Versions

```bash
# Update all @wayofmono packages to latest versions
npm update @wayofmono/wo-agent @wayofmono/wo-user-extra @wayofmono/wo-coding-agent @wayofmono/wo-ai @wayofmono/wo-tui @wayofmono/wo-agent-core @wayofmono/wo-skill-docs @wayofmono/wo-mermaid @wayofmono/web-access @wayofmono/lens @wayofmono/wo-web-ui @wayofmono/telemetry @wayofmono/telegram @wayofmono/whatsapp

# Update skill packages (install only what you use)
npm update @wayofmono/skill-tdd @wayofmono/skill-investor-ready-doc-gen @wayofmono/skill-interview

# Or update everything at once (if using these packages)
npm update
```

### After Updating — Re-Register Skills

After updating packages, you need to refresh the skill manifest to pick up new/updated skills:

```bash
# Re-scan and register new/updated skills from updated packages
npx wouser skill update

# Or discover all available skills in node_modules
npx wouser skill discover

# List what's currently registered
npx wouser skill list
```

### How It Works

1. **`npm update`** — Downloads latest package versions to `node_modules/`
2. **`wouser skill update`** — Re-reads `SKILL.md` files from updated packages and refreshes `.wo/manifest.json`
3. **`wouser skill discover`** — Finds any new skill packages you haven't registered yet
4. **`wouser skill list`** — Shows all registered skills with versions

### Quick Example Workflow

```bash
# 1. Update packages
npm update @wayofmono/wo-agent @wayofmono/wo-user-extra

# 2. Refresh skills
npx wouser skill update

# 3. Check for new skills
npx wouser skill discover

# 4. Register any new ones
npx wouser skill install investor-ready-doc-gen
```

## 🛠 Skill Management — Short Commands

### Install Skills (One Command)

```bash
# Short form (auto-resolves under @wayofmono scope)
npx wouser skill install investor-ready-doc-gen
npx wouser skill install tdd
npx wouser skill install codebase_analyzer

# Full npm form (also works)
npx wouser skill install npm:@wayofmono/skill-investor-ready-doc-gen
npx wouser skill install npm:@wayofmono/skill-tdd
```

### Manage Skills

```bash
# List registered skills with versions
npx wouser skill list

# Find unregistered skills in node_modules
npx wouser skill discover

# Update after npm update
npx wouser skill update

# Remove a skill
npx wouser skill remove investor-ready-doc-gen
```

### Also Manage Agents & Extensions

```bash
# Install agents (persona definitions)
npx wouser agent install codebase_analyzer
npx wouser agent install thoughts_analyzer

# Install extensions (custom LLM-callable tools)
npx wouser extension install pipeline-tools
npx wouser extension install web-search

# List all
npx wouser agent list
npx wouser extension list
```

## 📚 Fixes & Release Notes

See the [Fixes & Release Notes](docs/fixes/) directory for detailed change logs:

- [wo-agent fixes](docs/fixes/wo-agent-fixes.md) — Skill management, short-form auto-resolution
- [wo-coding-agent fixes](docs/fixes/wo-coding-agent-fixes.md) — Coding agent updates
- [AI Engineering Harness fixes](docs/fixes/ai-engineering-harness-fixes.md) — Harness updates
- [CTO Dashboard fixes](docs/fixes/cto-dashboard-fixes.md) — Dashboard updates

---

## 📊 CTO Dashboard

**Production dashboard**: https://cto.wayof.work ([@wayofmono/wo-cto-dashboard](https://www.npmjs.com/package/@wayofmono/wo-cto-dashboard), Next.js 16, Prisma/SQLite)

**What it does:**
- **Team visibility**: See all tickets, velocity, blockers across projects
- **Skill health**: Real-time skill installation status across all machines
- **Standups**: Daily async check-ins (yesterday/today/blockers)
- **Idea board**: Prioritized ideas with voting
- **Review queue**: PRs waiting for review

### Features

| View | Description | Best For |
|------|-------------|----------|
| **Overview** | Ticket stats, velocity, blockers | Quick team health check |
| **Tickets** | Full Kanban with filters, review queue, **GitHub/Local source switch + branch selector** | Project managers, leads |
| **Standup** | Daily check-ins (yesterday/today/blockers) | Async standups, remote teams |
| **Skills** | Real-time skill health across all machines | Ensuring team has latest skills |
| **Ideas** | Prioritized idea board with voting | Product planning, RFCs |
| **Developers** | Workflow and assignment tracking | Resource planning |
| **Docs** | Architecture docs and decision records | Onboarding, reference |

### Install & Run

**Quick one-liner (no clone, no install):**
```bash
npx @wayofmono/wo-cto-dashboard
```

**Global CLI (use `wodev` anywhere) — choose one:**

```bash
# Option A: local prefix (recommended — no sudo, everything works)
npm config set prefix ~/.npm-global
echo 'export PATH="$PATH:~/.npm-global/bin"' >> ~/.bashrc
source ~/.bashrc
npm install -g @wayofmono/wo-cto-dashboard
wodev

# Option B: sudo global install (run --build once with sudo)
sudo npm install -g @wayofmono/wo-cto-dashboard
sudo wodev --build    # one-time build (needs root to write .next/)
wodev                 # production server (read-only, works as user)
```

| Command | What it does |
|---------|-------------|
| `wodev` | Production server (read-only, requires build first) |
| `wodev --dev` | Dev server with hot reload |
| `wodev --build` | One-time production build |
| `wodev --update` | Update to latest npm version |

Port: **http://localhost:6969** (`PORT=8080 wodev` to override)

**From source (clone):**
```bash
git clone https://github.com/Way-Of/wayofdev.git
cd wayofdev
pnpm install
pnpm dev
```

### Run from Monorepo

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check (used by deploy script) |
| GET | `/api` | List tickets, developers, docs |
| POST | `/api/ideas` | Create new idea |
| POST | `/api/standup` | Create standup entry |
| POST | `/api/news` | Create news item |
| GET | `/api/news` | List news items |
| GET | `/api/skills/report` | Skills health report |
| POST | `/api/skills/report` | Submit skills report (from `ai-harness --report-skills`) |
| POST | `/api/link-github` | Link pincode dev ID to GitHub username |
| GET | `/api/link-github` | Get link mapping for a dev ID |
| DELETE | `/api/link-github` | Remove link mapping |

### GitHub Authentication (Private Repo Access)

The CTO Dashboard can fetch tickets from the private `f-rr-d` GitHub repository using GitHub OAuth.

**Setup:**
1. Create a GitHub OAuth App at https://github.com/settings/developers
2. Set Authorization callback URL: `https://your-domain.com/api/auth/callback/github`
3. Add environment variables to your deployment:
   ```bash
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   NEXTAUTH_SECRET=your_random_secret (generate with: openssl rand -base64 32)
   ```

**How it works:**
- User clicks "Sign in with GitHub" on login page
- OAuth flow redirects to GitHub, then back to `/api/auth/callback/github`
- NextAuth.js validates user against `thoughts/` developer list
- JWT session includes GitHub access token for authenticated API calls
- Ticket source switch (Local/GitHub) in Tickets view uses authenticated requests

**Required OAuth scopes:** `read:user user:email repo` (for private repo access)

**Ticket source API:** `/api?type=tickets&source=github&branch=main` (auto-includes auth token when logged in)

**Local fallback:** If GitHub is unavailable or user not authenticated, falls back to local `thoughts/` filesystem.

## 🔧 Pipeline Tools (each command separate copy-paste)

**These are maintenance scripts for the harness itself. Run them when contributing to WayOfMono or doing maintenance.**

```bash
# Sync canonical skills to all 6 tool directories
ai-harness --sync-docs
```

```bash
# Preview sync without changes (safe to run anytime)
ai-harness --sync-docs --check
```

```bash
# Validate all skill files for correct frontmatter, naming, format
deno run -A scripts/compliance-check.ts
```
> Runs in CI. Checks: frontmatter fields, snake_case naming, allowed-tools casing, file structure.

```bash
# Migrate ticket namespaces (e.g., PROJ-XXX → WOMONO-XXX)
deno run -A scripts/migrate-tickets.ts
```
> One-time migration script. Updates ticket filenames and frontmatter.

```bash
# Import reference skills from docs/ to all tool platforms
deno run -A scripts/import-ref-skills.ts
```
> Converts documented skills in `docs/skills/` to proper format for each tool.

```bash
# Generate repository statistics (lines of code, file counts)
npx tsx scripts/stats.ts
```
> Outputs: total files, lines per package, skill counts, etc.

| Tool | Location | Purpose |
|------|----------|---------|
| `docs-sync.ts` | `scripts/` | Sync canonical skills → per-tool copies |
| `compliance-check.ts` | `scripts/` | Validate frontmatter & naming conventions |
| `migrate-tickets.ts` | `scripts/` | Migrate ticket namespaces (PROJ → WOMONO) |
| `import-ref-skills.ts` | `scripts/` | Import reference skills from docs/ |
| `stats.ts` | `scripts/stats.ts` | Count lines per package |

## 🧠 f-rr-d Context Engineering (förråd)

**What is f-rr-d?**
**förråd** (Swedish for "storage/depot") is a **centralized thoughts repository** — a single Git repo that stores all tickets, plans, research, and decisions across all Way-Of projects. Think of it as a "shared brain" for the team.

**Why use it?**
- **Single source of truth**: All project knowledge in one place
- **Cross-project**: WayOfMono, WayOfWork, and Opticat share the same repo
- **AI-friendly**: Structured so agents can read/write context automatically
- **Git-powered**: Full history, branching, collaboration
- **Append-only**: Never delete, only add — complete audit trail

**Repository**: https://github.com/Way-Of/f-r-r-d (115 files across 3 namespaces)

### How it works

| Step | Action | Command |
|------|--------|---------|
| 1 | Clone on first init | `ai-harness --init` clones f-rr-d into `thoughts/` |
| 2 | Project-scoped tickets | WayOfMono → `thoughts/wayofmono/shared/tickets/` (WOMONO-XXX) |
| 3 | Multi-project | WoW → `thoughts/wow/` (WOW-XXX), Opticat → `thoughts/opticat/` (OPT-XXX) |
| 4 | Sync protocol | **Pull before read, push after write** — all harness skills auto-sync |
| 5 | Branch naming | `<project-slug>/<namespace>/<ticket-id>-<short-desc>` |

### Structure

```
thoughts/
├── global/                    # Cross-project concerns (shared configs, standards)
├── wayofmono/                 # WOMONO-XXX (WayOfMono monorepo)
│   ├── shared/tickets/        # 17+ WOMONO tickets (team-visible)
│   ├── shared/plans/          # Implementation plans
│   ├── shared/research/       # Technical research, evaluations
│   ├── craig/                 # Craig's personal tickets
│   ├── tomas/                 # Tomas's personal tickets
│   ├── andre/                 # Andre's personal tickets
│   └── zerwiz/                # Zerwiz's personal tickets
├── wow/                       # WOW-XXX (WayOfWork platform)
│   ├── shared/tickets/
│   └── andre/, craig/, tomas/, zerwiz/
└── opticat/                   # OPT-XXX (Opticat HVAC platform)
    ├── shared/tickets/
    └── andre/, craig/, tomas/, zerwiz/
```

**Key folders:**
- `shared/` = team-visible (tickets, plans, research)
- `personal/` = per-developer (work-in-progress, notes)

Config: `.wo/config/harness.json` stores `f_rrd_url` and `project_slug` for the harness.

### Workflow Pattern

```
Ticket → /create_plan → /implement_plan → /validate_plan → /validate_telemetry → /commit
```

**Step-by-step:**
1. **Ticket**: Create/select ticket in `thoughts/<project>/shared/tickets/`
2. **Plan**: `/create_plan` — AI generates detailed implementation plan
3. **Implement**: `/implement_plan` — Execute plan phase-by-phase with validation
4. **Validate**: `/validate_plan` — Verify implementation matches plan
5. **Telemetry**: `/validate_telemetry` — Check observability/tracing matches expectations
6. **Commit**: `/commit` — Create structured git commit with ticket reference

### Slash Commands

| Command | Description | When to Use |
|---------|-------------|-------------|
| `/init_harness` | Initialize harness (project memory + thoughts/) | First time in a project |
| `/create_plan` | Generate implementation plan from ticket | Starting new feature/fix |
| `/implement_plan` | Execute approved plan phase-by-phase | After plan is approved |
| `/validate_plan` | Verify implementation against plan | After implementation |
| `/validate_telemetry` | Validate local telemetry against narrative spec | After adding observability |
| `/commit` | Create well-structured git commits | Before pushing |
| `/debug` | Investigate issues during testing | When something breaks |
| `/sync skills` | Sync all skills to all frontends | After skill changes |
| `/help` | Unified help system | Anytime |

## 🎛️ AI Engineering Harness

Shared agents, commands, skills, and extensions for all 6 agent frontends. Install once and instantly configure any agent with battle-tested prompts and workflows. See the comprehensive [AI Engineering Harness Tutorial](https://github.com/Way-Of/wayofmono/tree/main/docs/ai-engineering-harness-tutorial.md) for step-by-step instructions on utilizing the agents, commands, and skills.

## 🚢 Deployment

### Architecture

```
Internet → Cloudflare Tunnel [cto.wayof.work]
              → Host server:
                  → Podman/Caddy container (:81)
                      → Next.js container (:3000)
                          ├── Bind mount: thoughts/ (RW)
                          └── Volume: db_data/ (SQLite)
```

**How it works:**
1. **Cloudflare Tunnel**: Secure tunnel from internet to your server (no open ports needed)
2. **Caddy**: Reverse proxy on port 81, handles HTTPS, routes to Next.js
3. **Next.js**: Dashboard app on port 3000 (inside container)
4. **Bind mount**: `thoughts/` folder mounted read-write (live ticket data)
5. **SQLite volume**: Persistent database for tickets, skills, users

### Stack

| Component | Purpose |
|-----------|---------|
| **Podman** + `podman-compose` | Container runtime (rootless, more secure than Docker) |
| **Devbox** | Reproducible shell environment (nix-based) |
| **cloudflared** | Cloudflare Tunnel daemon |
| **Caddy** | Reverse proxy with automatic HTTPS |
| **Next.js 16** | Dashboard application server |

### Deploy (each command separate copy-paste)

**Production deploy (run on server):**

```bash
# Automated deploy script (recommended)
./scripts/deploy-dashboard.sh
```
> Runs: git pull → build → deploy → health check → systemd setup

```bash
# Manual: build and start containers
cd ui && podman-compose up --build -d
```
> `-d` = detached mode (runs in background)

```bash
# Verify deployment health
curl https://cto.wayof.work/api/health
```
> Should return: `{"status":"ok"}`

```bash
# View live logs
podman-compose logs -f
```
> `Ctrl+C` to exit (containers keep running)

```bash
# Install as systemd service (auto-start on boot)
sudo cp ui/docker/wayofmono-dashboard.service /etc/systemd/system/
```

```bash
# Enable and start service
sudo systemctl enable --now wayofmono-dashboard
```

### Deploy Script Details

The `deploy-dashboard.sh` script (55 lines):

1. **Detects compose**: Tries `podman-compose` → `podman compose` → `docker-compose` → `docker compose`
2. **Runs `git pull`**: Gets latest code from main branch
3. **Creates `.env`**: If missing, creates with default `DATABASE_URL=file:../db/custom.db`
4. **Builds & starts**: Runs `$COMPOSE_CMD up --build -d`
5. **Health check**: Polls `http://localhost:81/api/health` every 5s for 60s
6. **Shows logs**: Last 5 lines from `nextjs` container on success

### Dev Script Details

The `dev-dashboard.sh` script (32 lines):

1. **Optional PORT**: Default 3000, override with `./scripts/dev-dashboard.sh 4000`
2. **`bun install`**: Installs dependencies in `ui/` (faster than npm/pnpm)
3. **Starts dev server**: `bun run dev` in background
4. **Waits for ready**: Up to 30s for Next.js compilation
5. **Opens browser**: Via `xdg-open` (Linux) or `sensible-browser` (cross-platform)

## 🔄 CI/CD Pipeline

### CI Workflow (`.github/workflows/ci.yml`)

Runs on: Push/PR to `main`, Node 22, pnpm 10, Deno 2.x

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [22]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - uses: denoland/setup-deno@v2
        with:
          deno-version: v2.x
      - name: Check canonical skills are in sync
        run: deno run -A scripts/docs-sync.ts --check | grep -q "Would sync: 0" || (echo "Canonical skills out of sync. Run: deno run -A scripts/docs-sync.ts" && exit 1)
      - name: Build
        run: pnpm -r build
      - name: Typecheck
        run: pnpm -r --parallel typecheck
      - name: Test
        run: pnpm -r test
```

### CD Workflow (`.github/workflows/cd.yml`)

Runs on: Tag push `v*`, publishes all packages to npm

```yaml
name: CD
on:
  push:
    tags:
      - "v*"

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: pnpm
          registry-url: "https://registry.npmjs.org"
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm -r publish --access public --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Pre-Deploy Checklist (each command separate copy-paste)

**Run all of these before deploying to production.**

```bash
# 1. Run all tests across all packages
pnpm -r test
```
> Must pass: unit tests, integration tests for all 13 packages

```bash
# 2. Verify all skills are in sync across tools
ai-harness --sync-docs --check
```
> Must output: "All skills in sync" or "Would sync: 0"

```bash
# 3. TypeScript type checking across all packages
pnpm -r --parallel typecheck
```
> Must pass with zero errors. `--parallel` runs simultaneously for speed.

```bash
# 4. Verify production dashboard is healthy
curl https://cto.wayof.work/api/health
```
> Should return: `{"status":"ok"}`

```bash
# 5. Build dashboard for production
cd ui && pnpm build
```
> Creates optimized Next.js build in `.next/`. Must succeed.

## 📂 Complete Repository Structure

```
/home/zerwiz/wayofmono/
│
├── packages/
│   ├── @aiengineeringharness/     # 1,226 files — Harness (core)
│   │   ├── manifest.json          # Source of truth (v1.3.0)
│   │   ├── install.ts             # Deno CLI installer
│   │   ├── setup.sh               # GNU Stow installer
│   │   ├── scripts/               # 14 pipeline scripts
│   │   ├── opencode/    → ~/.config/opencode/    # 180 files
│   │   ├── claude/      → ~/.claude/             # 167 files
│   │   ├── pi/          → ~/.pi/agent/           # 174 files
│   │   ├── codex/       → ~/.codex/              # 186 files
│   │   ├── antigravity/ → ~/.antigravity/        # 146 files
│   │   └── wocode/     → ~/.wocode/            # 182 files
│   │
│   ├── @wayofmono/                 # 29 NPM packages (14 core + 1 extension + 14 skill)
│   │   ├── wo-ai/                  # 4.0M — Multi-Provider LLM API
│   │   ├── wo-tui/                 # 1.5M — Terminal UI Library
│   │   ├── wo-agent-core/          # 1.1M — Agent Runtime
│   │   ├── wo-agent/               # 8.2M — wouser (SDK + CLI)
│   │   ├── wo-coding-agent/        # 8.2M — wocode (CLI)
│   │   ├── wo-skill-docs/          # 148K — Documentation Expert
│   │   ├── wo-mermaid/             # 3.9M — Mermaid Renderer
│   │   ├── web-access/             # 7.7M — Web tools
│   │   ├── lens/                   # 2.1M — Codebase Analysis
│   │   ├── wo-web-ui/              # 224K — React Web UI
│   │   ├── telemetry/              # 188K — Telemetry
│   │   ├── telegram/               # 88K — Telegram bot
│   │   └── whatsapp/               # 88K — WhatsApp bot
│   │
│   └── ui/                         # CTO Dashboard ([@wayofmono/wo-cto-dashboard](https://www.npmjs.com/package/@wayofmono/wo-cto-dashboard))
│       ├── src/app/                # Next.js App Router
│       │   ├── api/                # API routes (health, ideas, news, standup, skills)
│       │   └── page.tsx            # Main page
│       ├── src/components/         # Dashboard views (tickets, skills, standup, ideas, etc.)
│       ├── src/lib/                # Data access layer (thoughts.ts, db.ts, types.ts, utils.ts)
│       ├── src/store/              # Zustand state management (dashboard-store.ts)
│       ├── prisma/                 # SQLite schema (User, Post, SkillReport)
│       └── docker/                 # Dockerfile, entrypoint.sh, Caddyfile
│
├── thoughts/                       # 115 files — f-rr-d context engineering
├── docs/                           # 173 files — Architecture & reference
│   ├── archetecture/               # Architecture docs (OVERVIEW, HARNESS, INDEX)
│   ├── skills/                     # Per-skill SKILL.md files
│   ├── tools/                      # AI coding tool references
│   └── agents/                     # Agent definitions
│
├── scripts/                        # deploy.sh, dev.sh, stats.ts, sync-versions.js
├── test/                           # Integration tests
├── ref/                            # 7,628 files — Historical reference archives
├── planning/                       # Planning documents
│
├── .github/workflows/              # ci.yml, cd.yml
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
└── README.md                       # This file
```

## 🔗 External Integrations

| Project | Description | Integration |
|---------|-------------|-------------|
| [Way of Pi](https://github.com/Way-Of/pi) | AI-augmented engineering platform (Electron/Web IDE) | Uses `@wayofmono/wo-agent` as backend SDK |
| [Way of Work](https://github.com/Way-Of/work) | AI-powered productivity platform | Uses `@wayofmono/wo-agent` as user agent SDK |

## 📋 Best Practices

### Naming Conventions

| Artifact | Convention | Example |
|----------|-----------|---------|
| Code files | camelCase | `dashboardStore.ts` |
| Config files | kebab-case | `ticket-template.md` |
| Scripts | snake_case | `deploy_dashboard.sh` |
| Projects | kebab-case | `wo-ai`, `wo-coding-agent` |
| Skills | `SKILL.md` | uppercase extension |
| Tickets | `XXX-NNNN` | `WOMONO-150` |

### Git Commit Messages

```
feat: Add feature description
fix: Fix bug description
docs: Add/update documentation
chore: Update dependencies
refactor: Refactor code
test: Add/update tests
perf: Improve performance
```

### File Structure Per Tool

```
<tool>/
├── skills/          # Skill directories
├── tools/           # Tool-specific scripts
│   ├── init
│   ├── sync
│   └── validate
├── settings.json    # User configuration
└── .mcp.json        # MCP configuration
```

## 🛡️ Security

### Security Headers

All deployments include these security headers:

| Header | Purpose |
|--------|---------|
| **Content Security Policy** | Prevents XSS by controlling resource loading |
| **X-Frame-Options** | Prevents clickjacking (DENY or SAMEORIGIN) |
| **X-Content-Type-Options** | Prevents MIME type sniffing (nosniff) |
| **Referrer Policy** | Controls referrer information sent with requests |

### Scanning (each command separate copy-paste)

```bash
# Audit dependencies for known vulnerabilities
pnpm audit
```
> Checks all packages in `node_modules` against CVE database. Run regularly.

```bash
# Run custom security checks (if configured)
pnpm run security:check
```
> Runs project-specific security scripts (SAST, dependency review, etc.)

## 🌐 Multi-Platform Support

WayOfMono works on all major platforms with Deno:

| Platform | Deno Install | Support Level |
|----------|-------------|---------------|
| **Windows** | `irm https://deno.land/install.ps1 | iex` | Full |
| **macOS** | `brew install deno` | Full |
| **Linux** | `curl -fsSL https://deno.land/install.sh | sh` | Full |
| **WSL/Git Bash** | `apt install deno` | Full |

**Notes:**
- **Windows**: Use PowerShell (not CMD). Run as Administrator for first install.
- **macOS**: Homebrew required. Install from https://brew.sh if missing.
- **Linux**: Works on all distros (Ubuntu, Debian, Fedora, Arch, etc.)
- **WSL**: Windows Subsystem for Linux — full Linux compatibility

## 🤝 Contributing (each command separate copy-paste)

```bash
# 1. Fork and clone the repo
git clone https://github.com/Way-Of/wayofmono.git
```

```bash
# 2. Create feature branch
git checkout -b feat/your-feature
```
> Use prefix: `feat/`, `fix/`, `docs/`, `chore/`, `refactor/`, `test/`

```bash
# 3. Install dependencies
pnpm install
```
> Uses pnpm workspaces — installs all 13 packages + harness + dashboard

```bash
# 4. Run tests
pnpm -r test
```
> `-r` = recursive (all packages). Must pass before PR.

```bash
# 5. Type check
pnpm -r --parallel typecheck
```
> `--parallel` runs simultaneously for speed. Must pass with zero errors.

**Before submitting PR:**
- Run `ai-harness --sync-docs --check` (skills in sync)
- Run `ai-harness --compliance` (manifest validation)
- Update CHANGELOG.md if needed
- Follow commit message convention

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 📄 License

MIT License — See [LICENSE](./LICENSE) for details.

## 📞 Support

- **GitHub Issues**: https://github.com/Way-Of/wayofmono/issues
- **Dashboard**: https://cto.wayof.work
- **Documentation**: [./docs/](./docs/)
- **NPM Packages**: https://www.npmjs.com/settings/wayofmono/packages

---

> Built as a unified toolset for the next generation of AI engineering.

**WayOfMono — High-Performance AI Coding Agents** 🚀
