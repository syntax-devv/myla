import { registerCommand } from './commandParser.js';
import { switchCommand } from './commands/switch.js';

registerCommand({
  name: 'switch',
  description: 'Switch to a different engine',
  handler: switchCommand,
});
