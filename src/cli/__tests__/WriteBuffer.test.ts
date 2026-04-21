import test from 'node:test';
import assert from 'node:assert/strict';

import { WriteBuffer } from '../WriteBuffer';

test('WriteBuffer preserves write order', async () => {
  const writes: string[] = [];
  const wb = new WriteBuffer(chunk => writes.push(chunk), { chunkSize: 1024 });

  wb.enqueue('a');
  wb.enqueue('b');
  wb.enqueue('c');

  await new Promise<void>(resolve => wb.once('drained', resolve));

  assert.equal(writes.join(''), 'abc');
});

test('WriteBuffer drains asynchronously (does not write synchronously on enqueue)', async () => {
  const writes: string[] = [];
  const wb = new WriteBuffer(chunk => writes.push(chunk));

  wb.enqueue('x');
  assert.equal(writes.length, 0);

  await new Promise<void>(resolve => wb.once('drained', resolve));
  assert.equal(writes.join(''), 'x');
});

test('WriteBuffer applies backpressure by dropping oldest queued data', async () => {
  const writes: string[] = [];
  const overflow: number[] = [];

  const wb = new WriteBuffer(chunk => writes.push(chunk), { maxQueuedBytes: 3, chunkSize: 1024 });
  wb.on('overflow', dropped => overflow.push(dropped));

  wb.enqueue('aa'); // 2 bytes
  wb.enqueue('bb'); // +2 bytes => drops oldest (aa)

  await new Promise<void>(resolve => wb.once('drained', resolve));

  assert.equal(writes.join(''), 'bb');
  assert.ok(overflow.length >= 1);
});
