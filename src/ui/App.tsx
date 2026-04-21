import React from 'react';
import { Box, render, useInput } from 'ink';
import { StatusBar } from './components/StatusBar.js';
import { OutputPane } from './components/OutputPane.js';
import { InputBar } from './components/InputBar.js';
import { SessionPicker } from './components/SessionPicker.js';
import { useEngineManager } from './hooks/useEngineManager.js';
import { getSessionMessages } from '../db/queries.js';
import './commands/index.js';
import { executeCommand } from './commands/commandParser.js';

export function App(): React.ReactNode {
  const [input, setInput] = React.useState('');
  const [showPicker, setShowPicker] = React.useState(true);

  const engine = useEngineManager();

  const handleSessionSelect = async (sessionId: string | null) => {
    setShowPicker(false);

    if (sessionId) {
      const messages = await getSessionMessages(sessionId);
      engine.loadSessionHistory(messages);
    }
  };

  useInput((ch, key) => {
    if (showPicker) return;

    if (key.ctrl && ch === 'c') {
      engine.interruptFocused();
    }
  });

  const handleSubmit = async (value: string) => {
    setInput('');

    const isCommand = await executeCommand(value, {
      switchEngine: engine.switchEngine,
    });

    if (!isCommand) {
      await engine.writeToFocused(value + '\n');
    }
  };

  return (
    <Box flexDirection="column" height="100%">
      {showPicker ? (
        <SessionPicker onSelect={handleSessionSelect} />
      ) : (
        <>
          <StatusBar engineName={engine.focusedName} state={engine.focusedState} />
          <OutputPane lines={engine.focusedLines} pending={engine.focusedPending} />
          <InputBar value={input} onChange={setInput} onSubmit={handleSubmit} />
        </>
      )}
    </Box>
  );
}

(process.stdout as unknown as { isTTY?: boolean }).isTTY = true;
(process.stdin as unknown as { isTTY?: boolean }).isTTY = true;

render(<App />, {
  stdout: process.stdout,
  stdin: process.stdin,
  exitOnCtrlC: false,
});
