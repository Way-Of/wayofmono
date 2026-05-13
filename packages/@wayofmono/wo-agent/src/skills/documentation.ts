import type { AgentSkill } from "../types.js";
import { Type } from "typebox";

export function documentationSkill(): AgentSkill {
  return {
    name: "documentation",
    description: "Read, write, and generate documentation files (README, CHANGELOG, API docs, markdown)",
    systemPrompt: `You have access to documentation tools. When generating documentation:
- Use clear markdown formatting
- Include code examples where relevant
- Keep language consistent with existing project docs
- Generate structured documentation (headings, tables, lists)
- For README files: include install, usage, API, and config sections`,
    tools: [
      {
        name: "read_doc",
        description: "Read a documentation file from the project",
        parameters: Type.Object({
          path: Type.String({ description: "Path to the documentation file" }),
        }),
        execute: async (toolCallId, params) => {
          try {
            const fs = await import("node:fs/promises");
            const content = await fs.readFile(params.path as string, "utf-8");
            return { content: [{ type: "text", text: content }] };
          } catch (e) {
            return { content: [{ type: "text", text: `Error reading file: ${e}` }], isError: true };
          }
        },
      },
      {
        name: "write_doc",
        description: "Write or update a documentation file",
        parameters: Type.Object({
          path: Type.String({ description: "Path to write the documentation file" }),
          content: Type.String({ description: "Full content of the documentation file" }),
          summary: Type.String({ description: "Brief summary of what changed" }),
        }),
        execute: async (_toolCallId, params) => {
          try {
            const fs = await import("node:fs/promises");
            const path = await import("node:path");
            await fs.mkdir(path.dirname(params.path as string), { recursive: true });
            await fs.writeFile(params.path as string, params.content as string, "utf-8");
            return { content: [{ type: "text", text: `Written ${params.path}` }] };
          } catch (e) {
            return { content: [{ type: "text", text: `Error writing file: ${e}` }], isError: true };
          }
        },
      },
      {
        name: "list_docs",
        description: "List documentation files in the project",
        parameters: Type.Object({
          directory: Type.Optional(Type.String({ description: "Directory to search, defaults to project root" })),
        }),
        execute: async (_toolCallId, params) => {
          try {
            const { glob } = await import("node:fs/promises");
            const dir = (params.directory as string) || process.cwd();
            const patterns = ["**/*.md", "**/docs/**", "**/documentation/**"];
            const files: string[] = [];
            for (const pattern of patterns) {
              for await (const entry of glob(pattern, { cwd: dir })) {
                files.push(entry);
              }
            }
            return { content: [{ type: "text", text: files.length > 0 ? files.join("\n") : "No documentation files found" }] };
          } catch (e) {
            return { content: [{ type: "text", text: `Error listing docs: ${e}` }], isError: true };
          }
        },
      },
    ],
    prompts: [
      "Write a README.md for this project",
      "Update the CHANGELOG with recent changes",
      "Generate API documentation for the main module",
    ],
  };
}
