# Packages Documentation

WayOfMono follows a modular, package-based architecture aligned with the **Pi Agent Core** philosophy. Our \`packages/\` directory is designed to house both our custom logic and consolidated features from reference projects.

## Core Framework Packages (Pi-Aligned)

These packages provide the foundational runtime and abstractions, mirroring the official [\`earendil-works/pi-mono\`](https://github.com/earendil-works/pi-mono) structure.

- **\`@wayofmono/pi-ai\`**: A unified multi-provider LLM API. It abstracts interactions with OpenAI, Anthropic, Google, and others, providing a consistent interface for agent reasoning.
- **\`@wayofmono/pi-agent-core\`**: The central runtime. Responsible for the agent loop, state management, tool invocation, and decision-making logic.
- **\`@wayofmono/pi-tui\`**: A high-performance Terminal UI library utilizing differential rendering to ensure a smooth, high-velocity experience for power users.
- **\`@wayofmono/pi-web-ui\`**: A set of web components for building browser-based agent interfaces.

## Implementation Packages

- **\`@wayofmono/pi-coding-agent\`**: The primary CLI entry point (the \`pi\` command), providing the interactive terminal harness for developers.
- **\`@wayofmono/telemetry\`**: Our ODD-first instrumentation package, ensuring all internal operations are visible and measurable.

## Consolidated Reference Packages (RPIV)

We have consolidated the following packages from the RPIV project into our monorepo:
- **\`rpiv-pi\`**: Core RPIV agent logic.
- **\`rpiv-args\`**: Command-line argument parsing and validation.
- **\`rpiv-todo\`**: Task and workflow management integration.
- **\`rpiv-advisor\`**: Context-aware engineering advice.
- **\`rpiv-web-tools\`**: Integration with Brave/Web search and fetching.

## Developer Workflow

To maintain and extend these packages, follow the official Pi developer lifecycle:

1. **Install:** \`npm install\` (installs all workspace dependencies).
2. **Build:** \`npm run build\` (generates necessary type definitions and bundles).
3. **Check:** \`npm run check\` (runs linting, formatting, and type safety checks).
4. **Test:** \`./test.sh\` or \`npm test\` to run the suite across all packages.

## Adding New Packages
New packages should be added to the \`packages/\` directory. Ensure they include a \`package.json\` that correctly maps workspace dependencies using the \`workspace:*\` protocol.
