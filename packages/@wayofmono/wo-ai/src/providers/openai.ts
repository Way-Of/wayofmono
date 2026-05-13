import { fetchWithRetry } from "../retry.js";
import type { CompletionParams, CompletionResult, StreamChunk, Model, Message, ToolDefinition } from "../types.js";

interface OpenAIMessage {
  role: string;
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
}

interface OpenAIChoice {
  delta?: { role?: string; content?: string | null; tool_calls?: Array<{ index: number; id?: string; type: "function"; function?: { name?: string; arguments?: string } }> };
  message?: { role: string; content?: string | null; tool_calls?: Array<{ id: string; type: "function"; function: { name: string; arguments: string } }> };
  finish_reason: string | null;
}

function convertMessages(messages: Message[], system?: string): OpenAIMessage[] {
  const result: OpenAIMessage[] = [];

  if (system) {
    result.push({ role: "system", content: system });
  }

  for (const msg of messages) {
    if (typeof msg.content === "string") {
      result.push({ role: msg.role, content: msg.content });
    } else {
      const parts = msg.content.map((c) => {
        if (c.type === "text") return { type: "text", text: c.text };
        if (c.type === "image") return { type: "image_url", image_url: { url: `data:${c.source.mediaType};base64,${c.source.data}` } };
        return { type: "text", text: "" };
      });
      result.push({ role: msg.role, content: parts });
    }
  }

  return result;
}

function convertTools(tools?: ToolDefinition[]): Array<{ type: "function"; function: { name: string; description: string; parameters: Record<string, unknown> } }> | undefined {
  if (!tools || tools.length === 0) return undefined;
  return tools.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters as unknown as Record<string, unknown>,
    },
  }));
}

export async function completeOpenAI(
  model: Model,
  params: CompletionParams,
  apiKey?: string,
  baseUrl?: string
): Promise<CompletionResult> {
  const url = `${baseUrl || "https://api.openai.com/v1"}/chat/completions`;
  const key = apiKey || process.env.OPENAI_API_KEY || "";

  const body: Record<string, unknown> = {
    model: model.modelId,
    messages: convertMessages(params.messages, params.system),
    max_tokens: params.maxTokens || model.maxTokens,
    temperature: params.temperature,
    top_p: params.topP,
    stream: !!params.onStream,
  };

  const tools = convertTools(params.tools);
  if (tools) body.tools = tools;
  if (params.tool_choice) body.tool_choice = params.tool_choice;

  if (params.onStream) {
    return streamOpenAI(url, key, body, params.onStream, params.signal);
  }

  let res: Response;
  try {
    res = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
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
    choices: OpenAIChoice[];
    usage?: { prompt_tokens: number; completion_tokens: number };
    error?: { message: string };
  };

  if (data.error) {
    return { content: "", stopReason: "error", usage: { input: 0, output: 0 }, errorMessage: data.error.message };
  }

  const choice = data.choices?.[0];
  const content = choice?.message?.content || "";
  const toolCalls = choice?.message?.tool_calls;

  let resultContent = content;
  if (toolCalls) {
    resultContent = JSON.stringify(toolCalls.map((tc) => ({
      tool_use: { id: tc.id, name: tc.function.name, input: JSON.parse(tc.function.arguments) },
    })));
  }

  return {
    content: resultContent,
    stopReason: mapStopReason(choice?.finish_reason || "stop"),
    usage: {
      input: data.usage?.prompt_tokens || 0,
      output: data.usage?.completion_tokens || 0,
    },
  };
}

async function streamOpenAI(
  url: string,
  apiKey: string,
  body: Record<string, unknown>,
  onStream: (chunk: StreamChunk) => void,
  signal?: AbortSignal
): Promise<CompletionResult> {
  let res: Response;
  try {
    res = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
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
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data) as {
            choices?: OpenAIChoice[];
            usage?: { prompt_tokens: number; completion_tokens: number };
          };

          const choice = parsed.choices?.[0];
          if (choice?.delta?.content) {
            fullContent += choice.delta.content;
            onStream({ type: "text", text: choice.delta.content });
          }

          if (choice?.delta?.tool_calls) {
            for (const tc of choice.delta.tool_calls) {
              if (tc.function?.name || tc.function?.arguments) {
                onStream({
                  type: "tool_use",
                  toolName: tc.function?.name,
                  toolInput: tc.function?.arguments,
                  toolCallId: tc.id,
                });
                const partial = JSON.stringify({ toolCallId: tc.id, name: tc.function?.name, args: tc.function?.arguments });
                fullContent += partial;
              }
            }
          }

          if (choice?.finish_reason) {
            stopReason = mapStopReason(choice.finish_reason);
          }

          if (parsed.usage) {
            usage.input = parsed.usage.prompt_tokens || 0;
            usage.output = parsed.usage.completion_tokens || 0;
          }
        } catch {
          // skip parse errors in streaming
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
    case "stop": return "end_turn";
    case "length": return "max_tokens";
    case "tool_calls": return "tool_use";
    case "content_filter": return "error";
    default: return "end_turn";
  }
}
