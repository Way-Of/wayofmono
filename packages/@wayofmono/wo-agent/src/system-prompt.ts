import type { SystemPromptInput, SessionMode } from "./types.js";

const PLAN_FALLBACK = `You are the **planner** persona for this workspace.

**Behavior:** focus on design, trade-offs, and sequencing — not shipping large pasted code dumps unless the user asks for a small illustrative snippet.

**Output shape** in your replies (use clear headings):
- **Goal** — what "done" means
- **Assumptions & constraints** — unknowns explicit
- **Current state** — only what the user or prior messages established
- **Files to touch** — table: path | create/modify/delete | notes
- **Implementation steps** — ordered, concrete
- **Risks & mitigations**
- **Verification** — tests/commands/checks
- **Handoff** — what a builder should do next`;

const ORCHESTRATOR_SYSTEM = `You are the **orchestrator** for this session — the primary lead.

**How to work:** Break work into ordered steps, state assumptions. Use the tools available to you to gather information and execute tasks.

**Brevity (critical):** Operational asks deserve **short** answers: ≤6 bullets or one tight numbered list.

**Product / "what is …" questions:** Cap the answer at ≤5 short bullets unless the user asks for depth. No emoji in replies unless the user already used emoji.

**Outcomes:** After tool or command results, tell the user clearly what succeeded or failed and what to do next.`;

const MODE_NOTES: Record<SessionMode, string> = {
  build: "**Mode: Build** — Execute tasks directly using tools. Verify your work with reads or greps after writes.",
  plan: "**Mode: Plan** — Focus on design and sequencing. Prefer plans/PLAN-*.md for artifacts. Avoid shipping large unrequested code dumps.",
};

const TOOLS_NOTE = `\n\n---\n\n**Available tools:** You have workspace-jailed tools read, list_dir, grep, write, bash, and git operations. After tools return, tell the user clearly what succeeded vs failed. If a tool reports an error, explain what is broken and how to fix it.`;

export function composeSystemPrompt(input: SystemPromptInput): string | null {
  const env = input.envSystemPrompt?.trim() ?? "";
  const parts: string[] = [];
  if (env) parts.push(env);

  const agent = input.agentBody?.trim();
  if (!agent) {
    parts.push(ORCHESTRATOR_SYSTEM);
  } else {
    parts.push(agent);
  }

  if (input.toolsNote) {
    parts[parts.length - 1] += `\n\n---\n\n${input.toolsNote}`;
  } else {
    parts[parts.length - 1] += TOOLS_NOTE;
  }

  parts.push(MODE_NOTES[input.mode]);

  if (input.mode === "plan" && input.agentNameLower !== "planner") {
    const planCore = input.plannerBody?.trim() || PLAN_FALLBACK;
    parts.push(planCore);
  }

  const boost = input.indexBoost?.trim();
  if (boost) parts.push(boost);

  if (parts.length === 0) return null;
  return parts.join("\n\n---\n\n");
}

export function applySystemPrompt(
  messages: Array<{ role: string; content: string }>,
  input: SystemPromptInput,
): void {
  const composed = composeSystemPrompt(input);
  const hasSystem = messages.length > 0 && messages[0].role === "system";
  if (!composed) {
    if (hasSystem) messages.shift();
    return;
  }
  if (hasSystem) {
    messages[0] = { role: "system", content: composed };
  } else {
    messages.unshift({ role: "system", content: composed });
  }
}
