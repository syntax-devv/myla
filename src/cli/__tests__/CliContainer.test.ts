import test from 'node:test';
import assert from 'node:assert/strict';

import { CliContainer } from '../CliContainer';
import { PtyChildProcess } from '../PtyChildProcess';

function waitForEvent<T>(emitter: NodeJS.EventEmitter, event: string): Promise<T> {
  return new Promise(resolve => emitter.once(event, resolve as unknown as () => void));
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

test('CliContainer state transitions running -> paused on exit', async () => {
  const pty = new PtyChildProcess();
  const cli = new CliContainer({ pty });

  assert.equal(cli.getState(), 'paused');

  cli.spawn({
    command: process.execPath,
    args: ['-e', 'process.exit(0)'],
  });

  assert.equal(cli.getState(), 'running');

  await waitForEvent(cli, 'exit');
  assert.equal(cli.getState(), 'paused');
});
