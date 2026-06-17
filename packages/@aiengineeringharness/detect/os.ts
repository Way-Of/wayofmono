import { type DetectResult, type OsInfo } from "./types.ts";

export function detectOs(): DetectResult<OsInfo> {
  try {
    const rawPlatform = Deno.build.os;
    let platform: "linux" | "darwin" | "win32";
    if (rawPlatform === "windows") platform = "win32";
    else if (rawPlatform === "darwin") platform = "darwin";
    else platform = "linux";
    const isWindows = rawPlatform === "windows";
    const isMacos = platform === "darwin";
    const isLinux = platform === "linux";

    let distro: string | undefined;
    let distroVersion: string | undefined;
    let isWsl = false;
    let isContainer = false;

    if (isLinux) {
      try {
        const osRelease = Deno.readTextFileSync("/etc/os-release");
        const idMatch = osRelease.match(/^ID=(.+)$/m);
        const versionMatch = osRelease.match(/^VERSION_ID="?(.+?)"?$/m);
        if (idMatch) distro = idMatch[1].trim().toLowerCase();
        if (versionMatch) distroVersion = versionMatch[1].trim();
      } catch {
        try {
          const lsb = Deno.readTextFileSync("/etc/lsb-release");
          const idMatch = lsb.match(/^DISTRIB_ID=(.+)$/m);
          if (idMatch) distro = idMatch[1].trim().toLowerCase();
        } catch {}
      }

      try {
        const procVersion = Deno.readTextFileSync("/proc/version").toLowerCase();
        isWsl = procVersion.includes("microsoft") || procVersion.includes("wsl");
      } catch {}

      try {
        const cgroup = Deno.readTextFileSync("/proc/1/cgroup");
        isContainer = cgroup.includes("docker") || cgroup.includes("kubepods");
      } catch {}

      try {
        const envContainer = Deno.env.get("container");
        if (envContainer) isContainer = true;
      } catch {}
    }

    return {
      value: { platform, distro, distroVersion, isWsl, isContainer, isWindows, isMacos, isLinux },
      confidence: "high",
      source: "Deno.build.os + /etc/os-release",
    };
  } catch (err) {
    return {
      value: {
        platform: "linux",
        distro: undefined,
        distroVersion: undefined,
        isWsl: false,
        isContainer: false,
        isWindows: false,
        isMacos: false,
        isLinux: true,
      },
      confidence: "low",
      source: `fallback: ${err}`,
    };
  }
}
