import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "typebox";
import { StringEnum } from "@mariozechner/pi-ai";

interface Task {
  id: string;
  text: string;
  done: boolean;
}

export default function (pi: ExtensionAPI) {
  let todos: Task[] = [];

  // 1. State management setup
  pi.on("session_start", async (_event, ctx) => {
    todos = [];
    for (const entry of ctx.sessionManager.getBranch()) {
      if (entry.type === "message" && entry.message.role === "toolResult") {
        if (
          entry.message.toolName === "manage_todos" &&
          entry.message.details?.todos
        ) {
          todos = entry.message.details.todos;
        }
      }
    }
    renderWidget(ctx);
  });

  function renderWidget(ctx: any) {
    if (todos.length === 0) {
      ctx.ui.setWidget("composer-todos", undefined);
      return;
    }
    const lines = [ctx.ui.theme.fg("accent", "📋 Workspace Tasks")];
    todos.forEach((task) => {
      if (task.done) {
        lines.push(
          `  ${ctx.ui.theme.fg("success", "✓")} ${ctx.ui.theme.fg("dim", ctx.ui.theme.strikethrough(task.text))}`,
        );
      } else {
        lines.push(`  ${ctx.ui.theme.fg("warning", "☐")} ${task.text}`);
      }
    });
    ctx.ui.setWidget("composer-todos", lines, { placement: "aboveEditor" });
  }

  // 2. Register the Tool correctly within the function scope
  pi.registerTool({
    name: "manage_todos",
    label: "Manage Tasks",
    description:
      "Add, complete, remove, or list tasks from the active workspace to-do list.",
    promptSnippet: "Manage the persistent task list for the current workspace",
    promptGuidelines: [
      "Use manage_todos to keep track of multi-step plans.",
      "Check off tasks using manage_todos as soon as you finish them.",
      "The current tasks are provided in your system instructions, but you can also use action='list' to retrieve them directly.",
    ],
    parameters: Type.Object({
      action: StringEnum([
        "add",
        "complete",
        "remove",
        "clear_done",
        "list",
      ] as const),
      text: Type.Optional(
        Type.String({
          description:
            "Task description (required for 'add', 'complete', and 'remove')",
        }),
      ),
    }),
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      const action = params.action;
      let resultText = "";

      if (action === "add" && params.text) {
        todos.push({
          id: Math.random().toString(36).slice(2, 9),
          text: params.text,
          done: false,
        });
        resultText = `Task added. Total tasks: ${todos.length}`;
      } else if (action === "complete" && params.text) {
        const task = todos.find((t) =>
          t.text.toLowerCase().includes(params.text!.toLowerCase()),
        );
        if (task) {
          task.done = true;
          resultText = `Task marked complete: "${task.text}"`;
        } else {
          resultText = `Task not found matching: "${params.text}"`;
        }
      } else if (action === "remove" && params.text) {
        todos = todos.filter(
          (t) => !t.text.toLowerCase().includes(params.text!.toLowerCase()),
        );
        resultText = `Task removed. Remaining tasks: ${todos.length}`;
      } else if (action === "clear_done") {
        todos = todos.filter((t) => !t.done);
        resultText = `Cleared completed tasks. Remaining tasks: ${todos.length}`;
      } else if (action === "list") {
        if (todos.length === 0) {
          resultText = "The workspace task list is currently empty.";
        } else {
          resultText =
            "Current Workspace Tasks:\n" +
            todos.map((t) => `- [${t.done ? "x" : " "}] ${t.text}`).join("\n");
        }
      }

      renderWidget(ctx);

      return {
        content: [{ type: "text", text: resultText }],
        details: { todos: [...todos] },
      };
    },
  });
}
