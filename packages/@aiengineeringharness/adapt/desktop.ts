import type { DesktopInfo, OsInfo } from "../detect/types.ts";

export interface DesktopFileEntry {
  path: string;
  content: string;
}

export function generateDesktopFile(
  os: OsInfo,
  desktop: DesktopInfo,
  iconPath: string,
  binaryPath: string,
): DesktopFileEntry | null {
  if (!os.isLinux) return null;
  if (!desktop.desktopEnv) return null;

  const appsDir = `${desktop.xdgDataHome}/applications`;
  const content = `[Desktop Entry]
Type=Application
Name=WayOfMono CTO Dashboard
Comment=Release & Deploy Dashboard
Exec=${binaryPath}
Icon=${iconPath}
Terminal=false
Categories=Development;Utility;
StartupWMClass=wayofmono-cto-dashboard
`;

  return { path: `${appsDir}/wayofmono-cto-dashboard.desktop`, content };
}

export function generateIconPath(os: OsInfo, desktop: DesktopInfo, iconTheme?: string): string {
  if (os.isMacos) return "electron/build/icon.icns";
  if (os.isWindows) return "electron/build/icon.ico";
  return "electron/build/icon.png";
}

export function xdgOpenCommand(os: OsInfo, desktop: DesktopInfo): string {
  if (os.isMacos) return "open";
  if (os.isWindows) return "start";
  return "xdg-open";
}

export function clipboardCommand(os: OsInfo, desktop: DesktopInfo): string {
  if (os.isMacos) return "pbcopy";
  if (os.isWindows) return "clip";
  if (desktop.displayServer === "wayland") return "wl-copy";
  return "xclip -selection clipboard";
}
