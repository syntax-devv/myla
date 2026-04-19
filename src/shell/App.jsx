import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useApp } from 'ink';
import { ScrollView } from './components/ScrollView.jsx';
import { Input } from './components/Input.jsx';
import { getTheme } from './theme.js';
import { ConfigManager } from '../utils/config.js';
import { HistoryManager } from '../brain/history.js';
import { registerEngine, listEngines, route } from '../brain/engine.js';
import { createAdapters } from '../driver/index.js';

const App = () => {
  const { exit } = useApp();
  const [theme] = useState(() => getTheme('dark'));
  const [messages, setMessages] = useState([]);
  const [inputHistory, setInputHistory] = useState([]);
  const [status, setStatus] = useState('initializing');
  const [configManager] = useState(() => new ConfigManager());
  const [historyManager] = useState(() => new HistoryManager());

  useEffect(() => {
    const init = async () => {
      try {
        await configManager.init();
        await historyManager.init();
        
        const config = configManager.config;
        const adapters = createAdapters(config);
        
        Object.entries(adapters).forEach(([name, adapter]) => {
          registerEngine(name, adapter);
        });
        
        const engines = listEngines();
        setStatus(`ready (${engines.join(', ') || 'no engines'})`);
        
        addMessage('system', 'Myla initialized. Type /help for commands, /quit to exit.');
      } catch (err) {
        setStatus(`error: ${err.message}`);
        addMessage('error', `Initialization failed: ${err.message}`);
      }
    };
    
    init();
  }, []);

  const addMessage = useCallback((type, content) => {
    setMessages(prev => [...prev, { type, content, timestamp: Date.now() }]);
    historyManager.addEntry({ type, content });
  }, [historyManager]);

  const handleEngineMessage = useCallback(async (engineName, message) => {
    const engines = listEngines();
    if (!engines.includes(engineName)) {
      addMessage('error', `Engine "${engineName}" not available. Enabled: ${engines.join(', ') || 'none'}`);
      setStatus('error');
      return;
    }

    try {
      setStatus(`sending to ${engineName}...`);
      const response = await route(engineName, { message });
      addMessage(engineName, response.response);
      setStatus('ready');
    } catch (err) {
      addMessage('error', `${engineName} error: ${err.message}`);
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
          addMessage('system', 'Commands: /quit, /help, /engines, /status, /claude <msg>, /codex <msg>');
          return;
        case 'claude':
          if (args.length === 0) {
            addMessage('error', 'Usage: /claude <your message>');
            return;
          }
          const claudeMsg = args.join(' ');
          addMessage('user', `/claude ${claudeMsg}`);
          handleEngineMessage('claude', claudeMsg);
          return;
        case 'codex':
          if (args.length === 0) {
            addMessage('error', 'Usage: /codex <your message>');
            return;
          }
          const codexMsg = args.join(' ');
          addMessage('user', `/codex ${codexMsg}`);
          handleEngineMessage('codex', codexMsg);
          return;
        case 'engines':
          addMessage('system', `Available: ${listEngines().join(', ') || 'none'}`);
          return;
        case 'status':
          addMessage('system', `Status: ${status}`);
          return;
        default:
          addMessage('error', `Unknown command: /${cmd}`);
          return;
      }
    }

    addMessage('user', input);
    
    const engines = listEngines();
    if (engines.length === 0) {
      addMessage('error', 'No engines available. Check your config at ~/.myla/config.json');
      return;
    }

    const targetEngine = configManager.get('defaultEngine') || engines[0];
    
    try {
      setStatus(`sending to ${targetEngine}...`);
      const response = await route(targetEngine, { message: input });
      addMessage(targetEngine, response.response);
      setStatus('ready');
    } catch (err) {
      addMessage('error', `Engine error: ${err.message}`);
      setStatus('error');
    }
  }, [addMessage, configManager, exit, historyManager, status, handleEngineMessage]);

  const getMessageColor = (type) => {
    switch (type) {
      case 'user': return theme.primary;
      case 'claude': return theme.secondary;
      case 'codex': return theme.success;
      case 'error': return theme.error;
      case 'system': return theme.dim;
      default: return theme.text;
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color={theme.primary}>Myla</Text>
        <Text dimColor> v0.1.0 | </Text>
        <Text color={status.includes('error') ? theme.error : theme.dim}>{status}</Text>
      </Box>
      
      <ScrollView maxHeight={15}>
        {messages.map((msg, i) => (
          <Box key={i} marginBottom={1}>
            <Text color={getMessageColor(msg.type)}>
              {msg.type === 'user' ? '› ' : `[${msg.type}] `}
              {msg.content}
            </Text>
          </Box>
        ))}
      </ScrollView>
      
      <Box marginTop={1}>
        <Input 
          onSubmit={handleCommand}
          placeholder="Enter command or query..."
          history={inputHistory}
        />
      </Box>
    </Box>
  );
};

export default App;
