import React from 'react';
import { Box, Text, useStdout } from 'ink';

export interface OutputPaneProps {
  lines: string[];
  pending: string;
}

export function OutputPane({ lines, pending }: OutputPaneProps): React.ReactNode {
  const { stdout } = useStdout();
  const rows = stdout.rows ?? 24;const viewport = Math.max(1, rows - 6);

  const viewLines = lines.length > viewport ? lines.slice(lines.length - viewport) : lines;
  const output = [...viewLines, pending].join('\n');

  return (
    <Box flexGrow={1} flexDirection="column" paddingX={1}>
      <Text>{output}</Text>
    </Box>
  );
}
