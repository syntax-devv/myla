import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';

export const Input = ({ onSubmit, placeholder = 'Enter command...', history = [] }) => {
  const [query, setQuery] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);

  useInput((input, key) => {
    if (key.upArrow && history.length > 0) {
      const newIndex = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(newIndex);
      setQuery(history[history.length - 1 - newIndex] || '');
    }
    
    if (key.downArrow && historyIndex >= 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setQuery(newIndex < 0 ? '' : history[history.length - 1 - newIndex]);
    }
    
    if (key.return) {
      if (query.trim()) {
        onSubmit(query.trim());
        setQuery('');
        setHistoryIndex(-1);
      }
    }
  });

  return (
    <Box>
      <Text color="cyan">› </Text>
      <TextInput
        value={query}
        onChange={setQuery}
        placeholder={placeholder}
      />
    </Box>
  );
};

export default Input;
