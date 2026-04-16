import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS duties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day TEXT NOT NULL,
    nr TEXT,
    time TEXT,
    zielony TEXT,
    fiolet TEXT,
    poma TEXT,
    undrg TEXT,
    zolty TEXT,
    czerw TEXT,
    nieb TEXT,
    parter TEXT,
    sg TEXT,
    obiad TEXT
  )
`);

export default db;
