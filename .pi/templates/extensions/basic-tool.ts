/**
 * Basic Tool Extension Template
 * Creates a simple custom tool with parameters and rendering
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "typebox";

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "my_tool",
    label: "My Tool",
    description: "What this tool does",
    promptSnippet: "Perform action with my_tool",
    promptGuidelines: ["Use my_tool when the user asks to..."],
    parameters: Type.Object({
      action: Type.String({ description: "Action to perform" }),
      option: Type.Optional(Type.String({ description: "Optional parameter" })),
    }),
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      const { action, option } = params as { action: string; option?: string };

      // Stream progress
      onUpdate?.({
        content: [{ type: "text", text: `Working on: ${action}...` }],
      });

      // Do work here
      const result = `Processed ${action}${option ? ` with ${option}` : ""}`;

      return {
        content: [{ type: "text", text: result }],
        details: { action, option },
      };
    },
    renderCall: (args, theme) =>
      new Text(
        theme.fg("toolTitle", theme.bold("my_tool ")) +
          theme.fg("accent", args.action),
        0,
        0,
      ),
    renderResult: (result, _options, theme) =>
      new Text(theme.fg("success", "✓ " + result.content[0].text), 0, 0),
  });
}
