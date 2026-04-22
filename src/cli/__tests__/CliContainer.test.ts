import test from 'node:test';
import assert from 'node:assert/strict';

import { CliContainer } from '../CliContainer';
import { PtyChildProcess } from '../PtyChildProcess';

function waitForEvent<T>(emitter: NodeJS.EventEmitter, event: string): Promise<T> {
  return new Promise(resolve => emitter.once(event, resolve as unknown as () => void));
}

function waitForDataContains(cli: CliContainer, needle: string, timeoutMs = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for data containing: ${needle}`));
    }, timeoutMs);

    const onData = (t: string) => {
      if (t.includes(needle)) {
        cleanup();
        resolve();
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      cli.off('data', onData);
    };

    cli.on('data', onData);
  });
}

test('CliContainer emits data from a child process (scrubbed)', async () => {
  const pty = new PtyChildProcess();
  const cli = new CliContainer({ pty, scrub: true });

  const dataPromise = waitForEvent<string>(cli, 'data');

  cli.spawn({
    command: process.execPath,
    args: ['-e', "console.log('\u001b[32mhi\u001b[0m')"],
  });

  const data = await dataPromise;
  assert.equal(data.trim(), 'hi');
});

test('CliContainer spawn writes output, then returns to paused on exit', async () => {
  const pty = new PtyChildProcess();
  const cli = new CliContainer({ pty });

  assert.equal(cli.getState(), 'idle');

  cli.spawn({
    command: process.execPath,
    args: ['-e', 'process.exit(0)'],
  });

  assert.equal(cli.getState(), 'running');

  await waitForEvent(cli, 'exit');
  assert.equal(cli.getState(), 'idle');
});

test.skip('CliContainer logical pause ignores writes until resumed', async () => {
  const pty = new PtyChildProcess();
  const cli = new CliContainer({ pty, scrub: true });

  cli.spawn({
    command: process.execPath,
    args: ['-e', "process.stdin.setEncoding('utf8'); process.stdin.on('data', d => process.stdout.write(d));"],
  });

  try {
    cli.pause();
    cli.write('a');

    await new Promise(r => setTimeout(r, 100));

    let sawA = false;
    const onData = (t: string) => {
      if (t.includes('a')) sawA = true;
    };
    cli.on('data', onData);
    await new Promise(r => setTimeout(r, 100));
    cli.off('data', onData);
    assert.equal(sawA, false);

    cli.resume();
    cli.write('b');
    await waitForDataContains(cli, 'b');
  } finally {
    cli.kill();
    await waitForEvent(cli, 'exit');
  }
});

test('CliContainer kill keeps container reusable for subsequent spawn()', async () => {
  const pty = new PtyChildProcess();
  const cli = new CliContainer({ pty, scrub: true });

  cli.spawn({ command: process.execPath, args: ['-e', "setTimeout(() => {}, 1000)"] });
  assert.equal(cli.getState(), 'running');

  cli.kill();
  assert.equal(cli.getState(), 'idle');
  await waitForEvent(cli, 'exit');

  cli.spawn({ command: process.execPath, args: ['-e', 'process.exit(0)'] });
  await waitForEvent(cli, 'exit');
  assert.equal(cli.getState(), 'idle');
});
