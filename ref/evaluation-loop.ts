import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

interface EvaluationRecord {
  iteration: number;
  action: string;
  successCriteria: string;
  score: number;
  passed: boolean;
}

export default function (pi: ExtensionAPI) {
  const evaluationHistory: EvaluationRecord[] = [];
  let currentSuccessCriteria = "Not set";
  let currentObjectiveFunction = "Maximize accuracy";

  // --- 1. System Prompt Injection ---
  pi.on("before_agent_start", async (event: unknown) => {
    const systemAddition = `
### GOAL-CONDITIONED EVALUATION LOOP ###
You are operating in an autonomous goal-driven loop. Your current state is evaluated against the following criteria:
- Success Criteria: ${currentSuccessCriteria}
- Objective Function: ${currentObjectiveFunction}

Before completing a task, you must use the 'evaluate_task' tool to score your progress objectively. If you fail, iterate on the code or task until you meet the success criteria.
`;

    const eventData = event as { systemPrompt?: string };
    return {
      systemPrompt: eventData?.systemPrompt + systemAddition,
    };
  });

  // --- 2. Definition Tool for Objectives ---
  pi.registerCommand("objective", {
    description:
      "Sets the success criteria and objective function for the loop. Usage: /objective <criteria> | <objective>",
    handler: async (_args: string | undefined, ctx) => {
      if (!_args) {
        ctx.ui.notify(
          "Please provide criteria. Example: /objective Write a fast sort | Reduce latency to < 10ms",
          "info",
        );
        return;
      }

      const parts = _args.split("|");
      currentSuccessCriteria = parts[0]?.trim() || "Not set";
      currentObjectiveFunction = parts[1]?.trim() || "Maximize output";

      ctx.ui.notify(
        `Objective set! Criteria: ${currentSuccessCriteria}`,
        "info",
      );
    },
  });

  // --- 3. The Evaluation Tool ---
  pi.registerTool({
    name: "evaluate_task",
    label: "Evaluate Objective Function",
    description:
      "Evaluates the current workspace state against your success criteria.",
    promptSnippet: "Evaluate the current output against the success criteria",
    promptGuidelines: [
      "Use evaluate_task before finalizing a workflow to ensure you meet the objective function.",
    ],
    parameters: {
      actionTested: {
        description: "The action or change you are testing",
        type: "string",
      },
      computedScore: {
        description: "A numerical score reflecting the objective function",
        type: "number",
      },
    },
    async execute(
      _toolCallId: unknown,
      params: { actionTested: string; computedScore: number },
      _signal: unknown,
      _onUpdate: unknown,
      _ctx: unknown,
    ) {
      const isSuccess = params.computedScore >= 0.8;

      evaluationHistory.push({
        iteration: evaluationHistory.length + 1,
        action: params.actionTested,
        successCriteria: currentSuccessCriteria,
        score: params.computedScore,
        passed: isSuccess,
      });

      return {
        content: [
          {
            type: "text",
            text: `Evaluation Result: Score=${params.computedScore}. Criteria Met: ${isSuccess ? "YES" : "NO"}`,
          },
        ],
        details: { history: [...evaluationHistory] },
      };
    },
  });

  // --- 4. Manual Add Task ---
  pi.registerCommand("loop_step", {
    description: "Forces a loop evaluation step.",
    handler: async (_args: string | undefined, ctx) => {
      ctx.ui.notify("Evaluating loop status...", "info");
    },
  });
}
