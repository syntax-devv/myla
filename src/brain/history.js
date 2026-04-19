// History Manager - persists sessions to ~/.myla/sessions/

import { mkdir, writeFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const MYLA_DIR = join(homedir(), '.myla');
const SESSIONS_DIR = join(MYLA_DIR, 'sessions');

export class HistoryManager {
  constructor() {
    this.currentSession = [];
  }

  async init() {
    if (!existsSync(SESSIONS_DIR)) {
      await mkdir(SESSIONS_DIR, { recursive: true });
    }
  }

  addEntry(entry) {
    this.currentSession.push({
      timestamp: new Date().toISOString(),
      ...entry
    });
  }

  async saveSession(sessionId) {
    const path = join(SESSIONS_DIR, `${sessionId}.json`);
    await writeFile(path, JSON.stringify(this.currentSession, null, 2));
  }

  async loadSession(sessionId) {
    const path = join(SESSIONS_DIR, `${sessionId}.json`);
    const data = await readFile(path, 'utf-8');
    this.currentSession = JSON.parse(data);
    return this.currentSession;
  }
}

export default HistoryManager;
