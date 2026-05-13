export interface CliArgs {
  mode: "interactive" | "print" | "json" | "rpc";
  print: boolean;
  model?: string;
  provider?: string;
  apiKey?: string;
  thinking?: string;
  tools?: string[];
  noBuiltinTools: boolean;
  noTools: boolean;
  session?: string;
  fork?: string;
  sessionDir?: string;
  noSession: boolean;
  continue: boolean;
  resume: boolean;
  systemPrompt?: string;
  appendSystemPrompt?: string;
  extension?: string[];
  noExtensions: boolean;
  skill?: string[];
  noSkills: boolean;
  noPromptTemplates: boolean;
  noThemes: boolean;
  noContextFiles: boolean;
  verbose: boolean;
  offline: boolean;
  help: boolean;
  version: boolean;
  positional: string[];
}

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    mode: "interactive",
    print: false,
    noBuiltinTools: false,
    noTools: false,
    noSession: false,
    continue: false,
    resume: false,
    noExtensions: false,
    noSkills: false,
    noPromptTemplates: false,
    noThemes: false,
    noContextFiles: false,
    verbose: false,
    offline: false,
    help: false,
    version: false,
    positional: [],
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--help": case "-h": args.help = true; break;
      case "--version": case "-v": args.version = true; break;
      case "--print": case "-p": args.print = true; args.mode = "print"; break;
      case "--mode": args.mode = argv[++i] as CliArgs["mode"]; break;
      case "--model": args.model = argv[++i]; break;
      case "--provider": args.provider = argv[++i]; break;
      case "--api-key": args.apiKey = argv[++i]; break;
      case "--thinking": args.thinking = argv[++i]; break;
      case "--tools": case "-t": args.tools = argv[++i]?.split(","); break;
      case "--no-builtin-tools": args.noBuiltinTools = true; break;
      case "--no-tools": args.noTools = true; break;
      case "--session": args.session = argv[++i]; break;
      case "--fork": args.fork = argv[++i]; break;
      case "--session-dir": args.sessionDir = argv[++i]; break;
      case "--no-session": args.noSession = true; break;
      case "--continue": case "-c": args.continue = true; break;
      case "--resume": case "-r": args.resume = true; break;
      case "--system-prompt": args.systemPrompt = argv[++i]; break;
      case "--append-system-prompt": args.appendSystemPrompt = argv[++i]; break;
      case "--extension": case "-e": (args.extension ??= []).push(argv[++i]); break;
      case "--no-extensions": args.noExtensions = true; break;
      case "--skill": (args.skill ??= []).push(argv[++i]); break;
      case "--no-skills": args.noSkills = true; break;
      case "--no-prompt-templates": args.noPromptTemplates = true; break;
      case "--no-themes": args.noThemes = true; break;
      case "--no-context-files": case "-nc": args.noContextFiles = true; break;
      case "--verbose": args.verbose = true; break;
      case "--offline": args.offline = true; break;
      default:
        if (!arg.startsWith("-")) args.positional.push(arg);
        break;
    }
  }

  return args;
}

export function printHelp(): void {
  console.log(`
wo [options] [@files...] [messages...]

Modes:
  (default)             Interactive mode
  -p, --print           Print response and exit
  --mode <mode>         Output mode: print, json, rpc

Model Options:
  --provider <name>     Provider (anthropic, openai, gemini)
  --model <pattern>     Model ID or pattern
  --api-key <key>       API key (overrides env vars)
  --thinking <level>    off, low, medium, high, xhigh

Session Options:
  -c, --continue        Continue most recent session
  -r, --resume          Browse and select session
  --session <id|path>   Use specific session
  --fork <id|path>      Fork session into new one
  --no-session          Ephemeral mode (don't save)

Tool Options:
  --tools <list>, -t    Tool allowlist (comma-separated)
  --no-builtin-tools    Disable built-in tools
  --no-tools, -nt       Disable all tools

Other:
  -h, --help            Show help
  -v, --version         Show version
`);
}
