import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

export interface InputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

export function InputBar({ value, onChange, onSubmit }: InputBarProps): React.ReactNode {
  return (
    <Box borderStyle="single" paddingX={1}>
      <Text color="gray">› </Text>
      <TextInput value={value} onChange={onChange} onSubmit={onSubmit} />
    </Box>
  );
}
