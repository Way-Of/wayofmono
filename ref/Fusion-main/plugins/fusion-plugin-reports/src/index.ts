import { definePlugin } from "@fusion/plugin-sdk";
import { settingsSchema } from "./settings.js";

const plugin = definePlugin({
  manifest: {
    id: "fusion-plugin-reports",
    name: "Reports",
    version: "0.1.0",
    description: "Generates beautiful HTML system-activity reports with multi-agent review.",
    author: "Fusion Team",
    fusionVersion: ">=0.1.0",
    settingsSchema,
  },
  state: "installed",
  hooks: {},
});

export default plugin;

export * from "./settings.js";
