import { describe, expect, it, vi } from "vitest";
import { StubGlassesTransport } from "../transport.js";

describe("StubGlassesTransport", () => {
  it("records pushes in order", async () => {
    const transport = new StubGlassesTransport();
    await transport.pushCard({ id: "1", kind: "task", title: "A", lines: [], badge: "todo" });
    await transport.pushCard({ id: "2", kind: "task", title: "B", lines: [], badge: "done" });
    expect(transport.pushedCards.map((card) => card.id)).toEqual(["1", "2"]);
  });

  it("emits synthetic actions to handlers", async () => {
    const transport = new StubGlassesTransport();
    const handler = vi.fn();
    transport.onAction(handler);

    await transport.emitAction({ type: "quick-capture", text: "new task", timestamp: new Date().toISOString() });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ type: "quick-capture" }));
  });
});
