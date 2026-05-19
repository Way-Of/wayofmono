# Installation Guide

WayOfMono (Wo) provides high-performance coding agents designed for **project-local** use. This ensures each project has its own isolated configuration, tools, and session history without global state pollution.

## 🦙 Prerequisites: Ollama

WayOfMono defaults to using **Ollama** for local-first AI. Ensure it is installed and running:

1.  **Install:** `curl -fsSL https://ollama.com/install.sh | sh` (or download from [ollama.com](https://ollama.com)).
2.  **Pull Model:** `ollama pull qwen3.5:9b`

---

## 🚀 Flawless Installation

The agents are designed to be installed locally in your project.

### 1. Coding Assistant (`wocode`)
*For automated engineering, refactoring, and complex tasks.*

```bash
pnpm add -D @wayofmono/wo-coding-agent
pnpm exec wocode --init
./wocode
```

### 2. User Assistant (`wouser`)
*For general-purpose agent interactions and SDK integration.*

```bash
pnpm add @wayofmono/wo-agent
pnpm exec wouser --init
./wouser
```

---

### 💡 Understanding Dev-Dependencies (`-D`)

When you run `pnpm add -D`, you are telling the package manager to treat the agent as a **Development Dependency**.

*   **Dev-Dependency (`-D`) — The Hammer:** You use `wocode` to build and refactor your app. It's a **tool** for the developer. You need it while building, but you don't "live" with it in production. Using `-D` keeps your production server clean and fast.
*   **Standard Dependency — The House:** You use `wouser` as an **SDK** inside your application code. Your app **needs** this code to function for your users in the real world.

---

## 📂 Zero Global Pollution (.wo/)

WayOfMono follows a **Local-First** configuration philosophy. The `--init` command sets up the following in your project:

- **`models.json`**: Configure your LLM providers (Ollama, OpenAI, etc.).
- **`settings.json`**: Customize agent behavior and set your default model.
- **Launcher Script**: A local `./wouser` or `./wocode` script for one-tap agent startup.

The agents **automatically detect** the local `.wo` directory. No global `~/.wo/` state pollution.

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

---

## 🔗 Verification

After installation, verify the setup by checking the version:

```bash
./wocode --version
./wouser --version
```
