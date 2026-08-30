# Tools Documentation

WayOfMono integrates best-in-class tools for codebase analysis, web access, and observability.

## Integrated Toolset

### 1. Lens (LSP Integration)
Leverages Language Server Protocols to provide IDE-level diagnostics and "Read-Before-Edit" guards.
- **Diagnostics:** Surfaces errors and warnings directly in the agent's context.
- **Formatting:** Integrates with \`prettier\`, \`eslint --fix\`, and \`gofmt\` for automatic compliance.

### 2. Web Access (Brave-Backed)
Provides agents with high-fidelity web search and content fetching.
- **\`web_search\`**: Targeted searching using the Brave Search API.
- **\`fetch_content\`**: Reads and summarizes content from documentation URLs (e.g., GitHub, geminicli.com).

### 3. Markdown Preview
High-velocity rendering for technical artifacts.
- **Terminal:** Renders Markdown and Mermaid diagrams directly in the TUI using \`pi-tui\`.
- **Browser:** Seamless transition to browser-based previews for complex LaTeX or PDF exports.

## Model Context Protocol (MCP)

We support the **Model Context Protocol** (MCP) for extending tool capabilities.

### Configuration
MCP servers are configured in \`claude/.mcp.json\` and \`opencode/opencode.json\`.
- **Aspire Dashboard:** Connects to \`http://localhost:18891\` for real-time telemetry observation.
- **Remote Subagents:** Allows our monorepo agents to delegate tasks to specialized remote agents via MCP endpoints.

### Adding a Server
To add a new MCP server, update the respective tool configuration with the server's endpoint and capabilities:
\`\`\`json
{
  "mcpServers": {
    "my-custom-server": {
      "command": "npx",
      "args": ["@my/mcp-server-package"]
    }
  }
}
\`\`\`

## Observability Stack
Our observability stack is built on OpenTelemetry and the **Aspire Dashboard**.
- **Collector:** Manages OTLP pipelines in \`pi/skills/otel_collector.md\`.
- **Instrumentation:** Standardized across all packages via \`@wayofmono/telemetry\`.
