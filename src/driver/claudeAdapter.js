import { BaseAdapter } from './apiBase.js';
import { spawn } from 'child_process';

export class ClaudeAdapter extends BaseAdapter {
  constructor(config = {}) {
    super(config);
    this.name = 'claude';
  }

  async connect() {
    // Check if claude CLI is available
    return new Promise((resolve, reject) => {
      const check = spawn('claude', ['--version'], { shell: true });
      check.on('error', () => reject(new Error('Claude CLI not found')));
      check.on('close', (code) => {
        if (code === 0) {
          this.connected = true;
          resolve(true);
        } else {
          reject(new Error('Claude CLI not available'));
        }
      });
    });
  }

  async send(request) {
    if (!this.connected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      const args = ['--print', request.message];
      const claude = spawn('claude', args, { 
        shell: true,
        cwd: request.cwd || process.cwd()
      });

      let output = '';
      let error = '';

      claude.stdout.on('data', (data) => {
        output += data.toString();
      });

      claude.stderr.on('data', (data) => {
        error += data.toString();
      });

      claude.on('close', (code) => {
        if (code !== 0 && !output) {
          reject(new Error(error || `Claude exited with code ${code}`));
        } else {
          resolve({
            engine: 'claude',
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

export default ClaudeAdapter;
