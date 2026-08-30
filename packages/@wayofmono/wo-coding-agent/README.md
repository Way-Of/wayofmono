# @wayofmono/wo-coding-agent

A powerful AI coding assistant CLI with read, bash, edit, and write tools. Designed to be a project-local developer tool that lives where your code lives.

## 🚀 Flawless Getting Started

```bash
pnpm add -D @wayofmono/wo-coding-agent
pnpm exec wocode --init
./wocode
```

## Features

- **File Operations**: Intelligent read, write, and edit tools.
- **Shell Execution**: Execute bash commands and process output.
- **Plan Mode**: Generate implementation plans before making changes.
- **Session Management**: Resume previous coding sessions or fork them.
- **Advanced Context**: Automatically manages context tokens and compaction.
- **Visual Synthesis**: Render Mermaid diagrams directly in your terminal.

## 🦙 Prerequisites: Ollama

`wocode` defaults to using **Ollama** for local-first AI. Ensure it is installed and running:
1.  **Install:** `curl -fsSL https://ollama.com/install.sh | sh`
2.  **Pull Model:** `ollama pull qwen3.5:9b`

## 📂 Project Isolation (.wo/)

The `--init` command sets up a project-local `.wo` directory. All session data, configuration (`models.json`), and tools stay inside your project. No global state pollution.

---
*Part of the WayOfMono high-performance coding agent ecosystem.*
