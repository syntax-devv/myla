// Engine Router - routes requests to appropriate driver

const engines = {
  claude: null,  // ClaudeAdapter instance
  codex: null,   // CodexAdapter instance
  api: null,     // APIAdapter instance
};

export function route(engineName, request) {
  const adapter = engines[engineName];
  if (!adapter) {
    throw new Error(`Engine "${engineName}" not initialized`);
  }
  return adapter.send(request);
}

export function registerEngine(name, adapter) {
  engines[name] = adapter;
}

export function listEngines() {
  return Object.keys(engines).filter(k => engines[k] !== null);
}
