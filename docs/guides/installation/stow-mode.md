# GNU Stow Installation

Symlink-based installation for clean git updates (macOS/Linux only).

## Prerequisites

```bash
# Ubuntu/Debian
sudo apt install stow

# macOS
brew install stow
```

## Usage

```bash
# Install all tools via stow
./packages/@aiengineeringharness/setup.sh all

# Install specific tool via stow
./packages/@aiengineeringharness/setup.sh claude
./packages/@aiengineeringharness/setup.sh opencode
./packages/@aiengineeringharness/setup.sh gemini
./packages/@aiengineeringharness/setup.sh pi
./packages/@aiengineeringharness/setup.sh wocoder
./packages/@aiengineeringharness/setup.sh antigravity

# Stow management
./packages/@aiengineeringharness/setup.sh --restow
./packages/@aiengineeringharness/setup.sh --delete
./packages/@aiengineeringharness/setup.sh --dry-run
```

## How It Works

Stow creates symlinks from the harness repo to your config directories:

```
~/.config/opencode/skills/create_plan → /path/to/wayofmono/packages/@aiengineeringharness/opencode/skills/create_plan
```

Benefits:
- **Clean updates** — `git pull` in repo updates all tools instantly
- **No file copying** — Symlinks only
- **Easy rollback** — `git checkout` previous version
- **Single source** — One repo, multiple tool configs

## Directory Structure

```
packages/@aiengineeringharness/
├── opencode/    → ~/.config/opencode/
├── claude/      → ~/.claude/
├── gemini/      → ~/.gemini/
├── pi/          → ~/.pi/agent/
├── codex/       → ~/.codex/
├── antigravity/ → ~/.antigravity/
└── wocoder/     → ~/.wocoder/
```

## Commands

| Command | Description |
|---------|-------------|
| `setup.sh all` | Stow all 7 tools |
| `setup.sh <tool>` | Stow specific tool |
| `setup.sh --restow` | Re-stow (fix broken links) |
| `setup.sh --delete` | Remove all stow symlinks |
| `setup.sh --dry-run` | Preview without changes |

## Custom Destination

```bash
# Custom config directory
./packages/@aiengineeringharness/setup.sh all --dest=~/.my-configs
```

## Troubleshooting

**Broken symlinks after repo move:**
```bash
./packages/@aiengineeringharness/setup.sh --restow
```

**Permission denied:**
```bash
chmod +x packages/@aiengineeringharness/setup.sh
```

**Conflicting existing files:**
```bash
# Backup first, then use --delete and re-stow
./packages/@aiengineeringharness/setup.sh --delete
./packages/@aiengineeringharness/setup.sh all
```

## Related

- [CLI Reference](../installation/cli-reference.md)
- [One-Command Install](../installation/one-command.md)
- [AI Engineering Harness](../ai-harness/)