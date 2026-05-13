import { parseArgs, printHelp } from "./cli/args.js";
import { createAgentSession } from "./core/agent-session.js";
import { runPrintMode } from "./modes/print-mode.js";

const APP_NAME = "wo";
const VERSION = "1.0.0";

export async function main(argv: string[]): Promise<void> {
  const args = parseArgs(argv);

  if (args.help) {
    printHelp();
    return;
  }

  if (args.version) {
    console.log(`${APP_NAME} v${VERSION}`);
    return;
  }

  if (args.offline) {
    process.env.WO_OFFLINE = "1";
  }

  const cwd = process.cwd();
  const agentDir = process.env.WO_CONFIG_DIR || `${process.env.HOME}/.wo/agent`;

  const session = createAgentSession({
    cwd,
    agentDir,
    defaultModel: args.model,
    systemPrompt: args.systemPrompt,
  });

  if (args.mode === "print" || args.print) {
    const model = args.model || "claude-sonnet-4-20250514";
    await runPrintMode(session, { model, prompt: args.positional.join(" ") || "(no prompt)" });
    return;
  }

  if (args.mode === "interactive") {
    console.log(`${APP_NAME} v${VERSION} — interactive mode (not yet implemented)`);
    console.log(`  cwd: ${cwd}`);
    console.log(`  model: ${args.model || "default"}`);
    return;
  }

  console.error(`Unknown mode: ${args.mode}`);
  process.exit(1);
}
