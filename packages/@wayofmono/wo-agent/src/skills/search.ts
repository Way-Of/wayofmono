import type { AgentSkill } from "../types.js";
import { Type } from "typebox";

export function searchSkill(): AgentSkill {
  return {
    name: "search",
    description: "Search file contents and find files by name/pattern across the project",
    systemPrompt: `You can search file contents using ripgrep-like patterns and find files by name.
Use these tools to locate relevant code, configuration, and documentation.`,
    tools: [
      {
        name: "search_content",
        description: "Search file contents for a pattern (grep)",
        parameters: Type.Object({
          pattern: Type.String({ description: "Search pattern (regex supported)" }),
          path: Type.Optional(Type.String({ description: "Directory or file to search in" })),
          include: Type.Optional(Type.String({ description: "File glob pattern to include (e.g. *.ts, *.md)" })),
          maxResults: Type.Optional(Type.Number({ description: "Maximum results to return (default 50)" })),
        }),
        execute: async (_toolCallId, params, _signal, _onUpdate, ctx) => {
          try {
            const cwd = ctx?.cwd || process.cwd();
            const searchDir = (params.path as string) ? (params.path as string).startsWith("/") ? params.path as string : `${cwd}/${params.path}` : cwd;
            const pattern = params.pattern as string;
            const include = params.include as string | undefined;
            const maxResults = (params.maxResults as number) || 50;
            const results: string[] = [];
            const { glob, readFile } = await import("node:fs/promises");

            const globPattern = include || "**/*";
            let count = 0;
            for await (const file of glob(globPattern, { cwd: searchDir })) {
              if (count >= maxResults) break;
              try {
                const content = await readFile(file.startsWith("/") ? file : `${searchDir}/${file}`, "utf-8");
                const lines = content.split("\n");
                for (let i = 0; i < lines.length; i++) {
                  if (count >= maxResults) break;
                  if (lines[i].includes(pattern) || new RegExp(pattern).test(lines[i])) {
                    results.push(`${file}:${i + 1}: ${lines[i].trim().slice(0, 200)}`);
                    count++;
                  }
                }
              } catch {
                // skip unreadable files
              }
            }

            return { content: [{ type: "text", text: results.length > 0 ? results.join("\n") : "No matches found" }] };
          } catch (e) {
            return { content: [{ type: "text", text: `Error: ${e}` }], isError: true };
          }
        },
      },
      {
        name: "find_files",
        description: "Find files by name/glob pattern",
        parameters: Type.Object({
          pattern: Type.String({ description: "Glob pattern to match (e.g. **/*.ts, **/config*)") }),
          path: Type.Optional(Type.String({ description: "Directory to search in" })),
          maxResults: Type.Optional(Type.Number({ description: "Maximum files to return (default 100)" })),
        }),
        execute: async (_toolCallId, params, _signal, _onUpdate, ctx) => {
          try {
            const cwd = ctx?.cwd || process.cwd();
            const searchDir = (params.path as string) ? (params.path as string).startsWith("/") ? params.path as string : `${cwd}/${params.path}` : cwd;
            const pattern = params.pattern as string;
            const maxResults = (params.maxResults as number) || 100;
            const results: string[] = [];
            const { glob } = await import("node:fs/promises");

            let count = 0;
            for await (const file of glob(pattern, { cwd: searchDir })) {
              if (count >= maxResults) break;
              results.push(file);
              count++;
            }

            return { content: [{ type: "text", text: results.length > 0 ? results.join("\n") : "No files found" }] };
          } catch (e) {
            return { content: [{ type: "text", text: `Error: ${e}` }], isError: true };
          }
        },
      },
    ],
  };
}
