export interface EnvConfig {
  statusInterval?: number;
  themeColors?: Record<string, string>;
  maxLines?: number;
  runtimeDir?: string;
  debugMode?: boolean;
}

export function parseEnvConfig(): EnvConfig {
  const config: EnvConfig = {};

  if (process.env.MYLA_STATUS_INTERVAL) {
    const interval = parseInt(process.env.MYLA_STATUS_INTERVAL, 10);
    if (!isNaN(interval) && interval > 0 && interval <= 60) {
      config.statusInterval = interval;
    }
  }

  if (process.env.MYLA_THEME_COLORS) {
    try {
      config.themeColors = JSON.parse(process.env.MYLA_THEME_COLORS);
    } catch (error) {
      console.warn('Invalid MYLA_THEME_COLORS format, using defaults');
    }
  }

  if (process.env.MYLA_MAX_LINES) {
    const lines = parseInt(process.env.MYLA_MAX_LINES, 10);
    if (!isNaN(lines) && lines > 0) {
      config.maxLines = lines;
    }
  }

  if (process.env.MYLA_RUNTIME_DIR) {
    config.runtimeDir = process.env.MYLA_RUNTIME_DIR;
  }

  if (process.env.MYLA_DEBUG) {
    config.debugMode = process.env.MYLA_DEBUG === '1' || process.env.MYLA_DEBUG === 'true';
  }

  return config;
}

export function getEnvConfig<K extends keyof EnvConfig>(
  key: K,
  fallback: EnvConfig[K]
): EnvConfig[K] {
  const config = parseEnvConfig();
  return config[key] ?? fallback;
}
