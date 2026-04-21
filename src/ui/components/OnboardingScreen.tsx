import React from 'react';
import { Box, Text, useInput } from 'ink';

export interface OnboardingScreenProps {
  engineCount: number;
  onDismiss: () => void;
}

export function OnboardingScreen({ engineCount, onDismiss }: OnboardingScreenProps): React.ReactNode {
  useInput((_, key) => {
    if (key.return || key.escape) {
      onDismiss();
    }
  });

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Text bold color="cyan">
        Welcome to Myla
      </Text>
      <Box marginTop={1} />
      <Text>Myla is a terminal UI for AI coding engines.</Text>
      <Box marginTop={1} />

      <Box flexDirection="column">
        <Text bold>Key Commands:</Text>
        <Text>  • Ctrl+C — Interrupt engine</Text>
        <Text>  • /switch &lt;engine&gt; — Switch engines</Text>
        <Text>  • /history — View message history</Text>
        <Text>  • Esc — Close overlays</Text>
      </Box>

      {engineCount === 0 && (
        <>
          <Box marginTop={1} />
          <Box flexDirection="column">
            <Text color="yellow" bold>
              No engines detected
            </Text>
            <Text>
              Configure engines in{' '}
              <Text color="cyan">~/.myla/config.toml</Text>
            </Text>
            <Box marginTop={1} />
            <Text dimColor>
              Example config:
            </Text>
            <Text dimColor>
              [engines.claude]
            </Text>
            <Text dimColor>
              path = "/path/to/claude"
            </Text>
          </Box>
        </>
      )}

      <Box marginTop={2}>
        <Text color="gray" dimColor>
          Press Enter or Esc to continue
        </Text>
      </Box>
    </Box>
  );
}
