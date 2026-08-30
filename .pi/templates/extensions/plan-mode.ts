/**
 * Plan Mode Extension Template
 * Implements a planning workflow with scout, plan, review, and approve phases
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Text, DynamicBorder, Container } from "@mariozechner/pi-tui";

let isPlanMode = false;
let planStatus: "idle" | "scouting" | "planning" | "reviewing" | "awaiting_approval" | "approved" = "idle";
let planPath: string | null = null;

export default function (pi: ExtensionAPI) {
  // Block implementation tools during planning
  pi.on("tool_call", async (event, _ctx) => {
    if (isPlanMode && planStatus !== "approved") {
      if (["write", "edit", "replace", "bash"].includes(event.toolName)) {
        return {
          block: true,
          reason: `Plan mode active. Status: ${planStatus}. Use approve_plan to proceed.`,
        };
      }
    }
    return { block: false };
  });

  // Enter plan mode command
  pi.registerCommand("enter-plan", {
    description: "Enter plan mode for a task",
    handler: async (args, ctx) => {
      isPlanMode = true;
      planStatus = "scouting";
      ctx.ui.setStatus("plan", ctx.ui.theme.fg("accent", "● PLANNING"));
      ctx.ui.notify(`Plan mode: ${args}`, "info");
    },
  });

  // Approve plan command
  pi.registerCommand("approve-plan", {
    description: "Approve the current plan",
    handler: async (_args, ctx) => {
      planStatus = "approved";
      ctx.ui.setStatus("plan", ctx.ui.theme.fg("success", "● APPROVED"));
      ctx.ui.notify("Plan approved! Implementation tools unlocked.", "success");
    },
  });

  // Exit plan mode
  pi.registerCommand("exit-plan", {
    description: "Exit plan mode",
    handler: async (_args, ctx) => {
      isPlanMode = false;
      planStatus = "idle";
      planPath = null;
      ctx.ui.setStatus("plan", undefined);
      ctx.ui.notify("Exited plan mode.", "info");
    },
  });
}
