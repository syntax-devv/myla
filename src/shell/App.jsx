import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Text, useApp, useStdout } from 'ink';
import { ScrollView } from './components/ScrollView.jsx';
import { Input } from './components/Input.jsx';
import { Spinner } from './components/Spinner.jsx';
import { getTheme } from './theme.js';
import { ConfigManager } from '../utils/config.js';
import { HistoryManager } from '../brain/history.js';
import { registerEngine, listEngines, route } from '../brain/engine.js';
import { createAdapters } from '../driver/index.js';
import { MylaAgent } from '../brain/agent.js';

const rawArg = process.argv[2];
const cliEngine = rawArg ? rawArg.replace(/^\//, '').toLowerCase() : null;

const MultilineText = ({ content, color }) => {
  const lines = content.split('\n');
  return (
    <Box flexDirection="column">
      {lines.map((line, i) => (
        <Text key={i} color={color} wrap="wrap">
          {line === '' ? ' ' : line}
        </Text>
      ))}
    </Box>
  );
};

const App = () => {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const theme = getTheme('dark');

  const [messages, setMessages]           = useState([]);
  const [inputHistory, setInputHistory]   = useState([]);
  const [status, setStatus]               = useState('initializing');
  const [selectedEngine, setSelectedEngine] = useState(cliEngine);
  const [showSelector, setShowSelector]   = useState(!cliEngine);
  const [initialized, setInitialized]     = useState(false);

  const configManager = useRef(new ConfigManager()).current;
  const historyManager = useRef(new HistoryManager()).current;
  const adaptersRef = useRef({});
  const mylaAgent = useRef(null);

  const [cols, setCols] = useState(stdout.columns || 80);
  useEffect(() => {
    const onResize = () => setCols(stdout.columns || 80);
    onResize();
    stdout.on('resize', onResize);
    return () => stdout.off('resize', onResize);
  }, [stdout]);

  const sep = '─'.repeat(Math.max(10, cols - 2));

  const addMessage = useCallback((type, content) => {
    setMessages(prev => [...prev, { type, content, ts: Date.now() }]);
    historyManager.addEntry({ type, content });
  }, [historyManager]);

  useEffect(() => {
    const init = async () => {
      try {
        await configManager.init();
        await historyManager.init();

        const config = configManager.config;
        const adapters = createAdapters(config);
        adaptersRef.current = adapters;

        Object.entries(adapters).forEach(([name, adapter]) => {
          registerEngine(name, adapter);
        });

        mylaAgent.current = new MylaAgent(async (engine, req) => {
          return await route(engine, req);
        });
        await mylaAgent.current.init(config);

        setInitialized(true);

        if (selectedEngine) {
          const available = listEngines();
          if (available.includes(selectedEngine)) {
            try {
              const adapter = adaptersRef.current[selectedEngine];
              if (adapter) await adapter.connect();
              setStatus('ready');
              addMessage('system', `Using ${selectedEngine}. Type /help for commands.`);
            } catch (connErr) {
              setStatus('error');
              addMessage('error', `${selectedEngine} unavailable — ${connErr.message}`);
              setShowSelector(true);
            }
          } else {
            setStatus('error');
            addMessage('error', `Engine "${selectedEngine}" not enabled. Check ~/.myla/config.json`);
            setShowSelector(true);
          }
        } else {
          setInitialized(true);
        }
      } catch (err) {
        setStatus(`error: ${err.message}`);
        setInitialized(true);
      }
    };
    init();
  }, []);

  const sendToEngine = useCallback(async (engineName, message) => {
    const available = listEngines();
    if (!available.includes(engineName)) {
      addMessage('error', `Engine "${engineName}" not available. Try /engines`);
      setStatus('error');
      return;
    }
    try {
      setStatus(`thinking…`);
      
      if (mylaAgent.current) {
        const result = await mylaAgent.current.process(message, engineName);
        
        if (result.actions && result.actions.length > 0) {
          addMessage('system', `Executing: ${result.actions.map(a => a.tool).join(', ')}`);
        }
        
        addMessage(engineName, result.response);
      } else {
        const res = await route(engineName, { message });
        addMessage(engineName, res.response);
      }
      
      setStatus('ready');
    } catch (err) {
      addMessage('error', `${engineName}: ${err.message}`);
      setStatus('error');
    }
  }, [addMessage]);

  const handleCommand = useCallback(async (input) => {
    setInputHistory(prev => [...prev, input]);

    if (input.startsWith('/')) {
      const [cmd, ...args] = input.slice(1).split(' ');
      switch (cmd) {
        case 'quit':
        case 'exit':
          await historyManager.saveSession(`session-${Date.now()}`);
          exit();
          return;
        case 'help':
          addMessage('system',
            'Commands: /switch <engine>  /engines  /status  /clear  /tools  /quit'
          );
          return;
        case 'tools': {
          const tools = mylaAgent.current?.listTools() || {};
          const serverNames = Object.keys(tools);
          if (serverNames.length === 0) {
            addMessage('system', 'No MCP tools connected. Add to ~/.myla/config.json:\n{\n  "mcpServers": {\n    "filesystem": {\n      "enabled": true,\n      "command": "npx",\n      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"]\n    }\n  }\n}');
          } else {
            let toolList = 'Connected MCP Tools:\n';
            for (const [server, serverTools] of Object.entries(tools)) {
              toolList += `  ${server}:\n`;
              for (const tool of serverTools) {
                toolList += `    - ${tool.name}: ${tool.description}\n`;
              }
            }
            addMessage('system', toolList);
          }
          return;
        }
        case 'engines':
          addMessage('system', `Available: ${listEngines().join(', ') || 'none'}`);
          return;
        case 'status':
          addMessage('system', `Engine: ${selectedEngine}  ·  ${status}`);
          return;
        case 'switch': {
          const target = args[0]?.toLowerCase();
          if (!target) { addMessage('error', 'Usage: /switch <engine>'); return; }
          if (!listEngines().includes(target)) {
            addMessage('error', `Engine "${target}" not available. Try /engines`);
            return;
          }
          try {
            const adapter = adaptersRef.current[target];
            if (adapter && !adapter.connected) await adapter.connect();
            setSelectedEngine(target);
            setStatus('ready');
            addMessage('system', `Switched to ${target}.`);
          } catch (err) {
            addMessage('error', `Cannot switch to ${target}: ${err.message}`);
          }
          return;
        }
        case 'clear':
          setMessages([]);
          return;
        default:
          addMessage('error', `Unknown command: /${cmd}  —  try /help`);
          return;
      }
    }

    addMessage('user', input);
    sendToEngine(selectedEngine, input);
  }, [addMessage, exit, historyManager, status, sendToEngine, selectedEngine]);

  const msgColor = (type) => ({
    user:   theme.user,
    claude: theme.claude,
    codex:  theme.codex,
    error:  theme.error,
    system: theme.system,
  }[type] || theme.user);

  const isLoading = status === 'thinking…' || status === 'initializing';

  if (!initialized) {
    return (
      <Box flexDirection="column" paddingX={1} marginTop={1}>
        <Text color="#D97706" bold>◆ myla</Text>
        <Box marginTop={1}>
          <Spinner color="#D97706" text="starting up…" />
        </Box>
      </Box>
    );
  }

  if (showSelector) {
    const engines = listEngines();
    return (
      <Box flexDirection="column" paddingX={1} marginTop={1}>
        <Box marginBottom={1}>
          <Text color="#D97706" bold>◆ myla  </Text>
          <Text dimColor>v0.1.0</Text>
        </Box>
        <Text dimColor>{sep}</Text>
        <Box flexDirection="column" marginTop={1} marginBottom={1}>
          <Text bold>Select engine:</Text>
          {engines.length === 0
            ? <Text color={theme.error}>No engines enabled — check ~/.myla/config.json</Text>
            : engines.map((e, i) => (
                <Text key={e} dimColor={false} color={theme.claude}>
                  {i + 1}.  {e}
                </Text>
              ))
          }
        </Box>
        <Box>
          <Input
            onSubmit={(val) => {
              const v = val.toLowerCase().trim();
              const idx = parseInt(v) - 1;
              const chosen = engines[idx] ?? (engines.includes(v) ? v : null);
              if (chosen) {
                setSelectedEngine(chosen);
                setShowSelector(false);
              } else {
                addMessage('error', `Invalid choice: ${val}`);
              }
            }}
            placeholder="number or name…"
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={1}>

      <Box marginTop={1} marginBottom={0}>
        <Text color="#D97706" bold>◆ myla  </Text>
        <Text dimColor>v0.1.0  ·  </Text>
        <Text color={theme.claude}>{selectedEngine}</Text>
        <Text dimColor>  ·  </Text>
        {isLoading
          ? <Spinner color="#FBBF24" text={status} />
          : <Text color={status.includes('error') ? theme.error : '#34D399'}>{status}</Text>
        }
      </Box>
      <Text dimColor>{sep}</Text>

      <Box flexDirection="column" marginY={1}>
        <ScrollView>
          {messages.length === 0
            ? <Text dimColor>  type a message to begin…</Text>
            : messages.map((msg, i) => {
                if (msg.type === 'user') {
                  return (
                    <Box key={i} marginBottom={1} flexDirection="column">
                      <Box>
                        <Text dimColor>  you</Text>
                      </Box>
                      <Box marginLeft={2}>
                        <MultilineText content={msg.content} color={theme.user} />
                      </Box>
                    </Box>
                  );
                }
                if (msg.type === 'system') {
                  return (
                    <Box key={i} marginBottom={1}>
                      <Text dimColor>  ℹ  {msg.content}</Text>
                    </Box>
                  );
                }
                if (msg.type === 'error') {
                  return (
                    <Box key={i} marginBottom={1}>
                      <Text color={theme.error}>  ✕  {msg.content}</Text>
                    </Box>
                  );
                }
                // AI response
                return (
                  <Box key={i} marginBottom={1} flexDirection="column">
                    <Box>
                      <Text color={msgColor(msg.type)} bold>  {msg.type}</Text>
                    </Box>
                    <Box marginLeft={2}>
                      <MultilineText content={msg.content} color={theme.user} />
                    </Box>
                  </Box>
                );
              })
          }
        </ScrollView>
      </Box>

      <Text dimColor>{sep}</Text>
      <Box marginTop={1}>
        <Input
          onSubmit={handleCommand}
          placeholder="message or /command…"
          history={inputHistory}
        />
      </Box>

      <Box marginTop={1} marginBottom={1}>
        <Text dimColor>  /switch  /engines  /clear  /help  /quit</Text>
      </Box>

    </Box>
  );
};

export default App;
