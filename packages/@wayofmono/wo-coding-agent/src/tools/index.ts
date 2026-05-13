import type { ToolDefinition } from "@wayofmono/wo-agent-core";
import { Type } from "typebox";

export interface ToolFactories {
  read: ToolDefinition;
  bash: ToolDefinition;
  write: ToolDefinition;
  edit: ToolDefinition;
  grep: ToolDefinition;
  find: ToolDefinition;
  ls: ToolDefinition;
}

export function createReadTool(cwd: string): ToolDefinition {
  return {
    name: "read",
    description: "Read a file from the filesystem",
    parameters: Type.Object({ path: Type.String(), offset: Type.Optional(Type.Number()), limit: Type.Optional(Type.Number()) }),
    execute: async ({ path }) => ({ content: [{ type: "text" as const, text: `[read] ${cwd}/${path}` }] }),
  };
}

export function createBashTool(cwd: string): ToolDefinition {
  return {
    name: "bash",
    description: "Execute a bash command",
    parameters: Type.Object({ command: Type.String(), description: Type.Optional(Type.String()) }),
    execute: async ({ command }) => ({ content: [{ type: "text" as const, text: `[bash] ${command}` }] }),
  };
}

export function createWriteTool(cwd: string): ToolDefinition {
  return {
    name: "write",
    description: "Write content to a file",
    parameters: Type.Object({ path: Type.String(), content: Type.String() }),
    execute: async ({ path, content }) => ({ content: [{ type: "text" as const, text: `[write] ${cwd}/${path} (${content.length} chars)` }] }),
  };
}

export function createEditTool(cwd: string): ToolDefinition {
  return {
    name: "edit",
    description: "Edit a file using find/replace",
    parameters: Type.Object({ path: Type.String(), oldString: Type.String(), newString: Type.String() }),
    execute: async ({ path, oldString, newString }) => ({ content: [{ type: "text" as const, text: `[edit] ${cwd}/${path}: ${oldString.length} → ${newString.length} chars` }] }),
  };
}

export function createGrepTool(cwd: string): ToolDefinition {
  return {
    name: "grep",
    description: "Search for a pattern in files",
    parameters: Type.Object({ pattern: Type.String(), path: Type.Optional(Type.String()) }),
    execute: async ({ pattern }) => ({ content: [{ type: "text" as const, text: `[grep] ${pattern}` }] }),
  };
}

export function createFindTool(cwd: string): ToolDefinition {
  return {
    name: "find",
    description: "Find files matching a glob pattern",
    parameters: Type.Object({ pattern: Type.String() }),
    execute: async ({ pattern }) => ({ content: [{ type: "text" as const, text: `[find] ${pattern}` }] }),
  };
}

export function createLsTool(cwd: string): ToolDefinition {
  return {
    name: "ls",
    description: "List directory contents",
    parameters: Type.Object({ path: Type.Optional(Type.String()) }),
    execute: async () => ({ content: [{ type: "text" as const, text: `[ls] ${cwd}` }] }),
  };
}

export function createAllToolDefinitions(cwd: string): ToolDefinition[] {
  return [
    createReadTool(cwd),
    createBashTool(cwd),
    createWriteTool(cwd),
    createEditTool(cwd),
    createGrepTool(cwd),
    createFindTool(cwd),
    createLsTool(cwd),
  ];
}
