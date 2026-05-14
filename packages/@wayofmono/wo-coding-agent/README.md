# @wayofmono/wo-coding-agent

A powerful AI coding assistant CLI with read, bash, edit, and write tools.

## Installation

```bash
pnpm add @wayofmono/wo-coding-agent
```

## CLI Usage (`wocode`)

Once installed, you can use the `wocode` command:

```bash
pnpm exec wocode "Refactor the authentication logic in src/auth.ts"
```

## Features

- **File Operations**: Intelligent read, write, and edit tools.
- **Shell Execution**: Execute bash commands and process output.
- **Plan Mode**: Generate implementation plans before making changes.
- **Session Management**: Resume previous coding sessions or fork them.
- **Advanced Context**: Automatically manages context tokens and compaction.

## Getting Started

```bash
# Initialize wocode in your project
pnpm exec wocode --init

# Start a coding session
pnpm exec wocode "Fix the bug in the parser"
```
