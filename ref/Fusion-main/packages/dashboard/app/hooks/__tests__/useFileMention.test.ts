import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFileMention } from "../useFileMention";

// Mock the api module
vi.mock("../../api", () => ({
  searchFiles: vi.fn(),
}));

import { searchFiles } from "../../api";

const mockSearchFiles = searchFiles as unknown as ReturnType<typeof vi.fn>;

describe("useFileMention", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchFiles.mockResolvedValue({ files: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("detectMention", () => {
    it("returns false when cursor is at start with no text", () => {
      const { result } = renderHook(() => useFileMention());
      act(() => {
        result.current.detectMention("", 0);
      });
      expect(result.current.mentionActive).toBe(false);
    });

    it("detects # at start of text", () => {
      const { result } = renderHook(() => useFileMention());
      act(() => {
        result.current.detectMention("#", 1);
      });
      expect(result.current.mentionActive).toBe(true);
      expect(result.current.mentionQuery).toBe("");
    });

    it("detects # at start with partial filename", () => {
      const { result } = renderHook(() => useFileMention());
      act(() => {
        result.current.detectMention("#sr", 3);
      });
      expect(result.current.mentionActive).toBe(true);
      expect(result.current.mentionQuery).toBe("sr");
    });

    it("detects # after whitespace with partial filename", () => {
      const { result } = renderHook(() => useFileMention());
      act(() => {
        result.current.detectMention("Hello #sr", 9);
      });
      expect(result.current.mentionActive).toBe(true);
      expect(result.current.mentionQuery).toBe("sr");
    });

    it("ignores # after non-whitespace (middle of word)", () => {
      const { result } = renderHook(() => useFileMention());
      act(() => {
        result.current.detectMention("foo#bar", 6);
      });
      expect(result.current.mentionActive).toBe(false);
    });

    it("ignores # preceded by letter/word", () => {
      const { result } = renderHook(() => useFileMention());
      act(() => {
        result.current.detectMention("foo#bar", 6);
      });
      expect(result.current.mentionActive).toBe(false);
    });

    it("detects # preceded by comma (valid trigger)", () => {
      const { result } = renderHook(() => useFileMention());
      // Text: "foo, #sr" with cursor at position 8 (end of "sr")
      // comma is a valid trigger character
      act(() => {
        result.current.detectMention("foo, #sr", 8);
      });
      expect(result.current.mentionActive).toBe(true);
      expect(result.current.mentionQuery).toBe("sr");
    });

    it("detects # after opening paren", () => {
      const { result } = renderHook(() => useFileMention());
      act(() => {
        result.current.detectMention("(#sr", 4);
      });
      expect(result.current.mentionActive).toBe(true);
    });

    it("resets selected index when detection changes", () => {
      const { result } = renderHook(() => useFileMention());

      // Set initial selection
      act(() => {
        result.current.setSelectedIndex(3);
      });

      // Detect new mention
      act(() => {
        result.current.detectMention("#src", 4);
      });

      expect(result.current.selectedIndex).toBe(0);
    });
  });

  describe("selectFile", () => {
    it("replaces partial mention with full file path", () => {
      const { result } = renderHook(() => useFileMention());

      // Activate mention first
      act(() => {
        result.current.detectMention("Check #src/ind", 13);
      });

      const newText = result.current.selectFile(
        { path: "src/index.ts", name: "index.ts" },
        "Check #src/ind",
      );

      expect(newText).toBe("Check #src/index.ts");
    });

    it("handles files at root level", () => {
      const { result } = renderHook(() => useFileMention());

      act(() => {
        result.current.detectMention("#app", 4);
      });

      const newText = result.current.selectFile(
        { path: "app.ts", name: "app.ts" },
        "#app",
      );

      expect(newText).toBe("#app.ts");
    });

    it("preserves text after the mention", () => {
      const { result } = renderHook(() => useFileMention());

      // Activate with cursor at end of "src" (not at space) - space is after the mention
      act(() => {
        result.current.detectMention("#src another", 4);
      });
      expect(result.current.mentionActive).toBe(true);

      const newText = result.current.selectFile(
        { path: "src/index.ts", name: "index.ts" },
        "#src another",
      );

      // Should replace "#src" with "#src/index.ts", keeping " another"
      expect(newText).toBe("#src/index.ts another");
    });

    it("does nothing when mention is not active", () => {
      const { result } = renderHook(() => useFileMention());

      const newText = result.current.selectFile(
        { path: "src/index.ts", name: "index.ts" },
        "Some text",
      );

      expect(newText).toBe("Some text");
    });
  });

  describe("dismissMention", () => {
    it("clears all mention state", () => {
      const { result } = renderHook(() => useFileMention());

      // Activate
      act(() => {
        result.current.detectMention("#test", 5);
      });

      // Dismiss
      act(() => {
        result.current.dismissMention();
      });

      expect(result.current.mentionActive).toBe(false);
      expect(result.current.mentionQuery).toBe("");
      expect(result.current.files).toEqual([]);
      expect(result.current.selectedIndex).toBe(0);
    });
  });

  describe("handleKeyDown", () => {
    it("returns false when mention is not active", () => {
      const { result } = renderHook(() => useFileMention());

      const handled = result.current.handleKeyDown(
        { key: "ArrowDown", preventDefault: vi.fn() } as unknown as React.KeyboardEvent<HTMLElement>,
        "text",
      );

      expect(handled).toBe(false);
    });

    it("returns false when no files", () => {
      const { result } = renderHook(() => useFileMention());

      act(() => {
        result.current.detectMention("#test", 5);
      });

      const handled = result.current.handleKeyDown(
        { key: "ArrowDown", preventDefault: vi.fn() } as unknown as React.KeyboardEvent<HTMLElement>,
        "#test",
      );

      expect(handled).toBe(false);
    });

    it("Enter returns false when no files are loaded (no files to select)", () => {
      const { result } = renderHook(() => useFileMention());

      act(() => {
        result.current.detectMention("#test", 5);
      });

      const preventMock = vi.fn();
      const handled = result.current.handleKeyDown(
        { key: "Enter", preventDefault: preventMock } as unknown as React.KeyboardEvent<HTMLElement>,
        "#test",
      );

      expect(handled).toBe(false);
    });

    it("Tab returns false when no files are loaded (no files to select)", () => {
      const { result } = renderHook(() => useFileMention());

      act(() => {
        result.current.detectMention("#test", 5);
      });

      const preventMock = vi.fn();
      const handled = result.current.handleKeyDown(
        { key: "Tab", preventDefault: preventMock } as unknown as React.KeyboardEvent<HTMLElement>,
        "#test",
      );

      expect(handled).toBe(false);
    });

    it("Escape returns false when mention is not active", () => {
      const { result } = renderHook(() => useFileMention());

      const preventMock = vi.fn();
      const handled = result.current.handleKeyDown(
        { key: "Escape", preventDefault: preventMock } as unknown as React.KeyboardEvent<HTMLElement>,
        "some text",
      );

      expect(handled).toBe(false);
    });
  });
});