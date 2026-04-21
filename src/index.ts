import { CliContainer } from './cli/CliContainer.js';
import { PtyNodePty } from './cli/PtyNodePty.js';
import { discoverEngines } from './config/discoverEngines.js';

async function main(): Promise<void> {
  process.stdout.write('Myla booting…\n');

  const engines = discoverEngines();

  if (engines.length === 0) {
    process.stdout.write('No engines found in PATH or ~/.myla/config.toml\n');
    process.stdout.write('Supported engines: claude, codex\n');
    return;
  }

  process.stdout.write(`Found ${engines.length} engine(s):\n`);
  for (const e of engines) {
    process.stdout.write(`  - ${e.displayName}: ${e.command}\n`);
  }

  const engine = engines[0];
  process.stdout.write(`\nUsing: ${engine.displayName}\n`);

  const pty = new PtyNodePty();
  const cli = new CliContainer({ pty, scrub: true });

  cli.on('data', text => {
    process.stdout.write(text);
  });

  cli.on('error', err => {
    process.stderr.write(`Error: ${String(err?.stack ?? err)}\n`);
  });

  const exit = await new Promise<{ code: number | null; signal: NodeJS.Signals | null }>(resolve => {
    cli.once('exit', (code, signal) => resolve({ code, signal }));

    cli.spawn({
      command: engine.command,
      args: engine.args,
    });

    // Give it a moment to start, then send a test prompt
    setTimeout(() => {
      cli.write('hello\n');
    }, 500);
  });

  process.stdout.write(`\nEngine exited (code=${exit.code}, signal=${exit.signal})\n`);
}

main().catch(err => {
  process.stderr.write(String(err?.stack ?? err) + '\n');
  process.exitCode = 1;
});