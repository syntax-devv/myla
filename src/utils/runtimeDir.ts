import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { getEnvConfig } from '../config/envParser.js';

function getBaseRuntimeDir(): string {
  const customDir = getEnvConfig('runtimeDir', undefined);
  if (customDir && typeof customDir === 'string') {
    return customDir;
  }
  return path.join(os.homedir(), '.myla', 'runtime');
}

function getProjectHash(projectPath: string): string {
  return crypto.createHash('sha256').update(projectPath).digest('hex').substring(0, 16);
}

export function getRuntimeDir(projectPath?: string): string {
  const baseDir = getBaseRuntimeDir();
  
  if (!projectPath) {
    return path.join(baseDir, 'global');
  }

  const projectHash = getProjectHash(projectPath);
  return path.join(baseDir, `project-${projectHash}`);
}

export function ensureRuntimeDir(projectPath?: string): string {
  const runtimeDir = getRuntimeDir(projectPath);
  
  if (!fs.existsSync(runtimeDir)) {
    fs.mkdirSync(runtimeDir, { recursive: true });
  }

  return runtimeDir;
}

export function getRuntimeFilePath(projectPath: string, filename: string): string {
  const runtimeDir = ensureRuntimeDir(projectPath);
  return path.join(runtimeDir, filename);
}

export function cleanupOldRuntimeDirs(maxAgeDays: number = 30): void {
  const baseDir = getBaseRuntimeDir();
  
  if (!fs.existsSync(baseDir)) {
    return;
  }

  const now = Date.now();
  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

  try {
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      
      const entryPath = path.join(baseDir, entry.name);
      const stats = fs.statSync(entryPath);
      const age = now - stats.mtimeMs;

      if (age > maxAgeMs) {
        fs.rmSync(entryPath, { recursive: true, force: true });
      }
    }
  } catch (err) {
    console.warn('Failed to cleanup old runtime directories:', err);
  }
}

export function clearProjectRuntime(projectPath: string): void {
  const runtimeDir = getRuntimeDir(projectPath);
  
  if (fs.existsSync(runtimeDir)) {
    fs.rmSync(runtimeDir, { recursive: true, force: true });
  }
}
