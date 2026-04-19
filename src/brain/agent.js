// Mila's Agent Brain - Planner + Executive
// Mila is the OS. Models are CPUs. MCP tools are Drivers.

import { MCPHost } from '../mcp/host.js';

const MILA_SYSTEM_PROMPT = `You are the cognitive engine for Mila, a high-performance terminal agent.

Mila is an Intelligent Terminal OS with:
- You (the Model) as the CPU/Brain
- MCP Servers as Drivers/Tools (file system, web search, databases)
- Terminal as the Display

Your role:
1. Analyze the user's request
2. Decide which tools to use (if any)
3. Provide structured responses Mila can execute

When you need to use tools, respond with JSON:
{
  "thought": "Why I'm using these tools",
  "actions": [
    {"tool": "filesystem.read", "args": {"path": "/path/to/file"}},
    {"tool": "web.search", "args": {"query": "..."}}
  ],
  "response": "What I'll say after tool execution"
}

When no tools needed, respond normally with helpful text.

Available tools will be provided in the context. Be concise and actionable.`;

export class MilaAgent {
  constructor(engineRouter) {
    this.mcp = new MCPHost();
    this.engineRouter = engineRouter;
    this.context = new Map();
    this.history = [];
  }

  async init(config = {}) {
    if (config.mcpServers) {
      for (const [name, server] of Object.entries(config.mcpServers)) {
        if (server.enabled) {
          await this.mcp.connectServer(name, server.command, server.args || [], server.env || {});
        }
      }
    }
  }

  async process(userInput, engineName) {
    const tools = this.mcp.getToolsForAI();
    const toolContext = tools.length > 0 
      ? `\n\nAvailable MCP Tools:\n${JSON.stringify(tools, null, 2)}`
      : '\n\n(No MCP tools connected. Use /tools to add servers.)';

    const fullPrompt = `${MILA_SYSTEM_PROMPT}${toolContext}\n\nUser: ${userInput}`;

    const response = await this.engineRouter(engineName, { 
      message: fullPrompt,
      system: MILA_SYSTEM_PROMPT 
    });

    const result = this.parseResponse(response.response);

    if (result.actions && result.actions.length > 0) {
      const toolResults = await this.executeActions(result.actions);
      
      const followUp = await this.engineRouter(engineName, {
        message: `Tool execution results:\n${JSON.stringify(toolResults, null, 2)}\n\nProvide your response to the user.`,
        system: MILA_SYSTEM_PROMPT
      });
      
      return {
        thought: result.thought,
        actions: result.actions,
        toolResults,
        response: followUp.response
      };
    }

    return { response: response.response };
  }

  parseResponse(text) {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) ||
                      text.match(/\{[\s\S]*"actions"[\s\S]*\}/);

    if (jsonMatch) {
      try {
        const json = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        return {
          thought: json.thought || '',
          actions: json.actions || [],
          response: json.response || text
        };
      } catch {}
    }

    return { response: text, actions: [] };
  }

  async executeActions(actions) {
    const results = [];
    for (const action of actions) {
      try {
        const result = await this.mcp.executeTool(action.tool, action.args);
        results.push({ tool: action.tool, result, success: true });
      } catch (err) {
        results.push({ tool: action.tool, error: err.message, success: false });
      }
    }
    return results;
  }

  async connectTool(name, command, args, env) {
    return await this.mcp.connectServer(name, command, args, env);
  }

  listTools() {
    return this.mcp.getToolsByServer();
  }

  async shutdown() {
    await this.mcp.disconnectAll();
  }
}

export default MilaAgent;
