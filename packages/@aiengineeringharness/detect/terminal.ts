import { type DetectResult, type TerminalInfo } from "./types.ts";

export function detectTerminal(): DetectResult<TerminalInfo> {
  try {
    let shell: TerminalInfo["shell"] = "unknown";
    const shellEnv = Deno.env.get("SHELL") || "";
    if (shellEnv.includes("bash")) shell = "bash";
    else if (shellEnv.includes("zsh")) shell = "zsh";
    else if (shellEnv.includes("fish")) shell = "fish";
    else if (shellEnv.includes("powershell") || shellEnv.includes("pwsh")) shell = "powershell";

    const terminal = Deno.env.get("TERM_PROGRAM") || Deno.env.get("TERM") || undefined;

    let colorDepth: TerminalInfo["colorDepth"] = 8;
    const termEnv = Deno.env.get("TERM") || "";
    const colorterm = Deno.env.get("COLORTERM") || "";
    if (colorterm === "truecolor" || colorterm === "24bit") colorDepth = "truecolor";
    else if (termEnv.includes("256")) colorDepth = 256;

    const isMultiplexer = !!(Deno.env.get("TMUX") || Deno.env.get("STY"));

    let locale = "C";
    let isUtf8 = false;
    const lcAll = Deno.env.get("LC_ALL");
    const lcCtype = Deno.env.get("LC_CTYPE");
    const lang = Deno.env.get("LANG");
    locale = lcAll || lcCtype || lang || "C";
    isUtf8 = locale.toLowerCase().includes("utf-8") || locale.toLowerCase().includes("utf8");

    return {
      value: { shell, terminal, colorDepth, isMultiplexer, locale, isUtf8 },
      confidence: shell !== "unknown" ? "high" : "medium",
      source: "SHELL + TERM + LC_ALL env vars",
    };
  } catch (err) {
    return {
      value: {
        shell: "unknown",
        colorDepth: 8,
        isMultiplexer: false,
        locale: "C",
        isUtf8: false,
      },
      confidence: "low",
      source: `fallback: ${err}`,
    };
  }
}
