import type { Message, MessageContent, Usage } from "./types.js";

const IMAGE_TOKEN_COST = 1200;
const CHARS_PER_TOKEN = 4;

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export function tokenCount(text: string): number {
  return estimateTokenCount(text);
}

export function estimateMessageTokens(message: Message): number {
  const content = message.content;
  if (typeof content === "string") {
    return estimateTokenCount(content);
  }
  return content.reduce((sum, block) => sum + estimateContentBlockTokens(block), 0);
}

function estimateContentBlockTokens(block: MessageContent): number {
  switch (block.type) {
    case "text":
      return estimateTokenCount(block.text);
    case "image":
      return IMAGE_TOKEN_COST;
    case "tool_use":
      return estimateTokenCount(block.name) + estimateTokenCount(JSON.stringify(block.input));
    case "tool_result": {
      const content = block.content;
      if (typeof content === "string") {
        return estimateTokenCount(content);
      }
      return content.reduce((sum, c) => sum + estimateContentBlockTokens(c), 0);
    }
    default:
      return 0;
  }
}

export function estimateMessagesTokens(
  messages: Message[],
  systemPrompt?: string,
): { total: number; messages: number; system: number } {
  const system = systemPrompt ? estimateTokenCount(systemPrompt) : 0;
  const msgs = messages.reduce((sum, msg) => sum + estimateMessageTokens(msg), 0);
  return { total: system + msgs, messages: msgs, system };
}

export interface ContextWindowValidation {
  ok: boolean;
  estimatedTokens: number;
  maxTokens: number;
  utilizationPercent: number;
  remainingTokens: number;
  overflow: boolean;
}

export function validateContextWindow(
  messages: Message[],
  maxTokens: number,
  systemPrompt?: string,
): ContextWindowValidation {
  const { total } = estimateMessagesTokens(messages, systemPrompt);
  return {
    ok: total <= maxTokens,
    estimatedTokens: total,
    maxTokens,
    utilizationPercent: Math.round((total / maxTokens) * 100),
    remainingTokens: Math.max(0, maxTokens - total),
    overflow: total > maxTokens,
  };
}

export function calculateContextTokens(usage: Usage): number {
  if ("totalTokens" in usage && usage.totalTokens !== undefined) {
    return usage.totalTokens;
  }
  const cache = usage.cache ?? {};
  return usage.input + usage.output + (cache.input ?? 0) + (cache.creation ?? 0);
}
