import { EventEmitter } from 'node:events';

import { PtyNodePty } from '../cli/PtyNodePty.js';
import { IPty, type PtyStartOptions } from '../cli/IPty.js';
import type { PaneConfig, TerminalBackend } from './backend.js';

export class PtyBackend extends EventEmitter implements TerminalBackend {
  private sessions: Map<string, PtyNodePty> = new Map();
  private nextPaneId = 0;

  sendText(paneId: string, text: string): void {
    const pty = this.sessions.get(paneId);
    if (!pty) {
      throw new Error(`Pane ${paneId} not found`);
    }
    pty.write(text);
  }

  isAlive(paneId: string): boolean {
    return this.sessions.has(paneId);
  }

  killPane(paneId: string, signal?: NodeJS.Signals): void {
    const pty = this.sessions.get(paneId);
    if (!pty) return;
    pty.kill(signal);
    this.sessions.delete(paneId);
    this.emit('pane-killed', paneId);
  }

  activate(paneId: string): void {
    if (!this.sessions.has(paneId)) {
      throw new Error(`Pane ${paneId} not found`);
    }
  }

  createPane(config: PaneConfig): string {
    const paneId = `pty-${this.nextPaneId++}`;
    const pty = new PtyNodePty();

    const startOpts: PtyStartOptions = {
      command: config.command,
      args: config.args,
      cwd: config.cwd,
      env: config.env,
    };

    pty.on('data', (chunk: string) => {
      this.emit('pane-data', paneId, chunk);
    });

    pty.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
      this.emit('pane-exit', paneId, code, signal);
    });

    pty.on('error', (err: Error) => {
      this.emit('pane-error', paneId, err);
    });

    pty.start(startOpts);
    this.sessions.set(paneId, pty);

    this.emit('pane-created', paneId);
    return paneId;
  }

  getPty(paneId: string): IPty | undefined {
    return this.sessions.get(paneId);
  }

  destroy(): void {
    for (const pty of this.sessions.values()) {
      try {
        pty.kill();
      } catch (err) {
      }
    }
    this.sessions.clear();
  }
}
