import { ProviderCatalog } from '../providers/ProviderCatalog.js';
import { BUILTIN_PROVIDERS } from '../providers/registry.js';
import type { EngineConfig, EngineId } from './types.js';
import { _internal } from './discoverEngines.js';

export function discoverEnginesWithCatalog(): EngineConfig[] {
  const catalog = new ProviderCatalog(BUILTIN_PROVIDERS);
  const user = _internal.readUserConfig();

  const found: EngineConfig[] = [];

  for (const providerName of catalog.providers()) {
    const manifest = catalog.get(providerName);

    const fromConfig = user?.engines?.[providerName as EngineId];

    if (fromConfig?.path) {
      found.push({
        id: providerName as EngineId,
        displayName: manifest.displayName,
        command: fromConfig.path,
        args: fromConfig.args,
        env: undefined,
      });
      continue;
    }

    let resolved: string | null = null;
    for (const bin of _internal.candidateBinaries(providerName as EngineId)) {
      resolved = _internal.whichInPath(bin);
      if (resolved) break;
    }

    if (!resolved) continue;

    found.push({
      id: providerName as EngineId,
      displayName: manifest.displayName,
      command: resolved,
    });
  }

  return found;
}

export function getProviderCatalog(): ProviderCatalog {
  return new ProviderCatalog(BUILTIN_PROVIDERS);
}

export function discoverEngines(): EngineConfig[] {
  return discoverEnginesWithCatalog();
}
