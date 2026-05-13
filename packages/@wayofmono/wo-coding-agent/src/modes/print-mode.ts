import type { AgentSession } from "../core/agent-session.js";

export interface PrintModeOptions {
  model: string;
  prompt: string;
}

export async function runPrintMode(session: AgentSession, opts: PrintModeOptions): Promise<void> {
  try {
    const response = await session.prompt(opts.prompt);
    console.log(response);
  } catch (err) {
    console.error("Error:", err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
