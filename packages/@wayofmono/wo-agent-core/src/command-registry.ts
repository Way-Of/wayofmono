import type { CommandDefinition, RegisteredCommand, ExtensionCommandContext } from "./types.js";

export class CommandRegistry {
  private commands = new Map<string, RegisteredCommand>();

  register(name: string, cmd: CommandDefinition, sourceInfo = "wo"): void {
    this.commands.set(name, {
      name,
      description: cmd.description,
      sourceInfo,
      handler: cmd.handler,
    });
  }

  get(name: string): RegisteredCommand | undefined {
    return this.commands.get(name);
  }

  getAll(): RegisteredCommand[] {
    return Array.from(this.commands.values());
  }

  async execute(name: string, args: string, ctx: ExtensionCommandContext): Promise<void> {
    const cmd = this.commands.get(name);
    if (!cmd) {
      throw new Error(`Command "/${name}" not found`);
    }
    await cmd.handler(args, ctx);
  }

  getNames(): string[] {
    return Array.from(this.commands.keys());
  }
}
