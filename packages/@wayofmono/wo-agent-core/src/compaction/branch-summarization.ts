import type { Message } from "@wayofmono/wo-ai";
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
import { estimateTokenCount } from "./compaction.js";

// ============================================================================
// Types
// ============================================================================

export interface BranchSummaryResult {
  summary?: string;
  readFiles?: string[];
  modifiedFiles?: string[];
  aborted?: boolean;
  error?: string;
}

export interface BranchSummaryDetails {
  readFiles: string[];
  modifiedFiles: string[];
}

export interface BranchPreparation {
  messages: Message[];
  fileOps: FileOperations;
  totalTokens: number;
}

export interface GenerateBranchSummaryOptions {
  messages: Message[];
  modelConfig: { api?: string; modelId?: string; apiKey?: string; baseUrl?: string };
  signal?: AbortSignal;
  customInstructions?: string;
  replaceInstructions?: boolean;
  reserveTokens?: number;
}

// ============================================================================
// Preparation
// ============================================================================

/**
 * Prepare messages for branch summarization with token budget.
 * Walks from newest to oldest, collecting messages up to the budget.
 */
export function prepareBranchMessages(
  messages: Message[],
  tokenBudget: number = 0,
): BranchPreparation {
  const fileOps = createFileOps();
  let totalTokens = 0;
  const result: Message[] = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    extractFileOpsFromMessage(msg, fileOps);
    const tokens = estimateTokenCount(msg);

    if (tokenBudget > 0 && totalTokens + tokens > tokenBudget) {
      if (totalTokens < tokenBudget * 0.9) {
        result.unshift(msg);
        totalTokens += tokens;
      }
      break;
    }

    result.unshift(msg);
    totalTokens += tokens;
  }

  return { messages: result, fileOps, totalTokens };
}

// ============================================================================
// Summary Generation
// ============================================================================

const BRANCH_SUMMARY_PREAMBLE = "The user explored a different conversation branch before returning here.\nSummary of that exploration:\n\n";

const BRANCH_SUMMARY_PROMPT = `Create a structured summary of this conversation branch for context when returning later.

Use this EXACT format:

## Goal
[What was the user trying to accomplish in this branch?]

## Constraints & Preferences
- [Any constraints, preferences, or requirements mentioned]
- [Or "(none)" if none were mentioned]

## Progress
### Done
- [x] [Completed tasks/changes]

### In Progress
- [ ] [Work that was started but not finished]

### Blocked
- [Issues preventing progress, if any]

## Key Decisions
- **[Decision]**: [Brief rationale]

## Next Steps
1. [What should happen next to continue this work]

Keep each section concise. Preserve exact file paths, function names, and error messages.`;

/**
 * Generate a summary of abandoned branch messages.
 */
export async function generateBranchSummary(
  options: GenerateBranchSummaryOptions,
): Promise<BranchSummaryResult> {
  const { messages, modelConfig, signal, customInstructions, replaceInstructions, reserveTokens = 16384 } = options;

  const { model } = resolveModelConfig({
    api: modelConfig.api,
    modelId: modelConfig.modelId,
    apiKey: modelConfig.apiKey,
    baseUrl: modelConfig.baseUrl,
  });

  const contextWindow = (model as Record<string, unknown>).contextWindow as number || 128000;
  const tokenBudget = contextWindow - reserveTokens;

  const { messages: budgetedMessages, fileOps } = prepareBranchMessages(messages, tokenBudget);

  if (budgetedMessages.length === 0) {
    return { summary: "No content to summarize" };
  }

  const conversationText = serializeConversation(budgetedMessages);

  let instructions: string;
  if (replaceInstructions && customInstructions) {
    instructions = customInstructions;
  } else if (customInstructions) {
    instructions = `${BRANCH_SUMMARY_PROMPT}\n\nAdditional focus: ${customInstructions}`;
  } else {
    instructions = BRANCH_SUMMARY_PROMPT;
  }

  const promptText = `<conversation>\n${conversationText}\n</conversation>\n\n${instructions}`;

  const result = await complete(model, {
    messages: [{ role: "user", content: promptText }],
    system: SUMMARIZATION_SYSTEM_PROMPT,
    maxTokens: 2048,
    signal,
  }, { apiKey: modelConfig.apiKey, baseUrl: modelConfig.baseUrl });

  if (result.stopReason === "error") {
    return { error: result.errorMessage || "Summarization failed" };
  }

  let summary = BRANCH_SUMMARY_PREAMBLE + result.content;

  const { readFiles, modifiedFiles } = computeFileLists(fileOps);
  summary += formatFileOperations(readFiles, modifiedFiles);

  return {
    summary: summary || "No summary generated",
    readFiles,
    modifiedFiles,
  };
}
