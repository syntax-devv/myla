import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';

import { IPty, type PtyStartOptions } from './IPty.js';

export class PtyChildProcess extends IPty {
  private child: ChildProcessWithoutNullStreams | null = null;

  start(opts: PtyStartOptions): void {
    if (this.child) throw new Error('PTY already started');

    const args = opts.args ?? [];

    const child = spawn(opts.command, args, {
      cwd: opts.cwd,
      env: opts.env,
      stdio: 'pipe',
      shell: false,
      windowsHide: true,
    });

    this.child = child;

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');

    child.stdout.on('data', (chunk: string) => {
      this.emit('data', chunk);
    });

    child.stderr.on('data', (chunk: string) => {
      this.emit('data', chunk);
    });

    child.on('error', err => {
      this.emit('error', err instanceof Error ? err : new Error(String(err)));
    });

    child.on('exit', (code, signal) => {
      this.child = null;
      this.emit('exit', code, signal);
    });
  }

  write(data: string): void {
    if (!this.child) throw new Error('PTY not started');
    this.child.stdin.write(data);
  }

  kill(signal?: NodeJS.Signals): void {
    if (!this.child) return;
    this.child.kill(signal);
  }
}
