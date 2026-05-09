import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPluginSetupStatus, installPluginSetup } from "../../api";

describe("plugin setup API helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetchPluginSetupStatus calls setup-status endpoint with encoded id", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ hasSetup: true, status: "installed" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const result = await fetchPluginSetupStatus("plugin/id");

    expect(result).toEqual({ hasSetup: true, status: "installed" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/plugins/plugin%2Fid/setup-status",
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      }),
    );
  });

  it("fetchPluginSetupStatus includes projectId query parameter", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ hasSetup: false }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await fetchPluginSetupStatus("my-plugin", "project/one");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/plugins/my-plugin/setup-status?projectId=project%2Fone",
      expect.any(Object),
    );
  });

  it("installPluginSetup posts to setup install endpoint and supports project scope", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const result = await installPluginSetup("my plugin", "proj");

    expect(result).toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/plugins/my%20plugin/setup/install?projectId=proj",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
