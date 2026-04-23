import React from 'react';

export type AppMode = 'chat' | 'edit' | 'command';

export interface ModeState {
  mode: AppMode;
  previousMode: AppMode;
}

export function useModeTracker() {
  const [state, setState] = React.useState<ModeState>({
    mode: 'chat',
    previousMode: 'chat',
  });

  const setMode = React.useCallback((mode: AppMode) => {
    setState(prev => ({ mode, previousMode: prev.mode }));
  }, []);

  const toggleMode = React.useCallback(() => {
    setState(prev => {
      const newMode: AppMode = prev.mode === 'chat' ? 'edit' : 'chat';
      return { mode: newMode, previousMode: prev.mode };
    });
  }, []);

  return {
    mode: state.mode,
    previousMode: state.previousMode,
    setMode,
    toggleMode,
  };
}
