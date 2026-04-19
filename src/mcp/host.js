// MCP Host - Myla's connection to the Model Context Protocol
// This is the "Motherboard" that connects AI Models (CPUs) to Tools (MCP Servers)

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

export class MCPHost {
  constructor() {
    this.clients = new Map();
    this.tools = new Map();
  }

  async connectServer(name, command, args = [], env = {}) {
    try {
      const transport = new StdioClientTransport({
        command,
        args,
        env: { ...process.env, ...env }
      });

      const client = new Client({ name: 'myla', version: '0.1.0' });
      await client.connect(transport);

      const toolsResponse = await client.listTools();
      const serverTools = toolsResponse.tools || [];

      for (const tool of serverTools) {
        const fullName = `${name}.${tool.name}`;
        this.tools.set(fullName, {
          ...tool,
          server: name,
          client
        });
      }

      this.clients.set(name, { client, transport, tools: serverTools });
      return { success: true, tools: serverTools.length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async executeTool(fullName, args) {
    const tool = this.tools.get(fullName);
    if (!tool) {
      throw new Error(`Tool ${fullName} not found`);
    }

    const result = await tool.client.callTool({
      name: tool.name,
      arguments: args
    });

    return result;
  }

  getToolsForAI() {
    return Array.from(this.tools.entries()).map(([name, tool]) => ({
      name,
      description: tool.description,
      parameters: tool.inputSchema
    }));
  }

  getToolsByServer() {
    const byServer = {};
    for (const [name, tool] of this.tools) {
      if (!byServer[tool.server]) byServer[tool.server] = [];
      byServer[tool.server].push({
        name: tool.name,
        description: tool.description
      });
    }
    return byServer;
  }

  async disconnectAll() {
    for (const [name, { client }] of this.clients) {
      await client.close();
    }
    this.clients.clear();
    this.tools.clear();
  }

  listServers() {
    return Array.from(this.clients.keys());
  }
}

export default MCPHost;
