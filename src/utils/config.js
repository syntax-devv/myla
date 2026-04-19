// Config Manager - handles ~/.myla/config.json

import { mkdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const MYLA_DIR = join(homedir(), '.myla');
const SESSIONS_DIR = join(MYLA_DIR, 'sessions');
const CONFIG_PATH = join(MYLA_DIR, 'config.json');

const DEFAULT_CONFIG = {
  defaultEngine: 'claude',
  theme: 'dark',
  engines: {
    claude: { enabled: true },
    codex: { enabled: true },
    api: { enabled: false, endpoint: null }
  }
};

export class ConfigManager {
  constructor() {
    this.config = null;
  }

  async init() {
    if (!existsSync(MYLA_DIR)) {
      await mkdir(MYLA_DIR, { recursive: true });
    }
    
    if (!existsSync(CONFIG_PATH)) {
      await this.save(DEFAULT_CONFIG);
    }
    
    await this.load();
  }

  async load() {
    const data = await readFile(CONFIG_PATH, 'utf-8');
    this.config = JSON.parse(data);
    return this.config;
  }

  async save(config) {
    this.config = config;
    await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
  }

  get(key) {
    return key.split('.').reduce((obj, k) => obj?.[k], this.config);
  }

  set(key, value) {
    const keys = key.split('.');
    const last = keys.pop();
    const target = keys.reduce((obj, k) => {
      if (!obj[k]) obj[k] = {};
      return obj[k];
    }, this.config);
    target[last] = value;
    return this.save(this.config);
  }
}

export default ConfigManager;
