import { describe, expect, it, vi } from "vitest";
import type { CustomProvider } from "@fusion/core";
import {
  registerCustomProviders,
  reregisterCustomProviders,
  resolveApiType,
} from "../custom-provider-registry.js";

describe("custom-provider-registry", () => {
  it.each([
    ["openai-compatible", "openai-completions"],
    ["anthropic-compatible", "anthropic"],
  ])("resolveApiType maps %s -> %s", (apiType, expectedApi) => {
    expect(resolveApiType(apiType)).toBe(expectedApi);
  });

  it("registers providers with expected config shape", () => {
    const registerProvider = vi.fn();
    const refresh = vi.fn();
    const logFn = vi.fn();
    const providers: CustomProvider[] = [
      {
        id: "openai-custom",
        name: "OpenAI Custom",
        apiType: "openai-compatible",
        baseUrl: "https://example.test/v1",
        apiKey: "CUSTOM_KEY",
        models: [{ id: "m1", name: "Model 1" }],
      },
      {
        id: "anthropic-custom",
        name: "Anthropic Custom",
        apiType: "anthropic-compatible",
        baseUrl: "https://anthropic.test",
        apiKey: "ANTHROPIC_KEY",
        models: [{ id: "claude-x", name: "Claude X" }],
      },
    ];

    registerCustomProviders({ registerProvider, refresh }, providers, logFn);

    expect(registerProvider).toHaveBeenNthCalledWith(1, "openai-custom", expect.objectContaining({
      baseUrl: "https://example.test/v1",
      api: "openai-completions",
      apiKey: "CUSTOM_KEY",
      models: [expect.objectContaining({ id: "m1", name: "Model 1" })],
    }));
    expect(registerProvider).toHaveBeenNthCalledWith(2, "anthropic-custom", expect.objectContaining({
      baseUrl: "https://anthropic.test",
      api: "anthropic",
      apiKey: "ANTHROPIC_KEY",
      models: [expect.objectContaining({ id: "claude-x", name: "Claude X" })],
    }));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("handles empty provider list and still refreshes", () => {
    const registerProvider = vi.fn();
    const refresh = vi.fn();

    registerCustomProviders({ registerProvider, refresh }, [], vi.fn());

    expect(registerProvider).not.toHaveBeenCalled();
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("uses empty models when models is missing", () => {
    const registerProvider = vi.fn();
    const refresh = vi.fn();

    registerCustomProviders(
      { registerProvider, refresh },
      [{
        id: "no-models",
        name: "No Models",
        apiType: "openai-compatible",
        baseUrl: "https://nomodels.test",
      }],
      vi.fn(),
    );

    expect(registerProvider).toHaveBeenCalledWith("no-models", expect.objectContaining({ models: [] }));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("continues when one provider registration fails", () => {
    const registerProvider = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error("boom");
      })
      .mockImplementationOnce(() => undefined);
    const refresh = vi.fn();
    const logFn = vi.fn();

    registerCustomProviders(
      { registerProvider, refresh },
      [
        {
          id: "bad",
          name: "Bad",
          apiType: "openai-compatible",
          baseUrl: "https://bad.test",
        },
        {
          id: "good",
          name: "Good",
          apiType: "openai-compatible",
          baseUrl: "https://good.test",
        },
      ],
      logFn,
    );

    expect(registerProvider).toHaveBeenCalledTimes(2);
    expect(logFn).toHaveBeenCalledWith(expect.stringContaining("Failed to register custom provider bad"));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("reregisters new providers", () => {
    const registerProvider = vi.fn();
    const refresh = vi.fn();

    reregisterCustomProviders(
      { registerProvider, refresh },
      [{ id: "old", name: "Old", apiType: "openai-compatible", baseUrl: "https://old.test" }],
      [
        { id: "old", name: "Old", apiType: "openai-compatible", baseUrl: "https://old.test" },
        { id: "new", name: "New", apiType: "anthropic-compatible", baseUrl: "https://new.test" },
      ],
      vi.fn(),
    );

    expect(registerProvider).toHaveBeenCalledTimes(1);
    expect(registerProvider).toHaveBeenCalledWith("new", expect.objectContaining({ api: "anthropic" }));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("reregisters changed providers", () => {
    const registerProvider = vi.fn();
    const refresh = vi.fn();

    reregisterCustomProviders(
      { registerProvider, refresh },
      [{ id: "same-id", name: "Provider", apiType: "openai-compatible", baseUrl: "https://one.test", apiKey: "A" }],
      [{ id: "same-id", name: "Provider", apiType: "openai-compatible", baseUrl: "https://two.test", apiKey: "B" }],
      vi.fn(),
    );

    expect(registerProvider).toHaveBeenCalledTimes(1);
    expect(registerProvider).toHaveBeenCalledWith("same-id", expect.objectContaining({
      baseUrl: "https://two.test",
      apiKey: "B",
    }));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("handles empty previous/current arrays", () => {
    const registerProvider = vi.fn();
    const refresh = vi.fn();

    reregisterCustomProviders({ registerProvider, refresh }, [], [], vi.fn());

    expect(registerProvider).not.toHaveBeenCalled();
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
