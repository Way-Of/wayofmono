/**
 * Custom Command Extension Template
 * Registers slash commands and handles user interaction
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "typebox";
import { Text, SelectList, Container } from "@mariozechner/pi-tui";

export default function (pi: ExtensionAPI) {
  // Simple command
  pi.registerCommand("hello", {
    description: "Say hello",
    handler: async (args, ctx) => {
      ctx.ui.notify(`Hello ${args || "world"}!`, "info");
    },
  });

  // Command with argument completion
  pi.registerCommand("deploy", {
    description: "Deploy to an environment",
    getArgumentCompletions: (prefix: string) => {
      const envs = ["dev", "staging", "prod"];
      return envs
        .filter((e) => e.startsWith(prefix))
        .map((e) => ({ value: e, label: e }));
    },
    handler: async (args, ctx) => {
      ctx.ui.notify(`Deploying to ${args}...`, "info");
    },
  });

  // Command that registers a tool dynamically
  pi.registerCommand("enable-search", {
    description: "Enable web search tool",
    handler: async (_args, ctx) => {
      pi.registerTool({
        name: "web_search",
        label: "Web Search",
        description: "Search the web",
        parameters: Type.Object({
          query: Type.String({ description: "Search query" }),
        }),
        async execute(_id, params, _signal, _onUpdate, _ctx) {
          return {
            content: [{ type: "text", text: `Searching for: ${params.query}` }],
            details: {},
          };
        },
      });
      ctx.ui.notify("Web search tool enabled!", "success");
    },
  });
}
