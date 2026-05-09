import { lazy } from "react";
import { registerPluginView } from "./pluginViewRegistry";

let registered = false;

export function registerBundledPluginViews(): void {
  if (registered) return;
  registered = true;

  registerPluginView(
    "fusion-plugin-dependency-graph",
    "graph",
    lazy(async () => {
      const mod = await import("@fusion-plugin-examples/dependency-graph/dashboard-view");
      return { default: mod.DependencyGraphDashboardView };
    }),
  );

  registerPluginView(
    "roadmap-planner",
    "roadmaps",
    lazy(async () => {
      const mod = await import("@fusion-plugin-examples/roadmap/dashboard-view");
      return { default: mod.RoadmapDashboardView };
    }),
  );
}
