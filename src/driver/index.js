import { ClaudeAdapter } from './claudeAdapter.js';
import { CodexAdapter } from './codexAdapter.js';
import { BaseAdapter } from './apiBase.js';

export { ClaudeAdapter, CodexAdapter, BaseAdapter };

export const createAdapters = (config) => {
  const adapters = {};
  
  if (config.engines?.claude?.enabled) {
    adapters.claude = new ClaudeAdapter(config.engines.claude);
  }
  
  if (config.engines?.codex?.enabled) {
    adapters.codex = new CodexAdapter(config.engines.codex);
  }
  
  return adapters;
};

export default { createAdapters, ClaudeAdapter, CodexAdapter, BaseAdapter };
