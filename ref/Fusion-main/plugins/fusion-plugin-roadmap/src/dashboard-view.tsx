import type { PluginDashboardViewContext } from "@fusion/dashboard/app/plugins/types";
import { RoadmapsView } from "./dashboard/RoadmapsView.js";

export function RoadmapDashboardView({ context }: { context?: PluginDashboardViewContext }) {
  return <RoadmapsView projectId={context?.projectId} addToast={context?.addToast ?? (() => undefined)} />;
}
