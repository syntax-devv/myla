import type { CommandHandler } from '../commandParser.js';
import type { EngineId } from '../../../config/types.js';

export const switchCommand: CommandHandler = async (args, context) => {
  if (args.length === 0) {
    throw new Error('Usage: /switch <engine_id>');
  }

  const engineId = args[0] as EngineId;
  context.switchEngine(engineId);
};
