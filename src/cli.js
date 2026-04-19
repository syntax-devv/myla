#!/usr/bin/env node
import { spawn } from 'child_process';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Myla - AI Engine Launcher');
  console.log('');
  console.log('Usage:');
  console.log('  myla claude    Launch Claude CLI');
  console.log('  myla codex     Launch Codex CLI');
  console.log('');
  console.log('Or run: myla <engine> <message>');
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
