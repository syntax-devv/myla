import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';

export const Input = ({ onSubmit, placeholder = 'message...', history = [] }) => {
  const [query, setQuery] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);

  useInput((input, key) => {
    if (key.upArrow && history.length > 0) {
      const next = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(next);
      setQuery(history[history.length - 1 - next] || '');
    }
    if (key.downArrow) {
      const next = historyIndex - 1;
      setHistoryIndex(next);
      setQuery(next < 0 ? '' : history[history.length - 1 - next]);
    }
    if (key.return && query.trim()) {
      onSubmit(query.trim());
      setQuery('');
      setHistoryIndex(-1);
    }
  });

  return (
    <Box>
      <Text color="#D97706" bold>❯ </Text>
      <TextInput
        value={query}
        onChange={setQuery}
        placeholder={placeholder}
      />
    </Box>
  );
};

export default Input;
