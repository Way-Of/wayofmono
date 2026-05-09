import { runCursorCommand } from "./cli-spawn.js";
import type { CursorBinaryStatus } from "./types.js";

const CANDIDATES = ["cursor-agent", "cursor"] as const;

export async function probeCursorBinary(options?: { timeoutMs?: number; binaryPath?: string }): Promise<CursorBinaryStatus> {
  const startedAt = Date.now();
  const timeoutMs = options?.timeoutMs ?? 3000;
  const candidates = options?.binaryPath ? [options.binaryPath] : [...CANDIDATES];

  for (const binary of candidates) {
    const version = await runCursorCommand(binary, ["--version"], timeoutMs);
    if (version.code === 0) {
      // NOTE: Cursor CLI currently lacks a stable auth-status contract we can
      // invoke without side effects. Treating successful --version as ready is
      // a best-effort heuristic; keychain/auth errors are handled by fallback
      // probes below when surfaced in stderr/stdout.
      return {
        available: true,
        authenticated: true,
        binaryName: binary,
        binaryPath: binary,
        version: version.stdout.trim() || undefined,
        probeDurationMs: Date.now() - startedAt,
      };
    }

    const combined = `${version.stdout}\n${version.stderr}`.toLowerCase();
    if (combined.includes("keychain is locked")) {
      return {
        available: true,
        authenticated: false,
        binaryName: binary,
        binaryPath: binary,
        reason: "macOS login keychain is locked",
        probeDurationMs: Date.now() - startedAt,
      };
    }

    if (combined.includes("no cursor ide installation found")) {
      return {
        available: true,
        authenticated: false,
        binaryName: binary,
        binaryPath: binary,
        reason: "Cursor IDE installation not found",
        probeDurationMs: Date.now() - startedAt,
      };
    }
  }

  return {
    available: false,
    authenticated: false,
    reason: "cursor-agent/cursor not found on PATH",
    probeDurationMs: Date.now() - startedAt,
  };
}
