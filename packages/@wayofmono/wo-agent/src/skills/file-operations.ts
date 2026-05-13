import type { AgentSkill } from "../types.js";
import { Type } from "typebox";

export function fileOperationsSkill(): AgentSkill {
  return {
    name: "file-operations",
    description: "Read, search, list, and organize files in the project (read-only safe)",
    systemPrompt: `You can read and search files in the project. You cannot modify code files.
Focus on understanding file contents, structure, and organization.`,
    tools: [
      {
        name: "read_file",
        description: "Read the contents of a file",
        parameters: Type.Object({
          path: Type.String({ description: "Path to the file to read" }),
          offset: Type.Optional(Type.Number({ description: "Line number to start reading from (1-indexed)" })),
          limit: Type.Optional(Type.Number({ description: "Maximum number of lines to read" })),
        }),
        execute: async (_toolCallId, params, _signal, _onUpdate, ctx) => {
          try {
            const fs = await import("node:fs/promises");
            const cwd = ctx?.cwd || process.cwd();
            const resolvedPath = params.path as string;
            const fullPath = resolvedPath.startsWith("/") ? resolvedPath : `${cwd}/${resolvedPath}`;
            const content = await fs.readFile(fullPath, "utf-8");
            const lines = content.split("\n");
            const offset = (params.offset as number) || 1;
            const limit = params.limit as number | undefined;
            const slice = limit ? lines.slice(offset - 1, offset - 1 + limit) : lines.slice(offset - 1);
            const result = slice.join("\n");
            return {
              content: [{ type: "text", text: result }],
              details: { totalLines: lines.length, returnedLines: slice.length },
            };
          } catch (e) {
            return { content: [{ type: "text", text: `Error: ${e}` }], isError: true };
          }
        },
      },
      {
        name: "list_directory",
        description: "List files and directories at a given path",
        parameters: Type.Object({
          path: Type.Optional(Type.String({ description: "Directory to list, defaults to current" })),
          depth: Type.Optional(Type.Number({ description: "How deep to recurse (0 = flat only, default 0)" })),
        }),
        execute: async (_toolCallId, params, _signal, _onUpdate, ctx) => {
          try {
            const fs = await import("node:fs/promises");
            const pathMod = await import("node:path");
            const cwd = ctx?.cwd || process.cwd();
            const dir = (params.path as string) ? (params.path as string).startsWith("/") ? params.path as string : `${cwd}/${params.path}` : cwd;
            const depth = (params.depth as number) || 0;
            const entries: string[] = [];

            async function walk(dirPath: string, currentDepth: number) {
              const items = await fs.readdir(dirPath, { withFileTypes: true });
              for (const item of items) {
                const relative = pathMod.relative(cwd, pathMod.join(dirPath, item.name));
                entries.push(relative);
                if (item.isDirectory() && currentDepth < depth) {
                  await walk(pathMod.join(dirPath, item.name), currentDepth + 1);
                }
              }
            }

            await walk(dir, 0);
            return { content: [{ type: "text", text: entries.join("\n") }] };
          } catch (e) {
            return { content: [{ type: "text", text: `Error: ${e}` }], isError: true };
          }
        },
      },
    ],
  };
}
