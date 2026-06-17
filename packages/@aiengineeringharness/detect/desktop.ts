import { type DetectResult, type DesktopInfo } from "./types.ts";

export function detectDesktop(): DetectResult<DesktopInfo> {
  try {
    const isLinux = Deno.build.os === "linux";

    let desktopEnv: string | undefined;
    let displayServer: "x11" | "wayland" | "unknown" = "unknown";
    let hasNerdFont = false;
    let iconTheme: string | undefined;

    if (isLinux) {
      desktopEnv = Deno.env.get("XDG_CURRENT_DESKTOP") || undefined;
      const waylandDisplay = Deno.env.get("WAYLAND_DISPLAY");
      const x11Display = Deno.env.get("DISPLAY");
      if (waylandDisplay) displayServer = "wayland";
      else if (x11Display) displayServer = "x11";

      try {
        const fcCmd = new Deno.Command("fc-list", { args: [":lang=en"] });
        const fcOut = fcCmd.outputSync();
        if (fcOut.success) {
          const fonts = new TextDecoder().decode(fcOut.stdout).toLowerCase();
          hasNerdFont = fonts.includes("nerd") || fonts.includes("nerdfonts") || fonts.includes("nerd font");
        }
      } catch {}

      try {
        const gsettings = new Deno.Command("gsettings", {
          args: ["get", "org.gnome.desktop.interface", "icon-theme"],
        });
        const gsOut = gsettings.outputSync();
        if (gsOut.success) {
          iconTheme = new TextDecoder().decode(gsOut.stdout).trim().replace(/^'|'$/g, "");
        }
      } catch {}
    }

    const xdgConfigHome = Deno.env.get("XDG_CONFIG_HOME") || (isLinux ? `${Deno.env.get("HOME")}/.config` : "");
    const xdgDataHome = Deno.env.get("XDG_DATA_HOME") || (isLinux ? `${Deno.env.get("HOME")}/.local/share` : "");
    const xdgStateHome = Deno.env.get("XDG_STATE_HOME") || (isLinux ? `${Deno.env.get("HOME")}/.local/state` : "");

    return {
      value: { desktopEnv, displayServer, hasNerdFont, iconTheme, xdgConfigHome, xdgDataHome, xdgStateHome },
      confidence: isLinux ? "high" : "medium",
      source: "XDG env vars + fc-list + gsettings",
    };
  } catch (err) {
    return {
      value: {
        displayServer: "unknown",
        hasNerdFont: false,
        xdgConfigHome: "",
        xdgDataHome: "",
        xdgStateHome: "",
      },
      confidence: "low",
      source: `fallback: ${err}`,
    };
  }
}
