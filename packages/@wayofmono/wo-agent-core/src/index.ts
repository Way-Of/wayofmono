export { WoExtensionAPI } from "./extension-api.js";
export { EventEmitter } from "./event-emitter.js";
export { ToolEngine } from "./tool-engine.js";
export { CommandRegistry } from "./command-registry.js";
export { FlagManager } from "./flag-manager.js";
export { ExtensionUIContextImpl } from "./ui-context.js";
export { ModelRegistryImpl } from "./models.js";
export { DynamicBorder, BorderedLoader, keyHint } from "./dynamic-border.js";
export {
  truncateHead,
  formatSize,
  convertToLlm,
  isToolCallEventType,
  getMarkdownTheme,
  withFileMutationQueue,
} from "./utils.js";
export {
  loadSkills,
  parseFrontmatter,
  stripFrontmatter,
  getAgentDir,
} from "./skill-loader.js";
export { discoverAndLoadExtensions, createExtensionRuntime } from "./runtime.js";

// Context compaction
export {
  compact,
  prepareCompaction,
  generateSummary,
  estimateTokenCount,
  estimateContextTokens,
  shouldCompact,
  findCutPoint,
  generateBranchSummary,
  prepareBranchMessages,
  createFileOps,
  extractFileOpsFromMessage,
  computeFileLists,
  serializeConversation,
  DEFAULT_COMPACTION_SETTINGS,
  SUMMARIZATION_SYSTEM_PROMPT,
} from "./compaction/index.js";
export type {
  CompactionResult,
  CompactionSettings,
  CompactionDetails,
  CutPointResult,
  BranchSummaryResult,
  BranchPreparation,
  FileOperations,
} from "./compaction/index.js";

export type {
  ExtensionAPI,
  ExtensionContext,
  ExtensionCommandContext,
  ExtensionUIContext,
  CommandDefinition,
  ToolDefinition,
  ToolInfo,
  FlagDefinition,
  ShortcutDefinition,
  EventHandler,
  AgentToolResult,
  AgentToolUpdateCallback,
  ExecResult,
  SendMessageParams,
  ProviderConfig,
  SessionManager,
  ModelRegistry,
  RegisteredCommand,
  Skill,
  SessionEntry,
  TruncationResult,
  BeforeAgentStartEvent,
  BeforeAgentStartEventResult,
  InputEvent,
  InputEventResult,
  ResourceDiagnostic,
  SelectItem,
  Message,
} from "./types.js";
export { type Theme, type Component } from "./types.js";
