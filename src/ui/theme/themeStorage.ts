import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { ThemeConfig } from './themeTypes.js';

function getThemeConfigPath(): string {
  return path.join(os.homedir(), '.myla', 'theme.json');
}

export function saveThemeConfig(config: ThemeConfig): void {
  try {
    const configDir = path.dirname(getThemeConfigPath());
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(getThemeConfigPath(), JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    console.warn('Failed to save theme config:', err);
  }
}

export function loadThemeConfig(): ThemeConfig | null {
  try {
    const configPath = getThemeConfigPath();
    if (!fs.existsSync(configPath)) return null;
    const raw = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(raw) as ThemeConfig;
  } catch (err) {
    console.warn('Failed to load theme config:', err);
    return null;
  }
}

export function clearThemeConfig(): void {
  try {
    const configPath = getThemeConfigPath();
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  } catch (err) {
    console.warn('Failed to clear theme config:', err);
  }
}
