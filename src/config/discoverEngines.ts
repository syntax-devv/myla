import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import toml from 'toml';

import { discoverEnginesWithCatalog } from './providerDiscovery.js';
import type { EngineConfig, EngineId } from './types.js';

type ParsedConfig = {
  engines?: Partial<Record<EngineId, { path?: string; args?: string[] }>>;
};

function homeConfigPath(): string {
  return path.join(os.homedir(), '.myla', 'config.toml');
}

function isWindows(): boolean {
  return process.platform === 'win32';
}

function candidateBinaries(id: EngineId): string[] {
  if (!isWindows()) return [id];
  // On Windows, CLIs may be installed as .cmd shims.
  return [`${id}.cmd`, `${id}.exe`, id];
}

function pathExts(): string[] {
  const pathext = process.env.PATHEXT;
  if (!isWindows() || !pathext) return [''];
  return pathext.split(';').filter(Boolean);
}

function whichInPath(command: string): string | null {
  const envPath = process.env.PATH ?? '';
  const segments = envPath.split(path.delimiter).filter(Boolean);
  const exts = pathExts();

  const hasExt = path.extname(command).length > 0;

  for (const dir of segments) {
    if (!dir) continue;

    if (hasExt) {
      const full = path.join(dir, command);
      if (fs.existsSync(full)) return full;
      continue;
    }

    // Try PATHEXT candidates on Windows; otherwise just the command.
    for (const ext of exts) {
      const full = path.join(dir, command + ext);
      if (fs.existsSync(full)) return full;
    }
  }

  return null;
}

function readUserConfig(): ParsedConfig | null {
  const p = homeConfigPath();
  if (!fs.existsSync(p)) return null;

  const raw = fs.readFileSync(p, 'utf8');
  const parsed = toml.parse(raw) as unknown;

  if (typeof parsed !== 'object' || parsed === null) return null;
  return parsed as ParsedConfig;
}

export function discoverEngines(): EngineConfig[] {
  return discoverEnginesWithCatalog();
}

export const _internal = {
  whichInPath,
  homeConfigPath,
  candidateBinaries,
  readUserConfig,
};
