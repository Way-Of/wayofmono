import { type DetectResult, type PermissionsInfo } from "./types.ts";

export function detectPermissions(): DetectResult<PermissionsInfo> {
  try {
    let isRoot = false;
    let isAdmin = false;
    let macosQuarantineSupport = false;
    let windowsExecutionPolicy: string | undefined;
    let homebrewAppleSilicon = false;
    let homebrewIntel = false;

    if (Deno.build.os === "linux" || Deno.build.os === "darwin") {
      try {
        const idCmd = new Deno.Command("id", { args: ["-u"] });
        const idOut = idCmd.outputSync();
        if (idOut.success) {
          isRoot = parseInt(new TextDecoder().decode(idOut.stdout).trim()) === 0;
        }
      } catch {}
    }

    if (Deno.build.os === "darwin") {
      try {
        const cmd = new Deno.Command("xattr", { args: ["-h"] });
        const out = cmd.outputSync();
        macosQuarantineSupport = out.success;
      } catch {}

      try {
        const brewCmd = new Deno.Command("which", { args: ["brew"] });
        const brewOut = brewCmd.outputSync();
        if (brewOut.success) {
          const brewPath = new TextDecoder().decode(brewOut.stdout).trim();
          homebrewAppleSilicon = brewPath.startsWith("/opt/homebrew");
          homebrewIntel = brewPath.startsWith("/usr/local");
        }
      } catch {}
    }

    if (Deno.build.os === "windows") {
      try {
        const cmd = new Deno.Command("powershell", {
          args: ["-Command", "Get-ExecutionPolicy"],
        });
        const out = cmd.outputSync();
        if (out.success) {
          windowsExecutionPolicy = new TextDecoder().decode(out.stdout).trim();
        }
      } catch {}
    }

    return {
      value: { isRoot, isAdmin, macosQuarantineSupport, windowsExecutionPolicy, homebrewAppleSilicon, homebrewIntel },
      confidence: "high",
      source: "id + xattr + which + Get-ExecutionPolicy",
    };
  } catch (err) {
    return {
      value: {
        isRoot: false,
        isAdmin: false,
        macosQuarantineSupport: false,
        homebrewAppleSilicon: false,
        homebrewIntel: false,
      },
      confidence: "low",
      source: `fallback: ${err}`,
    };
  }
}
