import type { ProviderManifest, RuntimeMode } from './ProviderManifest.js';

export class ProviderCatalog {
  private manifests: Map<string, ProviderManifest> = new Map();

  constructor(manifests: ProviderManifest[] = []) {
    for (const manifest of manifests) {
      this.register(manifest);
    }
  }

  register(manifest: ProviderManifest): void {
    const key = manifest.provider.toLowerCase();
    if (this.manifests.has(key)) {
      throw new Error(`Duplicate provider manifest: ${manifest.provider}`);
    }
    this.manifests.set(key, manifest);
  }

  get(provider: string): ProviderManifest {
    const key = provider.toLowerCase();
    const manifest = this.manifests.get(key);
    if (!manifest) {
      throw new Error(`Unknown provider: ${provider}`);
    }
    return manifest;
  }

  has(provider: string): boolean {
    return this.manifests.has(provider.toLowerCase());
  }

  providers(): string[] {
    return Array.from(this.manifests.keys()).sort();
  }

  getCompletionProfile(provider: string, runtimeMode: RuntimeMode) {
    const manifest = this.get(provider);
    if (!manifest.runtimeProfiles[runtimeMode]) {
      throw new Error(
        `Provider ${manifest.provider} does not support runtime mode ${runtimeMode}`
      );
    }
    return manifest.runtimeProfiles[runtimeMode];
  }

  unregister(provider: string): void {
    this.manifests.delete(provider.toLowerCase());
  }

  clear(): void {
    this.manifests.clear();
  }
}
