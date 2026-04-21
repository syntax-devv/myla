export type EngineId = 'claude' | 'codex';

export type EngineConfig = {
  id: EngineId;
  displayName: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
};
