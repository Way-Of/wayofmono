import type { CapacitorConfig } from "@capacitor/cli";

const liveReloadEnabled = process.env.FUSION_LIVE_RELOAD === "true";

const config: CapacitorConfig = {
  appId: "com.fusion.mobile",
  appName: "Fusion",
  webDir: "../dashboard/dist/client",
  server: {
    url: liveReloadEnabled
      ? process.env.FUSION_SERVER_URL || "http://localhost:5173"
      : undefined,
    cleartext: liveReloadEnabled,
  },
};

export default config;
