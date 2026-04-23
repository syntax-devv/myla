import type { EnvConfig } from './envParser.js';
import type { ProviderManifest } from '../providers/ProviderManifest.js';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateEnvConfig(config: EnvConfig): ValidationResult {
  const errors: string[] = [];

  if (config.statusInterval !== undefined) {
    if (config.statusInterval < 1 || config.statusInterval > 60) {
      errors.push('Status interval must be between 1 and 60 seconds');
    }
  }

  if (config.maxLines !== undefined) {
    if (config.maxLines < 100 || config.maxLines > 100000) {
      errors.push('Max lines must be between 100 and 100000');
    }
  }

  if (config.themeColors) {
    const requiredColors = ['primary', 'secondary', 'background', 'text'];
    for (const color of requiredColors) {
      if (!config.themeColors[color]) {
        errors.push(`Missing required color: ${color}`);
      } else if (!isValidColor(config.themeColors[color])) {
        errors.push(`Invalid color format for ${color}: ${config.themeColors[color]}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateProviderManifest(manifest: ProviderManifest): ValidationResult {
  const errors: string[] = [];

  if (!manifest.provider || manifest.provider.trim().length === 0) {
    errors.push('Provider name cannot be empty');
  }

  if (!manifest.displayName || manifest.displayName.trim().length === 0) {
    errors.push('Provider display name cannot be empty');
  }

  if (Object.keys(manifest.runtimeProfiles).length === 0) {
    errors.push('Provider must have at least one runtime profile');
  }

  for (const [mode, profile] of Object.entries(manifest.runtimeProfiles)) {
    if (profile.provider !== manifest.provider.toLowerCase()) {
      errors.push(
        `Runtime profile provider ${profile.provider} does not match manifest provider ${manifest.provider}`
      );
    }

    if (profile.runtimeMode !== mode) {
      errors.push(
        `Runtime profile mode ${profile.runtimeMode} does not match runtime key ${mode}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function isValidColor(color: string): boolean {
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) return true;
  if (/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(color)) return true;
  const namedColors = [
    'red',
    'green',
    'blue',
    'yellow',
    'cyan',
    'magenta',
    'white',
    'black',
    'gray',
    'grey',
  ];
  return namedColors.includes(color.toLowerCase());
}
