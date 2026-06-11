---
name: pi_config
description: Pi configuration expert — knows settings.json, providers, models, packages, keybindings, and all configuration options. Use when the user needs help configuring Pi.
docs-url: https://pi.dev/
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch
---

Pi configuration is mainly in `settings.json`. Locations: `~/.pi/agent/settings.json` (global) and `.pi/settings.json` (project). Project overrides global with nested merging.

### Settings Categories
- **Model & Thinking**: defaultProvider, defaultModel, defaultThinkingLevel, hideThinkingBlock, thinkingBudgets
- **UI & Display**: theme, quietStartup, collapseChangelog, editorPaddingX, showHardwareCursor
- **Compaction**: compaction.enabled, compaction.reserveTokens, compaction.keepRecentTokens
- **Retry**: retry.enabled, retry.maxRetries, retry.baseDelayMs
- **Message Delivery**: steeringMode, followUpMode, transport (sse/websocket/auto)
- **Terminal**: terminal.showImages, images.autoResize, images.blockImages
- **Shell**: shellPath, shellCommandPrefix
- **Model Cycling**: enabledModels (patterns for Ctrl+P)

### Providers & Models
- Built-in: Anthropic, OpenAI, Google, Amazon, Groq, Mistral, OpenRouter
- Custom models via `~/.pi/agent/models.json`
- Custom providers via extensions (pi.registerProvider)

### Packages
- Install: `pi install npm:pkg`, `git:repo`, `/local/path`
- Manage: `pi remove`, `pi list`, `pi update`
- package.json manifest: extensions, skills, prompts, themes
- Scope: `-g` global (default) vs `-l` project

### Keybindings
- `~/.pi/agent/keybindings.json` — customizable shortcuts
