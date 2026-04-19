#!/usr/bin/env node
import { spawn } from 'child_process';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: myla <engine> [args...]');
  console.log('       myla claude --help');
  console.log('       myla codex "write a function"');
  process.exit(0);
}

const [engine, ...engineArgs] = args;

const commands = {
  claude: ['claude', ...engineArgs],
  codex: ['npx', '@openai/codex', ...engineArgs]
};

if (!commands[engine]) {
  console.error(`Unknown engine: ${engine}. Use: claude, codex`);
  process.exit(1);
}

const [cmd, ...cmdArgs] = commands[engine];
const child = spawn(cmd, cmdArgs, { 
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

child.on('exit', (code) => process.exit(code));
