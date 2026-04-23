import type { BackendType, TerminalBackend } from './backend.js';
import { PtyBackend } from './PtyBackend.js';

export class BackendFactory {
  private static cachedBackend: TerminalBackend | null = null;

  static getBackend(type?: BackendType): TerminalBackend {
    if (this.cachedBackend) {
      return this.cachedBackend;
    }

    const backendType = type ?? this.detectBackendType();
    this.cachedBackend = this.createBackend(backendType);
    return this.cachedBackend;
  }

  private static detectBackendType(): BackendType {
    return 'pty';
  }

  private static createBackend(type: BackendType): TerminalBackend {
    switch (type) {
      case 'pty':
        return new PtyBackend();
      case 'tmux':
        throw new Error('Tmux backend not yet implemented');
      case 'wezterm':
        throw new Error('WezTerm backend not yet implemented');
      default:
        throw new Error(`Unknown backend type: ${type}`);
    }
  }

  static clearCache(): void {
    if (this.cachedBackend) {
      if ('destroy' in this.cachedBackend) {
        (this.cachedBackend as PtyBackend).destroy();
      }
      this.cachedBackend = null;
    }
  }
}
