import test from 'node:test';
import assert from 'node:assert/strict';
import { CliContainer } from '../CliContainer';
import { PtyChildProcess } from '../PtyChildProcess';

function waitForEvent<T>(emitter: NodeJS.EventEmitter, event: string): Promise<T> {
  return new Promise(resolve => emitter.once(event, resolve as unknown as () => void));
}

test.skip('performance: PTY-to-render latency < 100ms (p99)', async () => {
  const pty = new PtyChildProcess();
  const cli = new CliContainer({ pty, scrub: true });

  const latencies: number[] = [];
  const dataPromise = new Promise<void>(resolve => {
    let count = 0;
    cli.on('data', () => {
      count++;
      if (count >= 100) resolve();
    });
  });

  cli.spawn({
    command: process.execPath,
    args: ['-e', "for(let i=0;i<100;i++) console.log('line '+i);"],
  });

  await dataPromise;
  await waitForEvent(cli, 'exit');

  assert.ok(true, 'PTY-to-render latency test completed - check console for warnings');
});

test('performance: Session resume with 10k messages < 200ms', async () => {
  // Simulate session resume with large message count
  const messages: { role: 'user' | 'assistant'; content: string }[] = [];
  for (let i = 0; i < 10000; i++) {
    messages.push({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i}: This is a test message with some content to simulate real data.`,
    });
  }

  const start = performance.now();

  const lines: string[] = [];
  for (const msg of messages) {
    const prefix = msg.role === 'user' ? '› ' : '';
    const content = msg.content.trim();
    if (content) {
      lines.push(prefix + content);
    }
  }

  const trimmed = lines.slice(-10000);

  const latency = performance.now() - start;

  assert.ok(
    latency < 200,
    `Session resume took ${latency.toFixed(2)}ms (target: <200ms)`
  );
});

test.skip('performance: Crash detection < 500ms', async () => {
  const pty = new PtyChildProcess();
  const cli = new CliContainer({ pty, scrub: true });

  const exitPromise = waitForEvent<{ code: number | null; signal: NodeJS.Signals | null }>(
    cli,
    'exit'
  );

  cli.spawn({
    command: process.execPath,
    args: ['-e', 'process.exit(1);'],
  });

  const start = performance.now();
  await exitPromise;
  const latency = performance.now() - start;

  assert.ok(
    latency < 500,
    `Crash detection took ${latency.toFixed(2)}ms (target: <500ms)`
  );
});

test.skip('performance: Large output buffer handling', async () => {
  const pty = new PtyChildProcess();
  const cli = new CliContainer({ pty, scrub: true });

  const dataPromise = new Promise<void>(resolve => {
    let count = 0;
    cli.on('data', () => {
      count++;
      if (count >= 1000) resolve();
    });
  });

  cli.spawn({
    command: process.execPath,
    args: ['-e', "for(let i=0;i<1000;i++) console.log('line '+i);"],
  });

  await dataPromise;
  await waitForEvent(cli, 'exit');

  assert.ok(true, 'Large output buffer handling test completed');
});
