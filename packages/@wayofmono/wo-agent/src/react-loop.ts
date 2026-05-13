import type { Message, Model, StreamChunk, StopReason, Usage, ToolDefinition as AiToolDefinition } from "@wayofmono/wo-ai";
import { complete, resolveModelConfig } from "@wayofmono/wo-ai";
import type { ToolDefinition as CoreToolDefinition } from "@wayofmono/wo-agent-core";
import type { ReActStep, ReActLoopParams, ReActLoopResult, ToolCallData } from "./types.js";

const DEFAULT_MAX_STEPS = 18;
const DEFAULT_MAX_NUDGES = 2;

function findToolByName(tools: CoreToolDefinition[], name: string): CoreToolDefinition | undefined {
  return tools.find(t => t.name === name);
}

function convertTools(tools: CoreToolDefinition[]): AiToolDefinition[] {
  return tools.map(t => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  }));
}

interface ToolCallAccum {
  id: string;
  name: string;
  arguments: string;
}

function accumulateToolCalls(chunks: StreamChunk[]): ToolCallAccum[] {
  const byIndex = new Map<number, ToolCallAccum>();
  let idx = 0;
  for (const chunk of chunks) {
    if (chunk.type !== "tool_use") continue;
    const key = idx++;
    let cell = byIndex.get(key);
    if (!cell) {
      cell = { id: chunk.toolCallId || "", name: chunk.toolName || "", arguments: chunk.toolInput || "" };
      byIndex.set(key, cell);
    } else {
      if (chunk.toolCallId) cell.id = chunk.toolCallId;
      if (chunk.toolName) cell.name += chunk.toolName;
      if (chunk.toolInput) cell.arguments += chunk.toolInput;
    }
  }
  return [...byIndex.values()].filter(t => t.name.length > 0);
}

function parseToolArguments(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return { _raw: raw };
  }
}

const NUDGE_TRIGGER = /\b(git|read|list|grep|search|find|inspect|show|what|how|look|check|file|code|structure|tree|status|branch)\b/i;

function shouldNudge(userTurn: string, round: ReActStep, nudgesUsed: number): boolean {
  if (nudgesUsed >= DEFAULT_MAX_NUDGES) return false;
  if (!NUDGE_TRIGGER.test(userTurn.trim())) return false;
  if (round.toolCalls.length > 0) return false;
  if (round.stopReason === "max_tokens") return false;
  if (round.content.trim().length === 0) return true;
  if (/\b(here'?s|here is|summary|results?)\b/i.test(round.content)) return false;
  return /\b(let me|i'?ll|i will|i need to|going to|first,? i|i should|i can)\b/i.test(round.content);
}

function mergeUsage(a: Usage, b: Usage): Usage {
  return {
    input: a.input + b.input,
    output: a.output + b.output,
    totalTokens: (a.totalTokens ?? a.input + a.output) + (b.totalTokens ?? b.input + b.output),
  };
}

export async function runReActLoop(params: ReActLoopParams): Promise<ReActLoopResult> {
  const { model: modelConfig, apiKey, baseUrl, messages, system, tools, toolChoice } = params;
  const maxSteps = params.maxSteps ?? DEFAULT_MAX_STEPS;
  const signal = params.signal;
  const onStep = params.onStep;
  const onStream = params.onStream;

  const { model } = resolveModelConfig({
    api: modelConfig.api,
    modelId: modelConfig.modelId,
    apiKey: modelConfig.apiKey,
    baseUrl: modelConfig.baseUrl,
  });

  const aiTools = convertTools(tools);
  let mergedUsage: Usage = { input: 0, output: 0 };
  let stepNumber = 0;
  let truncated = false;

  const userTurn = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.role === "user") {
        const c = messages[i].content;
        return typeof c === "string" ? c : "";
      }
    }
    return "";
  })();

  for (let step = 0; step < maxSteps; step++) {
    stepNumber = step + 1;

    const chunks: StreamChunk[] = [];
    let roundContent = "";
    let roundStopReason: StopReason = "end_turn";
    let roundUsage: Usage = { input: 0, output: 0 };

    const result = await complete(model, {
      messages: messages as Message[],
      system,
      tools: aiTools.length > 0 ? aiTools : undefined,
      tool_choice: toolChoice ?? (aiTools.length > 0 ? "auto" : undefined),
      signal,
      onStream: (chunk) => {
        chunks.push(chunk);
        if (chunk.type === "text" && chunk.text) {
          roundContent += chunk.text;
          onStream?.(chunk);
        } else if (chunk.type === "tool_use") {
          onStream?.(chunk);
        } else if (chunk.type === "thinking") {
          onStream?.(chunk);
        } else if (chunk.type === "error") {
          onStream?.(chunk);
        } else if (chunk.type === "done") {
          roundStopReason = chunk.stopReason || "end_turn";
          roundUsage = chunk.usage || { input: 0, output: 0 };
        }
      },
    }, { apiKey, baseUrl });

    if (result.stopReason && stepNumber > 1) {
      roundStopReason = result.stopReason;
    }
    roundUsage = result.usage || roundUsage;
    mergedUsage = mergeUsage(mergedUsage, roundUsage);

    const toolCallAccums = accumulateToolCalls(chunks);
    const toolCalls: ToolCallData[] = toolCallAccums.map(tc => ({
      id: tc.id || `call_${step}_${tc.name}`,
      name: tc.name,
      arguments: parseToolArguments(tc.arguments),
    }));

    const round: ReActStep = {
      content: roundContent,
      toolCalls,
      stopReason: roundStopReason,
      usage: roundUsage,
      stepNumber,
    };

    onStep?.(round);

    if (toolCalls.length > 0) {
      messages.push({
        role: "assistant",
        content: roundContent.trim().length > 0 ? roundContent : null,
      } as Message);

      for (const tc of toolCalls) {
        const toolDef = findToolByName(tools, tc.name);
        let output: string;
        let isError = false;

        if (!toolDef) {
          output = `Unknown tool: ${tc.name}. Available tools: ${tools.map(t => t.name).join(", ")}`;
          isError = true;
        } else {
          try {
            const toolResult = await toolDef.execute(tc.id, tc.arguments, signal);
            output = toolResult.content.map(c =>
              typeof c === "string" ? c : c.text || ""
            ).join("\n");
            isError = toolResult.isError || false;
          } catch (e) {
            output = `Tool ${tc.name} error: ${e instanceof Error ? e.message : String(e)}`;
            isError = true;
          }
        }

        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: output,
          name: tc.name,
        } as Message);
      }

      continue;
    }

    if (shouldNudge(userTurn, round, step)) {
      messages.push({ role: "assistant", content: roundContent } as Message);
      messages.push({
        role: "user",
        content: "[System] Your last reply did not include any tool calls. If you need information from the workspace, use the available tools. Otherwise, provide your answer directly.",
      } as Message);
      continue;
    }

    messages.push({ role: "assistant", content: roundContent } as Message);
    return { content: roundContent, messages, usage: mergedUsage, steps: stepNumber, truncated: false };
  }

  truncated = true;
  return {
    content: "Agent loop exceeded maximum steps without reaching a conclusion.",
    messages,
    usage: mergedUsage,
    steps: stepNumber,
    truncated: true,
  };
}
