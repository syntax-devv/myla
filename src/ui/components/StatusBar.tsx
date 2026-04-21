import React from 'react';
import { Box, Text } from 'ink';

export interface StatusBarProps {
  engineName: string;
  state: 'running' | 'idle' | 'crashed';
}

export function StatusBar({ engineName, state }: StatusBarProps): React.ReactNode {
  const stateColors = {
    running: 'green',
    idle: 'gray',
    crashed: 'red',
  };

  return (
    <Box borderStyle="single" paddingX={1}>
      <Text bold color="cyan">
        {engineName}
      </Text>
      {state === 'crashed' ? (
        <>
          <Text> — </Text>
          <Text color="red">⚠ {engineName.toLowerCase()} crashed</Text>
        </>
      ) : (
        <>
          <Text> — </Text>
          <Text color={stateColors[state]}>● {state}</Text>
        </>
      )}
    </Box>
  );
}
