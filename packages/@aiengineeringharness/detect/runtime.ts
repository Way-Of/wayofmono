import { type DetectResult, type RuntimeInfo } from "./types.ts";

function tryVersion(binary: string, ...args: string[]): { detected: boolean; version?: string; path?: string } {
  try {
    const cmd = new Deno.Command(binary, { args: args.length ? args : ["--version"] });
    const out = cmd.outputSync();
    if (out.success) {
      const version = new TextDecoder().decode(out.stdout).trim().split("\n")[0];
      let path: string | undefined;
      try {
        const which = new Deno.Command("which", { args: [binary] });
        const w = which.outputSync();
        if (w.success) path = new TextDecoder().decode(w.stdout).trim();
      } catch {}
      return { detected: true, version, path };
    }
  } catch {}
  return { detected: false };
}

export function detectRuntime(): DetectResult<RuntimeInfo> {
  try {
    const deno = tryVersion("deno");
    const node = tryVersion("node");
    const python = tryVersion("python3");
    const python2 = tryVersion("python");
    const pnpm = tryVersion("pnpm");
    const npm = tryVersion("npm");
    const yarn = tryVersion("yarn");

    let git: RuntimeInfo["git"] = { detected: false, hasSigningKey: false };
    try {
      const gitv = tryVersion("git");
      if (gitv.detected) {
        let userName: string | undefined;
        let userEmail: string | undefined;
        let hasSigningKey = false;
        try {
          const nameCmd = new Deno.Command("git", { args: ["config", "user.name"] });
          const nameOut = nameCmd.outputSync();
          if (nameOut.success) userName = new TextDecoder().decode(nameOut.stdout).trim();
        } catch {}
        try {
          const emailCmd = new Deno.Command("git", { args: ["config", "user.email"] });
          const emailOut = emailCmd.outputSync();
          if (emailOut.success) userEmail = new TextDecoder().decode(emailOut.stdout).trim();
        } catch {}
        try {
          const signCmd = new Deno.Command("git", { args: ["config", "user.signingkey"] });
          const signOut = signCmd.outputSync();
          hasSigningKey = signOut.success && new TextDecoder().decode(signOut.stdout).trim().length > 0;
        } catch {}
        git = { detected: true, version: gitv.version, userName, userEmail, hasSigningKey };
      }
    } catch {}

    return {
      value: {
        deno,
        node,
        python: python.detected ? python : python2,
        pnpm,
        npm,
        yarn,
        git,
      },
      confidence: "high",
      source: "which + --version for each runtime",
    };
  } catch (err) {
    return {
      value: {
        deno: { detected: false },
        node: { detected: false },
        python: { detected: false },
        pnpm: { detected: false },
        npm: { detected: false },
        yarn: { detected: false },
        git: { detected: false, hasSigningKey: false },
      },
      confidence: "low",
      source: `fallback: ${err}`,
    };
  }
}
