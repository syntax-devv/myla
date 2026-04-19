import { BaseAdapter } from './apiBase.js';
import { spawn } from 'child_process';

export class CodexAdapter extends BaseAdapter {
  constructor(config = {}) {
    super(config);
    this.name = 'codex';
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const check = spawn('npx', ['@openai/codex', '--version'], { shell: true });
      check.on('error', () => reject(new Error('Codex CLI not found')));
      check.on('close', (code) => {
        if (code === 0) {
          this.connected = true;
          resolve(true);
        } else {
          reject(new Error('Codex CLI not available'));
        }
      });
    });
  }

  async send(request) {
    if (!this.connected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      // Codex CLI uses different flags - just the prompt as argument
      const args = [request.message, '--quiet'];
      const codex = spawn('npx', ['@openai/codex', ...args], {
        shell: true,
        cwd: request.cwd || process.cwd()
      });

      let output = '';
      let error = '';

      codex.stdout.on('data', (data) => {
        output += data.toString();
      });

      codex.stderr.on('data', (data) => {
        error += data.toString();
      });

      codex.on('close', (code) => {
        if (code !== 0 && !output) {
          reject(new Error(error || `Codex exited with code ${code}`));
        } else {
          resolve({
            engine: 'codex',
            response: output.trim(),
            exitCode: code
          });
        }
      });
    });
  }

  async disconnect() {
    this.connected = false;
  }
}

export default CodexAdapter;
