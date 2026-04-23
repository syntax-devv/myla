import React from 'react';
import type { EngineId } from '../../config/types.js';

export interface EngineTerminalState {
  lines: string[];
  pending: string;
  state: 'idle' | 'running' | 'crashed';
  lastError: Error | null;
  approvalPrompt: boolean;
}

export interface TerminalState {
  engines: Map<EngineId, EngineTerminalState>;
  focusedId: EngineId | null;
}

export function useTerminalState(): [
  TerminalState,
  (updates: Partial<TerminalState>) => void,
  (engineId: EngineId, updates: Partial<EngineTerminalState>) => void,
] {
  const [state, setState] = React.useState<TerminalState>(() => ({
    engines: new Map(),
    focusedId: null,
  }));

  const updateGlobal = React.useCallback((updates: Partial<TerminalState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateEngine = React.useCallback(
    (engineId: EngineId, updates: Partial<EngineTerminalState>) => {
      setState(prev => {
        const engines = new Map(prev.engines);
        const current = engines.get(engineId) || {
          lines: [],
          pending: '',
          state: 'idle' as const,
          lastError: null,
          approvalPrompt: false,
        };
        engines.set(engineId, { ...current, ...updates });
        return { ...prev, engines };
      });
    },
    [],
  );

  return [state, updateGlobal, updateEngine];
}
