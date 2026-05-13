import { fetchWithRetry } from "../retry.js";
import type { CompletionParams, CompletionResult, StreamChunk, Model, Message } from "../types.js";

interface GeminiContent {
  role: string;
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
}

interface GeminiCandidate {
  content: GeminiContent;
  finishReason: string;
}

interface GeminiUsage {
  promptTokenCount: number;
  candidatesTokenCount: number;
  cacheTokensCount?: number;
}

function convertMessages(messages: Message[], system?: string): { systemInstruction?: GeminiContent; contents: GeminiContent[] } {
  const contents: GeminiContent[] = [];

  for (const msg of messages) {
    if (msg.role === "system") continue;

    if (typeof msg.content === "string") {
      contents.push({ role: msg.role === "assistant" ? "model" : "user", parts: [{ text: msg.content }] });
    } else {
      const parts = msg.content.map((c) => {
        if (c.type === "text") return { text: c.text };
        if (c.type === "image") return { inlineData: { mimeType: c.source.mediaType, data: c.source.data } };
        return { text: JSON.stringify(c) };
      });
      contents.push({ role: msg.role === "assistant" ? "model" : "user", parts });
    }
  }

  const systemPrompt = messages.find((m) => m.role === "system")?.content as string | undefined || system;
  const systemInstruction = systemPrompt ? { role: "user", parts: [{ text: systemPrompt }] } : undefined;

  return { systemInstruction, contents };
}

function convertTools(tools?: import("../types.js").ToolDefinition[]) {
  if (!tools || tools.length === 0) return undefined;
  return {
    functionDeclarations: tools.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters as unknown as Record<string, unknown>,
    })),
  };
}

export async function completeGemini(
  model: Model,
  params: CompletionParams,
  apiKey?: string,
  baseUrl?: string
): Promise<CompletionResult> {
  const key = apiKey || process.env.GEMINI_API_KEY || "";
  const url = `${baseUrl || "https://generativelanguage.googleapis.com/v1beta"}/models/${model.modelId}:generateContent`;

  const { systemInstruction, contents } = convertMessages(params.messages, params.system);

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      maxOutputTokens: params.maxTokens || model.maxTokens || 8192,
      temperature: params.temperature,
      topP: params.topP,
    },
  };

  if (systemInstruction) body.systemInstruction = systemInstruction;

  const tools = convertTools(params.tools);
  if (tools) body.tools = [tools];

  if (params.onStream) {
    return streamGemini(model.modelId, url, key, body, params.onStream, params.signal);
  }

  let res: Response;
  try {
    res = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body),
      signal: params.signal,
      maxRetries: 3,
      baseDelayMs: 2000,
    });
  } catch (err) {
    return { content: "", stopReason: "error", usage: { input: 0, output: 0 }, errorMessage: err instanceof Error ? err.message : String(err) };
  }

  if (!res.ok) {
    const err = await res.text();
    return { content: "", stopReason: "error", usage: { input: 0, output: 0 }, errorMessage: err };
  }

  const data = await res.json() as {
    candidates?: GeminiCandidate[];
    usageMetadata?: GeminiUsage;
    error?: { message: string };
  };

  if (data.error) {
    return { content: "", stopReason: "error", usage: { input: 0, output: 0 }, errorMessage: data.error.message };
  }

  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.filter((p) => p.text).map((p) => p.text).join("") || "";

  return {
    content: text,
    stopReason: mapStopReason(candidate?.finishReason || "STOP"),
    usage: {
      input: data.usageMetadata?.promptTokenCount || 0,
      output: data.usageMetadata?.candidatesTokenCount || 0,
      cache: { input: data.usageMetadata?.cacheTokensCount },
    },
  };
}

async function streamGemini(
  modelId: string,
  baseUrl: string,
  apiKey: string,
  body: Record<string, unknown>,
  onStream: (chunk: StreamChunk) => void,
  signal?: AbortSignal
): Promise<CompletionResult> {
  const url = baseUrl.replace(":generateContent", ":streamGenerateContent") + "?alt=sse";

  let res: Response;
  try {
    res = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(body),
      signal,
      maxRetries: 3,
      baseDelayMs: 2000,
    });
  } catch (err) {
    return { content: "", stopReason: "error", usage: { input: 0, output: 0 }, errorMessage: err instanceof Error ? err.message : String(err) };
  }

  if (!res.ok) {
    const err = await res.text();
    return { content: "", stopReason: "error", usage: { input: 0, output: 0 }, errorMessage: err };
  }

  const reader = res.body?.getReader();
  if (!reader) {
    return { content: "", stopReason: "error", usage: { input: 0, output: 0 }, errorMessage: "No response body" };
  }

  const decoder = new TextDecoder();
  let fullContent = "";
  let buffer = "";
  let stopReason: import("../types.js").StopReason = "end_turn";
  const usage: import("../types.js").Usage = { input: 0, output: 0 };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;
        const raw = trimmed.slice(5).trim();
        if (!raw || raw === "[DONE]") continue;

        try {
          const parsed = JSON.parse(raw) as {
            candidates?: Array<{
              content?: { parts?: Array<{ text?: string }> };
              finishReason?: string;
            }>;
            usageMetadata?: {
              promptTokenCount: number;
              candidatesTokenCount: number;
            };
          };

          const candidate = parsed.candidates?.[0];
          if (candidate?.content?.parts) {
            for (const part of candidate.content.parts) {
              if (part.text) {
                fullContent += part.text;
                onStream({ type: "text", text: part.text });
              }
            }
          }

          if (candidate?.finishReason) {
            stopReason = mapStopReason(candidate.finishReason);
          }

          if (parsed.usageMetadata) {
            usage.input = parsed.usageMetadata.promptTokenCount || 0;
            usage.output = parsed.usageMetadata.candidatesTokenCount || 0;
          }
        } catch {
          // skip parse errors
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  onStream({ type: "done", stopReason, usage });
  return { content: fullContent, stopReason, usage };
}

function mapStopReason(reason: string): import("../types.js").StopReason {
  switch (reason) {
    case "STOP": return "end_turn";
    case "MAX_TOKENS": return "max_tokens";
    case "SAFETY": case "BLOCKLIST": return "content_filtered";
    case "TOOL_USE": case "FUNCTION_CALL": return "tool_use";
    default: return "end_turn";
  }
}
