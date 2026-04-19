import { BaseAdapter } from './apiBase.js';
import { spawn } from 'child_process';

export class CodexAdapter extends BaseAdapter {
  constructor(config = {}) {
    super(config);
    this.name = 'codex';
    this.conversationHistory = [];
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
          reject(new Error('Codex CLI not available. Run: npm install -g @openai/codex'));
        }
      });
    });
  }

  async send(request) {
    if (!this.connected) {
      await this.connect();
    }

    let prompt = request.message;
    if (this.conversationHistory.length > 0) {
      const history = this.conversationHistory
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');
      prompt = `Previous conversation:\n${history}\n\nUser: ${request.message}\n\nContinue as Assistant:`;
    }

    this.conversationHistory.push({ role: 'user', content: request.message });

    return new Promise((resolve, reject) => {
      const args = ['@openai/codex', prompt];
      const codex = spawn('npx', args, {
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
          const reply = output.trim();
          this.conversationHistory.push({ role: 'assistant', content: reply });
          resolve({
            engine: 'codex',
            response: reply,
            exitCode: code
          });
        }
      });
    });
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  async disconnect() {
    this.connected = false;
    this.conversationHistory = [];
  }
}

export default CodexAdapter;
