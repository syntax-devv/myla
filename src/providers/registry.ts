import type { ProviderManifest } from './ProviderManifest.js';

export const BUILTIN_PROVIDERS: ProviderManifest[] = [
  {
    provider: 'claude',
    displayName: 'Claude',
    supportsResume: true,
    supportsPermissionAuto: true,
    supportsStreamWatch: true,
    supportsSubagents: false,
    supportsWorkspaceAttach: true,
    runtimeProfiles: {
      interactive: {
        provider: 'claude',
        runtimeMode: 'interactive',
      },
      batch: {
        provider: 'claude',
        runtimeMode: 'batch',
      },
      stream: {
        provider: 'claude',
        runtimeMode: 'stream',
      },
    },
  },
  {
    provider: 'codex',
    displayName: 'Codex',
    supportsResume: true,
    supportsPermissionAuto: true,
    supportsStreamWatch: true,
    supportsSubagents: false,
    supportsWorkspaceAttach: true,
    runtimeProfiles: {
      interactive: {
        provider: 'codex',
        runtimeMode: 'interactive',
      },
      batch: {
        provider: 'codex',
        runtimeMode: 'batch',
      },
      stream: {
        provider: 'codex',
        runtimeMode: 'stream',
      },
    },
  },
];

export const CORE_PROVIDER_NAMES = ['claude', 'codex'];

export const OPTIONAL_PROVIDER_NAMES: string[] = [];

export const TEST_DOUBLE_PROVIDER_NAMES: string[] = [];

export function buildDefaultProviderCatalog() {
  return BUILTIN_PROVIDERS;
}

export function getBuiltinProvider(name: string): ProviderManifest | undefined {
  return BUILTIN_PROVIDERS.find(p => p.provider === name.toLowerCase());
}
