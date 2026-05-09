import { describe, expect, it, vi } from "vitest";
import {
  FILLER_TOKENS,
  GlassesInputError,
  parseUtterance,
  runQuickCapture,
  splitTitleAndDescription,
  stripFillerTokens,
  stripWakePhrases,
} from "../quick-capture.js";

describe("quick-capture parsing", () => {
  it("strips wake phrases only at start", () => {
    expect(stripWakePhrases("hey fusion add a feature")).toBe("add a feature");
    expect(stripWakePhrases("call hey fusion later")).toBe("call hey fusion later");
  });

  it("removes filler tokens as whole words", () => {
    expect(FILLER_TOKENS).toContain("um");
    expect(stripFillerTokens("um, ship it")).toBe("ship it");
    expect(stripFillerTokens("summary")).toBe("summary");
  });

  it("splits title and description on first sentence boundary", () => {
    expect(splitTitleAndDescription("Ship parser. Add tests")).toEqual({
      title: "Ship parser.",
      description: "Add tests",
    });
    expect(splitTitleAndDescription("No boundary text")).toEqual({
      title: "No boundary text",
      description: "No boundary text",
    });
  });

  it("truncates long title and pushes overflow to description", () => {
    const { title, description } = splitTitleAndDescription(
      "this title is intentionally very long and should be truncated before eighty characters with overflow kept",
      { maxTitleChars: 80 },
    );
    expect(title.length).toBeLessThanOrEqual(80);
    expect(description).toContain("overflow kept");
  });

  it("throws on empty utterance", () => {
    expect(() => parseUtterance("")).toThrowError(GlassesInputError);
    expect(() => parseUtterance("   ")).toThrowError(/empty utterance/);
  });

  it("creates task with default column and channel metadata", async () => {
    const createTask = vi.fn(async (input) => ({ id: "FN-1", ...input, title: "t", column: input.column }));
    await runQuickCapture(
      { text: "hey fusion, write docs" },
      { taskStore: { createTask } as never, pluginId: "fusion-plugin-even-realities-glasses", defaultColumn: "triage" },
    );
    expect(createTask).toHaveBeenCalledWith(
      expect.objectContaining({
        column: "triage",
        source: expect.objectContaining({
          sourceMetadata: expect.objectContaining({ channel: "glasses-quick-capture" }),
        }),
      }),
    );
  });

  it("honors valid column override and rejects invalid column", async () => {
    const createTask = vi.fn(async (input) => ({ id: "FN-2", ...input, title: "t", column: input.column }));
    await runQuickCapture(
      { text: "ship it", column: "done" },
      { taskStore: { createTask } as never, pluginId: "fusion-plugin-even-realities-glasses", defaultColumn: "triage" },
    );
    expect(createTask).toHaveBeenCalledWith(expect.objectContaining({ column: "done" }));

    await expect(
      runQuickCapture(
        { text: "ship it", column: "bad-column" },
        { taskStore: { createTask } as never, pluginId: "fusion-plugin-even-realities-glasses", defaultColumn: "triage" },
      ),
    ).rejects.toThrowError(GlassesInputError);
  });
});
