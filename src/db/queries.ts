import { getDb, saveDb } from './schema.js';

export interface Session {
  id: string;
  started_at: number;
  engine: string;
}

export interface Message {
  id: number;
  session_id: string;
  engine: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export async function createSession(sessionId: string, engine: string): Promise<void> {
  const db = await getDb();
  const stmt = db.prepare('INSERT INTO sessions (id, started_at, engine) VALUES (?, ?, ?)');
  stmt.run([sessionId, Date.now(), engine]);
  stmt.free();
  saveDb();
}

export async function insertMessage(
  sessionId: string,
  engine: string,
  role: 'user' | 'assistant',
  content: string,
): Promise<void> {
  const db = await getDb();
  const stmt = db.prepare(
    'INSERT INTO messages (session_id, engine, role, content, timestamp) VALUES (?, ?, ?, ?, ?)',
  );
  stmt.run([sessionId, engine, role, content, Date.now()]);
  stmt.free();
  saveDb();
}

export async function getRecentSessions(limit: number): Promise<Session[]> {
  const db = await getDb();
  const stmt = db.prepare('SELECT id, started_at, engine FROM sessions ORDER BY started_at DESC LIMIT ?');
  stmt.bind([limit]);
  const sessions: Session[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as { id: string; started_at: number; engine: string };
    sessions.push({
      id: row.id,
      started_at: row.started_at,
      engine: row.engine,
    });
  }
  stmt.free();
  return sessions;
}

export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  const db = await getDb();
  const stmt = db.prepare(
    'SELECT id, session_id, engine, role, content, timestamp FROM messages WHERE session_id = ? ORDER BY timestamp ASC',
  );
  stmt.bind([sessionId]);
  const messages: Message[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as {
      id: number;
      session_id: string;
      engine: string;
      role: 'user' | 'assistant';
      content: string;
      timestamp: number;
    };
    messages.push({
      id: row.id,
      session_id: row.session_id,
      engine: row.engine,
      role: row.role,
      content: row.content,
      timestamp: row.timestamp,
    });
  }
  stmt.free();
  return messages;
}

export async function searchMessages(keyword: string, engine?: string): Promise<Message[]> {
  const db = await getDb();
  let sql = 'SELECT id, session_id, engine, role, content, timestamp FROM messages WHERE content LIKE ?';
  const params: (string | number)[] = [`%${keyword}%`];

  if (engine) {
    sql += ' AND engine = ?';
    params.push(engine);
  }

  sql += ' ORDER BY timestamp DESC';

  const stmt = db.prepare(sql);
  stmt.bind(params);
  const messages: Message[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as {
      id: number;
      session_id: string;
      engine: string;
      role: 'user' | 'assistant';
      content: string;
      timestamp: number;
    };
    messages.push({
      id: row.id,
      session_id: row.session_id,
      engine: row.engine,
      role: row.role,
      content: row.content,
      timestamp: row.timestamp,
    });
  }
  stmt.free();
  return messages;
}

export async function getSessionCount(sessionId: string): Promise<number> {
  const db = await getDb();
  const stmt = db.prepare('SELECT COUNT(*) as count FROM messages WHERE session_id = ?');
  stmt.bind([sessionId]);
  stmt.step();
  const result = stmt.getAsObject() as { count: number };
  stmt.free();
  return result.count;
}
