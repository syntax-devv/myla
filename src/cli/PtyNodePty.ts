import pty from 'node-pty';

import { IPty, type PtyStartOptions } from './IPty.js';

export class PtyNodePty extends IPty {
  private term: pty.IPty | null = null;

  start(opts: PtyStartOptions): void {
    if (this.term) throw new Error('PTY already started');

    const args = opts.args ?? [];
    const cwd = opts.cwd ?? process.cwd();
    const env = opts.env ?? process.env;

    this.term = pty.spawn(opts.command, args, {
      cwd,
      env,
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
    });

    this.term.onData(chunk => {
      this.emit('data', chunk);
    });

    this.term.onExit(({ exitCode, signal }) => {
      this.term = null;
      this.emit('exit', exitCode, signal ?? null);
    });
  }

  write(data: string): void {
    if (!this.term) throw new Error('PTY not started');
    this.term.write(data);
  }

  kill(signal?: NodeJS.Signals): void {
    if (!this.term) return;
    this.term.kill(signal);
    // exit handler will clear state
  }
}
