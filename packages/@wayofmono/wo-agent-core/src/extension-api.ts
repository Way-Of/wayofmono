import { exec as childExec } from "node:child_process";
import { promisify } from "node:util";
import type {
  ExtensionAPI,
  ExtensionContext,
  ExtensionCommandContext,
  CommandDefinition,
  ToolDefinition,
  FlagDefinition,
  ShortcutDefinition,
  EventHandler,
  ToolInfo,
  SendMessageParams,
  ExecResult,
  ProviderConfig,
} from "./types.js";
import { EventEmitter } from "./event-emitter.js";
import { ToolEngine } from "./tool-engine.js";
import { CommandRegistry } from "./command-registry.js";
import { FlagManager } from "./flag-manager.js";
import { ExtensionUIContextImpl } from "./ui-context.js";
import { ModelRegistryImpl } from "./models.js";

const execAsync = promisify(childExec);

export class WoExtensionAPI implements ExtensionAPI {
  private events = new EventEmitter();
  private tools = new ToolEngine();
  private commands = new CommandRegistry();
  private flags = new FlagManager();
  private shortcuts = new Map<string, ShortcutDefinition>();
  private activeToolNames: string[] = [];
  private ctx: ExtensionContext;

  constructor(cwd = process.cwd()) {
    const ui = new ExtensionUIContextImpl();
    this.ctx = {
      hasUI: !!process.stdout.isTTY,
      cwd,
      ui,
      sessionManager: { getBranch: () => "main" },
      modelRegistry: new ModelRegistryImpl(),
    };
  }

  registerCommand(name: string, cmd: CommandDefinition): void {
    this.commands.register(name, cmd);
  }

  registerTool(tool: ToolDefinition): void {
    this.tools.register(tool);
    this.activeToolNames.push(tool.name);
  }

  registerFlag(name: string, def: FlagDefinition): void {
    this.flags.register(name, def);
  }

  registerShortcut(keybinding: string, shortcut: ShortcutDefinition): void {
    this.shortcuts.set(keybinding, shortcut);
  }

  on(event: string, handler: EventHandler): void {
    this.events.on(event, handler);
  }

  getFlag(name: string): unknown {
    return this.flags.get(name);
  }

  getActiveTools(): string[] {
    return [...this.activeToolNames];
  }

  setActiveTools(names: string[]): void {
    this.activeToolNames = [...names];
    this.tools.setActiveTools(names);
  }

  getAllTools(): ToolInfo[] {
    return this.tools.getAll();
  }

  async exec(command: string, args?: string[]): Promise<ExecResult> {
    const cmd = args ? `${command} ${args.join(" ")}` : command;
    try {
      const { stdout, stderr } = await execAsync(cmd, { cwd: this.ctx.cwd });
      return { stdout, stderr, code: 0 };
    } catch (err: unknown) {
      const error = err as { stdout?: string; stderr?: string; code?: number };
      return {
        stdout: error.stdout || "",
        stderr: error.stderr || String(err),
        code: error.code || 1,
      };
    }
  }

  async sendMessage(message: SendMessageParams, _options?: { triggerTurn?: boolean }): Promise<void> {
    // Pass through to the UI
    if (message.display !== false) {
      this.ctx.ui.notify(`[${message.customType}] ${message.content}`, "info");
    }
  }

  async sendUserMessage(content: string): Promise<void> {
    await this.sendMessage({ customType: "user", content, display: true });
  }

  appendEntry(key: string, data: unknown): void {
    // Store in session log
    if (this.ctx.sessionManager) {
      // Session entries stored externally
    }
  }

  registerProvider(name: string, config: ProviderConfig): void {
    this.ctx.modelRegistry.registerProvider(name, config);
  }

  // Internal methods for the runtime
  getContext(): ExtensionContext {
    return this.ctx;
  }

  getCommandContext(): ExtensionCommandContext {
    return { ...this.ctx };
  }

  getEvents(): EventEmitter {
    return this.events;
  }

  getToolEngine(): ToolEngine {
    return this.tools;
  }

  getCommandRegistry(): CommandRegistry {
    return this.commands;
  }

  getFlagManager(): FlagManager {
    return this.flags;
  }

  updateCwd(cwd: string): void {
    this.ctx.cwd = cwd;
  }
}
