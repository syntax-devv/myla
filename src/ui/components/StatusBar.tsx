import React from 'react';
import { Box, Text } from 'ink';

export interface StatusBarProps {
  engineName: string;
  state: 'running' | 'paused' | 'idle' | 'crashed';
}

export function StatusBar({ engineName, state }: StatusBarProps): React.ReactNode {
  const stateColors = {
    running: 'green',
    paused: 'yellow',
    idle: 'gray',
    crashed: 'red',
  };

  return (
    <Box borderStyle="single" paddingX={1}>
      <Text bold color="cyan">
        {engineName}
      </Text>
      <Text> — </Text>
      <Text color={stateColors[state]}>● {state}</Text>
    </Box>
  );
}
