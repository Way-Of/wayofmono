import { resolve, normalize, relative } from "node:path";
import { stat } from "node:fs/promises";
import type { WorkspaceConfig } from "./types.js";

export function createWorkspace(config: WorkspaceConfig) {
  const root = resolve(config.root);
  const maxFileBytes = config.maxFileBytes ?? 1_048_576;
  const maxGrepBytes = config.maxGrepBytes ?? 120_000;
  const maxListEntries = config.maxListEntries ?? 200;
  const bashTimeoutMs = config.bashTimeoutMs ?? 28_000;
  const maxBashCmd = config.maxBashCmd ?? 8_000;

  function resolvePath(rel: string): string | null {
    const clean = rel.replace(/^[/\\]+/, "");
    const abs = normalize(resolve(root, clean));
    if (!abs.startsWith(root)) return null;
    return abs;
  }

  function toRelative(abs: string): string {
    return relative(root, abs).replace(/\\/g, "/");
  }

  async function readFile(rel: string, offset?: number, limit?: number): Promise<string> {
    const abs = resolvePath(rel);
    if (!abs) return "read: path is not inside the workspace or is unsafe.";
    try {
      const st = await stat(abs);
      if (!st.isFile()) return `read: not a file: ${rel}`;
      if (st.size > maxFileBytes) return `read: file too large (${st.size} bytes; max ${maxFileBytes}).`;
      const raw = await import("node:fs/promises").then(m => m.readFile(abs, "utf8"));
      const lines = raw.split(/\r?\n/);
      const off = Math.max(1, Math.floor(offset ?? 1));
      const lim = Math.min(500, Math.max(1, Math.floor(limit ?? 200)));
      const slice = lines.slice(off - 1, off - 1 + lim);
      return `[read ${rel} lines ${off}-${off + slice.length - 1} of ${lines.length}]\n${slice.join("\n")}`;
    } catch (e) {
      return `read: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  return {
    root,
    resolvePath,
    toRelative,
    readFile,
    maxFileBytes,
    maxGrepBytes,
    maxListEntries,
    bashTimeoutMs,
    maxBashCmd,
  };
}

export type Workspace = ReturnType<typeof createWorkspace>;
