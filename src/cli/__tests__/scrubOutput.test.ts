import test from 'node:test';
import assert from 'node:assert/strict';

import { scrubOutput } from '../scrubOutput';

test('scrubOutput strips ANSI codes', () => {
  const raw = '\u001b[32mHello\u001b[0m world';
  assert.equal(scrubOutput(raw), 'Hello world');
});

test('scrubOutput collapses carriage-return rewritten progress updates', () => {
  const raw = 'Downloading\rDownloading\rDownloading\nDone\n';
  assert.equal(scrubOutput(raw), 'Downloading\nDone\n');
});

test('scrubOutput removes simple spinner-only lines', () => {
  const raw = '|\n/\n-\n\\\nReady\n';
  assert.equal(scrubOutput(raw), '\nReady\n');
});

test('scrubOutput does NOT remove markdown separators like ---', () => {
  const raw = 'Header\n---\nContent\n';
  assert.ok(scrubOutput(raw).includes('---'), 'markdown separator should be preserved');
});

test('scrubOutput removes common progress bar tokens', () => {
  const raw = 'Build [#####] next line\n';
  const result = scrubOutput(raw);
  assert.ok(!result.includes('[#####]'), 'progress bar should be removed');
});

test('scrubOutput does NOT remove markdown links or bracket content', () => {
  const raw = 'See [the docs](https://example.com) for details\n';
  const result = scrubOutput(raw);
  assert.ok(result.includes('the docs'), 'link text should be preserved');
});

test('scrubOutput removes braille spinner glyphs', () => {
  const raw = '⠋ Working\n⠙ Working\nDone\n';
  assert.equal(scrubOutput(raw), ' Working\n Working\nDone\n');
});

test('scrubOutput removes box-drawing characters (TUI chrome)', () => {
  const raw = '╭──────────────╮\n│ Hello world  │\n╰──────────────╯\n';
  const result = scrubOutput(raw);
  assert.ok(!result.includes('╭'), 'top-left corner should be stripped');
  assert.ok(!result.includes('─'), 'horizontal bar should be stripped');
  assert.ok(result.includes('Hello world'), 'content should be preserved');
});

test('scrubOutput removes pure TUI chrome lines entirely', () => {
  const raw = '──────────────────\nResponse text\n──────────────────\n';
  const result = scrubOutput(raw);
  assert.ok(!result.includes('──'), 'border line should be removed');
  assert.ok(result.includes('Response text'), 'content should survive');
});

test('scrubOutput does NOT strip percentages inside prose', () => {
  const raw = "I'm about 90% sure this is correct.\n";
  const result = scrubOutput(raw);
  assert.ok(result.includes('90%'), 'percentage in prose should be preserved');
});

test('scrubOutput DOES strip standalone progress percentages', () => {
  const raw = 'Loading 42%\nDone\n';
  const result = scrubOutput(raw);
  assert.ok(!result.includes('42%'), 'standalone progress percentage should be removed');
  assert.ok(result.includes('Done'), 'surrounding content should survive');
});
