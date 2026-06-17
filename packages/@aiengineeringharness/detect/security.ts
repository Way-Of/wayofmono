import { type DetectResult, type SecurityInfo } from "./types.ts";

export function detectSecurity(): DetectResult<SecurityInfo> {
  try {
    let sshAgentRunning = false;
    try {
      sshAgentRunning = !!Deno.env.get("SSH_AUTH_SOCK");
    } catch {}

    let gpgKeys = 0;
    try {
      const cmd = new Deno.Command("gpg", { args: ["--list-keys", "--batch", "--with-colons"] });
      const out = cmd.outputSync();
      if (out.success) {
        const text = new TextDecoder().decode(out.stdout);
        gpgKeys = text.split("\n").filter((l) => l.startsWith("pub:")).length;
      }
    } catch {}

    let hasKeychain = false;
    try {
      if (Deno.build.os === "darwin") {
        const cmd = new Deno.Command("security", { args: ["list-keychains"] });
        const out = cmd.outputSync();
        hasKeychain = out.success;
      } else if (Deno.build.os === "linux") {
        hasKeychain = !!Deno.env.get("GNOME_KEYRING_CONTROL");
      }
    } catch {}

    let selinuxEnforcing = false;
    try {
      const cmd = new Deno.Command("getenforce", { args: [] });
      const out = cmd.outputSync();
      if (out.success) {
        selinuxEnforcing = new TextDecoder().decode(out.stdout).trim() === "Enforcing";
      }
    } catch {}

    let apparmorEnforcing = false;
    try {
      const cmd = new Deno.Command("aa-status", { args: ["--enabled"] });
      const out = cmd.outputSync();
      apparmorEnforcing = out.success;
    } catch {}

    return {
      value: { sshAgentRunning, gpgKeys, hasKeychain, selinuxEnforcing, apparmorEnforcing },
      confidence: "high",
      source: "env vars + gpg + security commands",
    };
  } catch (err) {
    return {
      value: { sshAgentRunning: false, gpgKeys: 0, hasKeychain: false, selinuxEnforcing: false, apparmorEnforcing: false },
      confidence: "low",
      source: `fallback: ${err}`,
    };
  }
}
