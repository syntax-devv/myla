import { EventEmitter } from 'node:events';

import { WriteBuffer, type WriteBufferOptions } from './WriteBuffer.js';
import { scrubOutput } from './scrubOutput.js';
import { IPty, type PtyStartOptions } from './IPty.js';

const DEV_MODE = process.env.NODE_ENV !== 'production';

export type EngineState = 'idle' | 'running' | 'crashed';

export type CliContainerOptions = {
  pty: IPty;
  scrub?: boolean;
  writeBuffer?: WriteBufferOptions;
};

export type CliContainerEvents = {
  data: (text: string) => void;
  exit: (code: number | null, signal: NodeJS.Signals | null) => void;
  error: (err: Error) => void;
  state: (state: EngineState) => void;
};

export class CliContainer extends EventEmitter {
  private readonly pty: IPty;
  private readonly scrub: boolean;
  private readonly buffer: WriteBuffer;

  private state: EngineState = 'idle';
  private lastStart: PtyStartOptions | null = null;
  private manuallyKilled = false;

  constructor(opts: CliContainerOptions) {
    super();

    this.pty = opts.pty;
    this.scrub = opts.scrub ?? true;

    this.buffer = new WriteBuffer(chunk => {
      this.pty.write(chunk);
    }, opts.writeBuffer);

    this.pty.on('data', chunk => {
      const start = DEV_MODE ? performance.now() : 0;
      const text = this.scrub ? scrubOutput(chunk) : chunk;
      if (text.length > 0) {
        this.emit('data', text);
        if (DEV_MODE) {
          const latency = performance.now() - start;
          if (latency > 100) {
            console.warn(`[LATENCY] PTY-to-render: ${latency.toFixed(2)}ms (target: <100ms)`);
          }
        }
      }
    });

    this.pty.on('error', err => {
      this.setState('crashed');
      this.emit('error', err);
    });

    this.pty.on('exit', (code, signal) => {
      const start = DEV_MODE ? performance.now() : 0;
      const exitCode = code ?? 0;
      if (exitCode !== 0 && !this.manuallyKilled) {
        this.setState('crashed');
      } else {
        this.setState('idle');
      }
      this.emit('exit', code, signal);
      if (DEV_MODE && exitCode !== 0 && !this.manuallyKilled) {
        const latency = performance.now() - start;
        if (latency > 500) {
          console.warn(`[LATENCY] Crash detection: ${latency.toFixed(2)}ms (target: <500ms)`);
        }
      }
    });
  }

  getState(): EngineState {
    return this.state;
  }

  spawn(opts: PtyStartOptions): void {
    this.lastStart = opts;
    this.manuallyKilled = false;
    this.pty.start(opts);
    this.setState('running');
  }

  pause(): void {
    if (this.state !== 'running') return;
    this.setState('idle');
  }

  resume(): void {
    if (this.state !== 'idle') return;
    this.setState('running');
  }

  write(input: string): void {
    if (this.state !== 'running') return;
    this.buffer.enqueue(input);
  }

  kill(signal?: NodeJS.Signals): void {
    this.manuallyKilled = true;
    this.pty.kill(signal);
    this.setState('idle');
  }

  restart(): void {
    if (!this.lastStart) throw new Error('No previous spawn() options to restart');
    this.kill();
    this.spawn(this.lastStart);
  }

  private setState(next: EngineState): void {
    if (this.state === next) return;
    this.state = next;
    this.emit('state', next);
  }
}
