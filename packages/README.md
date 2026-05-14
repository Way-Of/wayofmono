# WayOfMono Packages

This directory contains the self-sufficient, folder-contained building blocks of the WayOfMono ecosystem. 

## 🏗️ Folder-Contained Philosophy
Every package in this directory is **flawlessly self-sufficient**. All source code, automation scripts, and metadata needed for the package to run live directly within its specific folder. This ensures that users can download a single folder and have everything they need to run the agent's skills and tools.

## 📦 Core Agents & SDKs

| Package | Description | Installation |
|---------|-------------|--------------|
| [`@wayofmono/wo-coding-agent`](./@wayofmono/wo-coding-agent) | The `wocode` CLI for automated engineering and refactoring. | `pnpm add -D @wayofmono/wo-coding-agent` |
| [`@wayofmono/wo-agent`](./@wayofmono/wo-agent) | The `wouser` CLI and general-purpose Agent SDK. | `pnpm add @wayofmono/wo-agent` |
| [`@wayofmono/wo-agent-core`](./@wayofmono/wo-agent-core) | Core runtime, transport, and state management logic. | `pnpm add @wayofmono/wo-agent-core` |

## 🛠️ Specialized Skills (Contained & Powerful)

| Package | Description | Installation |
|---------|-------------|--------------|
| [`@wayofmono/wo-skill-docs`](./@wayofmono/wo-skill-docs) | **Supercharged Documentation Expert**. Folder-contained scripts for PDF, Word, HTML, and API Extraction. | `pnpm add -D @wayofmono/wo-skill-docs` |

## 🔌 UI & Utilities

| Package | Description | Installation |
|---------|-------------|--------------|
| [`@wayofmono/wo-ai`](./@wayofmono/wo-ai) | Unified Multi-Provider LLM API. | `pnpm add @wayofmono/wo-ai` |
| [`@wayofmono/wo-tui`](./@wayofmono/wo-tui) | High-performance Terminal UI component library. | `pnpm add @wayofmono/wo-tui` |
| [`@wayofmono/wo-web-ui`](./@wayofmono/wo-web-ui) | React components for web-based agent interfaces. | `pnpm add @wayofmono/wo-web-ui` |
| [`@wayofmono/telemetry`](./@wayofmono/telemetry) | OpenTelemetry instrumentation for ODD workflows. | `pnpm add @wayofmono/telemetry` |
| [`@wayofmono/lens`](./@wayofmono/lens) | High-fidelity codebase analysis and safety engine. | `pnpm add @wayofmono/lens` |

## 🚀 How to use
Users can download and install any of these packages to extend their `wouser` or `wocode` agents. 

Once installed project-locally, agents will automatically discover the skills and tools provided by these packages because they are fully contained within their respective `node_modules` folders.
