import type { ToolDefinition, ToolInfo, AgentToolResult, ExtensionContext } from "./types.js";

export class ToolEngine {
  private tools = new Map<string, ToolDefinition>();

  register(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  getAll(): ToolInfo[] {
    return Array.from(this.tools.values()).map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
      sourceInfo: t.label,
    }));
  }

  getNames(): string[] {
    return Array.from(this.tools.keys());
  }

  async execute(
    toolCallId: string,
    toolName: string,
    params: Record<string, unknown>,
    signal?: AbortSignal,
    onUpdate?: (update: { content: Array<{ type: string; text: string }>; details?: Record<string, unknown> }) => void,
    ctx?: ExtensionContext
  ): Promise<AgentToolResult> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return {
        content: [{ type: "text", text: `Tool "${toolName}" not found` }],
        isError: true,
      };
    }

    try {
      return await tool.execute(toolCallId, params, signal, onUpdate, ctx);
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error executing tool "${toolName}": ${String(err)}` }],
        isError: true,
      };
    }
  }

  remove(name: string): void {
    this.tools.delete(name);
  }

  setActiveTools(names: string[]): void {
    const allTools = this.getNames();
    for (const name of allTools) {
      if (!names.includes(name)) {
        this.tools.delete(name);
      }
    }
  }
}
