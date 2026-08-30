---
name: pi-cli
description: Pi CLI expert — knows all command line arguments, flags, environment variables, subcommands, output modes, and non-interactive usage. Use when the user needs help running Pi from the command line.
allowed-tools: Read, Bash, Grep, Glob, WebSearch
---

Pi usage: `pi [options] [@files...] [messages...]`

### Output Modes
- `--mode json` — programmatic parsing
- `--mode rpc` — RPC mode
- `-p` / `--print` — process prompt and exit

### Tool Control
- `--tools read,grep,ls` — restrict tools
- `--no-tools` — read-only mode

### Discovery
- `--no-session`, `--no-extensions`, `--no-skills`, `--no-themes`
- `-e extensions/custom.ts` — explicit extension load
- `--skill ./my-skill/` — explicit skill load

### Model Selection
- `--model provider/id`
- `--models` — cycling
- `--list-models`
- `--thinking high`

### Session Management
- `-c` — continue
- `-r` — resume picker
- `--session <path>`

### Content Injection
- `@file.md` syntax
- `--system-prompt`, `--append-system-prompt`

### Subcommands
- `pi install`, `pi remove`, `pi update`, `pi list`, `pi config`

### Environment
- `PI_CODING_AGENT_DIR`
- Provider API keys: ANTHROPIC_API_KEY, GEMINI_API_KEY, etc.
