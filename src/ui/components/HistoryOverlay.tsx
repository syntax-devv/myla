import React, { useEffect, useState } from 'react';
import { Box, Text, useInput, useStdout } from 'ink';
import { searchMessages, type Message } from '../../db/queries.js';

export interface HistoryOverlayProps {
  onClose: () => void;
}

export function HistoryOverlay({ onClose }: HistoryOverlayProps): React.ReactNode {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { stdout } = useStdout();
  const rows = stdout.rows ?? 24;
  const viewport = Math.max(1, rows - 8);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    const results = await searchMessages('', undefined);
    setMessages(results);
    setSelectedIndex(0);
  };

  useInput((_, key) => {
    if (key.escape) {
      onClose();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    }

    if (key.downArrow) {
      setSelectedIndex(prev => Math.min(messages.length - 1, prev + 1));
    }
  });

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const viewMessages = messages.length > viewport ? messages.slice(0, viewport) : messages;

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="cyan">
          History
        </Text>
      </Box>

      <Box flexDirection="column" flexGrow={1}>
        {messages.length === 0 ? (
          <Text color="gray">No messages found</Text>
        ) : (
          viewMessages.map((msg, index) => {
            const isSelected = index === selectedIndex;
            const prefix = msg.role === 'user' ? '›' : '•';
            const engineLabel = `[${msg.engine}]`;

            return (
              <Box key={msg.id}>
                <Text color={isSelected ? 'green' : 'gray'}>
                  {isSelected ? '›' : ' '}
                </Text>
                <Text color={isSelected ? 'green' : 'white'}>
                  {prefix} {engineLabel} {formatDate(msg.timestamp)}: {msg.content}
                </Text>
              </Box>
            );
          })
        )}
      </Box>

      <Box marginTop={1}>
        <Text color="gray" dimColor>
          ↑↓ Navigate · Esc Close
        </Text>
      </Box>
    </Box>
  );
}
