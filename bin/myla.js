#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const indexPath = join(__dirname, '..', 'src', 'index.jsx');

const args = process.argv.slice(2);
const child = spawn('npx', ['tsx', indexPath, ...args], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

child.on('exit', (code) => process.exit(code));
