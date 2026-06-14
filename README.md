# WayOfMono (Wo)

> Built as a unified toolset for the next generation of AI engineering.

The ultimate monorepo consolidation for high-performance coding agents. WayOfMono provides a shared Intelligence Backend (Packages, Tools, Memory) that serves **7** distinct Agent Frontends, with Wo (Way of Coding) as our primary synthesized interface.

## 👟 Quick Install

### What You're About to Do

This guide will install **7 AI coding tools** with shared skills, agents, and configurations. You'll get:
- **wocode** (Wo Coder) — our primary coding agent
- **wouser** — general-purpose AI assistant
- **Claude Code**, **OpenCode**, **Gemini CLI**, **Pi**, **Codex**, **Antigravity** — all configured with the same skills

Each tool will have access to **81 battle-tested skills** for tasks like debugging, planning, code review, and more.

---

### Step 1: Prerequisites — Deno

**Deno** is a modern JavaScript/TypeScript runtime (like Node.js but more secure). Our installer runs on Deno.

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

**Verify it works:**
```bash
deno --version
```
You should see something like `deno 2.x.x`. If you get "command not found", restart your terminal.

---

### Step 2: Install the CLI (One-time)

This installs the `ai-harness` command that manages everything else.

**macOS / Linux:**
```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --install-cli
```

**Windows (PowerShell):**
```powershell
deno run --reload -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --install-cli
```

> **Windows users**: First run needs `--reload` to bypass Deno's cache. Later updates work without it.

**Alternative (PowerShell wrapper):**
```powershell
iex (iwr https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ps1 -useb)
```
Then inside that session: `install.ps1 -InstallCli`

---

### Step 3: Install All 7 Tools at Once (Recommended)

This one command installs configurations for all 7 AI tools with all 81 skills.

**macOS / Linux / Windows (bash):**
```bash
ai-harness --tool=all --yes
```

**Windows (PowerShell wrapper):**
```powershell
.\install.ps1 -Tool all -Yes
```

**What happens**: Creates config folders at `~/.config/opencode/`, `~/.claude/`, `~/.gemini/`, `~/.pi/agent/`, `~/.codex/`, `~/.antigravity/`, `~/.wocoder/` — each with skills, agents, and settings.

### Step 3b: Install Individual Tools (one copy-paste per tool)

**macOS / Linux / Windows (bash) — pick one tool per copy-paste:**

```bash
ai-harness --tool=wocoder --yes
```

```bash
ai-harness --tool=pi --yes
```

```bash
ai-harness --tool=opencode --yes
```

```bash
ai-harness --tool=claude --yes
```

```bash
ai-harness --tool=gemini --yes
```

```bash
ai-harness --tool=antigravity --yes
```

```bash
ai-harness --tool=codex --yes
```

**Windows (PowerShell wrapper) — pick one tool per copy-paste:**

```powershell
.\install.ps1 -Tool wocoder -Yes
```

```powershell
.\install.ps1 -Tool pi -Yes
```

```powershell
.\install.ps1 -Tool opencode -Yes
```

```powershell
.\install.ps1 -Tool claude -Yes
```

```powershell
.\install.ps1 -Tool gemini -Yes
```

```powershell
.\install.ps1 -Tool antigravity -Yes
```

```powershell
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

### Step 3d: Install wocoder via npm/pnpm (Alternative)

Install wocoder directly from npm without the harness CLI — **each command is a separate copy-paste**:

**Local (project) install — npm:**

```bash
npm install --save-dev @wayofmono/wo-coding-agent
```

```bash
npx wocode --init
```

```bash
./wocode
```

```bash
# Update later: pnpm update @wayofmono/wo-coding-agent
```

```bash
# Uninstall: npm uninstall @wayofmono/wo-coding-agent
```

**Local (project) install — pnpm:**

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

Install configs to `.claude/`, `.opencode/`, `.wo/`, etc. in current project — **each command is a separate copy-paste**:

**macOS / Linux / Windows (bash):**

```bash
ai-harness --tool=wocoder --local --yes
```

```bash
ai-harness --tool=pi --local --yes
```

```bash
ai-harness --tool=all --local --yes
```
> Creates `./.wo/agent/`, `./.pi/agent/`, `./.config/opencode/`, etc. in your project folder.

**Windows (PowerShell wrapper):**

```powershell
.\install.ps1 -Tool wocoder -Local -Yes
```

```powershell
.\install.ps1 -Tool pi -Local -Yes
```

```powershell
.\install.ps1 -Tool all -Local -Yes
```

### Step 3d: Interactive Component Selection (--interactive / -i)

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

Full harness sync: CLI binary + docs + all tools + stale cleanup + compliance validation — **each command is a separate copy-paste**:

**macOS / Linux / Windows (bash):**

```bash
# Standard update — run this regularly
ai-harness --update
```

```bash
# Skip compliance validation after update (faster)
ai-harness --update --no-validate
```

```bash
# Skip CLI binary update (only sync tools/docs)
ai-harness --update --skip-binary
```

```bash
# Preview without writing (see what would change)
ai-harness --update --dry-run
```

**Windows (PowerShell wrapper):**

```powershell
.\install.ps1 -Update
```

```powershell
.\install.ps1 -Update -NoValidate
```

```powershell
.\install.ps1 -Update -SkipBinary
```

```powershell
.\install.ps1 -Update -DryRun
```

### Major Update (full refresh after a breaking overhaul)

**Each command is a separate copy-paste:**

**macOS / Linux / Windows (bash):**

```bash
# Option 1: Full refresh from source
deno run --reload -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --update
```

```bash
# Option 2: Wipe everything and reinstall from scratch (nuclear option)
ai-harness --uninstall=all --yes
```

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --install-cli
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

### Sync Documentation (--sync-docs)

Sync canonical skills to all tool skill directories — **each command is a separate copy-paste**:

**macOS / Linux / Windows (bash):**

```bash
ai-harness --sync-docs
```

```bash
# Preview only (no changes)
ai-harness --sync-docs --check
```

**Windows (PowerShell wrapper):**

```powershell
.\install.ps1 -SyncDocs
```

```powershell
.\install.ps1 -SyncDocs -Check
```

### Report Skills to Dashboard (--report-skills / --report-url)

Report local skills to CTO Dashboard telemetry API — **each command is a separate copy-paste**:

**macOS / Linux / Windows (bash):**

```bash
ai-harness --report-skills
```

```bash
# Custom dashboard URL
ai-harness --report-skills --report-url https://cto.wayof.work
```

**Windows (PowerShell wrapper):**

```powershell
.\install.ps1 -ReportSkills
```

```powershell
.\install.ps1 -ReportSkills -ReportUrl "https://cto.wayof.work"
```

### Import Reference Skills (--import-ref)

Import reference skills/agents to all platforms — **each command is a separate copy-paste**:

**macOS / Linux / Windows (bash):**

```bash
ai-harness --import-ref
```

**Windows (PowerShell wrapper):**

```powershell
.\install.ps1 -ImportRef
```

### Repo / Stow Mode (--mode / --dest)

Show clone + stow instructions for GNU Stow-based installation — one copy-paste:

**macOS / Linux / Windows (bash):**

```bash
ai-harness --mode=repo
```

```bash
ai-harness --mode=repo --dest=~/.ai-engineering-harness
```

**Windows (PowerShell wrapper):**

```powershell
.\install.ps1 -Mode repo
```

```powershell
.\install.ps1 -Mode repo -Dest "~/.ai-engineering-harness"
```

### Quick Reference: All PowerShell Flags

| Parameter | Description |
|-----------|-------------|
| `-InstallCli` | Install/update CLI binary |
| `-Tool <name>` | Install tool config (claude, opencode, gemini, pi, wocoder, antigravity, codex, all) |
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
| `-Help` | Show help |

> **Note**: PowerShell uses full parameter names (no single-letter aliases). The underlying Deno script supports `-y`, `-n`, `-i`, `-l`, `-h` as aliases.

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
./packages/@aiengineeringharness/setup.sh all
```

## 📊 Real Stats

| Metric | Value |
|--------|-------|
| Total repo files | **51,033** (excluding node_modules) |
| SKILL.md files | **906** (81 canonical × 7 tools + 79 doc copies) |
| NPM packages published | **13** |
| AI coding tools supported | **7** |
| Subagents | **6** |
| Active developers | **4** (craig, tomas, andre, zerwiz) |
| Active tickets | **29+** (WOMONO, WOW, OPT namespaces) |
| Harness version | **1.6.1** |
| Files in harness | **1,226** |
| Files in docs | **173** |
| Files in thoughts | **115** |
| Dashboard version | **0.2.0** (Next.js 16) |
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
| **Gemini CLI** | Multimodal automation | [github.com/google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) |
| **Antigravity** | Agent-first autonomous platform | [antigravity.io](https://antigravity.io) |

### What's Inside

```
packages/@aiengineeringharness/     → 1,226 files
├── manifest.json                   # Source of truth (v1.3.0)
├── install.ts                      # Deno CLI installer
├── setup.sh                        # GNU Stow installer
├── scripts/                        # 14 pipeline scripts
├── opencode/    → ~/.config/opencode/  # 180 files, 91 SKILL.md
├── claude/      → ~/.claude/           # 167 files, 90 SKILL.md
├── gemini/      → ~/.gemini/           # 145 files, 90 SKILL.md
├── pi/          → ~/.pi/agent/         # 174 files, 85 SKILL.md
├── codex/       → ~/.codex/            # 186 files, 90 SKILL.md
├── antigravity/ → ~/.antigravity/      # 146 files, 89 SKILL.md
└── wocoder/     → ~/.wocoder/          # 182 files, 85 SKILL.md
```

### Shared Resources

- **906 SKILL.md files** — same 81 canonical skills adapted for all 7 tools
- **6 subagents** — codebase_analyzer, codebase_locator, codebase_pattern_finder, explore, general, thoughts_analyzer
- **13 NPM packages** — `@wayofmono/*` scope on [npmjs.com](https://www.npmjs.com/settings/wayofmono/packages)
- Ticket templates — WOW, OPT, WOMONO, GLOBAL namespaces
- TUI dashboard components
- Multi-format documentation (MDX, HTML, PDF, JSON)
- Mermaid TUI renderer (ASCII art diagrams)

### Skill Loading Paths

Each agent frontend loads skills from specific directories. The AI Engineering Harness installs skills to these locations:

| Tool | Global Skill Directory | Project-Local Skill Directory |
|------|------------------------|-------------------------------|
| **Wo Coder (wocode)** | `~/.wocoder/agent/skills/` | `.wo/agent/skills/` |
| **Pi** | `~/.pi/agent/skills/` | `.pi/agent/skills/` |
| **OpenCode** | `~/.config/opencode/skills/` | `.config/opencode/skills/` |
| **Claude Code** | `~/.claude/skills/` | `.claude/skills/` |
| **Gemini CLI** | `~/.gemini/skills/` | `.gemini/skills/` |
| **Codex** | `~/.codex/skills/` | `.codex/skills/` |
| **Antigravity** | `~/.antigravity/skills/` | `.antigravity/skills/` |

**Additional skill discovery:**
- All tools also discover skills from `~/.agents/skills/` (shared cross-tool location)
- Pi and wocode support adding custom paths via `settings.json` skills array
- CLI flags like `--skill <path>` allow ad-hoc skill loading

**Skill format:** Each skill is a directory containing `SKILL.md` (frontmatter + instructions) plus optional scripts, references, and assets.

### Per-Tool Skill Counts

| Tool | SKILL.md files | Total files |
|------|---------------|-------------|
| **OpenCode** | 91 | 180 |
| **Claude Code** | 90 | 167 |
| **Gemini CLI** | 90 | 145 |
| **Codex** | 90 | 186 |
| **Pi** | 85 | 174 |
| **Antigravity** | 89 | 146 |
| **Wo Coder** | 85 | 182 |

### Why Use the Harness

- **Interface-agnostic**: Core logic works everywhere
- **Zero duplication**: One codebase, infinite frontends
- **Easy updates**: `ai-harness --update` pulls the latest from upstream
- **GNU Stow ready**: Symlink-based installation for clean git updates

## 🦙 Prerequisites: Ollama

WayOfMono defaults to using Ollama for local-first AI. Ensure it is installed and running — **each command is a separate copy-paste**:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

```bash
ollama pull qwen3.5:9b
```
> This downloads the qwen3.5:9b model (about 5GB). It runs locally on your machine — no API keys needed.

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

### One-Command Agent Install (CI/scripts/one-time)

Run any of these directly without installing the CLI first — pick one per need:

**Install all tools:**
```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --tool=all --yes
```

**Install specific tool:**
```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --tool=claude --yes
```

**Update harness:**
```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --update
```

**Sync documentation:**

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --sync-docs
```

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --sync-docs --check
```

**Validate & maintenance:**

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --check
```

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --compliance
```

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --prune
```

**Report & import:**

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --report-skills
```

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --import-ref
```

**Repo mode & uninstall:**

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --mode=repo
```

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --uninstall=claude
```

```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --uninstall=all
```

**Help:**
```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --help
```

### Global CLI Install (Recommended for repeated use)

Install CLI once, then use `ai-harness` for everything — one copy-paste for install, then one per task:

**Step 1: Install CLI**
```bash
deno run -A https://raw.githubusercontent.com/Way-Of/wayofmono/main/packages/@aiengineeringharness/install.ts --install-cli
```

**Step 2: Install tools (pick one tool per copy-paste)**

```bash
ai-harness --tool=opencode
```

```bash
ai-harness --tool=claude
```

```bash
ai-harness --tool=pi
```

```bash
ai-harness --tool=gemini
```

```bash
ai-harness --tool=codex
```

```bash
ai-harness --tool=antigravity
```

```bash
ai-harness --tool=wocoder
```

```bash
ai-harness --tool=all --yes
```

**Step 3: Update & maintenance** — **each command is a separate copy-paste**

```bash
ai-harness --update
```

```bash
ai-harness --update --no-validate
```

```bash
ai-harness --update --skip-binary
```

```bash
ai-harness --check
```
> Shows updates like: `wocoder: UPDATE AVAILABLE v1.1.0 → v1.2.0`

```bash
ai-harness --compliance
```

```bash
ai-harness --prune
```

**Step 4: Reporting & sync** — **each command is a separate copy-paste**

```bash
ai-harness --report-skills
```

```bash
ai-harness --report-skills --report-url https://cto.wayof.work
```

```bash
ai-harness --sync-docs
```

```bash
ai-harness --sync-docs --check
```

```bash
ai-harness --import-ref
```

**Step 5: Repo mode & uninstall** — **each command is a separate copy-paste**

```bash
ai-harness --mode=repo --dest=~/.ai-engineering-harness
```

```bash
ai-harness --uninstall=claude
```

```bash
ai-harness --uninstall=all
```

**Step 6: Component selection** — **each command is a separate copy-paste**

```bash
ai-harness --tool=claude --dry-run
```

```bash
ai-harness --tool=claude --interactive
```

```bash
ai-harness --tool=claude --skill=agents
```

```bash
ai-harness --help
```

```bash
ai-harness --tool=claude --local --yes
```

### Quick Reference: All CLI Flags

| Flag | Alias | Description |
|------|-------|-------------|
| `--install-cli` | | Install/update CLI binary |
| `--tool=<name>` | | Install tool config (claude, opencode, gemini, pi, wocoder, antigravity, codex, all) |
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
| `--sync-docs` | | Sync canonical skills to all tool directories |
| `--report-skills` | | Report local skills to dashboard telemetry API |
| `--report-url=<url>` | | Dashboard URL for skill reporting |
| `--import-ref` | | Import ref skills/agents to all platforms |
| `--mode=<mode>` | | Show clone + stow instructions (repo) |
| `--dest=<path>` | | Clone destination for --mode=repo |
| `--skip-binary` | | Skip CLI binary update in --update |
| `--help` | `-h` | Show help |

### GNU Stow Mode (Symlink-based)

Each command separate copy-paste:

```bash
./packages/@aiengineeringharness/setup.sh all
```

```bash
./packages/@aiengineeringharness/setup.sh claude
```

```bash
./packages/@aiengineeringharness/setup.sh opencode
```

```bash
./packages/@aiengineeringharness/setup.sh gemini
```

```bash
./packages/@aiengineeringharness/setup.sh pi
```

```bash
./packages/@aiengineeringharness/setup.sh wocoder
```

```bash
./packages/@aiengineeringharness/setup.sh antigravity
```

```bash
./packages/@aiengineeringharness/setup.sh --restow
```

```bash
./packages/@aiengineeringharness/setup.sh --delete
```

```bash
./packages/@aiengineeringharness/setup.sh --dry-run
```

## 💻 Coding Assistant (wocode)

For automated engineering and refactoring. Installed as a **dev-dependency** (tool for engineers, not end-users).

**Local (project) install — npm:**

```bash
npm install --save-dev @wayofmono/wo-coding-agent
```

```bash
npx wocode --init
```

```bash
./wocode
```

```bash
# Update: pnpm update @wayofmono/wo-coding-agent
```

```bash
# Uninstall: npm uninstall @wayofmono/wo-coding-agent
```

**Local (project) install — pnpm:**

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
# Update: pnpm update @wayofmono/wo-coding-agent
```

```bash
# Uninstall: pnpm remove @wayofmono/wo-coding-agent
```

**Global install (cross-project):**

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
# Update: npm update -g @wayofmono/wo-coding-agent
```

```bash
# Uninstall: npm uninstall -g @wayofmono/wo-coding-agent
```

## 🤖 User Assistant (wouser)

For general use and SDK integration. Installed as a standard **dependency** (needed at runtime).

**Local (project) install — npm:**

```bash
npm install @wayofmono/wo-agent
```

```bash
npx wouser --init
```

```bash
./wouser
```

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

All **13** packages published under `@wayofmono` scope at [npmjs.com/settings/wayofmono](https://www.npmjs.com/settings/wayofmono/packages).

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

| Package | Description | npm |
|---------|-------------|-----|
| [@wayofmono/wo-ai](https://www.npmjs.com/package/@wayofmono/wo-ai) | Multi-Provider LLM API (OpenAI, Anthropic, Gemini) | `npm install @wayofmono/wo-ai` |
| [@wayofmono/wo-tui](https://www.npmjs.com/package/@wayofmono/wo-tui) | High-Performance Terminal UI Library | `npm install @wayofmono/wo-tui` |
| [@wayofmono/wo-agent-core](https://www.npmjs.com/package/@wayofmono/wo-agent-core) | Central Agent Runtime & Extension API | `npm install @wayofmono/wo-agent-core` |
| [@wayofmono/wo-agent](https://www.npmjs.com/package/@wayofmono/wo-agent) | General-Purpose Agent SDK & CLI (**wouser**) | `npm install @wayofmono/wo-agent` |
| [@wayofmono/wo-coding-agent](https://www.npmjs.com/package/@wayofmono/wo-coding-agent) | CLI Coding Agent (**wocode**) | `npm install @wayofmono/wo-coding-agent` |
| [@wayofmono/wo-skill-docs](https://www.npmjs.com/package/@wayofmono/wo-skill-docs) | Multi-format Documentation Expert | `npm install @wayofmono/wo-skill-docs` |
| [@wayofmono/wo-mermaid](https://www.npmjs.com/package/@wayofmono/wo-mermaid) | TUI Mermaid Renderer (ASCII art) | `npm install @wayofmono/wo-mermaid` |
| [@wayofmono/web-access](https://www.npmjs.com/package/@wayofmono/web-access) | Web search, URL fetching, GitHub cloning, PDF/YouTube extraction | `npm install @wayofmono/web-access` |
| [@wayofmono/lens](https://www.npmjs.com/package/@wayofmono/lens) | Codebase Analysis & Safety Engine | `npm install @wayofmono/lens` |
| [@wayofmono/wo-web-ui](https://www.npmjs.com/package/@wayofmono/wo-web-ui) | Web UI Components (React 19) | `npm install @wayofmono/wo-web-ui` |
| [@wayofmono/telemetry](https://www.npmjs.com/package/@wayofmono/telemetry) | Telemetry and metrics | `npm install @wayofmono/telemetry` |
| [@wayofmono/telegram](https://www.npmjs.com/package/@wayofmono/telegram) | Telegram bot integration | `npm install @wayofmono/telegram` |
| [@wayofmono/whatsapp](https://www.npmjs.com/package/@wayofmono/whatsapp) | WhatsApp bot integration | `npm install @wayofmono/whatsapp` |

## 📊 CTO Dashboard

Production dashboard at **[https://cto.wayof.work](https://cto.wayof.work)** (v0.2.0, Next.js 16, Prisma/SQLite).

### Features

| View | Description |
|------|-------------|
| **Overview** | Ticket stats, velocity, blockers |
| **Tickets** | Full Kanban with filters, review queue |
| **Standup** | Daily check-ins (yesterday/today/blockers) |
| **Skills** | Real-time skill health across all machines |
| **Ideas** | Prioritized idea board with voting |
| **Developers** | Workflow and assignment tracking |
| **Docs** | Architecture docs and decision records |

### Run Locally (each command separate copy-paste)

```bash
cd ui && pnpm install && pnpm dev
```

```bash
./scripts/dev-dashboard.sh
```

```bash
./scripts/dev-dashboard.sh 4000
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api` | List tickets, developers, docs |
| POST | `/api/ideas` | Create new idea |
| POST | `/api/standup` | Create standup entry |
| POST | `/api/news` | Create news item |
| GET | `/api/news` | List news items |
| GET | `/api/skills/report` | Skills health report |
| POST | `/api/skills/report` | Submit skills report |

## 🔧 Pipeline Tools (each command separate copy-paste)

```bash
ai-harness --sync-docs
```

```bash
ai-harness --sync-docs --check
```

```bash
deno run -A packages/@aiengineeringharness/scripts/compliance-check.ts
```

```bash
deno run -A packages/@aiengineeringharness/scripts/migrate-tickets.ts
```

```bash
deno run -A packages/@aiengineeringharness/scripts/import-ref-skills.ts
```

```bash
npx tsx scripts/stats.ts
```

| Tool | Location | Purpose |
|------|----------|---------|
| `docs-sync.ts` | `packages/@aiengineeringharness/scripts/` | Sync canonical skills → per-tool copies |
| `compliance-check.ts` | `packages/@aiengineeringharness/scripts/` | Validate frontmatter & naming conventions |
| `migrate-tickets.ts` | `packages/@aiengineeringharness/scripts/` | Migrate ticket namespaces (PROJ → WOMONO) |
| `import-ref-skills.ts` | `packages/@aiengineeringharness/scripts/` | Import reference skills from docs/ |
| `stats.ts` | `scripts/stats.ts` | Count lines per package |

## 🧠 f-rr-d Context Engineering

Centralized thoughts repository at [github.com/Way-Of/f-r-r-d](https://github.com/Way-Of/f-r-r-d) — **115 files** across 3 namespaces.

### How it works

- **Clone on init**: `ai-harness --init` clones f-rr-d into `thoughts/`
- **Project-scoped**: WayOfMono tickets live in `thoughts/wayofmono/shared/tickets/` (WOMONO-XXX namespace)
- **Multi-project**: WoW (`thoughts/wow/`, WOW-XXX) and Opticat (`thoughts/opticat/`, OPT-XXX) share the same repo
- **Pull before read, push after write**: All harness skills auto-sync with f-rr-d
- **Branch naming**: `<project-slug>/<namespace>/<ticket-id>-<short-desc>` (e.g., `wayofmono/womono/WOMONO-001-centralized-repo`)

### Structure

```
thoughts/
├── global/                    # Cross-project concerns
├── wayofmono/                 # WOMONO-XXX (WayOfMono)
│   ├── shared/tickets/        # 17+ WOMONO tickets
│   ├── shared/plans/
│   ├── shared/research/
│   ├── craig/                 # 5 WOMONO tickets assigned
│   ├── tomas/                 # 1 WOMONO ticket
│   ├── andre/                 # 1 OPT ticket
│   └── zerwiz/                # 1 WOMONO + 1 WOW ticket
├── wow/                       # WOW-XXX (WayOfWork)
│   ├── shared/tickets/
│   ├── andre/, craig/, tomas/, zerwiz/
└── opticat/                   # OPT-XXX (Opticat)
    ├── shared/tickets/
    └── andre/, craig/, tomas/, zerwiz/
```

Config: `.wo/config/harness.json` stores `f_rrd_url` and `project_slug` for the harness.

### Workflow Pattern

```
Ticket → /create_plan → /implement_plan → /validate_plan → /validate_telemetry → /commit
```

### Slash Commands

| Command | Description |
|---------|-------------|
| `/init_harness` | Initialize harness (project memory + thoughts/) |
| `/create_plan` | Generate implementation plan from ticket |
| `/implement_plan` | Execute approved plan phase-by-phase |
| `/validate_plan` | Verify implementation against plan |
| `/validate_telemetry` | Validate local telemetry against narrative spec |
| `/commit` | Create well-structured git commits |
| `/debug` | Investigate issues during testing |
| `/sync skills` | Sync all skills to all frontends |
| `/help` | Unified help system |

## 🎛️ AI Engineering Harness

Shared agents, commands, skills, and extensions for all 7 agent frontends. Install once and instantly configure any agent with battle-tested prompts and workflows. See the comprehensive [AI Engineering Harness Tutorial](https://github.com/Way-Of/wayofmono/tree/main/docs/ai-engineering-harness-tutorial.md) for step-by-step instructions on utilizing the agents, commands, and skills.

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

### Stack

- **Podman** + `podman-compose` on the server
- **Devbox** (reproducible shell environment)
- **cloudflared** tunnel for `cto.wayof.work`
- **Caddy** reverse proxy
- **Next.js** application server

### Deploy (each command separate copy-paste)

```bash
./scripts/deploy-dashboard.sh
```

```bash
cd ui && podman-compose up --build -d
```

```bash
curl https://cto.wayof.work/api/health
```

```bash
podman-compose logs -f
```

```bash
sudo cp ui/docker/wayofmono-dashboard.service /etc/systemd/system/
```

```bash
sudo systemctl enable --now wayofmono-dashboard
```

### Deploy Script Details

The `deploy-dashboard.sh` script (55 lines):

1. Detects compose: `podman-compose` > `podman compose` > `docker-compose` > `docker compose`
2. Runs `git pull` for latest code
3. Creates `.env` if missing (default: `DATABASE_URL=file:../db/custom.db`)
4. Runs `$COMPOSE_CMD up --build -d`
5. Polls `http://localhost:81/api/health` every 5s for 60s
6. Shows last 5 log lines from `nextjs` on success

### Dev Script Details

The `dev-dashboard.sh` script (32 lines):

1. Optional PORT argument (default 3000)
2. `bun install` in ui/
3. Starts `bun run dev` in background
4. Waits up to 30s for server ready
5. Opens browser via `xdg-open` / `sensible-browser`

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
        run: deno run -A packages/@aiengineeringharness/scripts/docs-sync.ts --check | grep -q "Would sync: 0" || (echo "Canonical skills out of sync. Run: deno run -A packages/@aiengineeringharness/scripts/docs-sync.ts" && exit 1)
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

```bash
pnpm -r test
```

```bash
ai-harness --sync-docs --check
```

```bash
pnpm -r --parallel typecheck
```

```bash
curl https://cto.wayof.work/api/health
```

```bash
cd ui && pnpm build
```

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
│   │   ├── gemini/      → ~/.gemini/             # 145 files
│   │   ├── pi/          → ~/.pi/agent/           # 174 files
│   │   ├── codex/       → ~/.codex/              # 186 files
│   │   ├── antigravity/ → ~/.antigravity/        # 146 files
│   │   └── wocoder/     → ~/.wocoder/            # 182 files
│   │
│   ├── @wayofmono/                 # 13 NPM packages
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
│   └── ui/                         # CTO Dashboard (v0.2.0, 131 source files)
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

All deployments include: Content Security Policy, X-Frame-Options, X-Content-Type-Options, Referrer Policy

### Scanning (each command separate copy-paste)

```bash
pnpm audit
```

```bash
pnpm run security:check
```

## 🌐 Multi-Platform Support

| Platform | Deno Install | Level |
|----------|-------------|-------|
| **Windows** | `irm https://deno.land/install.ps1 | iex` | Full |
| **macOS** | `brew install deno` | Full |
| **Linux** | `curl -fsSL https://deno.land/install.sh | sh` | Full |
| **WSL/Git Bash** | `apt install deno` | Full |

## 🤝 Contributing (each command separate copy-paste)

```bash
git clone https://github.com/Way-Of/wayofmono.git
```

```bash
git checkout -b feat/your-feature
```

```bash
pnpm install
```

```bash
pnpm -r test
```

```bash
pnpm -r --parallel typecheck
```

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
