import test from 'node:test';
import assert from 'node:assert/strict';

import { scrubOutput } from './scrubOutput';

test('scrubOutput strips ANSI codes', () => {
  const raw = '\u001b[32mHello\u001b[0m world';
  assert.equal(scrubOutput(raw), 'Hello world');
});

test('scrubOutput collapses carriage-return rewritten progress updates', () => {
  const raw = 'Downloading 1%\rDownloading 20%\rDownloading 100%\nDone\n';
  assert.equal(scrubOutput(raw), 'Downloading\nDone\n');
});

test('scrubOutput removes simple spinner lines', () => {
  const raw = '|\n/\n-\n\\\nReady\n';
  assert.equal(scrubOutput(raw), '\nReady\n');
});

test('scrubOutput removes common progress bar tokens', () => {
  const raw = 'Build [#####-----] 42%\nNext line\n';
  assert.equal(scrubOutput(raw), 'Build\nNext line\n');
});

test('scrubOutput removes braille spinner glyphs', () => {
  const raw = '⠋ Working\n⠙ Working\nDone\n';
  assert.equal(scrubOutput(raw), ' Working\n Working\nDone\n');
});
