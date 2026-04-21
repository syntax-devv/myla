import React from 'react';
import { Box, Text } from 'ink';

export interface OutputPaneProps {
  output: string;
}

export function OutputPane({ output }: OutputPaneProps): React.ReactNode {
  return (
    <Box flexGrow={1} flexDirection="column" paddingX={1}>
      <Text>{output}</Text>
    </Box>
  );
}
