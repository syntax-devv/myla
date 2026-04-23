import React from 'react';
import { Box, Text } from 'ink';

import type { ColorScheme } from '../theme/themeTypes.js';
import type { GitStatus } from '../utils/gitStatus.js';
import type { AppMode } from '../utils/modeTracker.js';

export interface StatusBarProps {
  engineName: string;
  state: 'running' | 'idle' | 'crashed';
  colors?: ColorScheme;
  gitStatus?: GitStatus | null;
  mode?: AppMode;
  cwd?: string;
}

export function StatusBar({ engineName, state, colors, gitStatus, mode, cwd }: StatusBarProps): React.ReactNode {
  const themeColors = colors || {
    primary: '#61afef',
    secondary: '#c678dd',
    background: '#1e1e2e',
    text: '#cdd6f4',
    muted: '#6c7086',
    accent: '#89b4fa',
    error: '#f38ba8',
    success: '#a6e3a1',
    warning: '#f9e2af',
  };

  const stateColors = {
    running: themeColors.success,
    idle: themeColors.muted,
    crashed: themeColors.error,
  };

  const modeIcons = {
    chat: '💬',
    edit: '✏️',
    command: '⌘',
  };

  return (
    <Box flexDirection="column">
      <Box borderStyle="single" paddingX={1}>
        <Text bold color={themeColors.primary}>
          {engineName}
        </Text>
        {mode && (
          <>
            <Text> </Text>
            <Text color={themeColors.accent}>{modeIcons[mode]}</Text>
          </>
        )}
        {state === 'crashed' ? (
          <>
            <Text> — </Text>
            <Text color={themeColors.error}>⚠ {engineName.toLowerCase()} crashed</Text>
          </>
        ) : (
          <>
            <Text> — </Text>
            <Text color={stateColors[state]}>● {state}</Text>
          </>
        )}
        {gitStatus && gitStatus.hasChanges && (
          <>
            <Text> — </Text>
            <Text color={themeColors.warning}>
              {gitStatus.branch} {gitStatus.ahead > 0 && `↑${gitStatus.ahead}`} {gitStatus.staged > 0 && `+${gitStatus.staged}`} {gitStatus.unstaged > 0 && `~${gitStatus.unstaged}`}
            </Text>
          </>
        )}
      </Box>
      {cwd && (
        <Box paddingX={1}>
          <Text color={themeColors.muted}>{cwd}</Text>
        </Box>
      )}
    </Box>
  );
}
