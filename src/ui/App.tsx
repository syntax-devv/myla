import React from 'react';
import { Box, render, useInput } from 'ink';
import { StatusBar } from './components/StatusBar.js';
import { OutputPane } from './components/OutputPane.js';
import { InputBar } from './components/InputBar.js';
import { SessionPicker } from './components/SessionPicker.js';
import { HistoryOverlay } from './components/HistoryOverlay.js';
import { CrashModal } from './components/CrashModal.js';
import { useEngineManager } from './hooks/useEngineManager.js';
import { getSessionMessages } from '../db/queries.js';
import './commands/index.js';
import { executeCommand } from './commands/commandParser.js';

export function App(): React.ReactNode {
  const [input, setInput] = React.useState('');
  const [showPicker, setShowPicker] = React.useState(true);
  const [showHistory, setShowHistory] = React.useState(false);

  const engine = useEngineManager();

  const toggleHistory = React.useCallback(() => {
    setShowHistory(prev => !prev);
  }, []);

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
      toggleHistory,
    });

    if (!isCommand) {
      await engine.writeToFocused(value + '\n');
    }
  };

  const isCrashed = engine.focusedState === 'crashed';

  return (
    <Box flexDirection="column" height="100%">
      {showPicker ? (
        <SessionPicker onSelect={handleSessionSelect} />
      ) : showHistory ? (
        <HistoryOverlay onClose={() => setShowHistory(false)} />
      ) : (
        <>
          <StatusBar engineName={engine.focusedName} state={engine.focusedState} />
          <OutputPane lines={engine.focusedLines} pending={engine.focusedPending} />
          {isCrashed && (
            <CrashModal
              visible={isCrashed}
              engineName={engine.focusedName}
              onRestart={async () => {
                await engine.restartFocused();
              }}
              onDismiss={() => {
                engine.switchEngine(engine.focusedId!);
              }}
            />
          )}
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
