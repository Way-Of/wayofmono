import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  validateSuggestionInput,
  generateMilestoneSuggestions,
  validateFeatureSuggestionInput,
  generateFeatureSuggestions,
  ValidationError,
  ParseError,
  ServiceUnavailableError,
  SUGGESTION_TIMEOUT_MS,
  __resetSuggestionState,
  __setCreateFnAgent,
} from "../roadmap-suggestions";

describe("roadmap-suggestions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetSuggestionState();
  });

  afterEach(() => {
    __resetSuggestionState();
  });

  describe("validateSuggestionInput", () => {
    it("accepts valid input with all fields", () => {
      const input = {
        goalPrompt: "Build a modern e-commerce platform",
        count: 5,
      };

      expect(() => validateSuggestionInput(input)).not.toThrow();
    });

    it("accepts valid input without optional count", () => {
      const input = {
        goalPrompt: "Build a modern e-commerce platform",
      };

      expect(() => validateSuggestionInput(input)).not.toThrow();
    });

    it("accepts count at minimum boundary (1)", () => {
      const input = {
        goalPrompt: "Test goal",
        count: 1,
      };

      expect(() => validateSuggestionInput(input)).not.toThrow();
    });

    it("accepts count at maximum boundary (10)", () => {
      const input = {
        goalPrompt: "Test goal",
        count: 10,
      };

      expect(() => validateSuggestionInput(input)).not.toThrow();
    });

    it("rejects null input", () => {
      expect(() => validateSuggestionInput(null)).toThrow(ValidationError);
    });

    it("rejects non-object input", () => {
      expect(() => validateSuggestionInput("string")).toThrow(ValidationError);
      expect(() => validateSuggestionInput(123)).toThrow(ValidationError);
      expect(() => validateSuggestionInput([])).toThrow(ValidationError);
    });

    it("rejects missing goalPrompt", () => {
      expect(() => validateSuggestionInput({})).toThrow(ValidationError);
      expect(() => validateSuggestionInput({ count: 5 })).toThrow(ValidationError);
    });

    it("rejects non-string goalPrompt", () => {
      expect(() =>
        validateSuggestionInput({ goalPrompt: 123 })
      ).toThrow(ValidationError);
      expect(() =>
        validateSuggestionInput({ goalPrompt: null })
      ).toThrow(ValidationError);
      expect(() =>
        validateSuggestionInput({ goalPrompt: [] })
      ).toThrow(ValidationError);
    });

    it("rejects empty goalPrompt", () => {
      expect(() =>
        validateSuggestionInput({ goalPrompt: "" })
      ).toThrow(ValidationError);
      expect(() =>
        validateSuggestionInput({ goalPrompt: "   " })
      ).toThrow(ValidationError);
    });

    it("rejects goalPrompt exceeding max length", () => {
      const longPrompt = "a".repeat(4001);
      expect(() =>
        validateSuggestionInput({ goalPrompt: longPrompt })
      ).toThrow(ValidationError);
    });

    it("accepts goalPrompt at exactly max length", () => {
      const maxPrompt = "a".repeat(4000);
      expect(() =>
        validateSuggestionInput({ goalPrompt: maxPrompt })
      ).not.toThrow();
    });

    it("rejects non-integer count", () => {
      expect(() =>
        validateSuggestionInput({ goalPrompt: "Test", count: 3.5 })
      ).toThrow(ValidationError);
    });

    it("rejects count below minimum", () => {
      expect(() =>
        validateSuggestionInput({ goalPrompt: "Test", count: 0 })
      ).toThrow(ValidationError);
      expect(() =>
        validateSuggestionInput({ goalPrompt: "Test", count: -1 })
      ).toThrow(ValidationError);
    });

    it("rejects count above maximum", () => {
      expect(() =>
        validateSuggestionInput({ goalPrompt: "Test", count: 11 })
      ).toThrow(ValidationError);
    });
  });

  describe("generateMilestoneSuggestions", () => {
    const rootDir = "/test/project";

    it("generates milestone suggestions successfully", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"title": "Foundation Setup", "description": "Set up core infrastructure"},\n  {"title": "User Authentication", "description": "Implement login and user management"}\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      const suggestions = await generateMilestoneSuggestions(
        "Build a modern e-commerce platform",
        5,
        rootDir
      );

      expect(suggestions).toHaveLength(2);
      expect(suggestions[0]).toEqual({
        title: "Foundation Setup",
        description: "Set up core infrastructure",
      });
      expect(suggestions[1]).toEqual({
        title: "User Authentication",
        description: "Implement login and user management",
      });
    });

    it("uses default count of 5 when not specified", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"title": "Setup", "description": "Initial setup"}\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      await generateMilestoneSuggestions("Test goal", undefined, rootDir);

      expect(mockCreateFnAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          cwd: rootDir,
          systemPrompt: expect.stringContaining("milestone"),
        })
      );
    });

    it("respects the count parameter", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"title": "Setup", "description": "Initial setup"}\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      await generateMilestoneSuggestions("Test goal", 3, rootDir);

      expect(mockCreateFnAgent).toHaveBeenCalled();
    });

    it("includes count in user message", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"title": "Setup", "description": "Initial setup"}\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      await generateMilestoneSuggestions("Build a platform", 5, rootDir);

      expect(mockSession.prompt).toHaveBeenCalledWith(
        expect.stringContaining("5 milestones")
      );
    });

    it("disposes session after successful generation", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"title": "Setup", "description": "Initial setup"}\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      await generateMilestoneSuggestions("Test", 5, rootDir);

      expect(mockSession.dispose).toHaveBeenCalled();
    });

    it("throws when AI service is unavailable", async () => {
      __setCreateFnAgent(undefined);

      await expect(
        generateMilestoneSuggestions("Test", 5, rootDir)
      ).rejects.toThrow("AI service is not available");
    });

    it("throws when rootDir is missing", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      await expect(
        generateMilestoneSuggestions("Test", 5)
      ).rejects.toThrow("rootDir is required");
    });

    it("handles markdown-wrapped JSON response", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '```json\n[\n  {"title": "Setup", "description": "Initial setup"}\n]\n```',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      const suggestions = await generateMilestoneSuggestions("Test", 5, rootDir);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].title).toBe("Setup");
    });

    it("handles plain array response without markdown", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"title": "Phase 1", "description": "First phase"}\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      const suggestions = await generateMilestoneSuggestions("Test", 5, rootDir);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].title).toBe("Phase 1");
    });

    it("handles suggestions without description", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[{"title": "Phase 1"}, {"title": "Phase 2", "description": "With desc"}]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      const suggestions = await generateMilestoneSuggestions("Test", 5, rootDir);

      expect(suggestions).toHaveLength(2);
      expect(suggestions[0]).toEqual({ title: "Phase 1", description: undefined });
      expect(suggestions[1]).toEqual({ title: "Phase 2", description: "With desc" });
    });

    it("limits suggestions to requested count", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"title": "One"}, {"title": "Two"}, {"title": "Three"}, {"title": "Four"}, {"title": "Five"}\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      const suggestions = await generateMilestoneSuggestions("Test", 2, rootDir);

      expect(suggestions).toHaveLength(2);
      expect(suggestions[0].title).toBe("One");
      expect(suggestions[1].title).toBe("Two");
    });

    it("strips whitespace from titles and descriptions", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"title": "  Trimmed Title  ", "description": "  With whitespace  "}\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      const suggestions = await generateMilestoneSuggestions("Test", 5, rootDir);

      expect(suggestions[0]).toEqual({
        title: "Trimmed Title",
        description: "With whitespace",
      });
    });

    it("throws ParseError when AI returns no JSON", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: "Here are some milestones without JSON",
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      await expect(
        generateMilestoneSuggestions("Test", 5, rootDir)
      ).rejects.toThrow(ParseError);
    });

    it("throws ParseError when JSON is not an array", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '{"title": "Not an array"}',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      await expect(
        generateMilestoneSuggestions("Test", 5, rootDir)
      ).rejects.toThrow(ParseError);
    });

    it("throws ParseError when milestone is missing title", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[{"description": "Missing title"}]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      await expect(
        generateMilestoneSuggestions("Test", 5, rootDir)
      ).rejects.toThrow(ParseError);
    });

    it("supports model override parameters", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"title": "Setup", "description": "Initial setup"}\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      await generateMilestoneSuggestions(
        "Test",
        5,
        rootDir,
        "openai",
        "gpt-4o"
      );

      expect(mockCreateFnAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultProvider: "openai",
          defaultModelId: "gpt-4o",
        })
      );
    });

    it("times out when AI prompt hangs", async () => {
      // Create a mock session whose prompt hangs (never resolves)
      const mockSession = {
        prompt: vi.fn().mockReturnValue(
          new Promise<undefined>(() => {
            // Never resolves - simulates hanging AI
          })
        ),
        dispose: vi.fn(),
        state: {
          messages: [],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      // Use fake timers
      vi.useFakeTimers();

      try {
        const promise = generateMilestoneSuggestions("Test goal", 5, rootDir);

        // Ensure the promise rejection is captured by attaching a handler that won't interfere
        // with the test assertion but prevents unhandled rejection warnings
        const rejectionHandler = vi.fn();
        promise.catch(rejectionHandler);

        // Advance timers past the timeout threshold
        await vi.advanceTimersByTimeAsync(SUGGESTION_TIMEOUT_MS + 100);

        // Flush all pending ticks/microtasks to ensure the rejection is fully processed
        await vi.runAllTicks();

        // The promise should have been rejected with ServiceUnavailableError
        expect(rejectionHandler).toHaveBeenCalledWith(expect.any(ServiceUnavailableError));
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe("validateFeatureSuggestionInput", () => {
    it("accepts valid input with all fields", () => {
      const input = {
        prompt: "Focus on user authentication features",
        count: 5,
      };

      expect(() => validateFeatureSuggestionInput(input)).not.toThrow();
    });

    it("accepts valid input without optional fields", () => {
      const input = {};

      expect(() => validateFeatureSuggestionInput(input)).not.toThrow();
    });

    it("accepts empty object", () => {
      expect(() => validateFeatureSuggestionInput({})).not.toThrow();
    });

    it("accepts input with only count", () => {
      const input = {
        count: 3,
      };

      expect(() => validateFeatureSuggestionInput(input)).not.toThrow();
    });

    it("accepts count at minimum boundary (1)", () => {
      const input = {
        count: 1,
      };

      expect(() => validateFeatureSuggestionInput(input)).not.toThrow();
    });

    it("accepts count at maximum boundary (10)", () => {
      const input = {
        count: 10,
      };

      expect(() => validateFeatureSuggestionInput(input)).not.toThrow();
    });

    it("rejects null input", () => {
      expect(() => validateFeatureSuggestionInput(null)).toThrow(ValidationError);
    });

    it("rejects non-object input", () => {
      expect(() => validateFeatureSuggestionInput("string")).toThrow(ValidationError);
      expect(() => validateFeatureSuggestionInput(123)).toThrow(ValidationError);
    });

    it("rejects array input", () => {
      expect(() => validateFeatureSuggestionInput([])).toThrow(ValidationError);
      expect(() => validateFeatureSuggestionInput([{ prompt: "test" }])).toThrow(ValidationError);
    });

    it("rejects non-string prompt", () => {
      expect(() =>
        validateFeatureSuggestionInput({ prompt: 123 })
      ).toThrow(ValidationError);
      expect(() =>
        validateFeatureSuggestionInput({ prompt: null })
      ).toThrow(ValidationError);
      expect(() =>
        validateFeatureSuggestionInput({ prompt: [] })
      ).toThrow(ValidationError);
    });

    it("rejects prompt exceeding max length", () => {
      const longPrompt = "a".repeat(2001);
      expect(() =>
        validateFeatureSuggestionInput({ prompt: longPrompt })
      ).toThrow(ValidationError);
    });

    it("accepts prompt at exactly max length", () => {
      const maxPrompt = "a".repeat(2000);
      expect(() =>
        validateFeatureSuggestionInput({ prompt: maxPrompt })
      ).not.toThrow();
    });

    it("rejects non-integer count", () => {
      expect(() =>
        validateFeatureSuggestionInput({ count: 3.5 })
      ).toThrow(ValidationError);
    });

    it("rejects count below minimum", () => {
      expect(() =>
        validateFeatureSuggestionInput({ count: 0 })
      ).toThrow(ValidationError);
      expect(() =>
        validateFeatureSuggestionInput({ count: -1 })
      ).toThrow(ValidationError);
    });

    it("rejects count above maximum", () => {
      expect(() =>
        validateFeatureSuggestionInput({ count: 11 })
      ).toThrow(ValidationError);
    });
  });

  describe("generateFeatureSuggestions", () => {
    const rootDir = "/test/project";

    const baseContext = {
      roadmapTitle: "E-Commerce Platform",
      roadmapDescription: "Build a modern e-commerce platform",
      milestoneTitle: "User Authentication",
      milestoneDescription: "Implement user login and management",
      existingFeatureTitles: [],
    };

    it("generates feature suggestions successfully", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"title": "Login Form", "description": "Basic login form UI"}, {"title": "OAuth Integration", "description": "Support social login"}\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      const suggestions = await generateFeatureSuggestions(
        baseContext,
        5,
        undefined,
        rootDir
      );

      expect(suggestions).toHaveLength(2);
      expect(suggestions[0]).toEqual({
        title: "Login Form",
        description: "Basic login form UI",
      });
      expect(suggestions[1]).toEqual({
        title: "OAuth Integration",
        description: "Support social login",
      });
    });

    it("includes milestone context in system prompt", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"title": "Feature", "description": "A feature"}\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      await generateFeatureSuggestions(baseContext, 5, undefined, rootDir);

      expect(mockCreateFnAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          cwd: rootDir,
          systemPrompt: expect.stringContaining("User Authentication"),
        })
      );
    });

    it("includes existing features in context when present", async () => {
      const contextWithExistingFeatures = {
        ...baseContext,
        existingFeatureTitles: ["Login Form", "Password Reset"],
      };

      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"title": "New Feature", "description": "A new feature"}\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      await generateFeatureSuggestions(
        contextWithExistingFeatures,
        5,
        undefined,
        rootDir
      );

      expect(mockCreateFnAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          systemPrompt: expect.stringContaining("Login Form"),
        })
      );
    });

    it("includes optional prompt in user message", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"title": "Feature", "description": "A feature"}\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      await generateFeatureSuggestions(
        baseContext,
        5,
        "Focus on security features",
        rootDir
      );

      expect(mockSession.prompt).toHaveBeenCalledWith(
        expect.stringContaining("Focus on security features")
      );
    });

    it("respects the count parameter", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"title": "Feature"}\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      await generateFeatureSuggestions(baseContext, 3, undefined, rootDir);

      expect(mockSession.prompt).toHaveBeenCalledWith(
        expect.stringContaining("3 features")
      );
    });

    it("disposes session after successful generation", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"title": "Feature"}\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      await generateFeatureSuggestions(baseContext, 5, undefined, rootDir);

      expect(mockSession.dispose).toHaveBeenCalled();
    });

    it("throws when AI service is unavailable", async () => {
      __setCreateFnAgent(undefined);

      await expect(
        generateFeatureSuggestions(baseContext, 5, undefined, rootDir)
      ).rejects.toThrow("AI service is not available");
    });

    it("throws when rootDir is missing", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      await expect(
        generateFeatureSuggestions(baseContext, 5, undefined)
      ).rejects.toThrow("rootDir is required");
    });

    it("handles markdown-wrapped JSON response", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '```json\n[\n  {"title": "Feature", "description": "A feature"}\n]\n```',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      const suggestions = await generateFeatureSuggestions(
        baseContext,
        5,
        undefined,
        rootDir
      );

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].title).toBe("Feature");
    });

    it("handles plain array response without markdown", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"title": "Feature 1", "description": "First feature"}\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      const suggestions = await generateFeatureSuggestions(
        baseContext,
        5,
        undefined,
        rootDir
      );

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].title).toBe("Feature 1");
    });

    it("handles suggestions without description", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[{"title": "No Description Feature"}, {"title": "With Description", "description": "Has description"}]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      const suggestions = await generateFeatureSuggestions(
        baseContext,
        5,
        undefined,
        rootDir
      );

      expect(suggestions).toHaveLength(2);
      expect(suggestions[0]).toEqual({ title: "No Description Feature", description: undefined });
      expect(suggestions[1]).toEqual({ title: "With Description", description: "Has description" });
    });

    it("limits suggestions to requested count", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"title": "One"}, {"title": "Two"}, {"title": "Three"}, {"title": "Four"}, {"title": "Five"}\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      const suggestions = await generateFeatureSuggestions(
        baseContext,
        2,
        undefined,
        rootDir
      );

      expect(suggestions).toHaveLength(2);
      expect(suggestions[0].title).toBe("One");
      expect(suggestions[1].title).toBe("Two");
    });

    it("strips whitespace from titles and descriptions", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"title": "  Trimmed Title  ", "description": "  With whitespace  "}\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      const suggestions = await generateFeatureSuggestions(
        baseContext,
        5,
        undefined,
        rootDir
      );

      expect(suggestions[0]).toEqual({
        title: "Trimmed Title",
        description: "With whitespace",
      });
    });

    it("throws ParseError when AI returns no JSON", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: "Here are some features without JSON",
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      await expect(
        generateFeatureSuggestions(baseContext, 5, undefined, rootDir)
      ).rejects.toThrow(ParseError);
    });

    it("throws ParseError when JSON is not an array", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '{"title": "Not an array"}',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      await expect(
        generateFeatureSuggestions(baseContext, 5, undefined, rootDir)
      ).rejects.toThrow(ParseError);
    });

    it("throws ParseError when feature is missing title", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[{"description": "Missing title"}]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      await expect(
        generateFeatureSuggestions(baseContext, 5, undefined, rootDir)
      ).rejects.toThrow(ParseError);
    });

    it("supports model override parameters", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"title": "Feature", "description": "A feature"}\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      await generateFeatureSuggestions(
        baseContext,
        5,
        undefined,
        rootDir,
        "openai",
        "gpt-4o"
      );

      expect(mockCreateFnAgent).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultProvider: "openai",
          defaultModelId: "gpt-4o",
        })
      );
    });

    it("filters out invalid items and returns valid ones", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"title": "Valid Feature"}, {"title": ""}, {"title": "  "}, {"title": "Also Valid", "description": "Has desc"}, {"title": null}]\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      const suggestions = await generateFeatureSuggestions(
        baseContext,
        5,
        undefined,
        rootDir
      );

      // Should filter out empty/whitespace titles and return valid ones
      expect(suggestions).toHaveLength(2);
      expect(suggestions[0]).toEqual({ title: "Valid Feature", description: undefined });
      expect(suggestions[1]).toEqual({ title: "Also Valid", description: "Has desc" });
    });

    it("throws ParseError when all items are invalid", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"description": "Only has desc"}, {"title": "   "}, {"title": null}]\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      await expect(
        generateFeatureSuggestions(baseContext, 5, undefined, rootDir)
      ).rejects.toThrow(ParseError);
    });

    it("filters out non-object items", async () => {
      const mockSession = {
        prompt: vi.fn().mockResolvedValue(undefined),
        dispose: vi.fn(),
        state: {
          messages: [
            {
              role: "assistant",
              content: [
                {
                  type: "text",
                  text: '[\n  {"title": "Valid"}, "string item", null, {"title": "Also Valid"}]\n]',
                },
              ],
            },
          ],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      const suggestions = await generateFeatureSuggestions(
        baseContext,
        5,
        undefined,
        rootDir
      );

      // Should filter out non-object items and return valid ones
      expect(suggestions).toHaveLength(2);
      expect(suggestions[0]).toEqual({ title: "Valid", description: undefined });
      expect(suggestions[1]).toEqual({ title: "Also Valid", description: undefined });
    });

    it("times out when AI prompt hangs", async () => {
      // Create a mock session whose prompt hangs (never resolves)
      const mockSession = {
        prompt: vi.fn().mockReturnValue(
          new Promise<undefined>(() => {
            // Never resolves - simulates hanging AI
          })
        ),
        dispose: vi.fn(),
        state: {
          messages: [],
        },
      };

      const mockCreateFnAgent = vi.fn().mockResolvedValue({
        session: mockSession,
      });

      __setCreateFnAgent(mockCreateFnAgent);

      // Use fake timers
      vi.useFakeTimers();

      try {
        const promise = generateFeatureSuggestions(baseContext, 5, undefined, rootDir);

        // Ensure the promise rejection is captured by attaching a handler that won't interfere
        // with the test assertion but prevents unhandled rejection warnings
        const rejectionHandler = vi.fn();
        promise.catch(rejectionHandler);

        // Advance timers past the timeout threshold
        await vi.advanceTimersByTimeAsync(SUGGESTION_TIMEOUT_MS + 100);

        // Flush all pending ticks/microtasks to ensure the rejection is fully processed
        await vi.runAllTicks();

        // The promise should have been rejected with ServiceUnavailableError
        expect(rejectionHandler).toHaveBeenCalledWith(expect.any(ServiceUnavailableError));
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
