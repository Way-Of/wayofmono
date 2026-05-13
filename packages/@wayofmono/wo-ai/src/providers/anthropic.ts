import { fetchWithRetry } from "../retry.js";
import type { CompletionParams, CompletionResult, StreamChunk, Model, Message } from "../types.js";

interface AnthropicContent {
  type: string;
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  source?: { type: string; media_type: string; data: string };
  thinking?: string;
  signature?: string;
}

interface AnthropicMessage {
  role: string;
  content: string | AnthropicContent[];
}

interface AnthropicUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

function convertMessages(messages: Message[], system?: string): { system?: string; messages: AnthropicMessage[] } {
  const result: AnthropicMessage[] = [];

  for (const msg of messages) {
    if (msg.role === "system") continue;

    if (typeof msg.content === "string") {
      result.push({ role: msg.role, content: msg.content });
    } else {
      const content: AnthropicContent[] = msg.content.map((c) => {
        if (c.type === "text") return { type: "text", text: c.text };
        if (c.type === "image") return { type: "image", source: { type: "base64", media_type: c.source.mediaType, data: c.source.data } };
        if (c.type === "tool_use") return { type: "tool_use", id: c.id, name: c.name, input: c.input };
        if (c.type === "tool_result") return { type: "tool_result", content: typeof c.content === "string" ? c.content : [{ type: "text", text: JSON.stringify(c.content) }] };
        return { type: "text", text: "" };
      });
      result.push({ role: msg.role, content });
    }
  }

  const systemPrompt = messages.find((m) => m.role === "system")?.content as string | undefined || system;

  return { system: systemPrompt, messages: result };
}

function convertTools(tools?: import("../types.js").ToolDefinition[]) {
  if (!tools || tools.length === 0) return undefined;
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters as unknown as Record<string, unknown>,
  }));
}

export async function completeAnthropic(
  model: Model,
  params: CompletionParams,
  apiKey?: string,
  baseUrl?: string
): Promise<CompletionResult> {
  const url = `${baseUrl || "https://api.anthropic.com/v1"}/messages`;
  const key = apiKey || process.env.ANTHROPIC_API_KEY || "";

  const { system, messages } = convertMessages(params.messages, params.system);

  const body: Record<string, unknown> = {
    model: model.modelId,
    messages,
    max_tokens: params.maxTokens || model.maxTokens || 8192,
  };

  if (system) body.system = system;
  if (params.temperature !== undefined) body.temperature = params.temperature;
  if (params.topP !== undefined) body.top_p = params.topP;

  const tools = convertTools(params.tools);
  if (tools) body.tools = tools;
  if (params.tool_choice) body.tool_choice = params.tool_choice;

  if (params.thinking?.level && params.thinking.level !== "none") {
    body.thinking = {
      type: "enabled",
      budget_tokens: params.thinking.budget || 16000,
    };
  }

  if (params.onStream) {
    return streamAnthropic(url, key, body, params.onStream, params.signal);
  }

  let res: Response;
  try {
    res = await fetchWithRetry(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
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
    content: AnthropicContent[];
    stop_reason: string;
    usage: AnthropicUsage;
  };

  const textContent = data.content
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("");

  const toolUses = data.content
    .filter((c) => c.type === "tool_use")
    .map((c) => JSON.stringify({ tool_use: { id: c.id, name: c.name, input: c.input } }));

  const content = toolUses.length > 0 ? toolUses.join("\n") : textContent;

  return {
    content,
    stopReason: mapStopReason(data.stop_reason),
    usage: {
      input: data.usage.input_tokens,
      output: data.usage.output_tokens,
      cache: {
        input: data.usage.cache_read_input_tokens,
        creation: data.usage.cache_creation_input_tokens,
      },
    },
  };
}

async function streamAnthropic(
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
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ ...body, stream: true }),
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
  let currentToolName = "";
  let currentToolInput = "";
  let currentToolId = "";
  const toolContents: string[] = [];
  let currentEventType = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith("event:")) {
          currentEventType = trimmed.slice(6).trim();
          continue;
        }

        if (!trimmed.startsWith("data:")) continue;
        const raw = trimmed.slice(5).trim();
        if (!raw) continue;

        try {
          const parsed = JSON.parse(raw);

          if (parsed.type === "content_block_delta" && parsed.delta?.text) {
            fullContent += parsed.delta.text;
            onStream({ type: "text", text: parsed.delta.text });
          }

          if (parsed.type === "content_block_delta" && parsed.delta?.partial_json) {
            currentToolInput += parsed.delta.partial_json;
          }

          if (parsed.type === "content_block_start" && parsed.content_block?.type === "tool_use") {
            currentToolName = parsed.content_block.name;
            currentToolId = parsed.content_block.id;
          }

          if (parsed.type === "content_block_start" && parsed.content_block?.type === "thinking") {
            onStream({ type: "thinking", thinking: parsed.content_block.thinking || "" });
          }

          if (parsed.type === "content_block_delta" && parsed.delta?.type === "thinking_delta") {
            onStream({ type: "thinking", thinking: parsed.delta.thinking || "" });
          }

          if (parsed.type === "content_block_stop" && currentToolName) {
            const toolInput = (() => { try { return JSON.parse(currentToolInput || "{}"); } catch { return {}; } })();
            onStream({ type: "tool_use", toolName: currentToolName, toolInput: currentToolInput, toolCallId: currentToolId });
            toolContents.push(JSON.stringify({ tool_use: { id: currentToolId, name: currentToolName, input: toolInput } }));
            currentToolName = "";
            currentToolInput = "";
            currentToolId = "";
          }

          if (parsed.type === "message_delta" && parsed.delta?.stop_reason) {
            stopReason = mapStopReason(parsed.delta.stop_reason);
          }

          if (parsed.type === "message_delta" && parsed.usage) {
            usage.output = parsed.usage.output_tokens || 0;
          }

          if (parsed.message?.usage) {
            usage.input = parsed.message.usage.input_tokens || 0;
            usage.cache = {
              input: parsed.message.usage.cache_read_input_tokens,
              creation: parsed.message.usage.cache_creation_input_tokens,
            };
          }
        } catch {
          // skip parse errors
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  const content = toolContents.length > 0 ? toolContents.join("\n") : fullContent;
  onStream({ type: "done", stopReason, usage });
  return { content, stopReason, usage };
}

function mapStopReason(reason: string): import("../types.js").StopReason {
  switch (reason) {
    case "end_turn": return "end_turn";
    case "max_tokens": return "max_tokens";
    case "stop_sequence": return "stop_sequence";
    case "tool_use": return "tool_use";
    default: return "end_turn";
  }
}
