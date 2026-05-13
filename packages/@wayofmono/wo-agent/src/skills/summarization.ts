import type { AgentSkill } from "../types.js";
import { Type } from "typebox";

export function summarizationSkill(): AgentSkill {
  return {
    name: "summarization",
    description: "Summarize files, directories, diffs, and project structures",
    systemPrompt: `You can summarize:
- File contents: extract key points, APIs, patterns
- Directory structures: describe the organization and purpose
- Diffs: describe what changed and why
- Project configurations: explain the setup

When summarizing, be concise and focus on actionable information.`,
    tools: [
      {
        name: "summarize_file",
        description: "Read and prepare a file for summarization by the LLM (returns full content for analysis)",
        parameters: Type.Object({
          path: Type.String({ description: "Path to the file to summarize" }),
          context: Type.Optional(Type.String({ description: "Optional context about what to focus on" })),
        }),
        execute: async (_toolCallId, params, _signal, _onUpdate, ctx) => {
          try {
            const fs = await import("node:fs/promises");
            const pathMod = await import("node:path");
            const cwd = ctx?.cwd || process.cwd();
            const filePath = (params.path as string).startsWith("/") ? params.path as string : `${cwd}/${params.path}`;
            const content = await fs.readFile(filePath, "utf-8");
            const stat = await fs.stat(filePath);
            const info = [
              `File: ${pathMod.basename(filePath)}`,
              `Size: ${(stat.size / 1024).toFixed(1)} KB`,
              `Lines: ${content.split("\n").length}`,
              `Modified: ${stat.mtime.toISOString()}`,
              params.context ? `Context: ${params.context}` : "",
              "",
              content.slice(0, 100000), // limit to 100KB
            ].join("\n");
            return { content: [{ type: "text", text: info }], details: { size: stat.size } };
          } catch (e) {
            return { content: [{ type: "text", text: `Error: ${e}` }], isError: true };
          }
        },
      },
      {
        name: "summarize_directory",
        description: "Get a tree view of a directory for LLM summarization",
        parameters: Type.Object({
          path: Type.Optional(Type.String({ description: "Directory to summarize" })),
          depth: Type.Optional(Type.Number({ description: "How deep to traverse (default 2)" })),
        }),
        execute: async (_toolCallId, params, _signal, _onUpdate, ctx) => {
          try {
            const fs = await import("node:fs/promises");
            const pathMod = await import("node:path");
            const cwd = ctx?.cwd || process.cwd();
            const dir = (params.path as string) ? (params.path as string).startsWith("/") ? params.path as string : `${cwd}/${params.path}` : cwd;
            const depth = (params.depth as number) || 2;
            const lines: string[] = [];

            async function walk(dirPath: string, currentDepth: number, prefix: string) {
              const items = await fs.readdir(dirPath, { withFileTypes: true });
              for (const item of items) {
                if (item.name.startsWith(".") || item.name === "node_modules") continue;
                const fullPath = pathMod.join(dirPath, item.name);
                if (item.isDirectory()) {
                  lines.push(`${prefix}📁 ${item.name}/`);
                  if (currentDepth < depth) {
                    await walk(fullPath, currentDepth + 1, `${prefix}  `);
                  }
                } else {
                  const stat = await fs.stat(fullPath);
                  lines.push(`${prefix}📄 ${item.name} (${(stat.size / 1024).toFixed(1)} KB)`);
                }
              }
            }

            lines.push(`Directory: ${dir}`);
            await walk(dir, 0, "");
            return { content: [{ type: "text", text: lines.join("\n") }] };
          } catch (e) {
            return { content: [{ type: "text", text: `Error: ${e}` }], isError: true };
          }
        },
      },
    ],
  };
}
