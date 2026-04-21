import React from 'react';

import { CliContainer } from '../../cli/CliContainer.js';
import { PtyNodePty } from '../../cli/PtyNodePty.js';
import { discoverEngines } from '../../config/discoverEngines.js';
import type { EngineConfig, EngineId } from '../../config/types.js';
import { createSession as createDbSession, insertMessage } from '../../db/queries.js';

type EngineState = 'running' | 'paused' | 'idle' | 'crashed';

interface EngineSession {
  config: EngineConfig;
  cli: CliContainer;
  state: EngineState;
  lines: string[];
  pending: string;
  lastError: Error | null;
  started: boolean;
  sessionId: string | null;
  outputBuffer: string;
}

export interface EngineManager {
  engines: EngineConfig[];
  focusedId: EngineId | null;
  focusedName: string;
  focusedState: EngineState;
  focusedLines: string[];
  focusedPending: string;
  switchEngine: (id: EngineId) => void;
  writeToFocused: (input: string) => Promise<void>;
  interruptFocused: () => void;
}

const MAX_LINES = 10_000;
const FLUSH_THRESHOLD = 2048; // 2KB

async function flushOutputBuffer(session: EngineSession): Promise<void> {
  if (!session.sessionId || session.outputBuffer.length === 0) return;

  await insertMessage(session.sessionId, session.config.id, 'assistant', session.outputBuffer);
  session.outputBuffer = '';
}

function trimLines(lines: string[]): string[] {
  if (lines.length <= MAX_LINES) return lines;
  return lines.slice(lines.length - MAX_LINES);
}

function createSession(config: EngineConfig): EngineSession {
  const pty = new PtyNodePty();
  const cli = new CliContainer({ pty, scrub: true });

  return {
    config,
    cli,
    state: 'idle',
    lines: [],
    pending: '',
    lastError: null,
    started: false,
    sessionId: null,
    outputBuffer: '',
  };
}

async function appendChunk(session: EngineSession, chunk: string): Promise<void> {
  const combined = session.pending + chunk;
  const parts = combined.split('\n');

  session.pending = parts.pop() ?? '';

  if (parts.length > 0) {
    const nextLines: string[] = [];

    for (const line of parts) {
      const prev = nextLines.length > 0 ? nextLines[nextLines.length - 1] : session.lines[session.lines.length - 1];
      if (prev === line && line.length > 0) continue;
      nextLines.push(line);
    }

    if (nextLines.length > 0) {
      session.lines = trimLines(session.lines.concat(nextLines));
    }
  }
  session.outputBuffer += chunk;

  if (session.outputBuffer.includes('\n') || session.outputBuffer.length > FLUSH_THRESHOLD) {
    await flushOutputBuffer(session);
  }
}

export function useEngineManager(): EngineManager {
  const [engines] = React.useState<EngineConfig[]>(() => discoverEngines());

  const sessionsRef = React.useRef<Map<EngineId, EngineSession>>(new Map());
  const [focusedId, setFocusedId] = React.useState<EngineId | null>(() => {
    const first = engines[0];
    return first ? first.id : null;
  });

  const [, forceRender] = React.useState(0);

  const getOrCreateSession = React.useCallback(
    (id: EngineId): EngineSession => {
      const existing = sessionsRef.current.get(id);
      if (existing) return existing;

      const config = engines.find(e => e.id === id);
      if (!config) throw new Error(`Unknown engine: ${id}`);

      const session = createSession(config);
      sessionsRef.current.set(id, session);

      session.cli.on('state', s => {
        // CliContainer states: 'idle' | 'running' | 'paused'
        if (s === 'running' || s === 'paused' || s === 'idle') session.state = s;
        forceRender(n => n + 1);
      });

      session.cli.on('data', async text => {
        await appendChunk(session, text);
        forceRender(n => n + 1);
      });

      session.cli.on('error', err => {
        session.lastError = err;
        session.state = 'crashed';
        forceRender(n => n + 1);
      });

      session.cli.on('exit', () => {
        if (session.state !== 'crashed') session.state = 'paused';
        forceRender(n => n + 1);
      });

      return session;
    },
    [engines],
  );

  const ensureStarted = React.useCallback(
    async (id: EngineId): Promise<void> => {
      const session = getOrCreateSession(id);
      if (session.started) return;

      if (!session.sessionId) {
        session.sessionId = crypto.randomUUID();
        await createDbSession(session.sessionId, session.config.id);
      }

      session.started = true;
      session.cli.spawn({
        command: session.config.command,
        args: session.config.args,
        cwd: session.config.cwd,
        env: session.config.env,
      });
    },
    [getOrCreateSession],
  );

  React.useEffect(() => {
    if (!focusedId) return;
    ensureStarted(focusedId).catch(err => {
      console.error('Failed to start engine:', err);
    });
  }, [focusedId, ensureStarted]);

  const switchEngine = React.useCallback(
    (id: EngineId) => {
      setFocusedId(id);
      ensureStarted(id).catch(err => {
        console.error('Failed to start engine:', err);
      });
    },
    [ensureStarted],
  );

  const writeToFocused = React.useCallback(
    async (input: string) => {
      if (!focusedId) return;
      await ensureStarted(focusedId);
      const session = getOrCreateSession(focusedId);

      if (session.sessionId) {
        await insertMessage(session.sessionId, session.config.id, 'user', input);
      }

      session.cli.write(input);
    },
    [ensureStarted, focusedId, getOrCreateSession],
  );

  const interruptFocused = React.useCallback(() => {
    if (!focusedId) return;
    const session = getOrCreateSession(focusedId);
    session.cli.write('\x03');
  }, [focusedId, getOrCreateSession]);

  const focused = focusedId ? sessionsRef.current.get(focusedId) ?? getOrCreateSession(focusedId) : null;

  return {
    engines,
    focusedId,
    focusedName: focused?.config.displayName ?? 'No engine',
    focusedState: focused?.state ?? 'idle',
    focusedLines: focused?.lines ?? [],
    focusedPending: focused?.pending ?? '',
    switchEngine,
    writeToFocused,
    interruptFocused,
  };
}
