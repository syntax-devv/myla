export function enforcePrivacyGuards(): void {
  globalThis.fetch = (..._args: unknown[]) => {
    throw new Error('Network calls are forbidden by Myla privacy policy. Attempted to call fetch()');
  };

  try {
    const http = require('node:http');

    http.request = (..._args: unknown[]) => {
      throw new Error('Network calls are forbidden by Myla privacy policy. Attempted to call http.request()');
    };
    http.get = (..._args: unknown[]) => {
      throw new Error('Network calls are forbidden by Myla privacy policy. Attempted to call http.get()');
    };
  } catch {
  }

  try {
    const https = require('node:https');

    https.request = (..._args: unknown[]) => {
      throw new Error('Network calls are forbidden by Myla privacy policy. Attempted to call https.request()');
    };
    https.get = (..._args: unknown[]) => {
      throw new Error('Network calls are forbidden by Myla privacy policy. Attempted to call https.get()');
    };
  } catch {
  }

  try {
    const net = require('node:net');

    net.connect = (..._args: unknown[]) => {
      throw new Error('Network calls are forbidden by Myla privacy policy. Attempted to call net.connect()');
    };
    net.createConnection = (..._args: unknown[]) => {
      throw new Error('Network calls are forbidden by Myla privacy policy. Attempted to call net.createConnection()');
    };
  } catch {
  }
}
