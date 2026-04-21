import { EventEmitter } from 'node:events';

export type WriteBufferEvents = {
  drained: () => void;
  overflow: (droppedBytes: number) => void;
};

export type WriteBufferOptions = {
  maxQueuedBytes?: number;
  chunkSize?: number;
  flushIntervalMs?: number;
};

type Writer = (chunk: string) => void;

type QueueItem = {
  data: string;
  bytes: number;
};

export class WriteBuffer extends EventEmitter {
  private readonly writer: Writer;
  private readonly maxQueuedBytes: number;
  private readonly chunkSize: number;
  private readonly flushIntervalMs: number;

  private queue: QueueItem[] = [];
  private queuedBytes = 0;

  private draining = false;
  private timer: NodeJS.Timeout | null = null;

  constructor(writer: Writer, opts: WriteBufferOptions = {}) {
    super();
    this.writer = writer;
    this.maxQueuedBytes = opts.maxQueuedBytes ?? 256 * 1024;
    this.chunkSize = opts.chunkSize ?? 8 * 1024;
    this.flushIntervalMs = opts.flushIntervalMs ?? 0;
  }

  enqueue(data: string): void {
    const str = String(data);
    const bytes = Buffer.byteLength(str, 'utf8');

    if (bytes === 0) return;

    if (bytes > this.maxQueuedBytes) {
      this.emit('overflow', bytes);
      return;
    }

    let dropped = 0;
    while (this.queuedBytes + bytes > this.maxQueuedBytes && this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;
      this.queuedBytes -= item.bytes;
      dropped += item.bytes;
    }

    if (dropped > 0) this.emit('overflow', dropped);

    this.queue.push({ data: str, bytes });
    this.queuedBytes += bytes;

    this.scheduleDrain();
  }

  flushNow(): void {
    this.drainTick();
  }

  get sizeBytes(): number {
    return this.queuedBytes;
  }

  get length(): number {
    return this.queue.length;
  }

  private scheduleDrain(): void {
    if (this.draining) return;
    if (this.timer) return;

    if (this.flushIntervalMs > 0) {
      this.timer = setTimeout(() => {
        this.timer = null;
        this.drainTick();
      }, this.flushIntervalMs);
      return;
    }

    this.timer = setImmediate(() => {
      this.timer = null;
      this.drainTick();
    }) as unknown as NodeJS.Timeout;
  }

  private drainTick(): void {
    if (this.draining) return;
    if (this.queue.length === 0) return;

    this.draining = true;

    let budget = this.chunkSize;

    while (budget > 0 && this.queue.length > 0) {
      const item = this.queue[0];
      if (!item) break;

      if (item.bytes <= budget) {
        this.writer(item.data);
        this.queue.shift();
        this.queuedBytes -= item.bytes;
        budget -= item.bytes;
        continue;
      }
      
      const slice = item.data.slice(0, Math.max(1, Math.floor((item.data.length * budget) / item.bytes)));
      const sliceBytes = Buffer.byteLength(slice, 'utf8');

      this.writer(slice);
      item.data = item.data.slice(slice.length);
      item.bytes -= sliceBytes;
      this.queuedBytes -= sliceBytes;
      budget -= sliceBytes;
    }

    this.draining = false;

    if (this.queue.length === 0) {
      this.emit('drained');
      return;
    }

    this.scheduleDrain();
  }
}
