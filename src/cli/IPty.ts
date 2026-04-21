import { EventEmitter } from 'node:events';

export type PtyStartOptions = {
  command: string;
  args?: string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
};

export type IPtyEvents = {
  data: (chunk: string) => void;
  exit: (code: number | null, signal: NodeJS.Signals | null) => void;
  error: (err: Error) => void;
};

export abstract class IPty extends EventEmitter {
  abstract start(opts: PtyStartOptions): void;
  abstract write(data: string): void;
  abstract kill(signal?: NodeJS.Signals): void;
}
