import { registerCommand } from './commandParser.js';
import { switchCommand } from './commands/switch.js';
import { historyCommand } from './commands/history.js';

registerCommand({
  name: 'switch',
  description: 'Switch to a different engine',
  handler: switchCommand,
});

registerCommand({
  name: 'history',
  description: 'View message history',
  handler: historyCommand,
});
