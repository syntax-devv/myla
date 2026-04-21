import type { EngineId } from '../../config/types.js';

export type CommandHandler = (args: string[], context: CommandContext) => void | Promise<void>;

export interface CommandContext {
  switchEngine: (id: EngineId) => void;
}

export interface Command {
  name: string;
  description: string;
  handler: CommandHandler;
}

const commands = new Map<string, Command>();

export function registerCommand(cmd: Command): void {
  commands.set(cmd.name, cmd);
}

export function getCommand(name: string): Command | undefined {
  return commands.get(name);
}

export function listCommands(): Command[] {
  return Array.from(commands.values());
}

export function parseCommand(input: string): { isCommand: boolean; name?: string; args?: string[] } {
  const trimmed = input.trim();
  if (!trimmed.startsWith('/')) {
    return { isCommand: false };
  }

  const parts = trimmed.slice(1).split(/\s+/);
  const name = parts[0];
  const args = parts.slice(1);

  return { isCommand: true, name, args };
}

export async function executeCommand(input: string, context: CommandContext): Promise<boolean> {
  const parsed = parseCommand(input);
  if (!parsed.isCommand || !parsed.name) {
    return false;
  }

  const cmd = getCommand(parsed.name);
  if (!cmd) {
    // Unknown command - fall through to engine
    return false;
  }

  await cmd.handler(parsed.args ?? [], context);
  return true;
}
