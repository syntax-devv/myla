import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SCHEMA_VERSION = 1;

function dbPath(): string {
  const mylaDir = path.join(os.homedir(), '.myla');
  if (!fs.existsSync(mylaDir)) {
    fs.mkdirSync(mylaDir, { recursive: true });
  }
  return path.join(mylaDir, 'myla.db');
}

function initializeSchema(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      started_at INTEGER NOT NULL,
      engine TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      engine TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
    CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
    CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at DESC);
  `);
}

function ensureSchemaVersion(db: Database): void {
  const result = db.exec('PRAGMA user_version');
  const userVersion = result.length > 0 && result[0].values.length > 0
    ? (result[0].values[0][0] as number)
    : 0;
  if (userVersion === 0) {
    initializeSchema(db);
    db.run(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  }
}

let sqlJs: SqlJsStatic | null = null;
let dbInstance: Database | null = null;

async function initSqlJsModule(): Promise<SqlJsStatic> {
  if (!sqlJs) {
    sqlJs = await initSqlJs();
  }
  return sqlJs;
}

export async function getDb(): Promise<Database> {
  if (!dbInstance) {
    const SQL = await initSqlJsModule();
    const dbFilePath = dbPath();
    let dbBuffer: Uint8Array | undefined;

    if (fs.existsSync(dbFilePath)) {
      dbBuffer = fs.readFileSync(dbFilePath);
    }

    dbInstance = new SQL(dbBuffer);
    ensureSchemaVersion(dbInstance);
  }
  return dbInstance;
}

export function saveDb(): void {
  if (dbInstance) {
    const data = dbInstance.export();
    fs.writeFileSync(dbPath(), data);
  }
}

export function closeDb(): void {
  if (dbInstance) {
    saveDb();
    dbInstance.close();
    dbInstance = null;
  }
}
