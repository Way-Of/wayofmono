import type { DetectResult, OsInfo, DesktopInfo } from "../detect/types.ts";

export interface PlatformPaths {
  configDir: string;
  dataDir: string;
  stateDir: string;
  logDir: string;
  sep: "/" | "\\";
}

export function resolvePlatformPaths(os: DetectResult<OsInfo>, desktop: DetectResult<DesktopInfo>): PlatformPaths {
  const home = Deno.env.get("HOME") ?? Deno.env.get("USERPROFILE") ?? "";
  const isWindows = os.value.isWindows;
  const isMacos = os.value.isMacos;
  const sep: "/" | "\\" = isWindows ? "\\" : "/";

  if (isWindows) {
    const appdata = Deno.env.get("APPDATA") || `${home}\\AppData\\Roaming`;
    const localAppdata = Deno.env.get("LOCALAPPDATA") || `${home}\\AppData\\Local`;
    return {
      configDir: appdata,
      dataDir: localAppdata,
      stateDir: `${localAppdata}\\WayOfMono\\Harness`,
      logDir: `${localAppdata}\\WayOfMono\\Harness\\Logs`,
      sep,
    };
  }

  if (isMacos) {
    return {
      configDir: `${home}/Library/Application Support`,
      dataDir: `${home}/Library/Application Support`,
      stateDir: `${home}/Library/Application Support/com.wayofmono.harness`,
      logDir: `${home}/Library/Logs/com.wayofmono.harness`,
      sep,
    };
  }

  const xdgConfig = desktop.value.xdgConfigHome || `${home}/.config`;
  const xdgData = desktop.value.xdgDataHome || `${home}/.local/share`;
  const xdgState = desktop.value.xdgStateHome || `${home}/.local/state`;

  return {
    configDir: xdgConfig,
    dataDir: xdgData,
    stateDir: `${xdgState}/womono`,
    logDir: `${xdgState}/womono`,
    sep,
  };
}

export function sentinelPath(stateDir: string): string {
  return `${stateDir}/installed`;
}

export function lockFilePath(stateDir: string): string {
  return `${stateDir}/install.lock`;
}
