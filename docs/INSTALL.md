# Installation Guide

WayOfMono provides multiple installation paths depending on your preferred toolchain and environment.

## 1. Unified Harness CLI (Recommended)

Our main installation method uses the **AI Engineering Harness** installer (Deno-based). This allows you to configure multiple tools (Claude, OpenCode, Gemini, Pi) with a single command.

### Prerequisites
- [Deno](https://deno.com/)

### One-Time Setup
```bash
deno install -Agf -n ai-harness \
  https://raw.githubusercontent.com/zerwiz/wayofmono/main/pi/install.ts
```

### Install Tool Configs
```bash
ai-harness --tool=pi              # Pi-specific configs
ai-harness --tool=gemini          # Gemini CLI configs
ai-harness --tool=opencode        # OpenCode configs
ai-harness --tool=claude          # Claude Code configs
ai-harness --tool=all             # Install all four
```

---

## 2. Platform-Specific Installation

### For Pi Users
You can install our custom packages and agents directly into your Pi environment.

```bash
# Install the core monorepo package
pi install @wayofmono/core

# Install specific components
pi install @wayofmono/rpiv-todo
pi install @wayofmono/web-access
```

### For Node.js / NPM Users
All WayOfMono packages are available on the internal registry.

```bash
# Global installation
npm install -g @wayofmono/pi-coding-agent

# Local project installation
npm install @wayofmono/telemetry @wayofmono/lens
```

---

## 3. Alternative: Direct Repo Mode (GNU Stow)

For power users who want to keep the repository locally and symlink configurations (ideal for continuous updates via git pull).

### Prerequisites
- [GNU Stow](https://www.gnu.org/software/stow/)

### Setup
```bash
git clone https://github.com/zerwiz/wayofmono
cd wayofmono

./setup.sh pi         # Symlinks to ~/.pi/agent/
./setup.sh gemini     # Symlinks to ~/.gemini/
./setup.sh opencode   # Symlinks to ~/.config/opencode/
./setup.sh claude     # Symlinks to ~/.claude/
./setup.sh all        # Symlinks all tools
```

### Updating
```bash
git pull
./setup.sh all --restow
```

---

## 4. Verification

After installation, verify the setup by running the `init_harness` command in any project directory:

- **Pi:** `/init_harness`
- **Gemini:** `/init_harness` (triggers `init_harness.toml`)
- **OpenCode:** `/init_harness`

This will verify your directory structure and deploy the necessary steering files (`GEMINI.md` or `AGENTS.md`).
