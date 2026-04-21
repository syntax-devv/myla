import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { _internal } from '../discoverEngines';

test('homeConfigPath points to ~/.myla/config.toml', () => {
  const p = _internal.homeConfigPath();
  assert.equal(p, path.join(os.homedir(), '.myla', 'config.toml'));
});

test('readUserConfig returns null when config does not exist', () => {
  // Temporarily point homedir to a temp folder by monkeypatching os.homedir.
  const orig = os.homedir;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'myla-test-'));

  // @ts-expect-error intentional monkeypatch
  os.homedir = () => tmp;

  try {
    assert.equal(_internal.readUserConfig(), null);
  } finally {
    // @ts-expect-error restore
    os.homedir = orig;
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
