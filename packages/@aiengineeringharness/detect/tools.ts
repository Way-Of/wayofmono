import { type DetectResult, type ToolsInfo, type ToolInfo } from "./types.ts";

function detectTool(name: string, configDir: string, format: "snake_case" | "kebab-case", binary?: string): ToolInfo {
  const home = Deno.env.get("HOME") ?? Deno.env.get("USERPROFILE") ?? "";
  const dir = configDir.replace("~", home);
  let detected = false;
  let version: string | undefined;

  try {
    Deno.statSync(dir);
    detected = true;
  } catch {}

  if (binary && detected) {
    try {
      const cmd = new Deno.Command(binary, { args: ["--version"] });
      const out = cmd.outputSync();
      if (out.success) {
        version = new TextDecoder().decode(out.stdout).trim().split("\n")[0];
      }
    } catch {}
  }

  return { name, configDir: dir, detected, version, format };
}

export function detectTools(): DetectResult<ToolsInfo> {
  try {
    const tools = {
      opencode: detectTool("opencode", "~/.config/opencode", "kebab-case", "opencode"),
      claude: detectTool("claude", "~/.claude", "snake_case", "claude"),
      pi: detectTool("pi", "~/.pi/agent", "kebab-case"),
      codex: detectTool("codex", "~/.codex", "snake_case"),
      antigravity: detectTool("antigravity", "~/.antigravity", "snake_case"),
      wocode: detectTool("wocode", "~/.wocode", "kebab-case"),
    };

    const installed = Object.values(tools).filter((t) => t.detected).map((t) => t.name);

    return {
      value: { ...tools, any: installed.length > 0, installed },
      confidence: installed.length > 0 ? "high" : "medium",
      source: "fs stat on config dirs + --version where available",
    };
  } catch (err) {
    return {
      value: {
        opencode: { name: "opencode", configDir: "~/.config/opencode", detected: false, format: "kebab-case" },
        claude: { name: "claude", configDir: "~/.claude", detected: false, format: "snake_case" },
        pi: { name: "pi", configDir: "~/.pi/agent", detected: false, format: "kebab-case" },
        codex: { name: "codex", configDir: "~/.codex", detected: false, format: "snake_case" },
        antigravity: { name: "antigravity", configDir: "~/.antigravity", detected: false, format: "snake_case" },
        wocode: { name: "wocode", configDir: "~/.wocode", detected: false, format: "kebab-case" },
        any: false,
        installed: [],
      },
      confidence: "low",
      source: `fallback: ${err}`,
    };
  }
}
