import type { Message, MessageContent, Model, Usage } from "@wayofmono/wo-ai";
import { complete, resolveModelConfig } from "@wayofmono/wo-ai";
import {
  computeFileLists,
  createFileOps,
  extractFileOpsFromMessage,
  formatFileOperations,
  SUMMARIZATION_SYSTEM_PROMPT,
  serializeConversation,
  type FileOperations,
} from "./utils.js";

// ============================================================================
// Types
// ============================================================================

export interface CompactionDetails {
  readFiles: string[];
  modifiedFiles: string[];
}

export interface CompactionSettings {
  enabled: boolean;
  reserveTokens: number;
  keepRecentTokens: number;
}

export const DEFAULT_COMPACTION_SETTINGS: CompactionSettings = {
  enabled: true,
  reserveTokens: 16384,
  keepRecentTokens: 20000,
};

export interface CompactionResult {
  summary: string;
  firstKeptIndex: number;
  tokensBefore: number;
  details: CompactionDetails;
}

export interface CutPointResult {
  firstKeptIndex: number;
  turnStartIndex: number;
  isSplitTurn: boolean;
}

// ============================================================================
// Token Estimation
// ============================================================================

export function estimateTokenCount(message: Message): number {
  let chars = 0;

  switch (message.role) {
    case "user": {
      const content = message.content;
      if (typeof content === "string") {
        chars = content.length;
      } else if (Array.isArray(content)) {
        for (const block of content) {
          if (block.type === "text" && block.text) chars += block.text.length;
        }
      }
      return Math.ceil(chars / 4);
    }
    case "assistant": {
      if (typeof message.content === "string") {
        chars = message.content.length;
      } else {
        for (const block of message.content) {
          if (block.type === "text") chars += block.text.length;
          else if (block.type === "tool_use") chars += block.name.length + JSON.stringify(block.input).length;
        }
      }
      return Math.ceil(chars / 4);
    }
    case "tool": {
      const content = typeof message.content === "string" ? message.content : "";
      chars = content.length;
      return Math.ceil(chars / 4);
    }
    case "system": {
      const content = typeof message.content === "string" ? message.content : "";
      chars = content.length;
      return Math.ceil(chars / 4);
    }
  }

  return 0;
}

export function estimateContextTokens(messages: Message[]): number {
  let total = 0;
  for (const msg of messages) {
    total += estimateTokenCount(msg);
  }
  return total;
}

export function shouldCompact(contextTokens: number, contextWindow: number, settings: CompactionSettings): boolean {
  if (!settings.enabled) return false;
  return contextTokens > contextWindow - settings.reserveTokens;
}

// ============================================================================
// Cut Point Detection
// ============================================================================

function findValidCutPoints(messages: Message[], startIndex: number, endIndex: number): number[] {
  const cutPoints: number[] = [];
  for (let i = startIndex; i < endIndex; i++) {
    const msg = messages[i];
    if (msg.role === "user" || msg.role === "assistant" || msg.role === "system") {
      cutPoints.push(i);
    }
  }
  return cutPoints;
}

export function findCutPoint(
  messages: Message[],
  startIndex: number,
  endIndex: number,
  keepRecentTokens: number,
): CutPointResult {
  const cutPoints = findValidCutPoints(messages, startIndex, endIndex);

  if (cutPoints.length === 0) {
    return { firstKeptIndex: startIndex, turnStartIndex: -1, isSplitTurn: false };
  }

  let accumulatedTokens = 0;
  let cutIndex = cutPoints[0];

  for (let i = endIndex - 1; i >= startIndex; i--) {
    const tokens = estimateTokenCount(messages[i]);
    accumulatedTokens += tokens;

    if (accumulatedTokens >= keepRecentTokens) {
      for (const cp of cutPoints) {
        if (cp >= i) {
          cutIndex = cp;
          break;
        }
      }
      break;
    }
  }

  const cutEntry = messages[cutIndex];
  const isUserMessage = cutEntry.role === "user" || cutEntry.role === "system";
  const turnStartIndex = isUserMessage ? -1 : findTurnStart(messages, cutIndex, startIndex);

  return {
    firstKeptIndex: cutIndex,
    turnStartIndex,
    isSplitTurn: !isUserMessage && turnStartIndex !== -1,
  };
}

function findTurnStart(messages: Message[], entryIndex: number, startIndex: number): number {
  for (let i = entryIndex; i >= startIndex; i--) {
    if (messages[i].role === "user") return i;
  }
  return -1;
}

// ============================================================================
// Summarization
// ============================================================================

const SUMMARIZATION_PROMPT = `The messages above are a conversation to summarize. Create a structured context checkpoint summary that another LLM will use to continue the work.

Use this EXACT format:

## Goal
[What is the user trying to accomplish? Can be multiple items if the session covers different tasks.]

## Constraints & Preferences
- [Any constraints, preferences, or requirements mentioned by user]
- [Or "(none)" if none were mentioned]

## Progress
### Done
- [x] [Completed tasks/changes]

### In Progress
- [ ] [Current work]

### Blocked
- [Issues preventing progress, if any]

## Key Decisions
- **[Decision]**: [Brief rationale]

## Next Steps
1. [Ordered list of what should happen next]

## Critical Context
- [Any data, examples, or references needed to continue]
- [Or "(none)" if not applicable]

Keep each section concise. Preserve exact file paths, function names, and error messages.`;

const UPDATE_SUMMARIZATION_PROMPT = `The messages above are NEW conversation messages to incorporate into the existing summary provided in <previous-summary> tags.

Update the existing structured summary with new information. RULES:
- PRESERVE all existing information from the previous summary
- ADD new progress, decisions, and context from the new messages
- UPDATE the Progress section: move items from "In Progress" to "Done" when completed
- UPDATE "Next Steps" based on what was accomplished
- PRESERVE exact file paths, function names, and error messages
- If something is no longer relevant, you may remove it

Use this EXACT format:

## Goal
[Preserve existing goals, add new ones if the task expanded]

## Constraints & Preferences
- [Preserve existing, add new ones discovered]

## Progress
### Done
- [x] [Include previously done items AND newly completed items]

### In Progress
- [ ] [Current work - update based on progress]

### Blocked
- [Current blockers - remove if resolved]

## Key Decisions
- **[Decision]**: [Brief rationale] (preserve all previous, add new)

## Next Steps
1. [Update based on current state]

## Critical Context
- [Preserve important context, add new if needed]

Keep each section concise. Preserve exact file paths, function names, and error messages.`;

export async function generateSummary(
  messages: Message[],
  modelConfig: { api?: string; modelId?: string; apiKey?: string; baseUrl?: string },
  reserveTokens: number,
  signal?: AbortSignal,
  customInstructions?: string,
  previousSummary?: string,
): Promise<string> {
  const { model } = resolveModelConfig({
    api: modelConfig.api,
    modelId: modelConfig.modelId,
    apiKey: modelConfig.apiKey,
    baseUrl: modelConfig.baseUrl,
  });

  const maxTokens = Math.min(Math.floor(0.8 * reserveTokens), model.maxTokens > 0 ? model.maxTokens : Infinity);

  let basePrompt = previousSummary ? UPDATE_SUMMARIZATION_PROMPT : SUMMARIZATION_PROMPT;
  if (customInstructions) {
    basePrompt = `${basePrompt}\n\nAdditional focus: ${customInstructions}`;
  }

  const conversationText = serializeConversation(messages);

  let promptText = `<conversation>\n${conversationText}\n</conversation>\n\n`;
  if (previousSummary) {
    promptText += `<previous-summary>\n${previousSummary}\n</previous-summary>\n\n`;
  }
  promptText += basePrompt;

  const result = await complete(model, {
    messages: [{ role: "user", content: promptText }],
    system: SUMMARIZATION_SYSTEM_PROMPT,
    maxTokens,
    signal,
  }, { apiKey: modelConfig.apiKey, baseUrl: modelConfig.baseUrl });

  if (result.stopReason === "error") {
    throw new Error(`Summarization failed: ${result.errorMessage || "Unknown error"}`);
  }

  return result.content;
}

// ============================================================================
// Compaction
// ============================================================================

/**
 * Prepare messages for compaction: determine what to keep vs summarize.
 * Returns cut point info + messages to summarize + file operations.
 */
export function prepareCompaction(
  messages: Message[],
  settings: CompactionSettings,
  prevCompactionIndex?: number,
): {
  firstKeptIndex: number;
  messagesToSummarize: Message[];
  turnPrefixMessages: Message[];
  isSplitTurn: boolean;
  tokensBefore: number;
  fileOps: FileOperations;
} | undefined {
  if (messages.length === 0) return undefined;

  const boundaryStart = (prevCompactionIndex !== undefined && prevCompactionIndex >= 0)
    ? prevCompactionIndex + 1
    : 0;
  const boundaryEnd = messages.length;

  const tokensBefore = estimateContextTokens(messages);
  const cutPoint = findCutPoint(messages, boundaryStart, boundaryEnd, settings.keepRecentTokens);
  const historyEnd = cutPoint.isSplitTurn ? cutPoint.turnStartIndex : cutPoint.firstKeptIndex;

  const messagesToSummarize = messages.slice(boundaryStart, Math.max(0, historyEnd));

  const turnPrefixMessages = cutPoint.isSplitTurn
    ? messages.slice(cutPoint.turnStartIndex, cutPoint.firstKeptIndex)
    : [];

  const fileOps = createFileOps();
  for (const msg of messagesToSummarize) {
    extractFileOpsFromMessage(msg, fileOps);
  }
  for (const msg of turnPrefixMessages) {
    extractFileOpsFromMessage(msg, fileOps);
  }

  return {
    firstKeptIndex: cutPoint.firstKeptIndex,
    messagesToSummarize,
    turnPrefixMessages,
    isSplitTurn: cutPoint.isSplitTurn,
    tokensBefore,
    fileOps,
  };
}

/**
 * Run compaction: summarize historical messages, return result with summary + cut info.
 */
export async function compact(
  messages: Message[],
  modelConfig: { api?: string; modelId?: string; apiKey?: string; baseUrl?: string },
  settings: CompactionSettings = DEFAULT_COMPACTION_SETTINGS,
  options?: {
    signal?: AbortSignal;
    customInstructions?: string;
    previousSummary?: string;
    prevCompactionIndex?: number;
  },
): Promise<CompactionResult> {
  const prep = prepareCompaction(messages, settings, options?.prevCompactionIndex);
  if (!prep || prep.messagesToSummarize.length === 0) {
    return {
      summary: "No messages to compact.",
      firstKeptIndex: 0,
      tokensBefore: 0,
      details: { readFiles: [], modifiedFiles: [] },
    };
  }

  let summary: string;

  if (prep.isSplitTurn && prep.turnPrefixMessages.length > 0) {
    const [historySummary, turnPrefixSummary] = await Promise.all([
      prep.messagesToSummarize.length > 0
        ? generateSummary(
            prep.messagesToSummarize,
            modelConfig,
            settings.reserveTokens,
            options?.signal,
            options?.customInstructions,
            options?.previousSummary,
          )
        : Promise.resolve("No prior history."),
      generateTurnPrefixSummary(prep.turnPrefixMessages, modelConfig, settings.reserveTokens, options?.signal),
    ]);
    summary = `${historySummary}\n\n---\n\n**Turn Context (split turn):**\n\n${turnPrefixSummary}`;
  } else {
    summary = await generateSummary(
      prep.messagesToSummarize,
      modelConfig,
      settings.reserveTokens,
      options?.signal,
      options?.customInstructions,
      options?.previousSummary,
    );
  }

  const { readFiles, modifiedFiles } = computeFileLists(prep.fileOps);
  summary += formatFileOperations(readFiles, modifiedFiles);

  return {
    summary,
    firstKeptIndex: prep.firstKeptIndex,
    tokensBefore: prep.tokensBefore,
    details: { readFiles, modifiedFiles },
  };
}

const TURN_PREFIX_SUMMARIZATION_PROMPT = `This is the PREFIX of a turn that was too large to keep. The SUFFIX (recent work) is retained.

Summarize the prefix to provide context for the retained suffix:

## Original Request
[What did the user ask for in this turn?]

## Early Progress
- [Key decisions and work done in the prefix]

## Context for Suffix
- [Information needed to understand the retained recent work]

Be concise. Focus on what's needed to understand the kept suffix.`;

async function generateTurnPrefixSummary(
  messages: Message[],
  modelConfig: { api?: string; modelId?: string; apiKey?: string; baseUrl?: string },
  reserveTokens: number,
  signal?: AbortSignal,
): Promise<string> {
  const { model } = resolveModelConfig({
    api: modelConfig.api,
    modelId: modelConfig.modelId,
    apiKey: modelConfig.apiKey,
    baseUrl: modelConfig.baseUrl,
  });

  const maxTokens = Math.min(Math.floor(0.5 * reserveTokens), model.maxTokens > 0 ? model.maxTokens : Infinity);
  const conversationText = serializeConversation(messages);
  const promptText = `<conversation>\n${conversationText}\n</conversation>\n\n${TURN_PREFIX_SUMMARIZATION_PROMPT}`;

  const result = await complete(model, {
    messages: [{ role: "user", content: promptText }],
    system: SUMMARIZATION_SYSTEM_PROMPT,
    maxTokens,
    signal,
  }, { apiKey: modelConfig.apiKey, baseUrl: modelConfig.baseUrl });

  if (result.stopReason === "error") {
    throw new Error(`Turn prefix summarization failed: ${result.errorMessage || "Unknown error"}`);
  }

  return result.content;
}
