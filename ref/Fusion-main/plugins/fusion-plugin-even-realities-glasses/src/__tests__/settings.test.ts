import { describe, expect, it } from "vitest";
import {
  agentActionsEnabled,
  getFusionBaseUrl,
  getFusionToken,
  getNotifyColumns,
  getPollingIntervalMs,
  getQuickCaptureColumn,
} from "../settings.js";

describe("settings accessors", () => {
  it("uses safe defaults", () => {
    expect(getFusionBaseUrl({})).toBe("http://localhost:4040");
    expect(getFusionToken({})).toBeUndefined();
    expect(getPollingIntervalMs({})).toBe(30000);
    expect(getNotifyColumns({})).toEqual(["in-review"]);
    expect(getQuickCaptureColumn({})).toBe("triage");
    expect(agentActionsEnabled({})).toBe(true);
  });

  it("trims string values", () => {
    expect(getFusionBaseUrl({ fusionApiBaseUrl: "  http://fusion.local:4040  " })).toBe("http://fusion.local:4040");
    expect(getFusionToken({ fusionApiToken: "  token  " })).toBe("token");
  });

  it("enforces polling minimum and finite values", () => {
    expect(getPollingIntervalMs({ pollingIntervalSeconds: 2 })).toBe(5000);
    expect(getPollingIntervalMs({ pollingIntervalSeconds: 8.9 })).toBe(8000);
    expect(getPollingIntervalMs({ pollingIntervalSeconds: Number.NaN })).toBe(30000);
  });

  it("filters notify columns and falls back when invalid", () => {
    expect(getNotifyColumns({ notifyOnColumns: ["todo", " nope ", "in-review", 4] })).toEqual(["todo", "in-review"]);
    expect(getNotifyColumns({ notifyOnColumns: ["nope"] })).toEqual(["in-review"]);
  });

  it("validates quick capture column", () => {
    expect(getQuickCaptureColumn({ quickCaptureDefaultColumn: "done" })).toBe("done");
    expect(getQuickCaptureColumn({ quickCaptureDefaultColumn: "bad-column" })).toBe("triage");
  });

  it("respects explicit boolean for agent actions", () => {
    expect(agentActionsEnabled({ enableAgentActions: false })).toBe(false);
    expect(agentActionsEnabled({ enableAgentActions: true })).toBe(true);
    expect(agentActionsEnabled({ enableAgentActions: "true" })).toBe(true);
  });
});
