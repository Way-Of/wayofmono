import type { TSchema } from "typebox";
import type { Theme } from "@wayofmono/wo-tui";
import type { Component } from "@wayofmono/wo-tui";

export interface ExtensionAPI {
  registerCommand(name: string, cmd: CommandDefinition): void;
  registerTool(tool: ToolDefinition): void;
  registerFlag(name: string, value: FlagDefinition): void;
  registerShortcut(keybinding: string, shortcut: ShortcutDefinition): void;
  on(event: string, handler: EventHandler): void;
  getFlag(name: string): unknown;
  getActiveTools(): string[];
  setActiveTools(names: string[]): void;
  getAllTools(): ToolInfo[];
  exec(command: string, args?: string[]): Promise<ExecResult>;
  sendMessage(message: SendMessageParams, options?: { triggerTurn?: boolean }): Promise<void>;
  sendUserMessage(content: string): Promise<void>;
  appendEntry(key: string, data: unknown): void;
  registerProvider(name: string, config: ProviderConfig): void;
}

export interface ExtensionContext {
  hasUI: boolean;
  cwd: string;
  model?: Record<string, unknown>;
  ui: ExtensionUIContext;
  sessionManager: SessionManager;
  modelRegistry: ModelRegistry;
}

export type ExtensionCommandContext = ExtensionContext;

export interface ExtensionUIContext {
  notify(message: string, severity: "info" | "warning" | "error" | "success"): void;
  confirm(message: string): Promise<boolean>;
  input(prompt: string, defaultValue?: string): Promise<string>;
  select<T>(items: SelectItem[], options?: { prompt?: string }): Promise<T | undefined>;
  setWidget(key: string, component: Component | null): void;
  setStatus(text: string): void;
  setWorkingMessage(text: string): void;
  setHiddenThinkingLabel(text: string): void;
  onTerminalInput(handler: (input: string) => void): () => void;
  pasteToEditor(text: string): void;
  theme: Theme;
}

export interface SelectItem<T = string> {
  value: T;
  label: string;
}

export interface CommandDefinition {
  description: string;
  handler: (args: string, ctx: ExtensionCommandContext) => void | Promise<void>;
}

export interface ToolDefinition {
  name: string;
  label?: string;
  description: string;
  promptSnippet?: string;
  promptGuidelines?: string[];
  parameters: TSchema;
  execute(
    toolCallId: string,
    params: Record<string, unknown>,
    signal: AbortSignal | undefined,
    onUpdate?: AgentToolUpdateCallback,
    ctx?: ExtensionContext
  ): Promise<AgentToolResult>;
  renderCall?(args: unknown, theme: Theme): Component;
  renderResult?(result: AgentToolResult, opts: { expanded?: boolean; isPartial?: boolean }, theme: Theme): Component;
}

export interface AgentToolResult {
  content: Array<{ type: string; text: string }>;
  details?: Record<string, unknown>;
  isError?: boolean;
}

export type AgentToolUpdateCallback = (update: { content: Array<{ type: string; text: string }>; details?: Record<string, unknown> }) => void;

export interface ToolInfo {
  name: string;
  description: string;
  parameters: TSchema;
  sourceInfo?: string;
}

export interface FlagDefinition {
  description?: string;
  type?: "string" | "boolean" | "number";
  default?: unknown;
}

export interface ShortcutDefinition {
  description: string;
  handler: (ctx: ExtensionContext) => void | Promise<void>;
}

export type EventHandler = (event: unknown, ctx: ExtensionContext) => void | Promise<void | { systemPrompt?: string; message?: { customType: string; content: string; display?: boolean } }>;

export interface ExecResult {
  stdout: string;
  stderr: string;
  code: number;
}

export interface SendMessageParams {
  customType: string;
  content: string;
  display?: boolean;
}

export interface ProviderConfig {
  streamSimple?: (model: string, messages: unknown[]) => Promise<unknown>;
  completeSimple?: (model: string, messages: unknown[]) => Promise<unknown>;
}

export interface SessionManager {
  getBranch(): string;
}

export interface ModelRegistry {
  getAvailable(): Array<{ api: string; modelId: string; name: string }>;
  find(query: string): Record<string, unknown> | undefined;
  getAll(): Array<Record<string, unknown>>;
  registerProvider(name: string, config: ProviderConfig): void;
  refresh(): Promise<void>;
  getApiKeyAndHeaders(api: string): { apiKey?: string; headers?: Record<string, string> };
}

export interface RegisteredCommand {
  name: string;
  description: string;
  sourceInfo: string;
  handler: (args: string, ctx: ExtensionCommandContext) => void | Promise<void>;
}

export interface Skill {
  name: string;
  description: string;
  content: string;
  frontmatter: Record<string, unknown>;
  path?: string;
}

export interface SessionEntry {
  timestamp: number;
  key: string;
  data: unknown;
}

export interface TruncationResult {
  text: string;
  truncated: boolean;
  originalLength: number;
}

export interface BeforeAgentStartEvent {
  systemPrompt?: string;
}

export interface BeforeAgentStartEventResult {
  systemPrompt?: string;
  message?: { customType: string; content: string; display?: boolean };
}

export interface InputEvent {
  text: string;
}

export interface InputEventResult {
  handled?: boolean;
  text?: string;
}

export interface ResourceDiagnostic {
  path: string;
  severity: "error" | "warning" | "info";
  message: string;
}

export { type Theme, type Component } from "@wayofmono/wo-tui";
