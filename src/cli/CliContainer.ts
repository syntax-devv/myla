import { EventEmitter } from 'node:events';

import { WriteBuffer, type WriteBufferOptions } from './WriteBuffer.js';
import { scrubOutput } from './scrubOutput.js';
import { IPty, type PtyStartOptions } from './IPty.js';

export type EngineState = 'running' | 'paused' | 'crashed';

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

  private state: EngineState = 'paused';
  private lastStart: PtyStartOptions | null = null;

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
      if (this.state !== 'paused') this.setState('paused');
      this.emit('exit', code, signal);
    });
  }

  getState(): EngineState {
    return this.state;
  }

  spawn(opts: PtyStartOptions): void {
    this.lastStart = opts;
    this.pty.start(opts);
    this.setState('running');
  }

  pause(): void {
    if (this.state !== 'running') return;
    this.setState('paused');
  }

  resume(): void {
    if (this.state !== 'paused') return;
    this.setState('running');
  }

  write(input: string): void {
    if (this.state !== 'running') return;
    this.buffer.enqueue(input);
  }

  kill(signal?: NodeJS.Signals): void {
    this.pty.kill(signal);
    this.setState('paused');
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
