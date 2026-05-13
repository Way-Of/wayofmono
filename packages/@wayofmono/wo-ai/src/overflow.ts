import type { Message } from "./types.js";

const OVERFLOW_PATTERNS = [
  /prompt is too long/i,
  /request_too_large/i,
  /input is too long for requested model/i,
  /exceeds the context window/i,
  /input token count.*exceeds the maximum/i,
  /maximum prompt length is \d+/i,
  /reduce the length of the messages/i,
  /maximum context length is \d+ tokens/i,
  /input \(\d+ tokens\) is longer than the model'?s context length \(\d+ tokens\)/i,
  /exceeds the limit of \d+/i,
  /exceeds the available context size/i,
  /greater than the context length/i,
  /context window exceeds limit/i,
  /exceeded model token limit/i,
  /too large for model with \d+ maximum context length/i,
  /model_context_window_exceeded/i,
  /prompt too long; exceeded (?:max )?context length/i,
  /context[_ ]length[_ ]exceeded/i,
  /too many tokens/i,
  /token limit exceeded/i,
];

const NON_OVERFLOW_PATTERNS = [
  /^(Throttling error|Service unavailable):/i,
  /rate limit/i,
  /too many requests/i,
];

export interface OverflowCheckInput {
  stopReason: string;
  errorMessage?: string;
  usage?: { input?: number; output?: number };
}

export function isContextOverflow(input: OverflowCheckInput, contextWindow?: number): boolean {
  if (input.stopReason === "error" && input.errorMessage) {
    const isNonOverflow = NON_OVERFLOW_PATTERNS.some((p) => p.test(input.errorMessage!));
    if (!isNonOverflow && OVERFLOW_PATTERNS.some((p) => p.test(input.errorMessage!))) {
      return true;
    }
  }
  if (
    contextWindow &&
    input.stopReason === "end_turn" &&
    input.usage &&
    (input.usage.input ?? 0) > contextWindow
  ) {
    return true;
  }
  if (
    contextWindow &&
    input.stopReason === "max_tokens" &&
    input.usage?.output === 0 &&
    (input.usage.input ?? 0) >= contextWindow * 0.99
  ) {
    return true;
  }
  return false;
}

export function getOverflowPatterns(): RegExp[] {
  return [...OVERFLOW_PATTERNS];
}
