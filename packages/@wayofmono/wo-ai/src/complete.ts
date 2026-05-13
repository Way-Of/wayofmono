import type {
  CompletionParams,
  CompletionResult,
  SimpleCompletionParams,
  Message,
  Model,
  StreamChunk,
} from "./types.js";
import { resolveModelConfig } from "./model.js";
import { completeOpenAI } from "./providers/openai.js";
import { completeAnthropic } from "./providers/anthropic.js";
import { completeGemini } from "./providers/gemini.js";

export async function complete(
  model: Model,
  params: CompletionParams,
  opts?: { apiKey?: string; baseUrl?: string }
): Promise<CompletionResult> {
  const apiKey = opts?.apiKey;
  const baseUrl = opts?.baseUrl;

  switch (model.api) {
    case "openai":
    case "openai-completions":
      return completeOpenAI(model, params, apiKey, baseUrl);
    case "anthropic":
      return completeAnthropic(model, params, apiKey, baseUrl);
    case "gemini":
      return completeGemini(model, params, apiKey, baseUrl);
    default:
      return completeOpenAI(model, params, apiKey, baseUrl);
  }
}

export async function completeSimple(
  model: Model,
  params: SimpleCompletionParams,
  opts?: { apiKey?: string; baseUrl?: string }
): Promise<{ content: string; stopReason: import("./types.js").StopReason; usage: import("./types.js").Usage; errorMessage?: string }> {
  const messages: Message[] = params.messages;

  const result = await complete(
    model,
    {
      messages,
      system: params.systemPrompt,
      tools: params.tools,
      tool_choice: params.tool_choice,
      maxTokens: params.maxTokens,
      temperature: params.temperature,
      signal: params.signal,
    },
    opts
  );

  return result;
}

export async function completeWithConfig(
  config: { modelId?: string; api?: string; apiKey?: string; baseUrl?: string },
  params: CompletionParams
): Promise<CompletionResult> {
  const { model, apiKey, baseUrl } = resolveModelConfig({
    api: config.api as any,
    modelId: config.modelId,
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
  });

  return complete(model, params, { apiKey, baseUrl });
}
