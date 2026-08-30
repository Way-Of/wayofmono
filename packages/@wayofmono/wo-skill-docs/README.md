# @wayofmono/wo-skill-docs

The Supercharged Documentation Engineering Skill for WayOfMono agents. This package transforms any Wo agent into a senior technical writer capable of generating high-fidelity documentation in multiple formats.

## 🚀 Features

- **Multi-Format Support**: Generate Markdown, PDF, Word (DOCX), HTML, and TXT.
- **AI-Powered API Extraction**: Automatically extracts technical details, types, and JSDoc from TypeScript/JavaScript source code.
- **Flawless Formatting**: Enforces technical writing best practices and perfectly rendered code blocks.
- **Automation Scripts**: Includes built-in scripts for technical extraction and document conversion.

## 📦 Installation

This skill is designed to be installed project-locally.

```bash
pnpm add -D @wayofmono/wo-skill-docs
```

## 🛠️ Usage

Once installed, trigger the skill in your Wo agent:

```bash
/skill docs
```

The agent will then provide specialized commands and workflows for:
- Creating high-fidelity READMEs.
- Generating API reference documentation.
- Building architecture guides with Mermaid diagrams.
- Converting Markdown to PDF/Word for formal delivery.

## 📋 Automation Scripts

The package includes powerful scripts that can be used by the agent:
- `api-extractor.ts`: Uses the TypeScript Compiler API for deep symbol analysis.
- `converter.ts`: Handles multi-format document conversion (requires `pandoc` for PDF/Word).

---
*Built for the next generation of AI-native documentation.*
