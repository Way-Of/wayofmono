/**
 * Event Handler Extension Template
 * Demonstrates common event hooks for intercepting and modifying behavior
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { isToolCallEventType } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  // Session lifecycle
  pi.on("session_start", async (_event, ctx) => {
    ctx.ui.notify("Extension loaded!", "info");
  });

  pi.on("session_shutdown", async (_event, _ctx) => {
    // Cleanup work here
  });

  // Agent lifecycle
  pi.on("before_agent_start", async (event, _ctx) => {
    // Can inject message or modify system prompt
    return {
      systemPrompt: event.systemPrompt + "\n\nAdditional instructions...",
    };
  });

  // Tool call interception (can block)
  pi.on("tool_call", async (event, ctx) => {
    if (isToolCallEventType("bash", event)) {
      if (event.input.command.includes("rm -rf")) {
        const ok = await ctx.ui.confirm("Dangerous!", "Allow rm -rf?");
        if (!ok) return { block: true, reason: "Blocked by user" };
      }
    }
  });

  // Tool result modification
  pi.on("tool_result", async (event, _ctx) => {
    // Modify result if needed
    return {
      content: event.content,
      details: event.details,
    };
  });
}
