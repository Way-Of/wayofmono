import { discoverCursorModels } from "./process-manager.js";
import { probeCursorBinary } from "./probe.js";

export async function discoverCursorProviderModels() {
  const probe = await probeCursorBinary();
  if (!probe.available || !probe.binaryName) {
    return { models: [], source: "probe", fallbackUsed: true, reason: probe.reason ?? "binary unavailable" };
  }
  const result = await discoverCursorModels(probe.binaryName);
  return {
    models: result.models.map((id) => ({ id, label: id })),
    source: result.source,
    fallbackUsed: result.fallbackUsed,
    reason: result.reason,
  };
}
