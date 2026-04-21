import React from 'react';
import { Box, Text, useInput } from 'ink';

export interface ApprovalModalProps {
  visible: boolean;
  onApprove: () => void;
  onDeny: () => void;
}

export function ApprovalModal({ visible, onApprove, onDeny }: ApprovalModalProps): React.ReactNode {
  const [selected, setSelected] = React.useState<'yes' | 'no'>('yes');

  useInput((ch, key) => {
    if (!visible) return;

    if (key.leftArrow || key.rightArrow || key.tab) {
      setSelected(prev => (prev === 'yes' ? 'no' : 'yes'));
      return;
    }

    if (key.return) {
      if (selected === 'yes') onApprove();
      else onDeny();
      return;
    }

    if (ch === 'y' || ch === 'Y') {
      onApprove();
      return;
    }

    if (ch === 'n' || ch === 'N') {
      onDeny();
      return;
    }

    if (key.escape) {
      onDeny();
    }
  });

  if (!visible) return null;

  const yesColor = selected === 'yes' ? 'green' : 'gray';
  const noColor = selected === 'no' ? 'green' : 'gray';

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="yellow"
      paddingX={2}
      paddingY={1}
      width="100%"
    >
      <Text color="yellow" bold>
        Approval Required
      </Text>
      <Box marginTop={1} />
      <Text>Continue with this operation?</Text>
      <Box marginTop={1} />
      <Box>
        <Text color={yesColor}>
          {selected === 'yes' ? '› ' : '  '}[Y]es
        </Text>
        <Text>   </Text>
        <Text color={noColor}>
          {selected === 'no' ? '› ' : '  '}[N]o
        </Text>
      </Box>
      <Box marginTop={1}>
        <Text color="gray" dimColor>
          ↑↓ Navigate · Y/N Quick Select · Enter Confirm · Esc Cancel
        </Text>
      </Box>
    </Box>
  );
}
