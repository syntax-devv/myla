import React from 'react';
import { Box, Text, useInput } from 'ink';

export interface CrashModalProps {
  visible: boolean;
  engineName: string;
  onRestart: () => void;
  onDismiss: () => void;
}

export function CrashModal({ visible, engineName, onRestart, onDismiss }: CrashModalProps): React.ReactNode {
  const [selected, setSelected] = React.useState<'restart' | 'dismiss'>('restart');

  useInput((_, key) => {
    if (!visible) return;

    if (key.leftArrow || key.rightArrow || key.tab) {
      setSelected(prev => (prev === 'restart' ? 'dismiss' : 'restart'));
      return;
    }

    if (key.return) {
      if (selected === 'restart') onRestart();
      else onDismiss();
      return;
    }

    if (key.escape) {
      onDismiss();
    }
  });

  if (!visible) return null;

  const restartColor = selected === 'restart' ? 'green' : 'gray';
  const dismissColor = selected === 'dismiss' ? 'green' : 'gray';

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="red"
      paddingX={2}
      paddingY={1}
      width="100%"
    >
      <Text color="red" bold>
        {engineName} crashed
      </Text>
      <Box marginTop={1} />
      <Text>Engine crashed. Restart?</Text>
      <Box marginTop={1} />
      <Box>
        <Text color={restartColor}>
          {selected === 'restart' ? '› ' : '  '}[Restart]
        </Text>
        <Text>   </Text>
        <Text color={dismissColor}>
          {selected === 'dismiss' ? '› ' : '  '}[Dismiss]
        </Text>
      </Box>
    </Box>
  );
}
