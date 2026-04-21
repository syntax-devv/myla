import React from 'react';
import { Box, render, useInput } from 'ink';
import { StatusBar } from './components/StatusBar.js';
import { OutputPane } from './components/OutputPane.js';
import { InputBar } from './components/InputBar.js';
import { useEngineManager } from './hooks/useEngineManager.js';

export function App(): React.ReactNode {
  const [input, setInput] = React.useState('');

  const engine = useEngineManager();

  useInput((_, key) => {
    if (key.ctrl && key.c) {
      engine.interruptFocused();
    }
  });

  const handleSubmit = (value: string) => {
    setInput('');
    engine.writeToFocused(value + '\n');
  };

  return (
    <Box flexDirection="column" height="100%">
      <StatusBar engineName={engine.focusedName} state={engine.focusedState} />
      <OutputPane output={engine.focusedOutput} />
      <InputBar value={input} onChange={setInput} onSubmit={handleSubmit} />
    </Box>
  );
}

render(<App />);
