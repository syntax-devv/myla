import React from 'react';
import { Box, render } from 'ink';
import { StatusBar } from './components/StatusBar.js';
import { OutputPane } from './components/OutputPane.js';
import { InputBar } from './components/InputBar.js';

export function App(): React.ReactNode {
  const [engineName] = React.useState('Claude');
  const [state] = React.useState<'running' | 'paused' | 'idle' | 'crashed'>('idle');
  const [output] = React.useState('Myla v0.1.0 — Ready\n');
  const [input, setInput] = React.useState('');

  const handleSubmit = () => {
    setInput('');
  };

  return (
    <Box flexDirection="column" height="100%">
      <StatusBar engineName={engineName} state={state} />
      <OutputPane output={output} />
      <InputBar value={input} onChange={setInput} onSubmit={handleSubmit} />
    </Box>
  );
}

render(<App />);
