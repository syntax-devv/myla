import type { EngineConfig, EngineId } from './types.js';

export interface LegacyConfig {
  engines?: Partial<Record<EngineId, { path?: string; args?: string[] }>>;
}

export function convertLegacyConfig(legacy: LegacyConfig): EngineConfig[] {
  const configs: EngineConfig[] = [];

  if (!legacy.engines) return configs;

  for (const [id, engineConfig] of Object.entries(legacy.engines)) {
    if (!engineConfig?.path) continue;

    const displayName = id === 'claude' ? 'Claude' : 'Codex';
    configs.push({
      id: id as EngineId,
      displayName,
      command: engineConfig.path,
      args: engineConfig.args,
    });
  }

  return configs;
}

export function isLegacyConfig(config: unknown): config is LegacyConfig {
  if (typeof config !== 'object' || config === null) return false;
  const legacy = config as LegacyConfig;
  return typeof legacy.engines === 'object' && legacy.engines !== null;
}
