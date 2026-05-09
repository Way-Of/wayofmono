import { runCursorCommand } from "./cli-spawn.js";

function parseModelLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.toLowerCase().startsWith("usage"));
}

export async function discoverCursorModels(binary: string, timeoutMs = 5000): Promise<{ models: string[]; source: string; fallbackUsed: boolean; reason?: string }> {
  const attempts: Array<{ args: string[]; source: string; structured: boolean }> = [
    { args: ["models", "--json"], source: "models-json", structured: true },
    { args: ["model", "list", "--json"], source: "model-list-json", structured: true },
    { args: ["models"], source: "models-text", structured: false },
  ];

  for (const attempt of attempts) {
    const res = await runCursorCommand(binary, attempt.args, timeoutMs);
    if (res.code !== 0) continue;

    const output = (res.stdout || "").trim();
    if (!output) continue;

    try {
      const parsed = JSON.parse(output);
      if (Array.isArray(parsed)) {
        const ids = parsed
          .map((entry) => (typeof entry === "string" ? entry : typeof entry?.id === "string" ? entry.id : undefined))
          .filter((id): id is string => Boolean(id));
        if (ids.length > 0) {
          return { models: Array.from(new Set(ids)), source: attempt.source, fallbackUsed: !attempt.structured };
        }
      }
    } catch {
      // output is not JSON; continue with line-based fallback
    }

    const ids = Array.from(new Set(parseModelLines(output)));
    if (ids.length > 0) {
      return { models: ids, source: attempt.source, fallbackUsed: !attempt.structured };
    }
  }

  return { models: [], source: "none", fallbackUsed: true, reason: "model discovery command unavailable" };
}
