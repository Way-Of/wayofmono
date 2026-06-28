# @wayofmono/wo-agent

The Agent SDK for building AI-powered applications, including the `wouser` CLI. Designed to be embedded as a standard dependency or used as a general-purpose agent.

## 🚀 Flawless Getting Started

```bash
pnpm add @wayofmono/wo-agent
pnpm exec wouser --init
./wouser
```

## Features

- **Agent SDK**: Create and manage AI agent sessions with ease.
- **wouser CLI**: A user-facing CLI for interacting with agents.
- **Extensible**: Easily add custom tools and extensions.
- **Documentation Expert**: Use `/skill docs` to generate PDF, Word, and Markdown.
- **Visual Synthesis**: Render Mermaid diagrams directly in your terminal.

## 🦙 Prerequisites: Ollama

`wouser` defaults to using **Ollama** for local-first AI. Ensure it is installed and running:
1.  **Install:** `curl -fsSL https://ollama.com/install.sh | sh`
2.  **Pull Model:** `ollama pull qwen3.5:9b`

## 📂 Project Isolation (.wo/)

The `--init` command sets up a project-local `.wo` directory. All session data, configuration (`models.json`), and skills stay inside your project. No global state pollution.

## 🧠 Resource Management (Skills, Agents, Extensions)

Skills, agents, and extensions are all loaded from npm packages as project dependencies. No file copying, no global state. Tracked in `.wo/manifest.json`.

### Install a skill

```bash
# First install the npm package
npm install @wayofmono/skill-investor-ready-doc-gen

# Then register it with wouser
wouser skill install npm:@wayofmono/skill-investor-ready-doc-gen
```

Short form (auto-resolves under @wayofmono scope):
```bash
wouser skill install investor-ready-doc-gen
```

### Agents and Extensions

Same pattern for agents and extensions:

```bash
# Install an agent package
npm install @wayofmono/agent-expert-coder
wouser agent install npm:@wayofmono/agent-expert-coder

# Install an extension package
npm install @wayofmono/extension-web-search
wouser extension install npm:@wayofmono/extension-web-search
```

### List registered resources

```bash
wouser skill list
wouser agent list
wouser extension list
```

### Discover unregistered resources in node_modules

```bash
wouser skill discover
wouser agent discover
wouser extension discover
```

### Update (re-read after npm update)

```bash
# All registered resources of a type
wouser skill update
wouser agent update
wouser extension update

# A specific resource
wouser skill update investor-ready-doc-gen
```

### Remove a resource

```bash
wouser skill remove investor-ready-doc-gen
wouser agent remove expert-coder
wouser extension remove web-search
```

---
*Part of the WayOfMono high-performance coding agent ecosystem.*
