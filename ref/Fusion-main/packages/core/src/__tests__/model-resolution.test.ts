import { describe, expect, it } from "vitest";
import {
  resolveExecutionSettingsModel,
  resolvePlanningSettingsModel,
  resolveProjectDefaultModel,
  resolveTaskExecutionModel,
  resolveTaskPlanningModel,
  resolveTaskValidatorModel,
  resolveTitleSummarizerSettingsModel,
  resolveValidatorSettingsModel,
} from "../model-resolution.js";

describe("model-resolution", () => {
  it("prefers the project default override over the global default", () => {
    expect(
      resolveProjectDefaultModel({
        defaultProviderOverride: "openai",
        defaultModelIdOverride: "gpt-4o",
        defaultProvider: "anthropic",
        defaultModelId: "claude-sonnet-4-5",
      }),
    ).toEqual({ provider: "openai", modelId: "gpt-4o" });
  });

  it("uses the execution lane before the project default override", () => {
    expect(
      resolveExecutionSettingsModel({
        executionProvider: "google",
        executionModelId: "gemini-2.5-pro",
        defaultProviderOverride: "openai",
        defaultModelIdOverride: "gpt-4o",
      }),
    ).toEqual({ provider: "google", modelId: "gemini-2.5-pro" });
  });

  it("falls back from planning global to the project default override", () => {
    expect(
      resolvePlanningSettingsModel({
        defaultProviderOverride: "openai",
        defaultModelIdOverride: "gpt-4o-mini",
      }),
    ).toEqual({ provider: "openai", modelId: "gpt-4o-mini" });
  });

  it("falls back from validator global to the project default override", () => {
    expect(
      resolveValidatorSettingsModel({
        defaultProviderOverride: "anthropic",
        defaultModelIdOverride: "claude-opus-4",
      }),
    ).toEqual({ provider: "anthropic", modelId: "claude-opus-4" });
  });

  it("uses title summarizer global, then project planning, then project default override", () => {
    expect(
      resolveTitleSummarizerSettingsModel({
        titleSummarizerGlobalProvider: "openai",
        titleSummarizerGlobalModelId: "gpt-4.1",
        planningProvider: "google",
        planningModelId: "gemini-2.5-pro",
        defaultProviderOverride: "anthropic",
        defaultModelIdOverride: "claude-sonnet-4-5",
      }),
    ).toEqual({ provider: "openai", modelId: "gpt-4.1" });

    expect(
      resolveTitleSummarizerSettingsModel({
        planningProvider: "google",
        planningModelId: "gemini-2.5-pro",
        defaultProviderOverride: "anthropic",
        defaultModelIdOverride: "claude-sonnet-4-5",
      }),
    ).toEqual({ provider: "google", modelId: "gemini-2.5-pro" });

    expect(
      resolveTitleSummarizerSettingsModel({
        defaultProviderOverride: "anthropic",
        defaultModelIdOverride: "claude-sonnet-4-5",
      }),
    ).toEqual({ provider: "anthropic", modelId: "claude-sonnet-4-5" });
  });

  it("uses task overrides before settings fallbacks", () => {
    expect(
      resolveTaskExecutionModel(
        {
          modelProvider: "openai",
          modelId: "gpt-4o",
        },
        {
          executionProvider: "anthropic",
          executionModelId: "claude-sonnet-4-5",
        },
      ),
    ).toEqual({ provider: "openai", modelId: "gpt-4o" });

    expect(
      resolveTaskValidatorModel(
        {},
        {
          defaultProviderOverride: "anthropic",
          defaultModelIdOverride: "claude-sonnet-4-5",
        },
      ),
    ).toEqual({ provider: "anthropic", modelId: "claude-sonnet-4-5" });

    expect(
      resolveTaskPlanningModel(
        {},
        {
          planningGlobalProvider: "openai",
          planningGlobalModelId: "gpt-4.1",
          defaultProviderOverride: "anthropic",
          defaultModelIdOverride: "claude-sonnet-4-5",
        },
      ),
    ).toEqual({ provider: "openai", modelId: "gpt-4.1" });
  });
});
