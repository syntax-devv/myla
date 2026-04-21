import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { getRecentSessions, getSessionCount, type Session } from '../../db/queries.js';

export interface SessionPickerProps {
  onSelect: (sessionId: string | null) => void;
}

export function SessionPicker({ onSelect }: SessionPickerProps): React.ReactNode {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [counts, setCounts] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    getRecentSessions(20).then(recentSessions => {
      setSessions(recentSessions);

      const countPromises = recentSessions.map(async session => {
        const count = await getSessionCount(session.id);
        return [session.id, count] as const;
      });

      Promise.all(countPromises).then(results => {
        setCounts(new Map(results));
      });
    });
  }, []);

  const totalOptions = sessions.length + 1;

  useInput((_, key) => {
    if (key.return) {
      if (selectedIndex === sessions.length) {
        onSelect(null);
      } else {
        onSelect(sessions[selectedIndex].id);
      }
      return;
    }

    if (key.escape) {
      onSelect(null);
      return;
    }

    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    }

    if (key.downArrow) {
      setSelectedIndex(prev => Math.min(totalOptions - 1, prev + 1));
    }
  });

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Text bold color="cyan">
        Myla — Session Picker
      </Text>
      <Box marginTop={1} />

      {sessions.length === 0 ? (
        <Box flexDirection="column">
          <Text color="gray">No sessions found</Text>
          <Box marginTop={1} />
          <Text color="green">› Start new session</Text>
        </Box>
      ) : (
        <Box flexDirection="column">
          {sessions.map((session, index) => {
            const isSelected = index === selectedIndex;
            const count = counts.get(session.id) ?? 0;

            return (
              <Box key={session.id}>
                <Text color={isSelected ? 'green' : 'gray'}>
                  {isSelected ? '›' : ' '}
                </Text>
                <Text color={isSelected ? 'green' : 'white'}>
                  {' '}
                  {session.engine} — {formatDate(session.started_at)} ({count} messages)
                </Text>
              </Box>
            );
          })}
          <Box marginTop={1} />
          <Text color={selectedIndex === sessions.length ? 'green' : 'gray'}>
            {selectedIndex === sessions.length ? '›' : ' '} Start new session
          </Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text color="gray" dimColor>
          ↑↓ Navigate · Enter Select · Esc New Session
        </Text>
      </Box>
    </Box>
  );
}
