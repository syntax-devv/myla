// Base adapter interface

export class BaseAdapter {
  constructor(config = {}) {
    this.config = config;
    this.connected = false;
  }

  async connect() {
    throw new Error('connect() must be implemented');
  }

  async send(request) {
    throw new Error('send() must be implemented');
  }

  async disconnect() {
    throw new Error('disconnect() must be implemented');
  }
}

export default BaseAdapter;
