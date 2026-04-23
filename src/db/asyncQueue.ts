import { getDb, saveDb } from './schema.js';

interface QueuedOperation {
  type: 'insertMessage' | 'createSession';
  args: any[];
  resolve: () => void;
  reject: (err: Error) => void;
}

class AsyncDatabaseQueue {
  private queue: QueuedOperation[] = [];
  private processing = false;
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY_MS = 100;

  enqueue<T extends QueuedOperation>(operation: T): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.queue.push({ ...operation, resolve, reject });
      this.scheduleProcess();
    });
  }

  private scheduleProcess(): void {
    if (this.processing) return;
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }
    
    this.batchTimeout = setTimeout(() => {
      this.processBatch();
    }, this.BATCH_DELAY_MS);
  }

  private async processBatch(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const batch = this.queue.splice(0);
    
    try {
      const db = await getDb();
      
      for (const op of batch) {
        try {
          switch (op.type) {
            case 'createSession':
              await this.createSessionSync(db, op.args[0], op.args[1]);
              break;
            case 'insertMessage':
              await this.insertMessageSync(db, op.args[0], op.args[1], op.args[2], op.args[3]);
              break;
            default:
              throw new Error(`Unknown operation type: ${(op as any).type}`);
          }
          op.resolve();
        } catch (err) {
          op.reject(err as Error);
        }
      }
      
      saveDb();
    } catch (err) {
      batch.forEach(op => op.reject(err as Error));
    } finally {
      this.processing = false;
      
      if (this.queue.length > 0) {
        this.scheduleProcess();
      }
    }
  }

  private async createSessionSync(db: any, sessionId: string, engine: string): Promise<void> {
    const stmt = db.prepare('INSERT INTO sessions (id, started_at, engine) VALUES (?, ?, ?)');
    stmt.run([sessionId, Date.now(), engine]);
    stmt.free();
  }

  private async insertMessageSync(db: any, sessionId: string, engine: string, role: 'user' | 'assistant', content: string): Promise<void> {
    const stmt = db.prepare(
      'INSERT INTO messages (session_id, engine, role, content, timestamp) VALUES (?, ?, ?, ?, ?)',
    );
    stmt.run([sessionId, engine, role, content, Date.now()]);
    stmt.free();
  }

  async flush(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    await this.processBatch();
  }
}

export const dbQueue = new AsyncDatabaseQueue();

export async function createSession(sessionId: string, engine: string): Promise<void> {
  return dbQueue.enqueue({ type: 'createSession', args: [sessionId, engine] } as QueuedOperation);
}

export async function insertMessage(
  sessionId: string,
  engine: string,
  role: 'user' | 'assistant',
  content: string,
): Promise<void> {
  return dbQueue.enqueue({ type: 'insertMessage', args: [sessionId, engine, role, content] } as QueuedOperation);
}
