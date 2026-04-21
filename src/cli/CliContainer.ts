import { EventEmitter } from 'node:events';

import { WriteBuffer, type WriteBufferOptions } from './WriteBuffer.js';
import { scrubOutput } from './scrubOutput.js';
import { IPty, type PtyStartOptions } from './IPty.js';

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
      const text = this.scrub ? scrubOutput(chunk) : chunk;
      if (text.length > 0) this.emit('data', text);
    });

    this.pty.on('error', err => {
      this.setState('crashed');
      this.emit('error', err);
    });

    this.pty.on('exit', (code, signal) => {
      const exitCode = code ?? 0;
      if (exitCode !== 0 && !this.manuallyKilled) {
        this.setState('crashed');
      } else {
        this.setState('idle');
      }
      this.emit('exit', code, signal);
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
