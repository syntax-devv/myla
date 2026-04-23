
export interface CompletionProfile {
  provider: string;
  runtimeMode: RuntimeMode;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
}

export type RuntimeMode = 'interactive' | 'batch' | 'stream';

export interface ProviderManifest {
  provider: string;
  displayName: string;
  supportsResume: boolean;
  supportsPermissionAuto: boolean;
  supportsStreamWatch: boolean;
  supportsSubagents: boolean;
  supportsWorkspaceAttach: boolean;
  runtimeProfiles: Record<RuntimeMode, CompletionProfile>;
}

export function validateProviderManifest(manifest: ProviderManifest): void {
  if (!manifest.provider || manifest.provider.trim().length === 0) {
    throw new Error('Provider name cannot be empty');
  }

  if (!manifest.displayName || manifest.displayName.trim().length === 0) {
    throw new Error('Provider display name cannot be empty');
  }

  if (Object.keys(manifest.runtimeProfiles).length === 0) {
    throw new Error('Provider must have at least one runtime profile');
  }

  for (const [mode, profile] of Object.entries(manifest.runtimeProfiles)) {
    if (profile.provider !== manifest.provider.toLowerCase()) {
      throw new Error(
        `Runtime profile provider ${profile.provider} does not match manifest provider ${manifest.provider}`
      );
    }

    if (profile.runtimeMode !== mode) {
      throw new Error(
        `Runtime profile mode ${profile.runtimeMode} does not match runtime key ${mode}`
      );
    }
  }
}
