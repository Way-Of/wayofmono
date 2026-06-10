# Pi Templates Library

This directory serves as the primary reference library for the Pi Coding Agent ecosystem. It contains high-quality templates and reference implementations for all major Pi components.

The **Pi Pi** meta-agent (`.pi/agents/pi-pi/`) uses these templates to research and build new capabilities.

## Directory Structure

| Category | Path | Description |
|----------|------|-------------|
| **Agents** | [`agents/`](agents/) | Persona definitions (.md) with system prompts and frontmatter |
| **Extensions** | [`extensions/`](extensions/) | Custom tools, commands, and event handlers (.ts) |
| **Skills** | [`skills/`](skills/) | Multi-file capability packages with `SKILL.md` (50+ domains) |
| **Themes** | [`themes/`](themes/) | JSON color configurations with 51 tokens |
| **Prompts** | [`prompt-templates/`](prompt-templates/) | Positional argument based command templates (.md) |

---

## 1. Agent Templates (`agents/`)

Contains persona definitions for various specialized roles. These are used as blueprints when creating new project-specific agents.

*   **Core Blueprints:** `generic-agent.md`, `coding-agent.md`, `research-agent.md`, `expert-agent.md`
*   **Specialists:** `accessibility-agent.md`, `design-agent.md`, `seo-agent.md`, `marketing-agent.md`, `netlify-agent.md`
*   **Utilities:** `agent-with-memory.md`, `indexer.md`, `scout.md`, `planner.md`, `reviewer.md`

---

## 2. Extension Templates (`extensions/`)

TypeScript boilerplate for building the five primary types of Pi extensions.

*   `basic-tool.ts`: Creating new LLM-accessible tools via `pi.registerTool()`
*   `event-handler.ts`: Intercepting lifecycle events (e.g., `before_agent_start`)
*   `custom-command.ts`: Registering `/commands` with the Pi CLI
*   `ui-widget.ts`: Building terminal widgets and footers using the TUI API
*   `plan-mode.ts`: Implementation of strategy-first workflows

---

## 3. Skill Templates (`skills/`)

Self-contained capability packages. Over 50 domain-specific skills including:

*   **Engineering:** `code-review`, `browser-automation`, `fullstack-dev`, `shader-extraction`
*   **Research:** `web-research`, `academic-search`, `market-research`, `ai-news`
*   **Content:** `blog-writing`, `seo-writing`, `doc-generator`, `storyboard`
*   **Utilities:** `ffmpeg`, `pdf`, `image-analysis`, `spreadsheet-processing`

---

## 4. Theme Templates (`themes/`)

Reference JSON files for creating custom color schemes.

*   `dark-theme.json`: Standard dark mode reference
*   `light-theme.json`: Standard light mode reference
*   `nord-theme.json`: Example of a palette-based theme using `vars`

---

## 5. Prompt Templates (`prompt-templates/`)

Positional argument templates that provide reusable `/commands`.

*   `review.md`: Boilerplate for code review prompts
*   `component.md`: Structure for generating UI components
*   `explain.md`: Patterns for explaining complex logic

---

## Usage with Pi Pi

The **Pi Pi** meta-agent and its experts (`agent-expert`, `skill-expert`, etc.) are configured to search these directories first when asked to "build" or "create" something. 

To use a template manually, copy the desired file to its respective project directory (e.g., `.pi/agents/` or `.pi/extensions/`) and modify it to suit your needs.

---

**Version**: 1.0.0 | **Last Updated**: 2026-05-05
