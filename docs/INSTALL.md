# Installation Guide

WayOfMono (Wo) provides high-performance coding agents designed for **project-local** use. This ensures each project has its own isolated configuration, tools, and session history without global state pollution.

## 🚀 Recommended: Local Project Installation

The agents are designed to be installed as dev-dependencies in your project.

### 1. Coding Agent (`wocode`)
Best for automated codebase modifications, refactoring, and complex engineering tasks.

```bash
# Install as dev dependency
pnpm add -D @wayofmono/wo-coding-agent

# Run the agent
pnpm exec wocode "Describe the architecture of this project"
```

### 2. User Agent (`wouser`)
A general-purpose agent SDK and CLI for building AI-powered applications.

```bash
# Install as dependency
pnpm add @wayofmono/wo-agent

# Run the CLI
pnpm exec wouser "Hello! How can you help me today?"
```

---

## 📂 Zero Global Pollution (.wo/)

WayOfMono follows a **Local-First** configuration philosophy. Everything the agent needs is stored within your project directory:

- **Configuration**: Local `models.json` and `settings.json` live in `.wo/`.
- **Sessions**: All conversation history is saved in `.wo/sessions/`.
- **Tools**: Extension tools and binaries are isolated in `.wo/tools/` and `.wo/bin/`.

The agents **automatically detect** a local `.wo` directory in your current path or any parent directory. If found, they will use it as the root for all configuration and state.

**Tip:** Add `.wo/` to your `.gitignore` to keep your repo clean while maintaining local state, or track it if you want to share agent context with your team.

---

## 🛠️ Monorepo Development

If you are contributing to WayOfMono or building it from source:

```bash
# Clone the repository
git clone https://github.com/zerwiz/wayofmono.git
cd wayofmono

# Install dependencies
pnpm install

# IMPORTANT: Build all packages
pnpm build
```

After building, you can test the local versions using the launcher scripts in the `test/` directory:
- `test/coding-agent/wocode`
- `test/user-agent/wouser`

---

## 🎛️ Manual Environment Overrides

While the agents are "local-first," you can manually override the configuration directory using environment variables if needed:

- `WO_CODING_AGENT_DIR`: Set the root directory for configuration and state (defaults to `./.wo` or `~/.wo/agent`).
- `WO_CODING_AGENT_SESSION_DIR`: Set a specific directory for session storage.

---

## 🔗 Verification

After installation, verify the setup by checking the version:

```bash
pnpm exec wocode --version
pnpm exec wouser --version
```
