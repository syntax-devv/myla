import type { CommandHandler, CommandContext } from '../commandParser.js';

export const historyCommand: CommandHandler = async (_args: string[], context: CommandContext) => {
  context.toggleHistory();
};
